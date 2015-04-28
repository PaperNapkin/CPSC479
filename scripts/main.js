
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");
var prevMenu = null;
var currentMenu = null;

// comes from AUTH DATA
var client = null;

// our email
var clientEmail = null;

var literally = null;
var projectInfo = null;
var projectMode = null;
var projectRotation = null;
var rotationCenter = null;



window.onload = function() {

	/*
	$('#select_session').on('change', function() {
		 if($('#select_session').find(":selected").hasClass("clientTurn")){
		 	console.log("!!!!");
		 	$('#select_session').find(":selected").css("color", "black");
		 }
		 else{
		 	$('#select_session').find(":selected").css("color", "#CCCCCC");
		 }
		});
    */
	literally = LC.init(
	            document.getElementsByClassName('literally')[0],
	            {imageURLPrefix: 'img'}
        	);

	$("#drawingWidget").hide();

};

function panJson() {
       // x and y between -100 and 100
       var x = Math.floor(Math.random() * 201) - 100;
       var y = Math.floor(Math.random() * 201) - 100;
       literally.pan(x, y);
 }

function zoomJson() {
       var z = Math.floor(Math.random() * 10);
       literally.zoom(z);
}

function rotatePoint(rot, point){
	var x1 = point[0] * Math.cos(rot) - point[1] * Math.sin(rot);
	var y1 = point[0] * Math.sin(rot) + point[1] * Math.cos(rot);
	var arr = new Array(2);
	arr[0] = x1;
	arr[1] = y1;
	return arr;
}

function rotateSnapshot (json, rot) {

    // json is passed in as a string from firebase
    // JSON.parse() puts it into an object that we can access with JS

    var snapshot = JSON.parse(json);

    console.log(snapshot);
   // need to somehow get centerpoint of canvas... maybe passed in as
  // other args, or detected by finding boundary points in shape objects 


    // get array of all shapes
    var shapes = snapshot["shapes"];
    console.log(shapes);
    
    
    if(rotationCenter == null){
    	var minX = null;
	    var maxX = null;
	    var minY = null;
	    var maxY = null;

	    for( var i = 0; i < shapes.length; i++){
	    	 var points = shapes[i]["data"]["pointCoordinatePairs"];
	    	  for(var j = 0; j < points.length; j++){
	    	  	  if(j == 0 && i == 0){
	    	  	  	minX = points[j][0];
	    	  	  	maxX = points[j][0];
	    	  	  	minY = points[j][1];
	    	  	    maxY = points[j][1];
	    	  	  }
	    	  	  minX = Math.min(minX, points[j][0]);
	    	  	  maxX = Math.max(maxX, points[j][0]);
	    	  	  minY = Math.min(minY, points[j][1]);
	    	  	  maxY = Math.max(maxY, points[j][1]);
	    	  }
	    }

    	rotationCenter = new Array(2);
    	rotationCenter[0] = (maxX + minX)/2;
    	rotationCenter[1] = (maxY + minY)/2;
    	
    }
   

    for( var i = 0; i < shapes.length; i++ ) {
        var points = shapes[i]["data"]["pointCoordinatePairs"];
        console.log(points);

        for(var j = 0; j < points.length; j++){
            // rotatePoint will be some other function that you write that does a rotation
           points[j][0] = points[j][0] - rotationCenter[0];
           points[j][1] = points[j][1] - rotationCenter[1];
           points[j] = rotatePoint(rot, points[j]);
           points[j][0] = points[j][0] + rotationCenter[0];
           points[j][1] = points[j][1] + rotationCenter[1];
         }

    }

    console.log("finished rotation", snapshot);

    return snapshot;
}



