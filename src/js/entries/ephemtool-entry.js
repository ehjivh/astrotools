import {
	loadLegacyScripts
} from "./legacy-loader.js";

await loadLegacyScripts([
	"src/js/observer.js",
	"src/js/datetime.js",
	"src/js/cookie.js",
	"src/js/makelist.js",
	"src/js/makepage.js",
	"src/js/planets.js",
	"src/js/sunmoon.js",
	"src/js/comet.js",
	"src/js/stars.js",
	"src/js/util.js",
	"src/js/math.js",
	"src/js/events.js",
	"src/js/handlers.js"
]);

window.timer_on = false;
window.debug_on = false;

window.datecount = [1, 2, 3, 5, 7, 10, 14, 18, 21, 28, -1, -2, -3, -6, -12, -24, -60, -120, -240, -600, -1200];
window.daystep = [1 / 24.0, 1 / 12.0, 1 / 6.0, 0.25, 0.5, 1, 2, 3, 4, 5, 7, 10, 14, 21, 27.3217, 28, 29.5306, -1, -2, -3, -6, -12, -24, -60];
window.objlist = [9, 10, 0, 1, 3, 4, 5, 6, 7, 15, 20, 100];
window.aastep = [5, 10, 15, 30, 60, 120];
window.obj2 = [9, 10, 0, 1, 3, 4, 5, 6, 7, 20];
window.twl_alt = [-0.833, -6.0, -12.0, -18.0];
window.cut_alt = [0, 5, 10, 15, 20, 25, 30];
window.VIS = 0;
window.DAT = 2;
window.POS = 3;
window.A_A = 4;
window.TWI = 5;
window.SEP = 6;
window.L_EV = 8;
window.P_EV = 9;
window.STAR = 10;
window.DEC = 0;
window.LON = 1;
window.ELON = 2;

window.tbl = document.table1;

tbl.Place.options.length = 0;
for (let i = 0; i < atlas.length; i++) {
	tbl.Place.options[tbl.Place.options.length] = new Option(atlas[i].name);
}
reset1();

// Add all star and dso objects from stars.js to the drop down lists.
tbl.fixstar.options.length = 1;
for (let i = 0; i < stars.length; i++) {
	tbl.fixstar.options[tbl.fixstar.options.length] = new Option(stars[i].star + " " + stars[i].cons);
}

tbl.deepskyobj.options.length = 1;
for (let i = 0; i < dso.length; i++) {
	tbl.deepskyobj.options[tbl.deepskyobj.options.length] = new Option(dso[i].numb);
}

add_comets();
tbl.comet.options.length = 1;
for (let i = 0; i < comets.length; i++) {
	tbl.comet.options[tbl.comet.options.length] = new Option(comets[i].name);
}
tbl.perihel.value = "";

getCookie("HOME", observer);