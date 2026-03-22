// Javascript Astrotools
// FUNCTIONS FOR CREATING CHARTS

// Copyright Ole Nielsen 2002-2004
// Please read copyright notice in astrotools2.html source


SUNLIGHT = 0;
PLANETLIGHT = 1;
MOONLIGHT = 5; // indices 2-4 no longer used

// first array stores colours used for visibility diagrams
// as RGB triplets of value RRGGBB, eg. #f60 means red=FF, green=66, blue=00 (orange colour)
const light = [];
light[SUNLIGHT] = ["#ccd", "#88f", "#44c", "#00a", "#000"];
light[PLANETLIGHT] = ["#eef", "#8b8", "#0b0", "#0d0", "#0f0"];
light[MOONLIGHT] = ["#eef", "#bb9", "#cc4", "#ee0", "#ff0"];
// light[MOONLIGHT]= ["#eef","#cc8","#bb0","#dd0","#ff0"];

const psyms = ["assets/img/psym1.png", "assets/img/psym2.png", "assets/img/psym3.png", "assets/img/psym4.png", "assets/img/psym5.png", "assets/img/psym6.png", "assets/img/psym7.png", "assets/img/psym8.png", "", "assets/img/psymsol.png", "assets/img/psymmoon.png", "", "", "", "", "assets/img/psym.png", "", "", "", "", "assets/img/psym.png"];

const pageHead1 = "<!doctype html public \"-//w3c//dtd html 4.0 transitional//en\">\n<HTML><HEAD><TITLE>";
const pageHead3 = "</TITLE><style>\nbody {font: \"ariel\";}" +
	".lbl {position:absolute;font-size:11px;margin:0;padding:0;font:\"ariel\";}\n</style></HEAD>" +
	"<BODY><center><p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>";


function box(x, y, w, h, bgr) { // draw box with background parameter (colour and/or url as CSS)
	let str = "<div style=\"position:absolute; left: " + x + "; top:" + y + "; width:" + w;
	str += ";height:" + h + ";background:" + bgr + ";font-size:2px;\"></div>";
	// Keep tiny boxes rendering consistently across browser engines.
	return str;
}

function writexlbl(leftoff, topoff, lbl, lblpos, xlbl, xpos) { // write x-axis labels
	let str = "<p class=\"lbl\" style=\"position:absolute; left:" + (leftoff + xpos) + "; top:" + (topoff - 34) + ";\">" + xlbl + "</p>";
	for (let i = 0; i < lbl.length; i++) {
		str += "<p class=\"lbl\" style=\"position:absolute; left:" + (leftoff + lblpos[i]) + "; top:" + (topoff - 18) + ";\">" + lbl[i] + "</p>";
	}
	return str;
}

function txt_lft(x, y, s) { // left adjusted text
	return "<p class=\"lbl\" style=\"left:" + x + "; top:" + y + "\">" + s + "</p>";
}

function txt_rgt(x, y, w, rpad, s) { // right adjusted text, w is necessary width, rpad space from right
	let str = "<div style=\"position:absolute; left:" + x + "; top:" + y + "; width:" + w + ";height:20;\">";
	str += "<p class=\"lbl\" style=\"right:" + rpad + "; text-align:right\">" + s + "</p></div>\n";
	return str;
}

function combineEvents(obj, jday, obs, transit) {
	// Combines events of Sun and chosen object into a single array
	// Comprises times as fractions of a day from jday and indices into 'lights' arrays
	// last two entries store transit times in first index (-1 if not valid)
	let sunevents = findEvents(SUN, jday, obs); // first entry is state at t=0;
	let objevents = findEvents(obj, jday, obs); // same here
	let events = [];
	let k = 0;
	let i = 1;
	let n = 1; // counters for events and objevents arrays
	let tr = [-1, -1];
	let trcnt = 0; // remember up to two transit times
	let twl = sunevents[0][1]; // kind of twilight
	let up = (objevents[0][1] == 0); // true if object is up
	let otype = (up && (obj != SUN)) ? (obj == MOON ? MOONLIGHT : PLANETLIGHT) : SUNLIGHT;
	events[k++] = [sunevents[i][0], otype, twl];
	while (true) {
		let to = objevents[n][0];
		let ts = sunevents[i][0]
		while ((ts = sunevents[i][0]) < to) {
			if (sunevents[i][1] == 0) { // skip Sun transit
				i++;
				continue;
			}
			twl = sunevents[i][1];
			twl = (twl < 0 ? -twl - 1 : twl);
			events[k++] = [ts, otype, twl];
			i++;
		}
		if (to >= 1.0) break;
		if (objevents[n][1] == 0) { // check for object transit
			tr[trcnt++] = to;
			n++;
			continue;
		}
		up = !up; // object event must be rise or set
		otype = (up && (obj != SUN)) ? (obj == MOON ? MOONLIGHT : PLANETLIGHT) : SUNLIGHT;
		events[k++] = [to, otype, twl];
		n++;
	}
	events[k] = [1.0, -1, -1];
	events[k + 1] = [tr[0], 0, 0];
	events[k + 2] = [tr[1], 0, 0];
	return events;
} // end combineEvents()


