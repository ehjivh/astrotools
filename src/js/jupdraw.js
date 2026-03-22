// drawing functions

const winw = 700,
	winh = 220;
const jupx = winw / 2,
	jupy = winh / 2; // jupiter fixed position
const xbig = 75;
const xsmall = 12; // pixels per jup radius
let zoom = false; // true if zoomed-in
const satvisible = "#fff",
	sateclipsed = "#03a"; // colours of satellites
const satlabels = ["イオ", "エウロパ", "ガニメデ", "カリスト"];
let cont; // shortcut to container <div> node
let jup, jupi, grs, grsi; // <div> and <img> nodes
let moon = []; // <div> nodes for satellites
let shad = []; // <div> nodes for shadows


function satLabel(n) {
	if (tbl && tbl.show_sat_names && tbl.show_sat_names.checked) {
		return `${n + 1} ${satlabels[n]}`;
	}
	return `${n + 1}`;
}


function textelem(label, x, y, l, d) { // constructor for text-elements
	this.label = label;
	this.x = x;
	this.y = y;
	this.l = l; // lenght of value
	this.d = d; // digits after comma
	this.node = document.createElement("p");
	this.node.style.position = "absolute";
	this.node.style.margin = `${0}px`;
	this.node.style.left = `${x}px`;
	this.node.style.top = `${y}px`;
	this.node.style.color = "#fff";
	this.node.style.fontFamily = "monospace";
	this.node.style.fontSize = "12px";
	this.node.style.whiteSpace = "pre";
	this.t = document.createTextNode(label);
	this.node.appendChild(this.t);
}

const ALT = 0,
	AZ = 1,
	SUNALT = 2,
	SYS1 = 3,
	SYS2 = 4,
	DE = 5,
	TIMER = 5;

const texts = [
	new textelem("木星高度:", 5, winh - 30, 6, 1),
	new textelem("木星方位:", 5, winh - 45, 6, 1),
	new textelem("太陽高度:", 5, winh - 15, 6, 1),
	new textelem("中央経度 I :", winw - 140, winh - 30, 6, 1),
	new textelem("中央経度 II:", winw - 140, winh - 15, 6, 1)
	//				,new textelem("dt  :",winw-120,winh-45,6,3)	// uncomment to enable timer
];


function drawJup() {
	if (!jup) { // if node doesn't exist, create it
		jup = document.createElement("div");
		jup.style.position = "absolute";
		jup.style.zIndex = "5";
		jupi = document.createElement("img");
		jup.appendChild(jupi);
		cont.appendChild(jup);
	}
	jupi.setAttribute("src", zoom ? "assets/img/jupiter-150.png" : "assets/img/jupiter-24.png");
	jup.style.left = `${jupx - (zoom ? xbig + 5 : xsmall + 1)}px`;
	jup.style.top = `${jupy - (zoom ? xbig + 5 : xsmall + 1)}px`;
}


function drawGRS() { // draw the Great Red Spot
	let scale = zoom ? xbig : xsmall;
	if (!grs) { // if element doesn't exist
		grs = document.createElement("div");
		grs.style.position = "absolute";
		grs.style.zIndex = "6";
		grs.style.top = `${jupy + 13}px`;
		grsi = document.createElement("img");
		grsi.setAttribute("src", "assets/img/grs.png");
		grs.appendChild(grsi);
		cont.appendChild(grs);
	}
	if (!zoom) {
		grs.style.visibility = "hidden";
		return;
	} // only show on zoomed image
	let sqz = cosd(jupiter.grs_a); // how much is the GRS 'squeezed'?
	let xg = 0.94 * sind(jupiter.grs_a); // 0.94 = half width of Jupiter at GRS latitude
	grs.style.left = `${Math.round(jupx + xg * scale - 14 * sqz)}px`;
	grs.style.visibility = jupiter.grs_vis ? "visible" : "hidden";
	if (jupiter.grs_vis) { // Avoid unnecessary size updates when the image is hidden.
		grsi.style.width = `${Math.round(27 * sqz)}px`; // squeeze GRS if off-center
		grsi.style.height = "17px";
	}
}


