'use strict'

$(document).ready(function() {         	// Performs just after creating DOM tree
//	alert('came in login.ready()');
	var whatFunc = getCookie('whatFunc');		
	if (whatFunc == null || whatFunc == '0' || whatFunc == '9') {
	    // not came from home page (0: initial state; 9: other function is running)
		alert('Please use main page to login');
		window.close();
		return;
	}
	document.getElementById('userID').focus();
	const t = document.getElementById('login');
	t.addEventListener('click', function() {
//		alert('Login button clicked');                      // for debugging
		var userID = document.getElementById('userID').value;
		var passwd = document.getElementById('passwd').value;
		var jsonStr = '{"userID":"'+userID+'","passwd":"'+passwd+'"}'
		setCookie('whatEvent', "00");
		$.ajax({                       // Performs all the async comm. part (Client <-> Server)
			type: 'get',
			url: './SpringServlet02',       // Servlet url
			data: {json:jsonStr},			// Sending data
			contentType: 'json', 			// Data format to Server
			dataType: 'json',            	// Data format from Server
			timeout: 10000,                 // Setup maximum waiting time (if over; error: is processed)
			cache: false,                   // Works only when type is 'get'
			beforeSend: function() {        // Handles XMLHttpRequest object
//			  	alert('now sending...');
			},
        	success: function() {
//        		alert('success function is running');
        		var authStat = getCookie('authStat');
     			switch (authStat) {
     				case '3':
						window.close();
						if (whatFunc == '2') {
							var pOption = 'width=1580, height=800, left=170, top=100, toolbar=no, menubar=no, scrollbars=no, location=no, status=no, resizable=no, fullscreen=no';
							window.open('orderMgmt.html', 'OrdMgmtPopup', pOption);
						}
						setCookie('whatFunc', '9'); // to prevent external use of 'Login.html'
						break;
     				case '2':
     					alert('User ID inactive');
     					break;		
     				case '1':
     				case '0':
     					alert('User ID and/or password not match');
     					break;
     				default:
     					alert('Some abnormal situation happened');
     			}
			},
			error: function(xhr, status, error) {    // including timeout
				alert('xhr is '+xhr+' status is '+status);
				alert(error);
			},
			complete: function() {    // unconditionally process even met return()
			},			
		});            // end ajax
		return false;  // prevents the default action for that event
	});                // end Event listener
});		               // end (document).ready