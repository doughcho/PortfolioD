'use strict'

$(document).ready(function() {         	// Performs just after creating DOM tree
	const MAX_ROWS = 10;
	const COLUMNS  = 3; 
	// HTML table Values
	var tVal = new Array(MAX_ROWS);
		for (var i = 0; i < MAX_ROWS; i++) tVal[i] = new Array(COLUMNS - 1);
	// HTML table IDs
	var tIDs = new Array(MAX_ROWS);
		for (var i = 0; i < MAX_ROWS; i++) tIDs[i] = new Array(COLUMNS);
	setIDs(MAX_ROWS);		// setup HTML table IDs
    
//	alert('came in custOrder.ready()');
	if (getCookie('authStat') != '3') {	// if not authorized
		alert('You must login first');	
		window.close();
		return;	
	}
	if (getCookie('whatFunc') != '9') { // if not came from home page
		alert('Please use main page to use this function');
		window.close();
		return;
	}
	
	const endBtn = document.getElementById('endBtn');	// Close Window
	const selBtn0 = tIDs[0][2];
	const selBtn1 = tIDs[1][2];
	const selBtn2 = tIDs[2][2];
	const selBtn3 = tIDs[3][2];
	const selBtn4 = tIDs[4][2];
	const selBtn5 = tIDs[5][2];
	const selBtn6 = tIDs[6][2];
	const selBtn7 = tIDs[7][2];
	const selBtn8 = tIDs[8][2];
	const selBtn9 = tIDs[9][2];
	callServlet();
	endBtn.focus();	
    
	endBtn.addEventListener('click', function() {
		setCookie('orderID', '999999');
		window.close();
		return;
	});

	selBtn0.addEventListener('click', function() {
		setCookie('orderID', String(tVal[0][0]));
		self.close();
		return;
	});
	selBtn1.addEventListener('click', function() {
		setCookie('orderID', String(tVal[1][0]));
		self.close();
		return;
	});
	selBtn2.addEventListener('click', function() {
		setCookie('orderID', String(tVal[2][0]));
		self.close();
		return;
	});
	selBtn3.addEventListener('click', function() {
		setCookie('orderID', String(tVal[3][0]));
		self.close();
		return;
	});
	selBtn4.addEventListener('click', function() {
		setCookie('orderID', String(tVal[4][0]));
		self.close();
		return;
	});
	selBtn5.addEventListener('click', function() {
		setCookie('orderID', String(tVal[5][0]));
		self.close();
		return;
	});
	selBtn6.addEventListener('click', function() {
		setCookie('orderID', String(tVal[6][0]));
		self.close();
		return;
	});
	selBtn7.addEventListener('click', function() {
		setCookie('orderID', String(tVal[7][0]));
		self.close();
		return;
	});
	selBtn8.addEventListener('click', function() {
		setCookie('orderID', String(tVal[8][0]));
		self.close();
		return;
	});
	selBtn9.addEventListener('click', function() {
		setCookie('orderID', String(tVal[9][0]));
		self.close();
		return;
	});
	
	function setIDs(rows) {
		for (var i = 0; i < rows; i++) {
			tIDs[i][0] = document.getElementById('ordNum'+i);
			tIDs[i][1] = document.getElementById('date'+i);
			tIDs[i][2] = document.getElementById('selBtn'+i);
		}
	}
		    
	function showDetails(lines) {
		if (lines > MAX_ROWS) lines = MAX_ROWS;
		for (var i = 0; i < lines; i++) {
			tIDs[i][0].innerHTML = tVal[i][0];
			tIDs[i][1].innerHTML = tVal[i][1];
			tIDs[i][2].disabled  = false;
		}
		for (var i = lines; i < MAX_ROWS; i++) {
			tIDs[i][0].innerHTML = '';
			tIDs[i][1].innerHTML = '';
			tIDs[i][2].disabled  = true;
		}
	}
	
	function callServlet() {
		var custID  = getCookie('custID');
		var jsonStr = '{custID:'+custID+',maxCnt:'+MAX_ROWS+'}';
		setCookie('whatEvent', '04');
		$.ajax({                    // Performs all the async comm. part (Client <-> Server)
			type: 'get',			// 'post' cannot send JSON data..  why?
			url: './SpringServlet02', // Servlet url
			data: {json:jsonStr},	// Sending data
			contentType: 'json',  	// Data format to Server
			dataType: 'json',       // Data format from Server
			timeout: 10000,         // Setup maximum waiting time (if over; error: is processed)
			cache: false,           // Works only when type is 'get'
			beforeSend: function() {// Handles XMLHttpRequest object
//			  	alert('now sending...');
			},
        	success: function(response) {	// response is JSON object
        	    if (getCookie('wellDone') == 'N') {
        	    	alert('Server message: ' + response.Message);
        	    	return;
        	    }
//        		alert('success function is running');
				var cnt = response.ordCnt;
 				for (var i = 0; i < cnt; i++) {
					tVal[i][0] = response.cOrds[i].orderID;
					var str = response.cOrds[i].date;
					tVal[i][1] = str.substr(5, 2) + '//';
					tVal[i][1]+= str.substr(8, 2) + '//';
					tVal[i][1]+= str.substr(0, 4);
 				}
 				showDetails(cnt);
        	},        		
			error: function(xhr, status, error) {    // including timeout
				alert('xhr is '+xhr+' status is '+status);
				alert(error);
			},
			complete: function() {    // unconditionally process even met return()
			},			
		});            // end ajax
	}				   // end callServlet();
});		               // end (document).ready