function endTurn(){
	var sessionName = $("#input_sessionName").val();
	console.log("hi");
	console.log(literally.getSnapshotJSON());
	
	var create = function(){

				var someUser = projectInfo[0];
				var someUserKey = projectInfo[1];
				var sessionName = projectInfo[2];
				var rules = projectInfo[3];

				var s = "https://glaring-heat-449.firebaseio.com/projects/" + sessionName;
				var projRef = new Firebase(s);
				var projectObject = new Object();

				// create a file 
				var fileUrl =  "https://glaring-heat-449.firebaseio.com/files/" + sessionName;
				var fileRef = new Firebase(fileUrl);
				fileRef.set(literally.getSnapshotJSON());

				console.log(client);

				projectObject["members"] = new Array();
				projectObject.members.push(clientEmail);
				projectObject.members.push(someUser.email);
				projectObject["turn"] = someUser.email;
				projectObject["rules"] = rules;
				projectObject["file"] = "";

				console.log(projectObject);

				projRef.set(projectObject);
				console.log(someUser);

				var oldInvites = null;
				var hasProjectAlready = false;

				// add invite for collaborattor 
				var a = "https://glaring-heat-449.firebaseio.com/users/" + someUserKey;
				appendToField(a, "invites", sessionName, null);

				// add project to client
				var b = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
				appendToField(b, "projects", sessionName, null);

				projectInfo = null;
				literally.setPan(0,0);
				literally.setZoom(1);
;			}

	var update = function (){

		var fileUrl = "https://glaring-heat-449.firebaseio.com/files/" + projectInfo[0];
		console.log(fileUrl);
		var fileRef = new Firebase(fileUrl);
		var newDrawing = literally.getSnapshotJSON();


		if(projectRotation != null){
			newDrawing = JSON.stringify(rotateSnapshot(newDrawing, -projectRotation));
			projectRotation = null;
			rotationCenter = null;
		}

		fileRef.set(newDrawing);

		var projUrl = "https://glaring-heat-449.firebaseio.com/projects/" + projectInfo[0];
		var projRef = new Firebase(projUrl);

		projRef.once("value", function(data){
			if(data.val() != null){
				var obj = data.val();
				console.log("was turn for : " + obj.turn);
				for(var i = 0; i < obj.members.length; i++){
					if(obj.members[i] != obj.turn){
						obj.turn = obj.members[i]
						break;
					}
				}
				console.log("now its turn for : "+ obj.turn);
				projRef.set(obj);
				literally.setPan(0,0);
				literally.setZoom(1);
			}
		});

		projectInfo = null;

	}	

	if(projectMode == 1){
		update();
	}
	else{
		create();
	}

	

	$("#drawingWidget").hide();
	$("#menuWrapper").show();

	setTimeout(function(){

		$("#loadingProgress").hide();
		$("#loadingResult").text("Turn Complete.");
		$("#loadingResult").show();

		
		setTimeout(function(){
			transition("#loading", "#mainMenu", function(){
				$("#loadingResult").hide();
				$("#loadingProgress").show();
			});
		},1000);

	},1000);
	
}

function appendToField(url, field, elt, callback){
	var ref = new Firebase(url);

	ref.once("value", function(data){
		var obj = data.val();
		var arr = null;

		if (obj.hasOwnProperty(field)) {
			arr = obj[field];
		}
		else{
			arr = new Array();
		}

		var eltExists = false;
		for(var i = 0; i < arr.length; i++){
			if(arr[i] == elt){
				eltExists = true;
				break;
			}
		}

		if(!eltExists){
			arr.push(elt);
			obj[field] = arr;

			if(callback != null){
				ref.set(obj, callback);
			}
			else{
				ref.set(obj);
			}

		}

		
		
	});
}

function deleteFromField(url, field, elt, callback){
	var ref = new Firebase(url);
	// MAKE SURE URL IS PASSED IN WITHOUT A TRAILING BACKSLASH....???
	console.log("deleting from field");
	ref.once("value", function(data){
		var obj = data.val();
		var arr = null;

		if (obj.hasOwnProperty(field)) {
			arr = obj[field];
			var indexToRemove = null
			for(var i = 0; i < arr.length; i++){
				if(arr[i] == elt){
					indexToRemove = i;
					break;
				}
			}
			if(indexToRemove != null){

				console.log(arr);
				console.log("removing element", indexToRemove);
				arr.splice(i, 1);
				console.log(arr, arr.length);
				if(arr.length == 0){

					delete obj[field];
					/*var b = url + "/" + field;
					var newRef = new Firebase(b);
					newRef.remove();*/

				}

				if(callback != null){
					ref.set(obj, callback());
				}
				else{
					ref.set(obj);
				}

			}
			else{
				console.log("field does not contain element");
				callback();
			}

		}
		else{
			console.log("User does not have field");
			callback();
		}

		

	});
}


