import {
	loadLegacyScripts
} from "./legacy-loader.js";

await loadLegacyScripts([
	"src/js/observer.js",
	"src/js/datetime.js",
	"src/js/cookie.js",
	"src/js/util.js",
	"src/js/math.js",
	"src/js/juphandlers.js",
	"src/js/jupdraw.js",
	"src/js/jupiter.js"
]);

window.timer_on = false;
window.debug = true;

window.tbl = document.table1;

tbl.Place.options.length = 0;
for (let i = 0; i < atlas.length; i++) {
	tbl.Place.options[tbl.Place.options.length] = new Option(atlas[i].name);
}

reset1();
getCookie("HOME", observer);