
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");
var prevMenu = null;
var currentMenu = null;
var client = null;

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

		  	var clientEmail =  $("#input_userName").val();
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
                        usersRef.set({"email": clientEmail, "projects" : "", "invites": ""});
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

function loadGalleryMenu(){
	
	var loadGalleryData = function () {
		// Query firebase for gallery related data
		// make sure the transition call below is called after data retrieval completes.

		// End query
		transition("#loading", "#galleryMenu", null);
	}

	transition("#mainMenu", "#loading", loadGalleryData);

}

function loadMainMenu(){
	transition(currentMenu, "#mainMenu", null);
}

function beginTurn(){
	;
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


