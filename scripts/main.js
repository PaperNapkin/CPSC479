
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");
var prevMenu = null;
var currentMenu = null;

// comes from AUTH DATA
var client = null;

// our email
var clientEmail = null;

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
			}

		}
		else{
			console.log("User does not have field");
		}

		

	});
}


function newUser(){ 
	ref.createUser({
		  email    : $("#input_userName").val(),
		  password : $("#input_password").val()
		}, function(error, userData) {
		  if (error) {

		  	$('#authError').addClass("errorTxt");
		  	$('#authError').text("Error Creating User");
		    console.log("Error creating user:", error);

		  } else {
		  	$('#authError').addClass("validTxt");
		  	$('#authError').text("User Created!");
		  	setTimeout(function(){
		  		$('#authError').text('');
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

		  	$('#authError').addClass("errorTxt");
		  	$('#authError').text("Error Logging in ");

		    console.log("Login Failed!", error);

		  } else { //Successful login

		  	clientEmail =  $("#input_userName").val();

		  	$('#authError').addClass("validTxt");
		  	$('#authError').text("Login Successful!");
		  	setTimeout(function(){
		  		$('#authError').text('');
		  	}, 2000);

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

function loadNewSessionMenu(){
	transition("#mainMenu", "#newSessionMenu", null);
	var sessionName = $("#input_sessionName").val();
	var member = $("#input_member").val();

	console.log(member);
	
	//Name
	//Collaborator

}

function loadInvitesMenu(){


	var loadGalleryData = function () {
		// Query firebase for gallery related data
		
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);

		// load invitations
		ref.once("value", function(data){

			var invites = data.val().invites;
			console.log(invites);
			if(invites.length > 0){

				$("#select_invite").empty();
				for(var i = 0; i < invites.length ; i++){
				$("#select_invite").append($("<option></option>")
							         .attr("value",invites[i])
							         .text(invites[i])); 
          									
				}
			}
			


		});



		// End query
		transition("#loading", "#invitesMenu", null);
	}

	transition("#mainMenu", "#loading", loadGalleryData);

}


function beginTurn(){
	var selected = $("#select_session").val();
	var a = "https://glaring-heat-449.firebaseio.com/projects/" + selected;

	var ref = new Firebase(a);

	ref.once("value", function(data){
		var obj = data.val();
		if(obj != null){

			// invoke wiget

		}
		else{
			console.log("project appears to have been deleted");

			var url = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;

			deleteFromField(url, "projects", selected);

		}

	});

}

function deleteProject(){
	var selected = $("#select_session").val();
	var a = "https://glaring-heat-449.firebaseio.com/projects/" + selected;

	var ref = new Firebase(a);
	ref.once("value", function(data){
		var obj = data.val();
		if(obj.turn == clientEmail){
			var url = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
			deleteFromField(url, "projects", selected);
			ref.remove();
			// also delete the file
		}
		else{
			console.log("its not your turn, you cant delete this project");
		}
	});
}

function acceptInvite(){

		var selected = $("#select_invite").val();
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);

		var callback = function(){
			 deleteFromField(a, "invites", selected)
		}

		if (selected != "None"){
			appendToField(a, "projects", selected, callback);		
		}

		transition("#invitesMenu", "#mainMenu", null);

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
			// Open drawing tool

			var s = "https://glaring-heat-449.firebaseio.com/projects/" + sessionName;
			var projRef = new Firebase(s);
			var projectObject = new Object();

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

			transition("#newSessionMenu", "#mainMenu", null);
		}

	});




}

function loadGalleryMenu(){
	
	var loadGalleryData = function () {
		// Query firebase for gallery related data
		
		var a = "https://glaring-heat-449.firebaseio.com/users/" + client.uid;
		var ref = new Firebase(a);

		ref.once("value", function(data){
			var projects = data.val().projects;
			console.log(projects);
			$("#select_session").empty();
			for(var i = 0; i < projects.length ; i++){
				$("#select_session").append($("<option></option>")
							         .attr("value",projects[i])
							         .text(projects[i])); 
          									
			}

		});


		// End query
		transition("#loading", "#galleryMenu", null);
	}

	transition("#mainMenu", "#loading", loadGalleryData);

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


