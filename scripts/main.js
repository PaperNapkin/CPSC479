
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



window.onload = function() {


	$('#select_session').on('change', function() {
		 if($('#select_session').find(":selected").hasClass("validTxt")){
		 	console.log("!!!!");
		 	$('#select_session').css("color", "#33CC33");
		 }
		 else{
		 	$('#select_session').css("color", "red");
		 }
		});

	literally = LC.init(
	            document.getElementsByClassName('literally')[0],
	            {imageURLPrefix: 'img'}
        	);

	$("#drawingWidget").hide();

};

function endTurn(){
	var sessionName = $("#input_sessionName").val();
	console.log("hi");
	console.log(literally.getSnapshotJSON());
	
	var create = function(){

				var someUser = projectInfo[0];
				var someUserKey = projectInfo[1];
				var sessionName = projectInfo[2];

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
				projectObject["rules"] = "";
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
			}

	var update = function (){

		var fileUrl = "https://glaring-heat-449.firebaseio.com/files/" + projectInfo[0];
		console.log(fileUrl);
		var fileRef = new Firebase(fileUrl);

		fileRef.set(literally.getSnapshotJSON());

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
	

	$("#loadingProgress").hide();
	$("#loadingResult").text("Turn Complete!");
	$("#loadingResult").show();

	$("#menuWrapper").show();
	setTimeout(function(){
		transition("#loading", "#mainMenu", function(){
			$("#loadingResult").hide();
			$("#loadingProgress").show();
		});
	},2000);
	
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
		      				$("#title").hide();
                      });                    
                      
		     	}); 
 		  }
	});
}

function loadNewSessionMenu(){
	transition("#mainMenu", "#newSessionMenu", null);
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

						

						var fileUrl = "https://glaring-heat-449.firebaseio.com/files/" + selected;
						var fileRef = new Firebase(fileUrl);

						var unsubscribe = literally.on('snapshotLoad', function() {

							$("#menuWrapper").hide();
							$("#drawingWidget").show();
							unsubscribe();
							console.log("loaded a snapshot!");

						});

						fileRef.once("value", function(data){

							projectMode = 1;
							projectInfo = [selected];
							console.log(data.val());
							console.log(literally.loadSnapshotJSON(data.val()));
							

						});


						console.log("starting drawing widget");
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
	console.l

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

		// TODO : CHECK TO MAKE SURE PROJECT NAME IS UNIQUE 

		if(someUser == null || sessionName.length == 0){  //// < ------- 
			console.log("User Not Found...");
		}
		else{
			console.log("Success: ", someUser);
			
			projectInfo = [someUser, someUserKey, sessionName];
			projectMode = 0;

			transition("#newSessionMenu", "#loading", function(){
				var unsubscribe = literally.on('clear', function() {

	 			 	$("#menuWrapper").hide();
					$("#drawingWidget").show();
					unsubscribe(); 
				});

				literally.clear();
			});
		}

	});




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
												         .text(item)
														 .addClass("validTxt"));
						}	
						else{
							$("#select_session").append($("<option></option>")
												         .attr("value",item)
												         .text(item)
														 .addClass("errorTxt"));
						}
						if($($("#select_session").find("option")[0]).hasClass("validTxt")){
							$("#select_session").css("color", "#33CC33");
						}
						else{
							$("#select_session").css("color", "red");
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


function transition(last, next, callback){
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

