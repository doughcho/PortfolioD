'use strict'

$(document).ready(function() {         	// Performs just after creating DOM tree
	var isOrder  = false;				// Order# exists or not
	var isCust   = false;				// Cust#  exists or not
	var isEmpl   = false;				// Empl#(Sales Rep#) exists or not
	var isSeq    = false;     			// Order items seq# exists or not
	var isItem	 = false;				// Item#  exists or not
	var orderID  = null;				// for orderID is changed or not
	var custID	 = null;				// for custID is changed or not
	var emplID   = null;				// for salesRep is changed or not	
    var seq      = null;				// for seq. is changed or not
	var itemID	 = null;				// for itemID is changed or not
    var dcAmt    = null;				// for discount is changed or not
	var jsonStr  = null;				// sending data (JSON format)
	var USD = new Intl.NumberFormat('en-US', {
		style: 'currency',				// number to currency format
		currency: 'USD',				// to USD
		minimumFractionDigits: 2,       // $999,999.99
	});									// usage: USD.format(value)
	const MAX_ROWS = 20;
	const COLUMNS  = 7; 
	var customer = {
		custID: 0,
		name: '',
		emplID: 0,
		addr: '',
		taxExmt: false,
		shipMthd: '1',
		emplName: ''		// JOIN (employees table)
	};
	var order = {
		orderID: 0,
		custID: 0,
		emplID: 0,
		orderDT: '',
		comment: '',
		status: '1',
		shipMthd: '1',
		shipAddr: '',
    	shipPayr: '1',
    	trackNum: '',
    	crName: '',
    	crDT: '',
    	updName: '',
    	updDT: '',
    	itemCnt: 0,
    	subTotal: 0.00,
    	taxAmt: 0.00,
    	shipChrg: 0.00,
    	dcAmt: 0.00,
    	paidAmt: 0.00,
    	taxExmt: false,		// JOIN (customers table)
     	custName: '',		// JOIN (customers table)
    	emplName: ''		// JOIN (employees table)
	};
 	var orderItem = {
		orderID: 0,
		seq: 0,
		itemID: 0,
		qty: 0,
		uPrice: 0.00,
		comment: '',
		updDT: '',
		itemName: ''		// JOIN (items table)
	};
    var summary = {			// for changed order info. (after 07, 15, 16, 17 event)
    	orderID: 0,
    	seq: 0,				// for added orderItem (15)
    	itemCnt: 0,         // recalculated (server)
    	subTotal: 0.0,		// recalculated (server)
    	taxAmt: 0.0,		// recalculated (server)
		updName: '',
		updDT: ''
    };	
	// HTML table IDs
	var tIDs = new Array(MAX_ROWS);
		for (var i = 0; i < MAX_ROWS; i++) tIDs[i] = new Array(COLUMNS);
	setIDs(MAX_ROWS);		// setup HTML table IDs
	// HTML table Values
	var tVal = new Array(MAX_ROWS);
		for (var i = 0; i < MAX_ROWS; i++) tVal[i] = new Array(COLUMNS);
    
//	alert('came in orderMgmt.ready()');
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
	
	// assign constant variables to all event related fields
	const t01 = document.getElementById('orderID');	// Order #
	const t02 = document.getElementById('newBtn');	// Enter a New Order button
	const t03 = document.getElementById('custID');	// Customer #
	const t04 = document.getElementById('rctBtn');	// Recent Orders (the customer's)
	const t05 = document.getElementById('emplID');	// Sales Rep.
	const t06 = document.getElementById('addBtn');	// Register Order button
	const t07 = document.getElementById('chgBtn');	// Change Order button
	const t08 = document.getElementById('canBtn');	// Cancel Order button
	const t09 = document.getElementById('dcAmt');	// Discount
	const t10 = document.getElementById('seq');	    // Seq.
	const t11 = document.getElementById('inewBtn');	// Enter a New Item button
	const t12 = document.getElementById('itemID');	// Item #
	const t13 = document.getElementById('qty');	    // Quantity	
	const t14 = document.getElementById('uPrice');	// Unit Price
	const t15 = document.getElementById('iaddBtn');	// Add Item button
	const t16 = document.getElementById('ichgBtn');	// Change Item button
	const t17 = document.getElementById('idelBtn');	// Delete Item button
	const t18 = document.getElementById('trkBtn');	// Track Package button		
	const d01 = document.getElementById('custName');// Cust. Name (display only)
	const d02 = document.getElementById('emplName');// Rep. Name  (display only)
	const d03 = document.getElementById('orderDT'); // Order Date
	const d04 = document.getElementById('shipAddr');// Ship Addr.
	const d05 = document.getElementById('itemName');// Item Desc. (display only)
	const d06 = document.getElementById('icomment');// comment (orderItem)
	clearAll();
	var savedPos = t01;
	t01.focus();
    
	t01.addEventListener('focusin', function() {
		orderID = t01.value;
	});
	t01.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t03.focus();
	});
	t01.addEventListener('focusout', function() {
		var ordID = t01.value;
		if (ordID == orderID) return;
		clearAll();
		t01.value = orderID = ordID;
		if (orderID == '') return;
		savedPos = t01;
		jsonStr = '{"orderID":'+orderID+'}';
		callServlet('01');
	});
	
	t02.addEventListener('click', function() {
		clearAll();
		t01.disabled = true;
		t03.focus();
		alert('Please enter a new customer order and click "Register Order" button');
	});

	t03.addEventListener('focusin', function() {
		custID = t03.value;
	});
	t03.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t04.focus();
	});
	t03.addEventListener('focusout', function() {
		var cuID = t03.value;
		if (cuID == custID) return;
		custID = cuID;
		isCust = false;
		d01.value = t05.value = d02.value = d04.value = '';		
		if (custID == '') return;
		savedPos = t03;
		jsonStr = '{"custID":'+custID+'}';
		callServlet('03');
	});

	t04.addEventListener('click', function() {
		if (!isCust) {
			alert('custID '+t03.value+' does not exist');
			return;
		}
		setCookie('custID', t03.value);
		setCookie('whatFunc', '9');
		var pOption = 'width=450, height=350, left=680, top=255, toolbar=no, menubar=no, scrollbars=no, location=no, titlebar = no, status=no, resizable=no, fullscreen=no';
		var new_window = window.open('custOrder.html', 'custOrdPopup', pOption);
		new_window.onbeforeunload = function() {
			var ordID = getCookie('orderID');
			if (ordID == '999999') return;
			if (t01.value == ordID) return;
			orderID = t01.value = ordID;
			savedPos = t01;
			jsonStr = '{"orderID":'+orderID+'}';
			callServlet('01');
		}	
	});
	
	t05.addEventListener('focusin', function() {
		emplID = t05.value;
	});
	t05.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) d03.focus();
	});
	t05.addEventListener('focusout', function() {
		var sales = t05.value;
		if (sales == emplID) return;
		emplID = sales;
		d02.value = '';
		isEmpl = false;
		if (emplID == '') return;
		savedPos = t05;
		jsonStr = '{"emplID":'+emplID+'}';					
		callServlet('05');
	});

	t06.addEventListener('click', function() {
		t01.disabled = false;		// needed to escape the 'Enter a New Order' loop
		if (isOrder || !isCust || !isEmpl) {
			alert('You need to enter all the order data correctly');
			return;
		}
		getOrderData();
		order.orderID = 0;          // 0 and '' is different in Java 
   		jsonStr = JSON.stringify(order);
		callServlet('06');
	});
	
	t07.addEventListener('click', function() {
		if (!isOrder || !isCust || !isEmpl) {
			alert('You need to enter all the order data correctly');
			return;
		}
		getOrderData();
   		jsonStr = JSON.stringify(order);
		callServlet('07');
	});

	t08.addEventListener('click', function() {
		if (!isOrder) {
			alert('You need to have an order to cancel');
			return;
		}
		jsonStr = '{"orderID":'+orderID+'}';
		callServlet('08');
	});
	
	t09.addEventListener('focusin', function() {
		if (isOrder) dcAmt = t09.value;
		else alert('You need to select an order first');
	});
	t09.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t01.focus();
	});
	t09.addEventListener('focusout', function() {
		var dc = t09.value;
		if (dc == dcAmt) return;
		dcAmt = dc;
		if (!isOrder) return;
		if (!isDollar(dcAmt)) {
			alert('Enter valid "Discount" (zzz.zz)');
			return;
		}
		order.dcAmt = dcAmt;
   		jsonStr = JSON.stringify(order);
		callServlet('09');
	});
	
	t10.addEventListener('focusin', function() {
		if (isOrder) seq = t10.value;
		else alert('You need to select an order first');
	});
	t10.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t12.focus();
	});
	t10.addEventListener('focusout', function() {
		var sq = t10.value;
		if (sq == seq) return;
		seq = sq;
		if (!isOrder) return;
		var itemPos = getItemPos(seq);
		if (itemPos < order.itemCnt) showOrderItem(itemPos);
		else {
			clearOrderItem();
			t10.value = seq = sq;
			alert('the Seq. '+seq+' does not exist');
			t10.focus();
		}
	});
	
	t11.addEventListener('click', function() {
		if (!isOrder) {
			alert('You need to select an order first');
			return;
		}
		if (order.itemCnt == MAX_ROWS) {
			alert('Maximum item count is ' + MAX+ROWS);
			return;
		}
        clearOrderItem();
		t10.disabled = true;
		t12.focus();
		alert('Enter a new order item and click "Add Item" button');
	});

	t12.addEventListener('focusin', function() {
		if (isOrder) itemID = t12.value;
		else alert('You need to select an order first');		
	});
	t12.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t13.focus();
	});
	t12.addEventListener('focusout', function() {
		var itmID = t12.value;
		if (itmID == itemID) return;
		itemID = itmID;
		if (!isOrder) return;
		isItem = false;
		d05.value = '';
		if (itemID == '') return;
		savedPos = t12;
		jsonStr = '{"itemID":'+itemID+'}';		
	    callServlet('12');
	});

	t13.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) t14.focus();
	});
	t13.addEventListener('focusout', function() {
		document.getElementById('amount').value = USD.format(t13.value * t14.value);
	});

	t14.addEventListener('keyup', function(event) {
		event.preventDefault();
		if (event.keyCode == 13) d06.focus();
	});
	t14.addEventListener('focusout', function() {
		if (!isDollar(t14.value)) {
			alert('Enter valid \'Unit Price\' (zzz.zz)');
			t14.focus();
		} else document.getElementById('amount').value = USD.format(t13.value * t14.value);
	});

	t15.addEventListener('click', function() {
		t10.disabled = false;		// needed to escape the 'Enter a New Item' loop
		if (!isOrder) {
			alert('You need to select an order first');
			return;
		}
		if (isSeq || !isItem) {
			alert('You need to enter all the data correctly');
			return;
		}
		getItemData();
		orderItem.seq = 0;          // 0 and '' is different in Java 
   		jsonStr = JSON.stringify(orderItem);
		callServlet('15');
	});
	
	t16.addEventListener('click', function() {
		if (!isOrder) {
			alert('You need to select an order first');
			return;
		}
		if (!isSeq || !isItem) {
			alert('You need to enter existing seq # and item');
			return;
		}
		getItemData();
   		jsonStr = JSON.stringify(orderItem);
		callServlet('16');
	});
	
	t17.addEventListener('click', function() {
		if (!isOrder) {
			alert('You need to select an order first');
			return;
		}
		if (!isSeq) {
			alert('You need to enter existing seq #');
			return;
		}
		jsonStr = '{"orderID":'+orderID+', "seq":'+seq+'}';
		callServlet('17');
	});

	t18.addEventListener('click', function() {	// remained: "Track Package" pop-up
		var trackNum = t18.value;
		if (trackNum != '') {		
			setCookie('trackNum', trackNum);
			// call popup window for tracking the package
			alert(trackNum + ' tracking info. will be displayed');
		}
	});
	
	function getOrderData() {
		order.orderID = t01.value;
		order.custID  = t03.value;
		order.emplID  = t05.value;		    
		order.orderDT = d03.value;
		order.comment = document.getElementById('comment').value;
		order.status  = document.getElementById('status').value;
		order.shipMthd= document.getElementById('shipMthd').value;
		order.shipAddr= d04.value;
		order.shipPayr= document.getElementById('shipPayr').value;
	}
	function getItemData() {
		orderItem.orderID = t01.value;
		orderItem.seq     = t10.value;
		orderItem.itemID  = t12.value;		    
		orderItem.qty 	  = t13.value;
		orderItem.uPrice  = t14.value;
		orderItem.comment = d06.value;
	}
	
	function setIDs(rows) {
		for (var i = 0; i < rows; i++) {
			tIDs[i][0] = document.getElementById('s'+i);
			tIDs[i][1] = document.getElementById('item'+i);
			tIDs[i][2] = document.getElementById('iDesc'+i);
			tIDs[i][3] = document.getElementById('qty'+i);
			tIDs[i][4] = document.getElementById('uPric'+i);
			tIDs[i][5] = document.getElementById('amount'+i);
			tIDs[i][6] = document.getElementById('comment'+i);	
		}
	}
	function setRowValue(row) {
		tVal[row][0] = orderItem.seq;
		tVal[row][1] = orderItem.itemID;
		tVal[row][2] = orderItem.itemName;
		tVal[row][3] = orderItem.qty;
		tVal[row][4] = orderItem.uPrice;
		tVal[row][5] = tVal[row][3] * tVal[row][4];
		tVal[row][6] = orderItem.comment;	
	}
		    
	function clearAll() {
		clearOrder();
		showDetails(0);
		clearOrderItem();
		order.itemCnt = order.subTotal = order.taxAmt = order.shipChrg = order.dcAmt = order.paidAmt = 0;
		showSummary();
	}
	function clearOrder() {		
		t01.value = t03.value = d01.value = t05.value = d02.value = d04.value = '';
		var today = new Date();					// returns GMT
		today.setHours(today.getHours() - 8);	// to get PST (date is automatically adjusted)
		var todayStr = today.toISOString().substr(0, 10);
		d03.value = todayStr;
		document.getElementById('status').value = '1';
		document.getElementById('shipMthd').value = '1';
		document.getElementById('shipPayr').value = '1';		
		document.getElementById('comment').value = '';
		document.getElementById('trackNum').value = '';		    
    	document.getElementById('crName').value = '';
    	document.getElementById('crDT').value = '';	
    	document.getElementById('updName').value = '';
    	document.getElementById('updDT').value = '';
		orderID = custID = emplID = '';
		isOrder = isCust = isEmpl = t06.disabled = false;
		t07.disabled = t08.disabled = true;
	}
	function clearOrderItem() {		
		t10.value = t12.value = t14.value = d05.value = t13.value = d06.value = '';
		document.getElementById('amount').value = '';
		seq = itemID = '';
		isSeq = isItem = t15.disabled = false;
		t16.disabled = t17.disabled = true;
	}
	
	function showAll() {
		showOrder();
		showDetails(order.itemCnt);
		clearOrderItem();
		showSummary();		
	}
	function showOrder() {
		t03.value = custID = order.custID;
		d01.value = order.custName;
		t05.value = emplID = order.emplID;
		d02.value = order.emplName;
		d03.value = order.orderDT;
		document.getElementById('status').value   = order.status;
		document.getElementById('shipMthd').value = order.shipMthd;
		document.getElementById('shipPayr').value = order.shipPayr;
		d04.value = order.shipAddr;
		document.getElementById('comment').value  = order.comment;
		document.getElementById('trackNum').value = order.trackNum;		    
    	document.getElementById('crName').value   = order.crName;
    	document.getElementById('crDT').value	  = order.crDT;
    	document.getElementById('updName').value  = order.updName;
    	document.getElementById('updDT').value    = order.updDT;		
		isOrder = isCust = isEmpl = t06.disabled  = true;
		t01.disabled = t07.disabled = t08.disabled= false;
	}
	function showOrderItem(pos) {
		t10.value = seq = tVal[pos][0];
		t12.value = itemID = tVal[pos][1];
		d05.value = tVal[pos][2];
		t13.value = tVal[pos][3];
		t14.value = tVal[pos][4];
		document.getElementById('amount').value = USD.format(tVal[pos][5]);
		d06.value = tVal[pos][6];
		isSeq = isItem = t15.disabled = true;
		t16.disabled = t17.disabled = false;	    
	}
	function getItemPos(seq) {
		var row = order.itemCnt;
		for (var i = 0; i < order.itemCnt; i++) {
			if (tVal[i][0] == seq) {
				row = i;
				break;
			}
		}
		return row;
	}
	function adjustDetails() {
		var row = getItemPos(orderItem.seq);
		alert('orderItem.seq is '+orderItem.seq+', row is '+row);
		if (row == order.itemCnt) return;	// deleted orderItem is the last one
		if (getCookie('whatEvent') == '16') setRowValue(row);
		else {								// deleted item is in the middle
			for (var i = row; i < (order.itemCnt + 1); i++) {
				for (var j = 0; j < COLUMNS; j++) tVal[i][j] = tVal[i+1][j];
			}
		}
	}
	function showDetails(lines) {
		if (lines > MAX_ROWS) lines = MAX_ROWS;
		for (var i = 0; i < lines; i++) {
			tIDs[i][0].innerHTML = tVal[i][0];
			tIDs[i][1].innerHTML = tVal[i][1];
			tIDs[i][2].innerHTML = tVal[i][2];
			tIDs[i][3].innerHTML = tVal[i][3];
			tIDs[i][4].innerHTML = USD.format(tVal[i][4]);
			tIDs[i][5].innerHTML = USD.format(tVal[i][5]);
			tIDs[i][6].innerHTML = tVal[i][6];
		}
		for (var i = lines; i < MAX_ROWS; i++) {
			for (var j = 0; j < COLUMNS; j++) tIDs[i][j].innerHTML = '';
		}
	}
	function showSummary() {
		var total = order.subTotal + order.taxAmt + order.shipChrg - order.dcAmt;
		var remained = total - order.paidAmt;
		document.getElementById('itemCnt').value  = order.itemCnt;
		document.getElementById('subTotal').value = USD.format(order.subTotal);
		document.getElementById('taxAmt').value   = USD.format(order.taxAmt);
		document.getElementById('shipChrg').value = USD.format(order.shipChrg);
		t09.value = dcAmt = order.dcAmt;			
		document.getElementById('total').value 	  = USD.format(total);
		document.getElementById('paidAmt').value  = USD.format(order.paidAmt);		
		document.getElementById('remained').value = USD.format(remained);
	}
	
	function isDollar(numstr) {				//check for valid dollar (999.99)
		if (numstr == '') return true;		// 0 is OK
		var dotpos = numstr.indexOf('.');	// delimiter position ('.')
		if (dotpos == -1) return true;  	// no '.' found
		if ((dotpos + 3) >= numstr.length) return true;
		else return false;					// more than 2 numbers after '.'
	}
	
	function callServlet(eventID) {
		var json = null;
		setCookie('whatEvent', eventID);
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
        	    	savedPos.focus();		// return to the requested point
        	    	return;
        	    }
