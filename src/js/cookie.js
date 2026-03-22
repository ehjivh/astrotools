// Cookie functions

// Copyright Ole Nielsen 2002-2003
// Please read copyright notice in index.html source

// cookie value has format "place='Den Haag'&lat=52.03&lng=4.23&tz=-60&dst=false" (unescaped form)
// placeid is name of cookie (more than just "home" cookie possible)
// dst is true if tz is DST

// search for cookie "placeid" and initialize observer from it if found, else return 'false'
function getCookie(placeid, obs) {
	let place = "";
	let lat = 9999.0;
	let lng = 9999.0;
	let tz = 9999;
	let thisCookie = document.cookie.split("; ");
	if (thisCookie == "") return false;
	for (let i = 0; i < thisCookie.length; i++) {
		if (placeid == thisCookie[i].split("=")[0]) {
			let argstr = unescape(thisCookie[i].split("=")[1]);
			let args = argstr.split('&');
			if (args.length < 4) return false;
			for (let i = 0; i < args.length; i++) eval(args[i]);
		}
	}
	// check if valid values were read
	if (Math.abs(lat) > 90.0 || Math.abs(lng) > 180.0 || Math.abs(tz) > 960) return false;
	obs.name = place;
	obs.latitude = lat;
	obs.longitude = lng;
	obs.tz = tz;
	obs.dst = dst;
	//	tbl.Place.options[0].selected=true;
	rewritePlace();
	rewrite2();
	// rewrite cookie to refresh expire date
	setCookie(placeid, obs);
	return true;
}


// remember observatory in cookie 
function setCookie(placeid, obs) {
	let expireDate = new Date;
	expireDate.setFullYear(expireDate.getFullYear() + 2);
	let argstr = `place='${obs.name}'&lat=${obs.latitude}&lng=${obs.longitude}&tz=${obs.tz}&dst=${obs.dst}`;
	document.cookie = `${placeid}=${escape(argstr)}; expires=${expireDate.toGMTString()}`;
}


function deleteCookie(placeid) {
	let expireDate = new Date;
	expireDate.setFullYear(expireDate.getFullYear() - 1);
	document.cookie = `${placeid}=; expires=${expireDate.toGMTString()}`;
}