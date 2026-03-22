// Various date and time functions

// Copyright Peter Hayes 1999-2001, Ole Nielsen 2002-2004


// must be updated using leapyear() if year changed
const month_length = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function leapyear(year) {
  let leap = false;
  if (year % 4 == 0) leap = true;
  if (year % 100 == 0) leap = false;
  if (year % 400 == 0) leap = true;
  return leap;
}


function jd0(year, month, day) {
  // The Julian date at 0 hours(*) UT at Greenwich
  // (*) or actual UT time if day comprises time as fraction
  let y = year;
  let m = month;
  if (m < 3) {
    m += 12;
    y -= 1
  };
  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  let j = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
  return j;
} // jd0()


function jdtocd(jd) {
  // The calendar date from julian date, see Meeus p. 63
  // Returns year, month, day, day of week, hours, minutes, seconds
  let Z = Math.floor(jd + 0.5);
  let F = jd + 0.5 - Z;
  let A;
  if (Z < 2299161) {
    A = Z;
  } else {
    let alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  let B = A + 1524;
  let C = Math.floor((B - 122.1) / 365.25);
  let D = Math.floor(365.25 * C);
  let E = Math.floor((B - D) / 30.6001);
  let d = B - D - Math.floor(30.6001 * E) + F;
  let month;
  if (E < 14) {
    month = E - 1;
  } else {
    month = E - 13;
  }
  let year;
  if (month > 2) {
    year = C - 4716;
  } else {
    year = C - 4715;
  }
  let day = Math.floor(d);
  let h = (d - day) * 24;
  let hours = Math.floor(h);
  let m = (h - hours) * 60;
  let minutes = Math.floor(m);
  let seconds = Math.round((m - minutes) * 60);
  if (seconds >= 60) {
    minutes = minutes + 1;
    seconds = seconds - 60;
  }
  if (minutes >= 60) {
    hours = hours + 1;
    minutes = 0;
  }
  let dw = Math.floor(jd + 1.5) - 7 * Math.floor((jd + 1.5) / 7);
  return [year, month, day, dw, hours, minutes, seconds];
} // jdtocd()


function g_sidereal(year, month, day) {
  // sidereal time in hours for Greenwich
  let T = (jd0(year, month, day) - 2451545.0) / 36525;
  let res = 100.46061837 + T * (36000.770053608 + T * (0.000387933 - T / 38710000.0));
  return rev(res) / 15.0;
}