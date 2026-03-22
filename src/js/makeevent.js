// Javascript Event Tool
// FUNCTIONS FOR creating event display

// Copyright Ole Nielsen 2002-2005


const head1 = "<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
const head2 = "</TITLE><style>\npre {font-size:12px}\n</style></HEAD><BODY>";


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


function pheader(doc, obj, obs, title, descrip, line1, line2) {
	// common code for page header
	let str = `${head1}AstroTools: ${title}${head2}`;
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


// 'l_events' is array of records holding all detected events. Each record comprising:
// 1. time in JD format; 2. first object; 3. second object; 
// 4. event type: 0=conj, 1=summer solstice/1st quarter/quadrature, 2=aut. equinox/oppos./Full Moon, 
//		3=winter solstice/last quarter/quadrature, 4=max elong, 8=peri/apo event; 
// 5. angle or distance; 6. position angle or peri/apo flag

function longitudeEvents(obs, jdmax, l_events, sel) {
	// Find equinoxes, solstices, moon phases, oppositions, mutual and solar conjunctions
	// For each day in timespan detect if an event takes place by comparing longitudes
	let objects;
	if (!sel.conj_sol && !sel.conj_moon && !sel.conj_planet && !sel.quadrature) {
		objects = [SUN];
		if (sel.phase) objects[1] = MOON;
	} else {
		objects = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN, URANUS, NEPTUNE];
		if (!sel.phase && !sel.conj_moon) objects.splice(1, 1); // remove moon
	}
	let odat0 = []; // positions of all objects at start of day
	let odat2 = []; // positions at end of day
	let jday = jd0(obs.year, obs.month, obs.day) + obs.tz / 1440.0;
	for (let i in objects) {
		let p = objects[i];
		odat0[p] = PlanetAlt(p, jday, obs);
	}
	while (jday < jdmax) {
		for (let i in objects) {
			let p = objects[i];
			odat2[p] = PlanetAlt(p, jday + 1.0, obs);
		}
		for (let i in objects) { // check for events relative to Sun
			let p = objects[i];
			for (let a = 0; a < 360; a += 90) {
				// a = desired difference in longitude, 0 = new Moon/vernal equinox or solar conjunction, 
				// 90 = 1st quarter/summer solstice/quadrature etc
				if (p == SUN) {
					dlon0 = rev2(odat0[p][5] - a);
					dlon2 = rev2(odat2[p][5] - a);
				} else {
					dlon0 = rev2(odat0[p][5] - odat0[SUN][5] - a);
					dlon2 = rev2(odat2[p][5] - odat2[SUN][5] - a);
				}
				if (SGN(dlon2) != SGN(dlon0) && Math.abs(dlon2) < 20 && Math.abs(dlon0) < 20) {
					// the <20 test necessary, otherwise "oppositions" detected as well"
					odat1 = PlanetAlt(p, jday + 0.5, obs);
					sdat1 = PlanetAlt(SUN, jday + 0.5, obs);
					if (p == SUN) dlon1 = rev2(sdat1[5] - a);
					else dlon1 = rev2(odat1[5] - sdat1[5] - a);
					let n0 = nzero(dlon0, dlon1, dlon2);
					let jdzero = jday + 0.5 + n0 / 2;
					if ((p == MERCURY || p == VENUS) && dlon2 < 0) // detect if inferior conjunction
						l_events[l_events.length] = [jdzero, p, SUN, 2, 0, 0];
					else
						l_events[l_events.length] = [jdzero, p, SUN, a / 90, 0, 0];
				}
			}
		}
		if (sel.conj_moon || sel.conj_planet) {
			for (let i = 1; i < objects.length - 1; i++) { // check for mutual conjunctions, Sun ignored
				let p = objects[i];
				for (let j = i + 1; j < objects.length; j++) {
					let q = objects[j];
					dlon2 = rev2(odat2[p][5] - odat2[q][5]);
					dlon0 = rev2(odat0[p][5] - odat0[q][5]);
					if (SGN(dlon2) != SGN(dlon0) && Math.abs(dlon2) < 20 && Math.abs(dlon0) < 20) {
						odat1 = PlanetAlt(p, jday + 0.5, obs);
						sdat1 = PlanetAlt(q, jday + 0.5, obs);
						dlon1 = rev2(odat1[5] - sdat1[5]);
						n0 = nzero(dlon0, dlon1, dlon2);
						jdzero = jday + 0.5 + n0 / 2;
						odat1 = PlanetAlt(p, jdzero, obs);
						sdat1 = PlanetAlt(q, jdzero, obs);
						l_events[l_events.length] = [jdzero, p, q, 0, odat1[6] - sdat1[6], 0];
					}
				}
			}
		}
		for (let i in objects) {
			let p = objects[i];
			odat0[p][5] = odat2[p][5];
		}
		jday += 1.0;
	}
} // end longitudeEvents()


