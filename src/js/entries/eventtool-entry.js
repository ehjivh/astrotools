import {
	loadLegacyScripts
} from "./legacy-loader.js";

await loadLegacyScripts([
	"src/js/observer.js",
	"src/js/datetime.js",
	"src/js/cookie.js",
	"src/js/planets.js",
	"src/js/sunmoon.js",
	"src/js/makeevent.js",
	"src/js/util.js",
	"src/js/math.js",
	"src/js/eventhandlers.js"
]);

window.timer_on = false;
window.debug_on = false;
window.datecount = [1, 2, 3, 5, 7, 10, 14, 18, 21, 28, -1, -2, -3, -6, -12, -24, -60, -120, -240, -600, -1200];
window.daystep = [1 / 24.0, 1 / 12.0, 1 / 6.0, 0.25, 0.5, 1, 2, 3, 4, 5, 7, 10, 14, 21, 27.3217, 28, 29.5306, -1, -2, -3, -6, -12, -24, -60];
window.objlist = [9, 10, 0, 1, 3, 4, 5, 6, 7, 15, 20, 100];
window.SEL_EV = 0;
window.SEASON = 1;
window.PHASE = 2;
window.ALL_EV = 3;

window.tbl = document.table1;

tbl.Place.options.length = 0;
for (let i = 0; i < atlas.length; i++) {
	tbl.Place.options[tbl.Place.options.length] = new Option(atlas[i].name);
}

reset1();
getCookie("HOME", observer);