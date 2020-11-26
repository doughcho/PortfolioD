'use strict'

function setCookie(cookieName, cookieValue) {
	var cValue = cookieValue.split(' ').join('_');
	document.cookie = cookieName + '=' + cValue;
}

function getCookie(cookieName) {
	var cookies = document.cookie.split(';'); // cookie array
	if (cookies.length < 1) return null;
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim();
		var delpos = cookie.indexOf('=');     // delimiter position ('=')
		var cName  = cookie.substr(0, delpos);
		var cValue = cookie.substr(delpos + 1);
		if (cName == cookieName) return cValue.split('_').join(' ');
	}
	return null;
}

function delCookie(cookieName) {
	var cValue = getCookie(cookieName); 
	if (cValue != null) {
		cValue += '; MaxAge=0';               // immediately expires
		setCookie(cookieName, cValue);
	} 
}