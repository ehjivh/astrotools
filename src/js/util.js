// Utility functions

// Copyright Ole Nielsen 2002-2004, Peter Hayes 1999-2001


function datestring(obs) {
	// datestring provides a locale independent format
	return `${obs.year}:${(obs.month < 10) ? '0' : ''}${obs.month}:${(obs.day < 10) ? '0' : ''}${obs.day}`;
}


function datestring2(year, month, day) {
	return `${year}:${(month < 10) ? '0' : ''}${month}:${(day < 10) ? '0' : ''}${day}`;
}


function adjustTime(obs, amount) {
	// update date and time, amount is in minutes (may be negative)
	// added 2004
	month_length[1] = leapyear(obs.year) ? 29 : 28;
	if (amount < 0) {
		amount = Math.abs(amount);
		obs.minutes -= amount % 60;
		amount = Math.floor(amount / 60.0);
		obs.hours -= amount % 24;
		amount = Math.floor(amount / 24.0);
		obs.day -= amount;
		if (obs.minutes < 0) {
			obs.minutes += 60;
			obs.hours -= 1;
		}
		if (obs.hours < 0) {
			obs.hours += 24;
			obs.day -= 1;
		}
		while (obs.day < 1) {
			obs.day += month_length[obs.month - 2 + (obs.month == 1 ? 12 : 0)];
			obs.month -= 1;
			if (obs.month == 0) {
				obs.year -= 1;
				obs.month = 12;
				month_length[1] = (leapyear(obs.year) ? 29 : 28);
			}
		}
	} else {
		obs.minutes += amount % 60;
		amount = Math.floor(amount / 60.0);
		obs.hours += amount % 24;
		amount = Math.floor(amount / 24.0);
		obs.day += amount;
		if (obs.minutes > 59) {
			obs.minutes -= 60;
			obs.hours += 1;
		}
		if (obs.hours > 23) {
			obs.hours -= 24;
			obs.day += 1;
		}
		while (obs.day > month_length[obs.month - 1]) {
			obs.day -= month_length[obs.month - 1];
			obs.month += 1;
			if (obs.month == 13) {
				obs.year += 1;
				obs.month = 1;
				month_length[1] = (leapyear(obs.year) ? 29 : 28);
			}
		}
	}
} // end adjustTime()


function hmsstring(t) {
	// the caller must add a leading + if required.
	let hours = Math.abs(t);
	let minutes = 60.0 * (hours - Math.floor(hours));
	hours = Math.floor(hours);
	let seconds = Math.round(60.0 * (minutes - Math.floor(minutes)));
	minutes = Math.floor(minutes);
	if (seconds >= 60) {
		minutes += 1;
		seconds -= 60;
	}
	if (minutes >= 60) {
		hours += 1;
		minutes -= 60;
	}
	if (hours >= 24) {
		hours -= 24;
	}
	let hmsstr = (t < 0) ? "-" : "";
	hmsstr = ((hours < 10) ? "0" : "") + hours;
	hmsstr += ((minutes < 10) ? ":0" : ":") + minutes;
	hmsstr += ((seconds < 10) ? ":0" : ":") + seconds;
	return hmsstr;
} // end hmsstring()


function hmstring(t, plus) {
	// hmstring converts hours to a string (+/-)hours:minutes, used for relative time (TZ)
	let hours = Math.abs(t);
	let minutes = Math.round(60.0 * (hours - Math.floor(hours)));
	hours = Math.floor(hours);
	if (minutes >= 60) {
		hours += 1;
		minutes -= 60;
	} // minutes could be 60 due to rounding
	if (hours >= 24) {
		hours -= 24;
	}
	let hmstr = (t < 0) ? "-" : (plus ? "+" : "");
	hmstr += ((hours < 10) ? "0" : "") + hours;
	hmstr += ((minutes < 10) ? ":0" : ":") + minutes;
	return hmstr;
} // end hmstring()


function hmstring2(hours, minutes, seconds) {
	// hmstring2 returns time as a string HH:MM (added 2004.01.02), seconds needed for rounding
	if (seconds >= 30) minutes++;
	if (minutes >= 60) {
		hours++;
		minutes = 0;
	}
	let timestr = ((hours < 10) ? "0" : "") + hours;
	timestr += ((minutes < 10) ? ":0" : ":") + minutes;
	return timestr;
} // end hmstring2()


function dmsstring(d) {
	// dmsstring converts lat/long angle to unsigned string d:m:s
	let deg = Math.abs(d);
	let minutes = 60.0 * (deg - Math.floor(deg));
	deg = Math.floor(deg);
	let seconds = Math.round(60.0 * (minutes - Math.floor(minutes)));
	minutes = Math.floor(minutes);
	if (seconds >= 60) {
		minutes += 1;
		seconds -= 60;
	}
	if (minutes >= 60) {
		deg += 1;
		minutes -= 60;
	}
	let hmsstr = ((deg < 10) ? "0" : "") + deg;
	hmsstr += ((minutes < 10) ? ":0" : ":") + minutes;
	hmsstr += ((seconds < 10) ? ":0" : ":") + seconds;
	return hmsstr;
} // end dmsstring()


