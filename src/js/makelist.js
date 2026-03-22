// Javascript AstroTools
// FUNCTIONS FOR CREATING EPHEMERIDES

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source


const listHead1 = "<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
const listHead2 = "</TITLE><style>\npre {font-size:12px}\n</style></HEAD><BODY>";


function nextDate(obs1, dstep, origday) {
	// update date and time, origday is day of month at start (some months may not allow this day)
	if (dstep < 0) { // dstep is in months (integer!)
		dstep = -dstep;
		if (dstep >= 12) {
			obs1.year += Math.floor(dstep / 12);
		} else {
			obs1.month += dstep;
			if (obs1.month > 12) {
				obs1.year++;
				obs1.month -= 12;
			}
		}
		month_length[1] = leapyear(obs1.year) ? 29 : 28; // check for leapyear
		obs1.day = (origday > month_length[obs1.month - 1] ? month_length[obs1.month - 1] : origday);
	} else { // dstep is in days (max 31)
		let m = Math.round(1440 * (dstep - Math.floor(dstep)));
		obs1.minutes += m - 60 * (Math.floor(m / 60));
		obs1.hours += Math.floor(m / 60);
		obs1.day += Math.floor(dstep);
		if (obs1.minutes > 59) {
			obs1.minutes -= 60;
			obs1.hours++;
		}
		if (obs1.hours > 23) {
			obs1.hours -= 24;
			obs1.day++;
		}
		month_length[1] = leapyear(obs1.year) ? 29 : 28; // check for leapyear
		while (obs1.day > month_length[obs1.month - 1]) {
			obs1.day -= month_length[obs1.month - 1];
			obs1.month++;
			if (obs1.month == 13) {
				obs1.year++;
				obs1.month = 1;
			}
		}
	}
} // end nextDate()


function dfrac2tstr(t) {
	// returns time string from fraction of day (0 <= t < 1). If t < 0 return '--:--'
	if (t < 0 || t >= 1) return "--:--";
	t1 = Math.round(1440 * t); // round to nearest minute
	let hours = Math.floor(t1 / 60);
	let minutes = t1 - 60 * hours;
	return hmstring2(hours, minutes, 0);
}


function pheader(doc, obj, obs, title, descrip, line1, line2) {
	// common code for page header
	let str = `${listHead1}AstroTools: ${title}${listHead2}`;
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>\n";
	str += `<h2>${title}</h2><p><b>${descrip}</b></p>`;
	if (obj >= 0 && obj < 100) str += "<h3>天体: " + bodies[obj].name + "</h3>";
	if (obj == 100) str += "<h3>天体: 全惑星</h3>";
	str += "<p>観測地: " + sitename();
	str += " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";
	let line3 = "";
	for (let i = 0; i < line2.length; i++) line3 += "-";
	str += "<pre>" + line1 + "\n" + line2 + "\n" + line3 + "\n";
	doc.write(str);
} //	end pheader()