function newUser(){ 
	ref.createUser({
		  email    : $("#input_userName").val(),
		  password : $("#input_password").val()
		}, function(error, userData) {
		  if (error) {

		  	$('#errorMsg').addClass("errorTxt");
		  	$('#errorMsg').text("Error Creating User");
		    console.log("Error creating user:", error);

		  } else {
		  	$('#errorMsg').addClass("validTxt");
		  	$('#errorMsg').text("User Created!");
		  	setTimeout(function(){
		  		$('#errorMsg').text('');
		  	}, 2000);
		    console.log("Successfully created user account with uid:", userData.uid);
		  }
	});
}

function login(){ 
	ref.authWithPassword({
		  email    : $("#input_userName").val(),
		  password : $("#input_password").val()
		}, function(error, authData) {
		  if (error) {

		  	$('#errorMsg').addClass("errorTxt");
		  	$('#errorMsg').text("Error Logging in ");

		    console.log("Login Failed!", error);

		  } else { //Successful login

		  	clientEmail =  $("#input_userName").val();

		  	$('#errorMsg').text('');
		

                    var s = "https://glaring-heat-449.firebaseio.com/users/" +  authData.uid; //Create the reference to the user list
                    var s1 = "https://glaring-heat-449.firebaseio.com/map/" ;
                    var usersRef =  new Firebase(s);
                    usersRef.once("value",function(data){

                      if (data.val() === null)                                            //If there isn't a record for this user (i.e. first authentication),
                      {                                                                   //Create one and put it on the database
                        console.log("New reference being created...");
                        var userObject = new Object();

                        userObject["email"] = clientEmail;
                        userObject["projects"] = new Array();
                        userObject["invites"] = new Array();

                        usersRef.set(userObject);
                      }                    
                      else
                      {
                        console.log("user node already exists");
                      }


                      console.log("Authenticated successfully with payload:", authData);  //Transition only after we've added the user node to the database
                      client = authData;

		      		  transition("#loginMenu", "#mainMenu", function(){
		      				$("#title").animate({opacity:0},500, null);
                      });                    
                      
		     	}); 
 		  }
	});
}

function loadNewSessionData(callback){

	var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
	var ref = new Firebase(a);

	ref.once("value", function(data){
		console.log("rofl!");
		var finished = data.val().finished;
		$("#select_src").empty();
		$("#select_src").append($("<option></option>")
												   .attr("value","None")
												   .text("None"));

		if(finished != undefined && finished.length > 0){
			$("#select_src_label").show();
			$("#select_src").show();
			for(var i = 0; i < finished.length; i++){
				var item = finished[i];
				$("#select_src").append($("<option></option>")
												   .attr("value",item)
												   .text(item));
			}
		}
		else{
			$("#select_src_label").hide();
			$("#select_src").hide();
		}
		callback();
	});

}

function loadNewSessionMenu(){
	$("#rulesConfig").hide();
	$("#input_sessionName").val("");
	$("#input_member").val("");
	var load = function(){
		loadNewSessionData(function(){
			transition("#loading", "#newSessionMenu", null);
		});
	}

	transition("#mainMenu", "#loading", load);

	var sessionName = $("#input_sessionName").val();
	var member = $("#input_member").val();

	console.log(member);
	
	//Name
	//Collaborator

}


	var loadInvitesData = function (callback) {
		// Query firebase for gallery related data
		
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);

		// load invitations
		ref.once("value", function(data){

			var invites = data.val().invites;

			console.log(invites);

			$("#select_invite").empty();

			if(invites != undefined && invites.length > 0){

				
				for(var i = 0; i < invites.length ; i++){

				$("#select_invite").append($("<option></option>")
							         .attr("value",invites[i])
							         .text(invites[i]));      									
				}

			}
			else{
				$("#select_invite").empty();
			}
			

			if(callback != null){
				callback();
			}
		});
	}