function dmstring(d) {
	// dmstring converts lat/long angle to unsigned string d:m
	let deg = Math.abs(d);
	let minutes = 60.0 * (deg - Math.floor(deg));
	deg = Math.floor(deg);
	let seconds = Math.round(60.0 * (minutes - Math.floor(minutes)));
	minutes = Math.floor(minutes);
	if (seconds >= 30) {
		minutes += 1;
	}
	if (minutes >= 60) {
		deg += 1;
		minutes -= 60;
	}
	let hmstr = ((deg < 10) ? "0" : "") + deg;
	hmstr += ((minutes < 10) ? ":0" : ":") + minutes;
	return hmstr;
} // end dmstring()


function anglestring(a, circle, arcmin) {
	// Return angle as degrees:minutes. 'circle' is true for range between 0 and 360 
	// and false for -90 to +90, if 'arcmin' use deg and arcmin symbols
	let ar = Math.round(a * 60) / 60;
	let deg = Math.abs(ar);
	let min = Math.round(60.0 * (deg - Math.floor(deg)));
	if (min >= 60) {
		deg += 1;
		min = 0;
	}
	let anglestr = "";
	if (!circle) anglestr += (ar < 0 ? "-" : "+");
	if (circle) anglestr += ((Math.floor(deg) < 100) ? "0" : "");
	anglestr += ((Math.floor(deg) < 10) ? "0" : "") + Math.floor(deg);
	if (arcmin) anglestr += ((min < 10) ? "&deg;0" : "&deg;") + (min) + "' ";
	else anglestr += ((min < 10) ? ":0" : ":") + (min);
	return anglestr;
} // end anglestring()


function fixnum(n, l, d) {
	// convert float n to right adjusted string of length l with d digits after decimal point.
	// the sign always requires one character, allow for that in l!
	let m = 1;
	for (let i = 0; i < d; i++) m *= 10;
	let n1 = Math.round(Math.abs(n) * m);
	let nint = Math.floor(n1 / m);
	let nfract = (n1 - m * nint) + ""; // force conversion to string
	while (nfract.length < d) nfract = "0" + nfract;
	let str = (n < 0 ? "-" : " ") + nint;
	if (d > 0) str = str + "." + nfract;
	while (str.length < l) str = " " + str;
	return str;
} // end fixnum()


function fixstr(str, l) {
	// returns left-adjusted string of length l, pad with spaces or truncate as necessary
	if (str.length > l) return str.substring(0, l);
	while (str.length < l) {
		str += " ";
	}
	return str;
} // end fixstr()


function parsecol(str) {
	// parsecol converts deg:min:sec or hr:min:sec to a number
	let col1 = str.indexOf(":");
	let col2 = str.lastIndexOf(":");
	if (col1 < 0) return parseInt(str);
	let res;
	if (str.substring(0, 1) == "-") {
		res = parseInt(str.substring(1, col1), 10);
	} else {
		res = parseInt(str.substring(0, col1), 10);
	}
	if (col2 > col1) {
		res += (parseInt(str.substring(col1 + 1, col2), 10) / 60.0) +
			(parseInt(str.substring(col2 + 1, str.length), 10) / 3600.0);
	} else {
		res += (parseInt(str.substring(col1 + 1, str.length), 10) / 60.0);
	}
	if (str.substring(0, 1) == "-") {
		return -res;
	} else {
		return res;
	}
} // end parsecol()


function interpol(n, y1, y2, y3) {
	// interpolate y (Meeus 3.3)
	let a = y2 - y1;
	let b = y3 - y2;
	let c = b - a;
	return y2 + (n / 2) * (a + b + n * c);
}


function nzero(y1, y2, y3) {
	// Calculate value of interpolation factor for which y=zero. n0 should be within [-1:1] 
	// Meeus formula (3.7)	
	let a = y2 - y1;
	let b = y3 - y2;
	let c = b - a;
	let n0 = 0;
	let dn0;
	do {
		dn0 = -(2 * y2 + n0 * (a + b + c * n0)) / (a + b + 2 * c * n0);
		n0 += dn0;
	} while (Math.abs(dn0) > 0.0001);
	return n0;
} // end nzero()


function nextrem(y1, y2, y3) {
	// Calculate value of interpolation factor for which y reaches extremum (-1<n<1);
	let a = y2 - y1;
	let b = y3 - y2;
	let c = b - a;
	let nm = -(a + b) / (2 * c); // (3.5)
	return nm;
} // end nextrem();


function isort(arr) {
	// Sort 2D array in ascending order on first column of each element using insertion sort 
	for (let c = 0; c < arr.length - 1; c++) {
		let tmp = arr[c + 1];
		let a = c;
		while (a >= 0 && arr[a][0] > tmp[0]) {
			arr[a + 1] = arr[a];
			a--;
		}
		arr[a + 1] = tmp;
	}
} // end isort()