function makeBar(obs, obj, jday, transit, x, y) {
	let str = "";
	let events = combineEvents(obj, jday, obs, transit);
	let el = events.length;
	let len = 480; // = 3 min per pixel
	let h = 13;
	let l1 = 0;
	let l;
	for (let i = 0; i < el - 3; i++) {
		l = Math.round(events[i + 1][0] * len);
		if (l - l1 > 0) str += box(x + l1, y + 1, (l - l1), h, light[events[i][1]][events[i][2]]);
		l1 = l;
	}
	for (let j = 0; j < 2; j++) { // plot red markers for transits
		if (transit && events[el - 2 + j][0] >= 0) str += box(x + events[el - 2 + j][0] * len, y + 1, 1, h, "#f00");
	}
	return str;
} // end makeBar()


// function nextDate(obs1,dstep,origday) *** moved to makelist.js


function doVisibility(obs, obj, dspan, dstep, transit) {
	// Create visibility diagrams for one object
	// obs is a reference variable, make a copy
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	if (dstep < 1.0) dstep = 1.0;
	obscopy.hours = 12;
	obscopy.minutes = 0; // graphics only allows for 12:00
	let pwin = window.open("", "moonlight", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let str = pageHead1 + "AstroTools: 可視性" + pageHead3 + "\n<h2>可視性</h2><h3>対象: " + bodies[obj].name + "</h3>";
	str += "<p>観測地: " + sitename() + " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	let jday = jd(obscopy);
	let tmax = Math.floor((jdmax - jday) / dstep); // how many lines?
	if (dstep < 0) tmax = Math.floor(dspan / dstep);
	let leftoff = 130;
	let topoff = 30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * tmax + 50) + "; width:700;\">";
	str += box(leftoff - 1, topoff, 482, 15 * tmax + 2, "#aaa url(assets/img/hourline.png)");
	let lbl = ["12", "14", "16", "18", "20", "22", "00", "02", "04", "06", "08", "10", "12"];
	let lblpos = [-5, 35, 75, 115, 155, 195, 235, 275, 315, 355, 395, 435, 475];
	str += writexlbl(leftoff, topoff, lbl, lblpos, "時", 225);
	str += txt_lft(leftoff + 488, topoff - 30, "照明率");
	for (let t = 0; t < tmax; t++) {
		jday = jd(obscopy);
		let dw = Math.floor(jday + 1.5) - 7 * Math.floor((jday + 1.5) / 7);
		str += txt_lft(leftoff - 90, topoff + 15 * t + 2, datestring(obscopy) + " " + dow[dw]);
		str += makeBar(obscopy, obj, jday, transit, leftoff, topoff + 15 * t + 1);
		if (obj == MOON) {
			bodies[MOON].update(jday + 0.5, obscopy); // get illum. at mid interval
			str += txt_lft(leftoff + 488, topoff + 15 * t + 2, Math.round(100 * bodies[MOON].illum) + "%");
		}
		nextDate(obscopy, dstep, obs.day);
		obscopy.hours = 12;
		obscopy.minutes = 0;
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = 南中</p>";
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doVisibility()


function doPlanetVisibility(obs, transit) {
	// Create the diagram showing all planets for one date
	let obscopy = {};
	for (let i in obs) obscopy[i] = obs[i];
	obscopy.hours = 12;
	obscopy.minutes = 0; // graphics only allows for 12:00
	let pwin = window.open("", "planetvis", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let str = pageHead1 + "AstroTools: 可視性" + pageHead3 + "<h2>可視性</h2><h3>太陽・月・惑星</h3>";
	str += "<p>観測地: " + sitename() + " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>";
	str += "<h4>日付: " + datestring(obscopy) + " </h4>\n";
	let objects = [SUN, MOON, 0, 1, 3, 4, 5, 6, 7];
	let leftoff = 120;
	let topoff = 30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * 9 + 50) + "; width:700;\">";
	str += box(leftoff - 1, topoff, 482, 15 * 9 + 2, "#aaa url(assets/img/hourline.png)");
	let lbl = ["12", "14", "16", "18", "20", "22", "00", "02", "04", "06", "08", "10", "12"];
	let lblpos = [-5, 35, 75, 115, 155, 195, 235, 275, 315, 355, 395, 435, 475];
	str += writexlbl(leftoff, topoff, lbl, lblpos, "時", 225);
	for (let t = 0; t < objects.length; t++) {
		let p = objects[t];
		let jday = jd(obscopy);
		str += txt_lft(leftoff - 45, topoff + 15 * t + 2, bodies[p].name);
		str += makeBar(obscopy, p, jday, transit, leftoff, topoff + 15 * t + 1);
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = 南中</p>";
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doPlanetVisibility()


function doStars(obs, deepsky, minalt, rasort, transit) {
	// Show visible stars or deep sky objects on selected date
	let obscopy = {};
	for (let i in obs) obscopy[i] = obs[i];
	obscopy.hours = 12;
	obscopy.minutes = 0; // graphics only allows for start at 12:00
	// stepsize in Julian day
	let stepsize = 1 / 96.0;

	let ord = []; // for storing records of siderial time and index to catalogue
	let sid = local_sidereal(obscopy) + 12 * 1.002737; // sidereal time for following midnight
	let objcnt = 0; // calculate number of objects to show
	for (let t = 0; t < (deepsky ? dso.length : stars.length); t++) {
		let de = parsecol(deepsky ? dso[t].de : stars[t].de);
		if (de >= obs.latitude - 90 + minalt && de <= obs.latitude + 90 - minalt) {
			let h = parsecol(deepsky ? dso[t].ra : stars[t].ra) - sid; // negative hour angle
			if (h < 0) h += 24;
			if (h > 12) h -= 24;
			ord[objcnt++] = [h, t]; // 
		}
	}
	if (rasort) isort(ord); // sort according to transit time starting from north

	let pwin = window.open("", "starvis", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let ostr = (deepsky ? "深宇宙天体" : "恒星");
	let str = pageHead1 + "AstroTools: 可視性" + pageHead3 + "<h2>可視性</h2>" + "<h3>対象: " + ostr + "</h3>";
	str += "<p>観測地: " + sitename();
	str += " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";
	str += "<p>高度制限: " + minalt + "&deg;</p>\n";
	str += "<p>観測日: " + datestring(obs) + " </p>";
	let leftoff = 130;
	let topoff = 30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * objcnt + 50) + "; width:600;\">";
	str += box(leftoff - 1, topoff, 482, 15 * objcnt + 2, "#aaa url(assets/img/hourline.png)");
	let lbl = ["12", "14", "16", "18", "20", "22", "00", "02", "04", "06", "08", "10", "12"];
	let lblpos = [-5, 35, 75, 115, 155, 195, 235, 275, 315, 355, 395, 435, 475];
	str += writexlbl(leftoff, topoff, lbl, lblpos, "時", 225);

	let jday = jd(obscopy);
	for (let t = 0; t < objcnt; t++) {
		i = ord[t][1];
		let ra = (deepsky ? dso[i].ra : stars[i].ra);
		let de = (deepsky ? dso[i].de : stars[i].de);
		bodies[20].ra = parsecol(ra) * 15; // use User object as temporary object
		bodies[20].dec = parsecol(de);
		if (deepsky) {
			str += txt_lft(leftoff - 150, topoff + 15 * t + 2, dso[i].numb + " (" + dso[i].name + " " + dso[i].cons + ")");
		} else {
			str += txt_lft(leftoff - 150, topoff + 15 * t + 2, stars[i].name + " (" + stars[i].star + " " + stars[i].cons + ")");
		}
		str += makeBar(obscopy, 20, jday, transit, leftoff, topoff + 15 * t + 1);
	}
	str += "</div>\n";
	if (transit) str += "<p><span style=\"background:#f00;\">&nbsp;</span> = 南中</p>";
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p>";
	str += "</CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doStars()


function doDataGrph(obs, obj, dspan, dstep) {
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}

	let pwin = window.open("", "illumdiam", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let str = pageHead1 + "AstroTools: 天体データ" + pageHead3;
	str += "<h2>天体データ</h2><p>(視直径・等級・照明率)</p><h3>対象: " + bodies[obj].name + "</h3>\n";
	str += "<p>観測地: " + sitename() + " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";

	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	let jday = jd(obscopy);
	let tmax = Math.floor((jdmax - jday) / dstep);
	if (dstep < 0) tmax = Math.floor(dspan / dstep);
	let leftoff = 130;
	let topoff = 60;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * tmax + 50) + "; width:700;\">";
	str += box(leftoff, topoff, 502, 15 * (tmax - 1) + 2, "#aaa url(assets/img/grid.png)");
	lblillum = ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];
	lblipos = [-3, 42, 92, 142, 192, 242, 292, 342, 392, 442, 492];
	if (obj == SUN || obj == MOON) {
		lbldiam = ["1600\"", "1700\"", "1800\"", "1900\"", "2000\"", "2100\""];
		lbldpos = [-12, 88, 188, 288, 388, 488];
	} else {
		lbldiam = ["0\"", "10\"", "20\"", "30\"", "40\"", "50\""];
		lbldpos = [-3, 95, 195, 295, 395, 495];
	}
	lblmag = ["14.0", "12.0", "10.0", "8.0", "6.0", "4.0", "2.0", "0.0", "-2.0", "-4.0", "-6.0"];
	lblmagpos = [-8, 42, 92, 144, 194, 244, 294, 344, 392, 442, 492];
	str += writexlbl(leftoff, topoff - 12, lblmag, lblmagpos, "", 180);
	str += writexlbl(leftoff, topoff, lblillum, lblipos, "", 180);
	str += writexlbl(leftoff, topoff - 24, lbldiam, lbldpos, "照明率(%) / 等級 / 視直径(arcsec)", 140);
	//	str += txt_lft(leftoff+612,topoff-30,ylbl);
	for (let t = 0; t < tmax; t++) {
		jday = jd(obscopy);
		// do line for current date
		str += txt_rgt(leftoff - 120, (topoff - 6 + 15 * t), 114, 6, datestring(obscopy) + "&nbsp;&nbsp;" + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[obj].update(jday, obs);
		let illum = Math.round(bodies[obj].illum * 500);
		let dist = bodies[obj].dist;
		let diam;
		if (obj < SUN) diam = ndiam[obj] / dist * 10;
		else if (obj == SUN || obj == MOON) diam = ndiam[obj] / dist - 1600;
		else diam = 0;
		let mag = -bodies[obj].mag * 25 + 350; // display interval +14 - -6, resol. 0.04 mag/px
		if (obj != COMET && obj != SUN) str += box(leftoff + illum - 1, topoff - 7 + 15 * t, 3, 15, "#ff0");
		if (obj != COMET) str += box(leftoff + diam - 1, topoff - 7 + 15 * t, 3, 15, "#f22");
		if (obj != MOON && obj != SUN) str += box(leftoff + mag - 1, topoff - 7 + 15 * t, 3, 15, "#0f0");
		nextDate(obscopy, dstep, obs.day);
	}
	str += "</div>\n";
	str += "<p><span style=\"width:3;background:#f22;\">&nbsp;</span> = 視直径, ";
	str += "<span style=\"background:#ff0;\">&nbsp;</span> = 照明率, ";
	str += "<span style=\"background:#0f0;\">&nbsp;</span> = 等級</p>";
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doDataGrph()


function doTwilightVisibility(obs, obj, dspan, dstep, sunalt) {
	// Altitude of object(s) when Sun 6 degrees below horizon
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}
	if (dstep < 1.0) dstep = 1.0;
	let objects = (obj == 100 ? [7, 6, 5, 4, 3, 1, 0, 10] : [obj]); /* order of planets */
	let values = [44];
	// stepsize in degrees
	let stepsize = 1.0;
	// Now make the diagram
	let pwin = window.open("", "mercvenus", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let ostr;
	if (obj > 20) ostr = "Moon and Planets";
	else ostr = bodies[obj].name;
	let str = pageHead1 + "AstroTools: 薄明時高度" + pageHead3 + "<h2>薄明時高度</h2>";
	str += "<h3>対象: " + ostr + "</h3>\n";
	str += "<p>太陽高度が地平線下 " + (-sunalt) + "&deg; の時刻</p>";
	str += "<p>観測地: " + sitename() + " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";
	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	let jday = jd(obscopy);
	let tmax = Math.floor((jdmax - jday) / dstep); // needed for calculating box sizes
	if (dstep < 0) tmax = Math.floor(dspan / dstep);
	let leftoff = 80;
	let off2 = 320;
	let topoff = 30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * tmax + 50) + "; width:700;\">";
	str += box(leftoff, topoff, 221, 15 * (tmax - 1) + 2, "#aaa url(assets/img/grid.png)");
	str += box(leftoff + off2, topoff, 221, 15 * (tmax - 1) + 2, "#aaa url(assets/img/grid.png)");
	let lbl = ["0&deg;", "10&deg;", "20&deg;", "30&deg;", "40&deg;"];
	let lblpos = [-3, 45, 95, 145, 195];
	let lblpos2 = [-3 + off2, 45 + off2, 95 + off2, 145 + off2, 195 + off2];
	str += writexlbl(leftoff, topoff, lbl, lblpos, "高度 (明け方)", 70);
	str += writexlbl(leftoff, topoff, lbl, lblpos2, "高度 (夕方)", 70 + off2);
	//	str += txt_lft(leftoff+612,topoff-30,"az");
	for (let t = 0; t < tmax; t++) {
		// do line for current date
		jday = jd(obscopy);
		let rset = sunrise(obscopy, sunalt);
		str += txt_rgt(leftoff - 100, (topoff - 6 + 15 * t), 50, 0, datestring(obscopy));
		for (let i = 0; i < 2; i++) { // i=0: before sunrise, i=1: after sunset
			str += txt_rgt(leftoff - 60 + i * off2, (topoff - 6 + 15 * t), 50, 0, hmstring(rset[i + 3], false));
			// fill with gray and grid
			for (let n in objects) {
				if (!rset[2]) continue; // Sun never reaches sunalt deg on this day
				let p = objects[n];
				if (p != obj && obj != 100) continue; // skip if not desired object
				bodies[p].update(rset[i], obscopy);
				let h = bodies[p].alt;
				if (h >= 0 && h < 45) {
					str += "<img src=\"" + psyms[p] + "\" style=\"position:absolute;left:" + (leftoff + i * off2 + 5 * h - 6) + ";top:" + (topoff - 7 + 15 * t) + ";\">\n";
				}
				if (obj < 100) str += txt_lft(leftoff + i * off2 + 226, topoff - 6 + 15 * t, (bodies[p].az < 180) ? "昇る" : "沈む");
			}
		}
		nextDate(obscopy, dstep, obs.day);
	}
	str += "</div>\n";
	if (obj == 100) {
		str += "<p>M=月, 1=水星, 2=金星, 4=火星, 5=木星, 6=土星, 7=天王星, 8=海王星</p>\n";
	}
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p></CENTER></BODY></HTML>";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doTwilightVisibility()


function doAltitude(obs, obj, mstep) {
	// altitude of one or more objects during one day, if obj=100 plot all planets and Sun/Moon
	let obscopy = {}; // make working copy
	for (let i in obs) obscopy[i] = obs[i];
	obscopy.minutes = 0; // start at full hour for nice display
	// order of planets, later ones plot on top of earlier ones
	let objects = (obj == 100 ? [7, 6, 5, 4, 3, 1, 0, 10, 9] : [obj]);
	// dstep in julian days
	let dstep = mstep / 1440;
	let ostr;
	if (obj > 20) ostr = "Sun, Moon and Planets";
	else ostr = bodies[obj].name;
	let pwin = window.open("", "pl_altitude", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let str = pageHead1 + "AstroTools: 高度" + pageHead3 + "<h2>高度</h2><h3>対象: " + ostr + "</h3>";
	str += "<p>観測地: " + sitename();
	str += " (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";
	doc.write(str);

	let leftoff = 120;
	let topoff = 30;
	let htot = 15 * 1440 / mstep;
	str = "<div align=\"center\" style=\"position:relative; height:" + (15 * 1440 / mstep + 50) + "; width:700;\">";
	let jday = jd(obscopy);
	// shade according to sun up/down
	let ev = findEvents(SUN, jday, obs);
	let t0 = 0;
	let vis = (ev[0][1] == 0);
	let i = 1; // vis == true if sun up
	while (ev[i][0] < 1.0) {
		if ((vis && (ev[i][1] == 1)) || (!vis && (ev[i][1] == (-1)))) {
			str += box(leftoff + 100, Math.round(topoff + t0 * htot), 452, (ev[i][0] - t0) * htot + 1, (vis) ? "#ccd" : "#58f");
			t0 = ev[i][0];
			vis = !vis;
		}
		i++;
	}
	str += box(leftoff + 100, Math.round(topoff + t0 * htot), 452, (1.0 - t0) * htot + 1, (vis) ? "#ccd" : "#58f");
	str += box(leftoff, topoff, 100, htot + 2, "#888"); // paint box below horizon
	//	str += box(leftoff+100,topoff,452,(15*1440/mstep+2),"#ddd");	// above horizon
	str += box(leftoff, topoff, 552, htot + 2, "url(assets/img/grid.png)"); // transparent grid
	let lbl = ["-20&deg;", "-10&deg;", "0&deg;", "10&deg;", "20&deg;", "30&deg;", "40&deg;", "50&deg;", "60&deg;", "70&deg;", "80&deg;", "90&deg;"];
	let lblpos = [-10, 40, 97, 144, 194, 244, 294, 344, 394, 444, 494, 544];
	str += writexlbl(leftoff, topoff, lbl, lblpos, "高度", 250);
	str += txt_lft(leftoff + 562, topoff - 30, "az");
	// for each mstep min do
	for (let t = 0; t < 1.0 / dstep + 0.001; t++) {
		str += txt_rgt(0, (topoff - 5 + 15 * t), 114, 6, datestring(obscopy) + "&nbsp;&nbsp;" + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[9].update(jday, obs);
		for (let n in objects) {
			let p = objects[n];
			bodies[p].update(jday, obs);
			let h = bodies[p].alt;
			if (h >= -20.0) {
				str += "<img src=\"" + psyms[p] + "\" style=\"position:absolute; left:" + (leftoff + 93 + (5.0 * h)) +
					"; top:" + (topoff - 6 + 15 * t) + ";\">\n";
			}
		}
		if (obj < 21) { // write azimuth
			str += txt_lft(leftoff + 562, topoff - 5 + 15 * t, Math.round(bodies[obj].az) + "&deg;");
		}
		jday += dstep;
		nextDate(obscopy, dstep, obs.day);
	}
	str += "</div>"; // outer block
	if (obj == 100) {
		str += "<p>S=太陽, M=月, 1=水星, 2=金星, 4=火星, 5=木星, 6=土星, 7=天王星, 8=海王星</p>";
	}
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doAltitude()


function doAngles(obs, obj, dspan, dstep, type) {
	// Common function for declination (0), longitude (1) and elongation (2)
	let obscopy = {};
	let obsmax = {};
	for (let i in obs) {
		obscopy[i] = obs[i];
		obsmax[i] = obs[i];
	}

	let objects = (obj == 100 ? [7, 6, 5, 4, 3, 1, 0, 10, 9] : [obj]);
	// objects to plot and order, later ones plot on top of earlier ones
	let tstr, lbl, lblpos, ylbl;
	if (type == 0) {
		tstr = "赤緯";
		lbl = ["-30&deg;", "-25&deg;", "-20&deg;", "-15&deg;", "-10&deg;", "-5&deg;", "0&deg;", "5&deg;", "10&deg;", "15&deg;", "20&deg;", "25&deg;", "30&deg;"];
		lblpos = [-10, 40, 90, 140, 190, 244, 297, 347, 395, 445, 495, 545, 595];
		ylbl = "赤経";
	} else if (type == 1) {
		tstr = "黄経";
		lbl = ["0&deg;", "30&deg;", "60&deg;", "90&deg;", "120&deg;", "150&deg;", "180&deg;", "210&deg;", "240&deg;", "270&deg;", "300&deg;", "330&deg;", "360&deg;"];
		lblpos = [-10, 40, 97, 144, 194, 244, 294, 344, 394, 444, 494, 544, 594];
		ylbl = "緯度";
	} else {
		tstr = "離角";
		lbl = ["0&deg;", "15&deg;", "30&deg;", "45&deg;", "60&deg;", "75&deg;", "90&deg;", "105&deg;", "120&deg;", "135&deg;", "150&deg;", "165&deg;", "180&deg;"];
		lblpos = [-3, 45, 95, 145, 195, 245, 295, 342, 392, 442, 492, 542, 592];
		ylbl = "位置角";
	}
	let ostr = (obj == 100 ? "太陽・月・惑星" : bodies[obj].name);
	if (type == 2 && obj == 100) ostr = "月と惑星";
	// Now make the diagram
	let pwin = window.open("", "position", "menubar,scrollbars,resizable");
	let doc = pwin.document;
	let str = pageHead1 + "AstroTools: " + tstr + pageHead3 + "<h2>" + tstr + "</h2><h3>対象: " + ostr + "</h3>\n";
	str += "<p>地方時正午 (UT " + hmstring(-obs.tz / 60.0, true) + ")</p>\n";

	nextDate(obsmax, dspan, obs.day); // 'abuse' nextdate to calculate end time
	jdmax = jd(obsmax);
	let jday = jd(obscopy);
	let tmax = Math.floor((jdmax - jday) / dstep);
	if (dstep < 0) tmax = Math.floor(dspan / dstep);
	let leftoff = 80;
	let topoff = 30;
	str += "<div align=\"center\" style=\"position:relative; height:" + (15 * tmax + 50) + "; width:700;\">";
	str += box(leftoff, topoff, 602, 15 * (tmax - 1) + 2, "#aaa url(assets/img/grid.png)");
	str += writexlbl(leftoff, topoff, lbl, lblpos, tstr, 270);
	str += txt_lft(leftoff + 612, topoff - 30, ylbl);
	for (let t = 0; t < tmax; t++) {
		jday = jd(obscopy);
		// do line for current date
		str += txt_rgt(leftoff - 120, (topoff - 6 + 15 * t), 114, 6, datestring(obscopy) + "&nbsp;&nbsp;" + hmstring2(obscopy.hours, obscopy.minutes, 0));
		bodies[9].update(jday, obs); /* need this for elongation */
		let ra1 = bodies[9].ra;
		let dec1 = bodies[9].dec;
		for (let n in objects) {
			let p = objects[n];
			bodies[p].update(jday, obs);
			let ang;
			if (type == 0) {
				/* range -30 deg to +30 deg in 0.5 deg steps, 0 deg == pos 60 */
				ang = Math.round(bodies[p].dec * 10) + 300;
			} else if (type == 1) {
				/* longitude range 0 to 360 deg in 3 deg steps */
				ang = Math.round(bodies[p].eclon / 0.6);
			} else {
				/* elongation 0 - 180 deg, 1.5 deg steps */
				if (p == 9) continue;
				let ra = bodies[p].ra;
				let dec = bodies[p].dec;
				ang = Math.round(acosd(sind(dec) * sind(dec1) + cosd(dec) * cosd(dec1) * cosd(ra - ra1)) / 0.3);
			}
			str += "<img src=\"" + psyms[p] + "\" style=\"position:absolute;left:" + (leftoff + ang - 7) + ";top:" + (topoff - 6 + 15 * t) + ";\">\n";
		}
		if (obj < USER) {
			let sval;
			if (type == 0) {
				sval = hmstring(bodies[obj].ra / 15.0, false);
			} else if (type == 1) {
				sval = anglestring(bodies[obj].eclat, false, true);
			} else {
				let ra = bodies[obj].ra;
				let dec = bodies[obj].dec;
				let pa = Math.round(atan2d(sind(ra - ra1), cosd(dec1) * tand(dec) - sind(dec1) * cosd(ra - ra1)));
				sval = (pa < 0 ? pa + 360 : pa) + "&deg;";
			}
			str += txt_lft(leftoff + 612, topoff - 5 + 15 * t, sval);
		}
		nextDate(obscopy, dstep, obs.day);
	}
	str += "</div>\n";
	if (obj == 100) {
		str += "<p>S=太陽, M=月, 1=水星, 2=金星, 4=火星, 5=木星, 6=土星, 7=天王星, 8=海王星</p>\n";
	}
	str += "<p><A HREF=\"javascript:window.close()\">ウィンドウを閉じる</A></p></CENTER></BODY></HTML>\n";
	doc.write(str);
	doc.close();
	pwin.focus();
} // end doAngles