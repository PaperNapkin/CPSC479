
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");

function newUser(){ 
	ref.createUser({
		  email    : $("#input_userName").val(),
		  password : $("#input_password").val()
		}, function(error, userData) {
		  if (error) {
		    console.log("Error creating user:", error);
		  } else {
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
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    transition("div.splashBox", "div.ui", null);
		  }
	});
}

function transition(last, next, callback){
	var afterAnim = function(){
		$(last).hide();
		$(next).show();
		$(next).animate({opacity:1},500,callback);
	}
	$(last).animate({opacity:0},500,afterAnim);


}