function elongEvents(obs, jdmax, l_events) {
	// Detect max elongations for Mercury, Venus
	let e0 = [];
	let e1 = [];
	let e2 = [];
	let jdmin = jd0(obs.year, obs.month, obs.day) + obs.tz / 1440.0;
	let jday = jdmin;
	bodies[MERCURY].elongupdate(jday - 1.0, obs);
	e0[0] = bodies[MERCURY].elong;
	bodies[MERCURY].elongupdate(jday, obs);
	e1[0] = bodies[MERCURY].elong;
	bodies[VENUS].elongupdate(jday - 1.0, obs);
	e0[1] = bodies[VENUS].elong;
	bodies[VENUS].elongupdate(jday, obs);
	e1[1] = bodies[VENUS].elong;
	while (jday < jdmax + 1.0) {
		for (let i = 0; i <= 1; i++) {
			let p = (i == 0 ? MERCURY : VENUS);
			bodies[p].elongupdate(jday + 1.0, obs);
			e2[i] = bodies[p].elong;
			if (e1[i] > e0[i] && e1[i] > e2[i]) {
				n0 = nextrem(e0[i], e1[i], e2[i]);
				jdextr = jday + n0;
				if (jdextr >= jdmin && jdextr <= jdmax) {
					bodies[p].elongupdate(jdextr, obs);
					l_events[l_events.length] = [jdextr, p, p, 4, bodies[p].elong, bodies[p].pa];
				}
			}
			e0[i] = e1[i];
			e1[i] = e2[i];
		}
		jday += 1.0;
	}
} // end elongEvents()


function distEvents(obs, jdmax, l_events, sel) {
	// Detect peri/aphelion peri/apogee
	let e0 = [];
	let e1 = [];
	let e2 = [];
	let jdmin = jd0(obs.year, obs.month, obs.day) + obs.tz / 1440.0;
	let jday = jdmin;
	bodies[SUN].update(jday - 1.0, obs);
	e0[0] = bodies[SUN].dist;
	bodies[SUN].update(jday, obs);
	e1[0] = bodies[SUN].dist;
	bodies[MOON].update(jday - 1.0, obs);
	e0[1] = bodies[MOON].dist;
	bodies[MOON].update(jday, obs);
	e1[1] = bodies[MOON].dist;
	while (jday < jdmax + 1.0) {
		for (let i = 0; i <= 1; i++) {
			let p = (i == 0 ? SUN : MOON);
			bodies[p].update(jday + 1.0, obs);
			e2[i] = bodies[p].dist;
			if ((e1[i] > e0[i] && e1[i] > e2[i]) || (e1[i] < e0[i] && e1[i] < e2[i])) {
				let apo;
				if (e1[i] > e0[i]) apo = true;
				else apo = false;
				n0 = nextrem(e0[i], e1[i], e2[i]);
				jdextr = jday + n0;
				if (jdextr >= jdmin && jdextr <= jdmax) {
					bodies[p].update(jdextr, obs);
					l_events[l_events.length] = [jdextr, p, p, 8, bodies[p].dist, apo];
				}
			}
			e0[i] = e1[i];
			e1[i] = e2[i];
		}
		jday += 1.0;
	}
} // end distEvents()


