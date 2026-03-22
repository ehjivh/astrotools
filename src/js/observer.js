// The place, observatory definitions and daylight savings functions

// Copyright Ole Nielsen 2002-2003, Peter Hayes 1999-2001

function place(name, latitude, ns, longitude, we, zone, dss, dse) {
  this.name = name;
  this.latitude = latitude;
  this.ns = ns;
  this.longitude = longitude;
  this.we = we;
  this.zone = zone;
  this.dss = dss;
  this.dse = dse;
}

// 日本の47都道府県 (みさと天文台がデフォルト観測地)
// The first entry is used as the default observatory.
// Customize it to your preferred location.

const atlas = [
  new place("JP:みさと天文台", "34:08:41", 0, "135:24:24", 1, -540, "", ""),
  new place("JP:北海道", "43:00:00", 0, "141:00:00", 1, -540, "", ""),
  new place("JP:青森県", "40:50:00", 0, "140:44:00", 1, -540, "", ""),
  new place("JP:岩手県", "39:42:00", 0, "141:09:00", 1, -540, "", ""),
  new place("JP:宮城県", "38:16:00", 0, "140:52:00", 1, -540, "", ""),
  new place("JP:秋田県", "39:36:00", 0, "140:07:00", 1, -540, "", ""),
  new place("JP:山形県", "38:15:00", 0, "140:22:00", 1, -540, "", ""),
  new place("JP:福島県", "37:53:30", 0, "140:27:30", 1, -540, "", ""),
  new place("JP:茨城県", "36:21:00", 0, "140:28:00", 1, -540, "", ""),
  new place("JP:栃木県", "36:33:00", 0, "139:53:00", 1, -540, "", ""),
  new place("JP:群馬県", "36:23:00", 0, "139:02:00", 1, -540, "", ""),
  new place("JP:埼玉県", "35:52:00", 0, "139:39:00", 1, -540, "", ""),
  new place("JP:千葉県", "35:36:00", 0, "140:06:00", 1, -540, "", ""),
  new place("JP:東京都", "35:41:00", 0, "139:46:00", 1, -540, "", ""),
  new place("JP:神奈川県", "35:26:00", 0, "139:37:00", 1, -540, "", ""),
  new place("JP:新潟県", "37:54:00", 0, "139:02:00", 1, -540, "", ""),
  new place("JP:富山県", "36:45:00", 0, "137:12:00", 1, -540, "", ""),
  new place("JP:石川県", "36:33:00", 0, "136:39:00", 1, -540, "", ""),
  new place("JP:福井県", "36:04:00", 0, "136:13:00", 1, -540, "", ""),
  new place("JP:山梨県", "35:39:00", 0, "138:34:00", 1, -540, "", ""),
  new place("JP:長野県", "36:39:00", 0, "138:11:00", 1, -540, "", ""),
  new place("JP:岐阜県", "35:23:00", 0, "136:45:00", 1, -540, "", ""),
  new place("JP:愛知県", "35:10:00", 0, "136:54:00", 1, -540, "", ""),
  new place("JP:三重県", "34:44:00", 0, "136:30:00", 1, -540, "", ""),
  new place("JP:滋賀県", "35:02:00", 0, "135:52:00", 1, -540, "", ""),
  new place("JP:京都府", "35:00:00", 0, "135:46:00", 1, -540, "", ""),
  new place("JP:大阪府", "34:41:00", 0, "135:26:00", 1, -540, "", ""),
  new place("JP:兵庫県", "34:41:00", 0, "135:10:00", 1, -540, "", ""),
  new place("JP:奈良県", "34:41:00", 0, "135:52:00", 1, -540, "", ""),
  new place("JP:和歌山県", "34:13:00", 0, "135:09:00", 1, -540, "", ""),
  new place("JP:鳥取県", "35:29:00", 0, "134:14:00", 1, -540, "", ""),
  new place("JP:島根県", "35:28:00", 0, "133:03:00", 1, -540, "", ""),
  new place("JP:岡山県", "34:40:00", 0, "133:56:00", 1, -540, "", ""),
  new place("JP:広島県", "34:24:00", 0, "132:27:00", 1, -540, "", ""),
  new place("JP:山口県", "34:11:00", 0, "131:28:00", 1, -540, "", ""),
  new place("JP:徳島県", "34:04:00", 0, "134:32:00", 1, -540, "", ""),
  new place("JP:香川県", "34:20:00", 0, "134:02:00", 1, -540, "", ""),
  new place("JP:愛媛県", "33:51:00", 0, "132:46:00", 1, -540, "", ""),
  new place("JP:高知県", "33:33:00", 0, "133:33:00", 1, -540, "", ""),
  new place("JP:福岡県", "33:35:00", 0, "130:24:00", 1, -540, "", ""),
  new place("JP:佐賀県", "33:16:00", 0, "130:12:00", 1, -540, "", ""),
  new place("JP:長崎県", "32:45:00", 0, "129:52:00", 1, -540, "", ""),
  new place("JP:熊本県", "32:47:00", 0, "130:42:00", 1, -540, "", ""),
  new place("JP:大分県", "33:14:00", 0, "131:36:00", 1, -540, "", ""),
  new place("JP:宮崎県", "31:56:00", 0, "131:25:00", 1, -540, "", ""),
  new place("JP:鹿児島県", "31:35:00", 0, "130:33:00", 1, -540, "", ""),
  new place("JP:沖縄県", "26:12:00", 0, "127:40:00", 1, -540, "", "")
];