//        		alert('success function is running');
     			switch (eventID) {
     				case '01': 				// 'Order #' inserted
 						json  = JSON.stringify(response.ord);
 						order = JSON.parse(json);
 						for (var i = 0; i < order.itemCnt; i++) {
 						    json = JSON.stringify(response.ordItem[i]);
 							orderItem = JSON.parse(json);
 							setRowValue(i);
 						}
 						showAll();
     					break;
     				case '03': 				// 'Customer #' inserted
 						json = JSON.stringify(response);
 						customer = JSON.parse(json);   				
						order.custID   = customer.custID;
						order.custName = d01.value = customer.name;
						order.emplID   = emplID = t05.value = customer.emplID;
						order.emplName = d02.value = customer.emplName;
						order.shipMthd = document.getElementById('shipMthd').value = customer.shipMthd;
						order.shipAddr = d04.value = customer.addr;
						order.taxExmt  = customer.taxExmt;
						isCust = isEmpl= true;
     					break;
     				case '05': 				// 'Sales Rep.' inserted
						order.emplName = d02.value = response.emplName;
						isEmpl = true;
     					break;
     				case '06': 				// 'Register Order' clicked
						order.orderID = orderID = t01.value = response.orderID;
						order.crName  = document.getElementById('crName').value = response.crName;
						order.crDT    = document.getElementById('crDT').value   = response.crDT;
						alert('New order registered successfully');
						t07.disabled = t08.disabled = false;
						isOrder = t06.disabled = true;
						t11.focus();
     					break;
     				case '07': 				// 'Change Order' clicked
     				case '08':				// 'Cancel Order' clicked
						if (eventID == '07') order.taxAmt  = response.taxAmt;
						else order.status = document.getElementById('status').value = '9';
						t01.focus();
     				case '09':				// 'DcAmt' changed
						order.updName = document.getElementById('updName').value = response.updName;
						order.updDT   = document.getElementById('updDT').value   = response.updDT;
						if (eventID != '08') showSummary();
     					break;
     				case '12':				// 'Item #' inserted
						orderItem.itemName = d05.value = response.itemName;
			            isItem = true;
     					break;
     				case '15':				// 'Add Item' clicked
     				case '16':				// 'Change Item' clicked
     				case '17':				// 'Delete Item' clicked
 						json = JSON.stringify(response);
 						summary = JSON.parse(json);
 						orderItem.seq = t10.value = summary.seq;
 						order.itemCnt = summary.itemCnt;
 						order.subTotal= summary.subTotal; 
 						order.taxAmt  = summary.taxAmt;
 						if (eventID == '15') {
 							isSeq = isItem = t15.disabled = true;
							t16.disabled = t17.disabled = false;
 							setRowValue(order.itemCnt - 1);
 						} else {
							order.updName = document.getElementById('updName').value = summary.updName;
							order.updDT   = document.getElementById('updDT').value   = summary.updDT;
							adjustDetails();
 						}
 						showDetails(order.itemCnt);					 						
						showSummary();
						if (eventID == '17') clearOrderItem();
						t10.focus();
						break;
     				default:				// just in case
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
	}				   // end callServlet();
});		               // end (document).ready