function doPlanetEvents(obs, dspan, sel) {
	// Search lunar, solar and planetary events (conjunctions, quadratures, oppositions)
	// Incl. Moon phases, Earth equinoxes, solstices etc
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	obscopy.hours = 0;
	obscopy.minutes = 0; // set to local midnight
	let pwin = window.open("", "planetevents", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let title = "月と太陽のイベント";
	if (planets) title = "惑星イベント";
	let descrip = "地心位置";
	let line1 = "";
	let line2 = "   Date       Time                Event             ";
	pheader(doc, -1, obs, title, descrip, line1, line2);
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	let jdmax = jd(obsmax);
	let pevents = [];
	longitudeEvents(obscopy, jdmax, pevents, sel);
	if (sel.maxelong) elongEvents(obscopy, jdmax, pevents);
	if (sel.sol_peri || sel.moon_peri) distEvents(obscopy, jdmax, pevents); // peri/apo things
	isort(pevents); // bring out-of-order events into place
	for (let i = 0; i < pevents.length; i++) {
		let doprint = true;
		let descr = "";
		let dt = jdtocd(pevents[i][0] - obs.tz / 1440);
		let date = datestring2(dt[0], dt[1], dt[2]);
		let time = hmstring2(dt[4], dt[5], dt[6]);
		let p = pevents[i][1];
		let q = pevents[i][2];
		let sep = pevents[i][4];
		let ang = pevents[i][5];
		switch (pevents[i][3]) {
			case 0: // same longitude
				if (sel.season && p == SUN) descr = "春分";
				else if (sel.phase && p == MOON && q == SUN) descr = "新月";
				else if (sel.conj_sol && (p == MERCURY || p == VENUS) && q == SUN)
					descr = bodies[p].name + " 外合";
				else if (sel.conj_sol && p < SUN && q == SUN)
					descr = bodies[p].name + " 合";
				else if ((sel.conj_moon && p == MOON && !(q == SUN || q == URANUS || q == NEPTUNE)) ||
					(sel.conj_planet && p < SUN && q < SUN)) {
					descr = bodies[p].name + " と " + bodies[q].name + " の合";
					if (q != SUN) descr += "," + fixnum(Math.abs(sep), 5, 2) + "&deg; " +
						(sep >= 0 ? "北" : "南") + " " + bodies[q].name;
				} else doprint = false;
				break;
			case 1: // 90 deg difference
				if (sel.season && p == SUN) descr = "至点";
				else if (sel.phase && p == MOON) descr = "上弦";
				else if (sel.quadrature && p < SUN) descr = bodies[p].name + " 矩";
				else doprint = false;
				break;
			case 2: // 180 deg difference
				if (sel.season && p == SUN) descr = "秋分";
				else if (sel.phase && p == MOON) descr = "満月";
				else if (sel.conj_sol && (p == MERCURY || p == VENUS)) descr = bodies[p].name + " 内合";
				else if (sel.conj_sol && p < SUN) descr = bodies[p].name + " 衝";
				else doprint = false;
				break;
			case 3: // 270 deg difference
				if (sel.season && p == SUN) descr = "至点";
				else if (sel.phase && p == MOON) descr = "下弦";
				else if (sel.quadrature && p < SUN) descr = bodies[p].name + " 矩";
				else doprint = false;
				break;
			case 4: // max elongation
				descr = bodies[p].name + " 最大" + (ang < 180 ? "東" : "西") + "離角 (" +
					fixnum(sep, 5, 2) + "&deg;)";
				break;
			case 8: // max or min distance
				if (sel.sol_peri && p == SUN)
					descr = "地球 " + (ang ? "遠日点" : "近日点") + " (" + fixnum(sep, 5, 3) + " AU)";
				else if (sel.moon_peri && p == MOON)
					descr = "月 " + (ang ? "遠地点" : "近地点") + " (" + fixnum(sep, 5, 0) + " km)";
				else doprint = false;
				break;
			default:
				doprint = false;
		}
		if (doprint)
			doc.writeln(date + "   " + time + "      " + descr);
	}
	pbottom(doc, pwin, line2);
} // end doPlanetEvents()