function loadInvitesMenu(){

	var load = function(){
		loadInvitesData(function(){
			transition("#loading", "#invitesMenu", null);
		});
		// End query
	}

	transition("#mainMenu", "#loading", load);

}


function beginTurn(){
	var selected = $("#select_session").val();
	var a = "https://glaring-heat-449.firebaseio.com/projects/" + selected;

	var ref = new Firebase(a);

		var showError = function(txt){
			loadGalleryData(function(){
				$("#loadingProgress").hide();
				$("#loadingResult").text(txt);
				$("#loadingResult").show();

				setTimeout(function(){
					transition("#loading", "#galleryMenu", function(){
						$("#loadingProgress").show();
						$("#loadingResult").hide();
					})
				}, 1000);
			});
		
		}

		var load = function() {
			ref.once("value", function(data){

					var obj = data.val();
					var url = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;

					if(obj != null && obj.turn == clientEmail){

						
						var rules = obj["rules"];
						var fileUrl = "https://glaring-heat-449.firebaseio.com/files/" + selected;
						var fileRef = new Firebase(fileUrl);

						var unsubscribe = literally.on('snapshotLoad', function() {

							//Apply pan and zoom

							if(rules["pan"] == true){
								panJson();
							}
							if(rules["zoom"] == true){
								zoomJson();
							}

							$("#menuWrapper").hide();
							$("#title").hide();
							$("#drawingWidget").show();

							unsubscribe();
							console.log("loaded a snapshot!");

						});

						fileRef.once("value", function(data){

							projectMode = 1;
							projectInfo = [selected];
							var drawingString = data.val();

							if(rules["rotate"] == true){

								console.log("applying rotation");

								projectRotation = Math.random() * Math.PI * 2;

								var rotatedJson = rotateSnapshot( drawingString, projectRotation);

								console.log("starting drawing widget");

								drawingString = JSON.stringify(rotatedJson);
								// apply rotation
							}
							
							
							literally.loadSnapshotJSON(drawingString);
							
						});


						
					}
					else if(obj == null){

						console.log("project appears to have been deleted");

						
						deleteFromField(url, "projects", selected, function(){
								var txt = "Project seems to have been deleted."
								showError(txt)});

					}	
					else if(obj.turn != clientEmail){
								var txt = "It is not your turn.";
								showError(txt);
					}
				});
			}
		
	if(selected != undefined && selected != "None"){
		transition("#galleryMenu", "#loading", load);
	}

}

function deleteProject(){

	var selected = $("#select_session").val();
	var a = "https://glaring-heat-449.firebaseio.com/projects/" + selected;
	var ref = new Firebase(a);

	var process = function(){

		ref.once("value", function(data){
			var obj = data.val();
			if(obj != null && obj.turn == clientEmail){
				var usersUrl = "https://glaring-heat-449.firebaseio.com/users";
				var usersRef = new Firebase(usersUrl);

				usersRef.once("value", function(data){
					var users = data.val();
					for(var i = 0; i < obj.members.length; i++){
						var someMember = null;
						for(key in users){
							if(users[key].email == obj.members[i]){
								appendToField(usersUrl + "/" + key, "finished", selected, null);
							}
						}
					}
				});
				

				var url = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
				deleteFromField(url, "projects", selected, function(){

					ref.remove( function(){

						$("#loadingProgress").hide();
						$("#loadingResult").text("Project deleted!");
						$("#loadingResult").show();

						loadGalleryData(function(){

							setTimeout(function(){
								transition("#loading", "#galleryMenu", function() {
									 $("#loadingProgress").show();
									$("#loadingResult").hide(); });
							}, 1000);

						});
						

					});
				});	
			}
			else if(obj != null && obj.turn != clientEmail){

				$("#loadingProgress").hide();
				$("#loadingResult").text("It's not your turn, you can't delete this project.");
				$("#loadingResult").show();

				setTimeout(function(){

					transition("#loading", "#galleryMenu", function(){
						$("#loadingResult").hide();
						$("#loadingProgress").show();
							}
						);
				}, 1000);

				console.log("its not your turn, you cant delete this project");
			}
			else{
				var url = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
				deleteFromField(url, "projects", selected, function(){

					ref.remove( function(){

						$("#loadingProgress").hide();
						$("#loadingResult").text("Project seems to have been deleted.");
						$("#loadingResult").show();

						loadGalleryData(function(){

							setTimeout(function(){
								transition("#loading", "#galleryMenu", function() {
									 $("#loadingProgress").show();
									 $("#loadingResult").hide(); });
							}, 1000);

						});
						

					});
				});	
			}
		});
	}

	
		
	if(selected != undefined && selected != "None"){
		transition("#galleryMenu", "#loading", process);
	}
	
}

