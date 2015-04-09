
var ref = new Firebase("https://glaring-heat-449.firebaseio.com");
var prevMenu = null;
var currentMenu = null;

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

		  	$('#authError').addClass("validTxt");
		  	$('#authError').text("Login Successful!");
		  	setTimeout(function(){
		  		$('#authError').text('');
		  	}, 2000);

                    var s = "https://glaring-heat-449.firebaseio.com/users/" +  authData.uid; //Create the reference to the user list
                    var usersRef =  new Firebase(s);
                    usersRef.once("value",function(data){
                      if (data.val() === null)                                            //If there isn't a record for this user (i.e. first authentication),
                      {                                                                   //Create one and put it on the database
                        console.log("New reference being created...");
                        usersRef.set({"projects": "", "invites": ""});
                      }                    
                      else
                      {
                        console.log("user node already exists");
                      }
                      console.log("Authenticated successfully with payload:", authData);  //Transition only after we've added the user node to the database
		      transition("#loginMenu", "#mainMenu", function(){
		      	$("#title").animate({opacity:0},500, null);
                      });                    
                      
		     });


                    }); 
 		  }
	});
}

function newSession(){
	transition("#mainMenu", "#newSessionMenu", null);

	//Name
	//Collaborator
}

function oldSession(){
	transition("#mainMenu", "#oldSessionMenu", null);

}

function previousMenu(){
	transition(currentMenu, prevMenu, null);
}


function transition(last, next, callback){
	prevMenu = last;
	currentMenu = next;
	var afterAnim = function(){
		$(last).hide();
		$(next).show();
		$(next).animate({opacity:1},500,callback);
		$("button").removeAttr('disabled');
	}
	$(last).animate({opacity:0},500,afterAnim);
	$("button").attr('disabled', "true");
}

