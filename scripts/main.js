
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");

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

		  } else {

		  	$('#authError').addClass("validTxt");
		  	$('#authError').text("Login Successful!");
		  	setTimeout(function(){
		  		$('#authError').text('');
		  	}, 2000);

                    var s = "https://glaring-heat-449.firebaseio.com/users/" +  authData.uid; //Create the reference to the user list
                    var usersRef =  new Firebase(s);
                    usersRef.once("value",function(data){
                      if (data.val() === null)
                      {
                        usersRef.set({"userId": authData.uid, "projects": "hello"});
                        console.log(s);
                        console.log(data.val()); 
                      }                    
                    }); 
                    
                    var newRef = new Firebase(s);
                    newRef.once("value",function(data){
                    console.log(data.val()); 
                    }); 

  
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