function acceptInvite(){

		var selected = $("#select_invite").val();
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);

		var process = function(){
			var displayMsg = function(){
				$("#loadingProgress").hide();
				$("#loadingResult").text("Accepted invite!");
				$("#loadingResult").show();

				loadInvitesData( function(){
					setTimeout(function(){
								
						transition("#loading", "#invitesMenu", function(){
							$("#loadingResult").hide();
							$("#loadingProgress").show();
						});

					}, 1000);
				})	
			}

			var callback = function(){
			 	deleteFromField(a, "invites", selected, displayMsg)
			}

			appendToField(a, "projects", selected, callback);		

		}
		
		if(selected != undefined && selected != "None"){
			transition("#invitesMenu", "#loading", process);
		}

}

function createSession(){
	var s = "https://glaring-heat-449.firebaseio.com/users/";

	var sessionName = $("#input_sessionName").val();
	var member = $("#input_member").val();
	console.log("looking for: " , member);

	var ref = new Firebase(s).once("value",function(data){
		var userList = data.val();
		var someUser = null;
		var someUserKey = null;

		console.log(userList);
		for(key in userList){
			console.log(key);
			var user = userList[key];
			console.log(user);
			if (user.email == member){
				someUser = user;
				someUserKey = key;
				break;
			}

		}

		var filesUrl = "https://glaring-heat-449.firebaseio.com/files/";
		var filesRef = new Firebase(filesUrl);

		filesRef.once("value", function(data){
			var files = data.val();
			var isUnique = true;


			console.log(files);
			if(files != undefined){
				
				console.log(sessionName);
				for(key in files){
					console.log(key);
					if(key == sessionName){
						console.log("naming conflict");
						isUnique = false;
					}
				}
			}
			if(isUnique == true){

				if(someUser == null || sessionName.length == 0){  //// < ------- 
					console.log("User Not Found...");
				}
				else{
					console.log("Success: ", someUser);

					var rulesObj = new Object();

					rulesObj["rotate"] = $("#checkbox_rot")[0].checked;
					rulesObj["pan"] = $("#checkbox_pan")[0].checked;
					rulesObj["zoom"] = $("#checkbox_zoom")[0].checked;

					projectInfo = [someUser, someUserKey, sessionName, rulesObj];
					projectMode = 0;

					var selectedSrc = $("#select_src").val();
					if(selectedSrc == "None"){
						transition("#newSessionMenu", "#loading", function(){
							var unsubscribe = literally.on('clear', function() {
				 			 	$("#menuWrapper").hide();
				 			 	$("#title").hide();
								$("#drawingWidget").show();
								unsubscribe(); 
							});

							literally.clear();
						});
					}
					else{
						transition("#newSessionMenu", "#loading", function(){
							var fileUrl = "https://glaring-heat-449.firebaseio.com/files/"+selectedSrc;
							var fileRef = new Firebase(fileUrl);
							var unsubscribe = literally.on('snapshotLoad', function() {

										$("#menuWrapper").hide();
										$("#title").hide();
										$("#drawingWidget").show();
										unsubscribe();
										console.log("loaded a snapshot!");

									});

									fileRef.once("value", function(data){
										console.log(data.val());
										console.log(literally.loadSnapshotJSON(data.val()));
									});
							});

					}
					
				}
			}
		});

		// TODO : CHECK TO MAKE SURE PROJECT NAME IS UNIQUE 


	});




}