function drawSat(sat) {
	// paint sat n (dark blue if eclipsed), occult true if sat further away than jup (then potentially occulted)
	let n = sat.no - 1;
	let scale = zoom ? xbig : xsmall;
	if (!moon[n]) { // create elements
		moon[n] = []; // two divs needed to draw round moon, and a <p> for the text
		for (let i = 0; i < 3; i++) {
			moon[n][i] = document.createElement(i == 2 ? "p" : "div");
			moon[n][i].style.position = "absolute";
			moon[n][i].style.zIndex = "8";
			if (i == 2) { // create <p> element with sat number
				moon[n][2].style.margin = `${0}px`;
				moon[n][2].appendChild(document.createTextNode(satLabel(n)));
				moon[n][2].style.color = "#f00";
				moon[n][2].style.fontSize = "12px";
			} else {
				let a1 = (n == 2 || n == 3) ? 1 : 0; // Callisto and Ganym. are bigger than the two inner sats.
				moon[n][i].style.width = `${2 + 2 * i + a1}px`;
				moon[n][i].style.height = `${4 - 2 * i + a1}px`;
				moon[n][i].style.fontSize = "1px"; // Keep very small elements visible across engines.
			}
			cont.appendChild(moon[n][i]);
		}
	}
	for (let i = 0; i < 2; i++) {
		moon[n][i].style.visibility = (sat.vis ? "visible" : "hidden");
		if (!sat.vis) continue;
		moon[n][i].style.zIndex = (sat.z > 0) ? "1" : "8"; // sat is further away than jup
		moon[n][i].style.left = `${jupx + sat.x * scale - 1 - i}px`;
		moon[n][i].style.top = `${jupy - sat.y * scale - 2 + i}px`;
		moon[n][i].style.background = sat.eclipsed ? sateclipsed : satvisible;
	}
	moon[n][2].style.visibility = (sat.vis ? "visible" : "hidden");
	if (!sat.vis) return;
	moon[n][2].firstChild.data = satLabel(n);
	moon[n][2].style.zIndex = (sat.z > 0 ? "1" : "8"); // sat is further away than jup
	moon[n][2].style.left = `${jupx + sat.x * scale}px`;
	moon[n][2].style.top = `${jupy - sat.y * scale + 3}px`;
} // drawSat()


function drawShad(sat) {
	// paint black shadow for sat n
	let n = sat.no - 1;
	let scale = zoom ? xbig : xsmall;
	if (!shad[n]) { // create elements
		shad[n] = []; // two divs needed to draw round shadow
		for (let i = 0; i < 3; i++) {
			shad[n][i] = document.createElement(i == 2 ? "p" : "div");
			shad[n][i].style.position = "absolute";
			shad[n][i].style.zIndex = "7";
			if (i == 2) {
				shad[n][2].style.margin = `${0}px`;
				shad[n][2].appendChild(document.createTextNode(`${n + 1}`));
				shad[n][2].style.color = "#444";
				shad[n][i].style.fontSize = "12px";
			} else {
				let a1 = (n == 2 || n == 3) ? 1 : 0;
				shad[n][i].style.background = "black";
				shad[n][i].style.width = `${2 + 2 * i + a1}px`;
				shad[n][i].style.height = `${4 - 2 * i + a1}px`;
				shad[n][i].style.fontSize = "1px"; // Keep very small elements visible across engines.
			}
			cont.appendChild(shad[n][i]);
		}
	}
	for (let i = 0; i < 2; i++) {
		shad[n][i].style.visibility = (sat.shad_vis ? "visible" : "hidden");
		shad[n][i].style.left = `${jupx + sat.shx * scale - 1 - i}px`;
		shad[n][i].style.top = `${jupy - sat.shy * scale - 2 + i}px`;
	}
	shad[n][2].style.visibility = (sat.shad_vis ? "visible" : "hidden");
	shad[n][2].style.left = `${jupx + sat.shx * scale}px`;
	shad[n][2].style.top = `${jupy - sat.shy * scale + 3}px`;
}


function writeDat() {
	// write data to window
	for (let i = 0; i < texts.length; i++) {
		let n = texts[i];
		if (!n.init) {
			cont.appendChild(n.node);
			n.init = true;
		}
		let v;
		switch (i) {
			case ALT:
				v = jupiter.alt;
				break;
			case AZ:
				v = jupiter.az;
				break;
			case SUNALT:
				v = sun.alt;
				break;
			case SYS1:
				v = jupiter.sys1;
				break;
			case SYS2:
				v = jupiter.sys2;
				break;
			case TIMER:
				v = dt;
				break; // used for performence measurement
			default:
				v = 0;
				break;
		}
		n.t.data = n.label + fixnum(v, n.l, n.d);
	}
}


function updateDisplay() {
	JupSitu();
	drawGRS();
	for (let i = 1; i <= 4; i++) {
		sat[i].vis = (zoom && (sat[i].x < -4.66 || sat[i].x > 4.66)) ? false : true; // clip if zoomed
		if (sat[i].vis || sat[i].displayed) { // if displayed it may need to be hidden
			drawSat(sat[i]);
		}
		sat[i].displayed = sat[i].vis;
		if (sat[i].shad_vis || sat[i].shad_displayed) {
			drawShad(sat[i]);
		}
		sat[i].shad_displayed = sat[i].shad_vis;
	}
	writeDat();
	//	tbl.iox.value = fixnum(sat[1].x,6,2);
	//	tbl.ioy.value = fixnum(sat[1].y,6,2);
	//	tbl.ioz.value = fixnum(sat[1].z,6,2);
	//	tbl.iosx.value = sat[1].shx;
	//	tbl.iosy.value = sat[1].shy;
	//	tbl.iosz.value = sat[1].shz;
}


function j_init() {
	cont = document.getElementById("container");
	drawJup();
}