function pbottom(doc, pwin, line2) {
	// finish the page
	let line3 = "";
	for (let i = 0; i < line2.length; i++) line3 += "-";
	let str = line3 + "</pre>\n";
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>\n";
	str += "</CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end pbottom()


function doTwilightAltAz(obs, obj, dspan, dstep, sunalt) {
	// Altitude of object at specified Sun depression (twilight visibility)
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	obscopy.hours = 12; // set to local noon
	obscopy.minutes = 0;
	if (dstep > 0 && dstep < 1.0) dstep = 1.0; // time step must be at least one day

	let pwin = window.open("", "twilight", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let descrip = "太陽高度が地平線下 " + (-sunalt) + "&deg; の時刻";
	let line1 = "                     明け方薄明                        夕方薄明        ";
	let line2 = "   日付          時刻     高度     方位   離角       時刻     高度     方位   離角";
	pheader(doc, obj, obs, "薄明時高度", descrip, line1, line2);
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		let jday = jd0(obscopy.year, obscopy.month, obscopy.day) + obscopy.tz / 1440.0;
		if (jday >= jdmax) break;
		let rset = sunrise(obscopy, sunalt);
		// do line for current date
		doc.write(datestring(obscopy));
		for (let t = 0; t < 2; t++) {
			doc.write("      " + (rset[2] ? hmstring(rset[t + 3], false) : "--:--"));
			if (rset[2]) { // false if Sun never reaches specified altitude on this day
				bodies[obj].update(rset[t], obscopy);
				bodies[obj].elongupdate(rset[t], obscopy);
				doc.write("   " + fixnum(bodies[obj].alt, 5, 1));
				doc.write("  " + fixnum(bodies[obj].az, 6, 1));
				doc.write("  " + fixnum(bodies[obj].elong, 6, 1));
			} else doc.write("    --.-    --.-    --.-");
		}
		doc.writeln("");
		nextDate(obscopy, dstep);
	}
	pbottom(doc, pwin, line2);
} // end doTwilightAltAz()


function doAltAz(obs, obj, dt) {
	// alt-az of object during one day in steps of dt minutes
	let obscopy = {}; // make working copy
	for (let i in obs) obscopy[i] = obs[i];
	let ostr = bodies[obj].name;
	let pwin = window.open("", "pl_altitude", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let line2 = "      Date    Time      Alt       Az     Sun    Moon";
	pheader(doc, obj, obs, "高度・方位", " ", "", line2);
	let jday = jd(obscopy);
	// for each 0.5 hours do
	for (let t = 0; t < 1440 / dt; t++) {
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[SUN].update(jday, obs);
		let sunalt = bodies[SUN].alt;
		bodies[MOON].update(jday, obs);
		let moonalt = bodies[MOON].alt;
		bodies[obj].update(jday, obs);
		doc.write("   " + fixnum(bodies[obj].alt, 6, 1));
		doc.write("   " + fixnum(bodies[obj].az, 6, 1) + "   ");
		if (sunalt > -0.833) doc.write("  Day");
		else if (sunalt > -6.0) doc.write("Civ-t");
		else if (sunalt > -12.0) doc.write("Nau-t");
		else if (sunalt > -18.0) doc.write("Ast-t");
		else doc.write(" Dark");
		if (moonalt > -0.833) doc.writeln("      Up");
		else doc.writeln("    Down");
		jday += dt / 1440.0;
		adjustTime(obscopy, dt);
	}
	pbottom(doc, pwin, line2);
} // end doAltAz()


function doObjectData(obs, obj, dspan, dstep) {
	// list object physical data (diameter, illumination, distance, brightness)
	// eq. diameters at dist=1 AU/1km
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	let pwin = window.open("", "illumdiam", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let line1 = "    Date      Time  Dist(Sun) Dist(Earth)    Diam.  Illum.  Brightn.";
	let line2 = "                         [AU]       [km]       [\"]     [%]    [mag]";
	if (obj != MOON)
		line2 = "                         [AU]       [AU]       [\"]     [%]    [mag]";
	pheader(doc, obj, obs, "天体データ", " ", line1, line2);
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		let jday = jd(obscopy);
		if (jday >= jdmax) break;
		// do line for current date
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[obj].update(jday, obscopy);
		let dist = bodies[obj].dist;
		let r = bodies[obj].r;
		doc.write(fixnum(r, 11, 3) + "    " + (obj == MOON ? fixnum(dist, 7, 0) : fixnum(dist, 7, 3)));
		if (obj < COMET) {
			doc.write(fixnum(ndiam[obj] / dist, 10, 1));
			doc.write(fixnum(bodies[obj].illum * 100, 8, 1));
		} else {
			doc.write("    ----.-   ---.-");
		}
		doc.writeln(fixnum(bodies[obj].mag, 9, 1));
		nextDate(obscopy, dstep, obs.day);
	}
	pbottom(doc, pwin, line2);
} // end doObjectData()


function doPositions(obs, obj, dspan, dstep) {
	// RA, declination, longitude, latitude and elongation
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	let pwin = window.open("", "declination", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let descrip = "地心位置";
	let line1 = "   Date       Time      RA        Dec      Alt.     Az.   Longitude  Latitude   Elongation";
	let line2 = "                      [h m s]    [&deg; \']      [&deg;]     [&deg;]     [&deg; \']      [&deg; \']        [&deg;]";
	pheader(doc, obj, obs, "位置", descrip, line1, line2);
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		let jday = jd(obscopy);
		if (jday >= jdmax) break;
		// do line for current date
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[obj].update(jday, obs);
		bodies[obj].elongupdate(jday, obs);
		let pa = bodies[obj].pa;
		doc.write("   " + hmsstring(bodies[obj].ra / 15));
		doc.write("   " + anglestring(bodies[obj].dec, false, true));
		doc.write(fixnum(bodies[obj].alt, 7, 1));
		doc.write(fixnum(bodies[obj].az, 8, 1));
		doc.write("    " + anglestring(bodies[obj].eclon, true, true));
		doc.write("   " + anglestring(bodies[obj].eclat, false, true));
		doc.write(fixnum(bodies[obj].elong, 8, 1) + "&deg;" + (pa >= 180 ? " W" : " E"));
		doc.writeln("");
		nextDate(obscopy, dstep, obs.day);
	}
	pbottom(doc, pwin, line2);
} // end doPositions()


function doAllPlanets(obs) {
	// print data for all planets for ONE day. Positions are for local noon.
	let obscopy = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
	}
	obscopy.hours = 0; // set to local midnight
	obscopy.minutes = 0;
	let ndiam = [6.72, 16.68, 1, 9.36, 196.88, 165.46, 70.04, 67.0, 1, 1919.3, 716900000.0];

	let pwin = window.open("", "declination", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let descrip = "Date: " + datestring(obscopy);
	let line1 = "Object     Rise  Transit   Set       RA        Dec       Elong     Dist     Diam    Illum  Brightn";
	let line2 = "                                   [h m s]    [deg]      [deg]   [AU/km]     [\"]     [%]    [mag]";
	pheader(doc, -1, obs, "全惑星データ", descrip, line1, line2);
	let objects = [9, 10, 0, 1, 3, 4, 5, 6, 7];
	for (let n in objects) {
		let obj = objects[n];
		let jday = jd(obscopy);
		doc.write(bodies[obj].name);
		// rise, transit, set
		let objevents = findEvents(obj, jday, obs);
		let rise = -1;
		let set = -1;
		let objtr = -1;
		for (let i = objevents.length - 2; i > 0; i--) { // scan array for relevant events
			let t = objevents[i][0];
			let e = objevents[i][1];
			if (e == -1) rise = t;
			if (e == 1) set = t;
			if (e == 0) objtr = t;
		}
		doc.write("   " + dfrac2tstr(rise));
		doc.write("   " + dfrac2tstr(objtr));
		doc.write("   " + dfrac2tstr(set));
		// positions
		bodies[obj].update(jday + 0.5, obs);
		bodies[obj].elongupdate(jday + 0.5, obs);
		let pa = bodies[obj].pa;
		doc.write("   " + hmsstring(bodies[obj].ra / 15));
		doc.write("   " + anglestring(bodies[obj].dec, false, true));
		doc.write(" " + fixnum(bodies[obj].elong, 6, 1) + "&deg;" + (pa >= 180 ? " W" : " E"));
		let dist = bodies[obj].dist;
		doc.write("  " + (obj == MOON ? fixnum(dist, 7, 0) : fixnum(dist, 7, 3)));
		doc.write("  " + fixnum(ndiam[obj] / dist, 7, 1));
		doc.write("  " + fixnum(bodies[obj].illum * 100, 6, 1));
		doc.writeln("   " + fixnum(bodies[obj].mag, 5, 1));
	}
	pbottom(doc, pwin, line2);
} // doAllPlanets()


function doSeparation(obs, obj1, obj2, dt) {
	let obscopy = {}; // make working copy
	for (let i in obs) obscopy[i] = obs[i];
	let pwin = window.open("", "pl_altitude", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let descrip = "of " + bodies[obj1].name + " and " + bodies[obj2].name;
	let line1 = "                        Object 1       Object 2";
	let line2 = "      Date    Time     Alt     Az     Separ.     PA    Occult.   Sun";
	pheader(doc, -1, obs, "離角", descrip, line1, line2);
	let jday = jd(obscopy);
	// for each dt minutes do
	for (let t = 0; t < 1440 / dt; t++) {
		doc.write(datestring(obscopy));
		doc.write("   " + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[SUN].update(jday, obs);
		let sunalt = bodies[SUN].alt;
		bodies[obj1].update(jday, obs);
		bodies[obj2].update(jday, obs);
		alt1 = bodies[obj1].alt;
		alt2 = bodies[obj2].alt;
		az1 = bodies[obj1].az;
		az2 = bodies[obj2].az;
		doc.write("  " + fixnum(alt1, 6, 1) + "  " + fixnum(az1, 6, 1));
		let sep = separation(az1, az2, alt1, alt2);
		doc.write("  " + fixnum(sep[0], 7, 2) + "&deg;" + "  " + fixnum(sep[1], 6, 1) + "   ");
		touchd = (ndiam[obj1] / bodies[obj1].dist + ndiam[obj2] / bodies[obj2].dist) / (2 * 3600);
		if (touchd > sep[0]) // check if occultation (eclipse, transit)
			doc.write("  あり   ");
		else
			doc.write("        ");
		if (sunalt > -0.833) doc.write("  Day");
		else if (sunalt > -6.0) doc.write("Civ-t");
		else if (sunalt > -12.0) doc.write("Nau-t");
		else if (sunalt > -18.0) doc.write("Ast-t");
		else doc.write(" Dark");
		doc.writeln("");
		jday += dt / 1440.0;
		adjustTime(obscopy, dt);
	}
	pbottom(doc, pwin, line2);
} // end doSeparation()


function doVisible(obs, deepsky, minalt, rasort) {
	// show visible stars or DSO
	let obscopy = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
	}
	let pwin = window.open("", "visible", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let descrip = "Date: " + datestring(obscopy) + "  Time: " + hmstring2(obscopy.hours, obscopy.minutes, 0);
	let line1 = "";
	let line2 = "Ident     Proper name         RA        Dec       Alt      Az      Rise  Transit   Set ";
	if (deepsky)
		line2 = "Ident    Name          Const     RA        Dec       Alt      Az      Rise  Transit   Set ";
	pheader(doc, -1, obs, "可視 " + (deepsky ? "深宇宙天体" : "恒星"), descrip, line1, line2);

	let jday = jd(obscopy);
	let ord = []; // for storing records of siderial time and index to catalogue
	let sid = local_sidereal(obs);
	for (let i = 0; i < (deepsky ? dso.length : stars.length); i++) {
		let h = parsecol(deepsky ? dso[i].ra : stars[i].ra) - sid; // negative hour angle
		if (h < 0) h += 24;
		if (h > 12) h -= 24;
		ord[i] = [h, i]; // 
	}
	if (rasort) isort(ord); // sort according to transit time starting from north
	for (let k = 0; k < (deepsky ? dso.length : stars.length); k++) {
		i = ord[k][1];
		let ra = (deepsky ? dso[i].ra : stars[i].ra);
		let de = (deepsky ? dso[i].de : stars[i].de);
		bodies[20].ra = parsecol(ra) * 15; // use User object as temporary object
		bodies[20].dec = parsecol(de);
		bodies[20].update(jday, obscopy);
		if (bodies[20].alt < minalt) continue; // object not visible, skip it	
		if (deepsky) {
			doc.write(fixstr(dso[i].numb, 9) + fixstr(dso[i].name, 14) + " " + dso[i].cons);
		} else {
			doc.write(fixstr(stars[i].star, 6) + fixstr(stars[i].cons, 4) + fixstr(stars[i].name, 14))
		}
		doc.write("   " + hmsstring(bodies[20].ra / 15));
		doc.write("   " + anglestring(bodies[20].dec, false, true));
		doc.write(" " + fixnum(bodies[20].alt, 6, 1));
		doc.write("   " + fixnum(bodies[20].az, 6, 1));

		let objevents = findEvents(20, jday - 0.5, obs); // center "day" on observation time
		let rise = -1;
		let set = -1;
		let objtr = -1;
		for (let j = objevents.length - 2; j > 0; j--) { // scan array for relevant events
			let t = objevents[j][0] + jday - obs.tz / 1440;
			t = t - Math.floor(t);
			let e = objevents[j][1];
			if (e == -1) rise = t;
			if (e == 1) set = t;
			if (e == 0) objtr = t;
		}
		doc.write("    " + dfrac2tstr(rise));
		doc.write("   " + dfrac2tstr(objtr));
		doc.write("   " + dfrac2tstr(set));

		doc.writeln("");
	}

	pbottom(doc, pwin, line2);
} // end doVisible()


function doDailyEvents(obs, obj, dspan, dstep, sunevents) {
	// List daily events (rise, set etc) for one object, optionally include solar events
	// obs is a reference variable, make a copy
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	obscopy.hours = 0; // set to local midnight
	obscopy.minutes = 0;
	if (dstep > 0 && dstep < 1.0) dstep = 1.0; // time step must be at least one day
	let ostr = bodies[obj].name;
	let pwin = window.open("", "daily", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let line1 = "               ";
	let line2 = "      Date     ";
	if (obj != SUN) {
		line1 += "  |         Object        ";
		line2 += "  |   Rise  Transit   Set ";
	}
	if (obj == SUN || sunevents) {
		line1 += "  |     Morning Twilight               Sun                Evening Twilight  ";
		line2 += "  |   Astr    Naut   Civil     Rise  Transit   Set     Civil    Naut    Astr";
	}
	pheader(doc, obj, obs, "日別イベント", "", line1, line2);
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	while (true) {
		let jday = jd0(obscopy.year, obscopy.month, obscopy.day) + obscopy.tz / 1440.0;
		if (jday >= jdmax) break;
		// do line for current date
		if (obj != SUN) {
			let objevents = findEvents(obj, jday, obs);
			let rise = -1;
			let set = -1;
			let objtr = -1;
			for (let i = objevents.length - 2; i > 0; i--) { // scan array for relevant events
				let t = objevents[i][0];
				let e = objevents[i][1];
				if (e == -1) rise = t;
				if (e == 1) set = t;
				if (e == 0) objtr = t;
			}
		}
		if (sunevents || obj == SUN) {
			let events = findEvents(SUN, jday, obs);
			srise = -1;
			sset = -1;
			ctw_b = -1;
			ctw_e = -1;
			ntw_b = -1;
			ntw_e = -1;
			atw_b = -1;
			atw_e = -1;
			for (let i = events.length - 2; i > 0; i--) {
				let t = events[i][0];
				let e = events[i][1];
				if (e == 0) suntr = t;
				else if (e == -1) srise = t;
				else if (e == 1) sset = t;
				else if (e == -2) ctw_b = t;
				else if (e == 2) ctw_e = t;
				else if (e == -3) ntw_b = t;
				else if (e == 3) ntw_e = t;
				else if (e == -4) atw_b = t;
				else if (e == 4) atw_e = t;
			}
		}
		let dw = Math.floor(jday + 1.5) - 7 * Math.floor((jday + 1.5) / 7);
		doc.write(datestring(obscopy) + "  " + dow[dw]);
		if (obj != SUN) {
			doc.write("     " + dfrac2tstr(rise) + "   " + dfrac2tstr(objtr) + "   " + dfrac2tstr(set));
		}
		if (obj == SUN || sunevents) {
			doc.write("     " + dfrac2tstr(atw_b) + "   " + dfrac2tstr(ntw_b) + "   " + dfrac2tstr(ctw_b));
			doc.write("    " + dfrac2tstr(srise) + "   " + dfrac2tstr(suntr) + "   " + dfrac2tstr(sset));
			doc.write("    " + dfrac2tstr(ctw_e) + "   " + dfrac2tstr(ntw_e) + "   " + dfrac2tstr(atw_e));
		}
		doc.writeln("");
		nextDate(obscopy, dstep);
	}
	pbottom(doc, pwin, line2);
} // end doDailyEvents()