function observatory(place, year, month, day, hr, min, sec) {
  // The observatory object holds local date and time,
  // timezone correction in minutes with daylight saving if applicable,
  // latitude and longitude (west is positive)
  this.name = place.name;
  this.year = year;
  this.month = month;
  this.day = day;
  this.hours = hr;
  this.minutes = min;
  this.seconds = sec;
  this.tz = place.tz;
  this.dst = false; // is it DST?
  this.latitude = place.latitude;
  this.longitude = place.longitude;
}

// The default observatory (first entry in atlas, noon Jan 1 2000) 
// changed by user setting place and time from menu

const observer = new observatory(atlas[0], 2000, 1, 1, 12, 0, 0);

// Site name returns name and latitude / longitude as a string
function sitename() {
  let sname = observer.name;
  let latd = Math.abs(observer.latitude) + 0.00001;
  let latdi = Math.floor(latd);
  sname += ((latdi < 10) ? " 0" : " ") + latdi;
  latm = 60 * (latd - latdi);
  latmi = Math.floor(latm);
  sname += ((latmi < 10) ? ":0" : ":") + latmi;
  //  lats=60*(latm-latmi); latsi=Math.floor(lats);
  //  sname+=((latsi < 10) ? ":0" : ":") + latsi;
  sname += ((observer.latitude >= 0) ? " N, " : " S, ");
  let longd = Math.abs(observer.longitude) + 0.00001;
  let longdi = Math.floor(longd);
  sname += ((longdi < 10) ? "0" : "") + longdi;
  longm = 60 * (longd - longdi);
  longmi = Math.floor(longm);
  sname += ((longmi < 10) ? ":0" : ":") + longmi;
  //  longs=60*(longm-longmi); longsi=Math.floor(longs);
  //  sname+=((longsi < 10) ? ":0" : ":") + longsi;
  sname += ((observer.longitude >= 0) ? " W" : " E");
  return sname;
} // sitename()


function checkdst(obs) {
  // Check DST is an attempt to check daylight saving, its not perfect.
  // Returns 0 or -60 that is amount to remove to get to zone time.
  // this function is now only called when selecting a place from the dropdown list. No dst check when updating the time!
  // We only know daylight saving if in the atlas
  if ((tbl.Place.selectedIndex < 0) || (tbl.Place.selectedIndex >= atlas.length))
    return 0;
  let dss = atlas[tbl.Place.selectedIndex].dss;
  let dse = atlas[tbl.Place.selectedIndex].dse;
  let ns = atlas[tbl.Place.selectedIndex].ns;
  if (dss.length == 0) return 0;
  if (dse.length == 0) return 0;
  // parse the daylight saving start & end dates
  let col1 = dss.indexOf(":");
  let col2 = dss.lastIndexOf(":");
  let col3 = dss.length;
  let dssm = parseInt(dss.substring(0, col1), 10);
  let dssw = parseInt(dss.substring(col1 + 1, col2), 10);
  let dssd = parseInt(dss.substring(col2 + 1, col3), 10);
  col1 = dse.indexOf(":");
  col2 = dse.lastIndexOf(":");
  col3 = dse.length;
  let dsem = parseInt(dse.substring(0, col1), 10);
  let dsew = parseInt(dse.substring(col1 + 1, col2), 10);
  let dsed = parseInt(dse.substring(col2 + 1, col3), 10);
  // Length of months
  // year,month,day and day of week
  let jdt = jd0(obs.year, obs.month, obs.day);
  let ymd = jdtocd(jdt);
  // first day of month - we need to know day of week
  let fymd = jdtocd(jdt - ymd[2] + 1);
  // look for daylight saving / summertime changes
  // first the simple month checks
  // Test for the northern hemisphere
  if (ns == 0) {
    if ((ymd[1] > dssm) && (ymd[1] < dsem)) return -60;
    if ((ymd[1] < dssm) || (ymd[1] > dsem)) return 0;
  } else {
    // Southern hemisphere, New years day is summer.
    if ((ymd[1] > dssm) || (ymd[1] < dsem)) return -60;
    if ((ymd[1] < dssm) && (ymd[1] > dsem)) return 0;
  }
  // check if we are in month of change over
  if (ymd[1] == dssm) { // month of start of summer time
    // date of change over
    let ddd = dssd - fymd[3] + 1;
    ddd = ddd + 7 * dssw;
    while (ddd > month_length[ymd[1] - 1]) ddd -= 7;
    if (ymd[2] < ddd) return 0;
    // assume its past the change time, its impossible
    // to know if the change has occured.
    return -60;
  }
  if (ymd[1] == dsem) { // month of end of summer time
    // date of change over
    let ddd = dsed - fymd[3] + 1;
    ddd = ddd + 7 * dsew;
    while (ddd > month_length[ymd[1] - 1]) ddd -= 7;
    if (ymd[2] < ddd) return -60;
    // see comment above for start time
    return 0;
  }
  return 0;
} // checkdst()


function jd(obs) {
  // The Julian date at observer time
  let j = jd0(obs.year, obs.month, obs.day);
  j += (obs.hours + ((obs.minutes + obs.tz) / 60.0) + (obs.seconds / 3600.0)) / 24;
  return j;
} // jd()


function local_sidereal(obs) {
  // sidereal time in hours for observer
  let res = g_sidereal(obs.year, obs.month, obs.day);
  res += 1.00273790935 * (obs.hours + (obs.minutes + obs.tz + (obs.seconds / 60.0)) / 60.0);
  res -= obs.longitude / 15.0;
  while (res < 0) res += 24.0;
  while (res > 24) res -= 24.0;
  return res;
}