function openRulesConfiguration(){
	$("#rulesConfig").show()
	console.log("hello");
}

var loadGalleryData = function (callback) {
		// Query firebase for gallery related data
		
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);
		var b = "https://glaring-heat-449.firebaseio.com/projects/";
		var projRef = new Firebase(b);
		var count = 0;
		


		var process = function(obj){
			ref.once("value", function(data){
				var projects = data.val().projects;
				console.log(projects);

				$("#select_session").empty();

				var b = "https://glaring-heat-449.firebaseio.com/projects";
				var projRef = new Firebase(b);

				if(projects != undefined && projects.length > 0){
					for(var i = 0; i < projects.length ; i++){
						var item = projects[i];
						if(obj.hasOwnProperty(item) && obj[item].turn == clientEmail){
							$("#select_session").append($("<option></option>")
												         .attr("value",item)
												         .text(item));
														// .addClass("clientTurn"));
						}	
						else if(obj.hasOwnProperty(item) && obj[item].turn != clientEmail){
							/*$("#select_session").append($("<option></option>")
												         .attr("value",item)
												         .text(item)
														 .addClass("memberTurn"));*/
						}
						else{
							deleteFromField(a, "projects", item);
						}
			
				    }
				}
				
				if(callback != null){
					callback();
			}	

			});
		}

		projRef.once("value", function(data){

			if(data.val() != null){
				console.log(data.val());
				process(data.val());
			}
			else{
				process({});
			}
	

		});
		
	}


function loadGalleryMenu(){
	
	
	var load = function(){

		loadGalleryData(function(){
			transition("#loading", "#galleryMenu", null);
		});
		
	}

	transition("#mainMenu", "#loading", load);

}

function loadMainMenu(){
	transition(currentMenu, "#mainMenu", null);
}


function loadFinishedData(callback){
	var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
	var ref = new Firebase(a);

	ref.once("value", function(data){
		console.log("rofl!");
		var finished = data.val().finished;
		$("#select_finished").empty();
		if(finished != undefined && finished.length > 0){
		
			console.log(finished);
			for(var i = 0; i < finished.length; i++){
				var item = finished[i];
				$("#select_finished").append($("<option></option>")
												   .attr("value",item)
												   .text(item));
			}
		}
		callback();
	});

	
}

function loadFinishedMenu(){
	
	
	var load = function(){

		loadFinishedData(function(){
			transition("#loading", "#finishedMenu", null);
		});
		
	}

	transition("#mainMenu", "#loading", load);

}


function loadFinished(){
	console.log("ming");

	var selected = $("#select_finished").val();
	if(selected != undefined && selected != "None"){
		var fileUrl = "https://glaring-heat-449.firebaseio.com/files/" + selected;
		var fileRef = new Firebase(fileUrl);

		projectMode = 3;

		var unsubscribe = literally.on('snapshotLoad', function() {
							console.log("mong");
								if(projectMode == 3){
									window.open(literally.getImage().toDataURL());
								}
							});

		fileRef.once("value", function(data){

							
								console.log(literally.loadSnapshotJSON(data.val()));
							});
	}
				
}

function transition(last, next, callback){
	$("#errorMsg").hide();
	prevMenu = last;
	currentMenu = next;
	console.log(last, next);

	var afterAnim = function(){
		$(last).hide();
		console.log(next);
		$(next).show();
		$(next).animate( {opacity:1}, 500, callback);
		$("button").removeAttr('disabled');
	}

	$(last).animate({opacity:0},500,afterAnim);
	$("button").attr('disabled', "true");
}

