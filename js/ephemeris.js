/**
 * ephemeris.js - खगोलीय तथा ज्योतिषीय ग्रह गणना इन्जिन (Vedic Ephemeris Engine)
 * Kundali Darsan Web
 */

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * Normalizes degrees to [0, 360)
 */
function normalizeDeg(deg) {
    let d = deg % 360.0;
    if (d < 0) d += 360.0;
    return d;
}

/**
 * Converts Date (UTC) to Julian Day Number
 */
function getJulianDay(dateUtc) {
    let year = dateUtc.getUTCFullYear();
    let month = dateUtc.getUTCMonth() + 1;
    const day = dateUtc.getUTCDate();
    const hour = dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60.0 + dateUtc.getUTCSeconds() / 3600.0;

    if (month <= 2) {
        year -= 1;
        month += 12;
    }

    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    const JD = Math.floor(365.25 * (year + 4716)) +
        Math.floor(30.6001 * (month + 1)) +
        day + B - 1524.5 + hour / 24.0;

    return JD;
}

/**
 * [DEACTIVATED FROM ACTIVE WEBSITE - ARCHIVED IN js/drik_ephemeris_archive.js]
 * True Lahiri (Chitra Paksha) Ayanamsha has been deactivated on the website.
 * Defaulted to getSuryaSiddhantaAyanamsha (संशोधित सूर्यसिद्धान्त).
 */
function getLahiriAyanamsha(jd) {
    return getSuryaSiddhantaAyanamsha(jd);
}

/**
 * Obliquity of the Ecliptic (in degrees)
 */
function getObliquity(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    return 23.439291 - 0.0130042 * T - 0.00000016 * T * T;
}

/**
 * Greenwich Mean Sidereal Time (GMST in degrees)
 */
function getGMST(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
        0.000387933 * T * T - (T * T * T) / 38710000.0;
    return normalizeDeg(gmst);
}

/**
 * Classical Surya Siddhanta Engine Bridge:
 * All planet positions, Lagna, and Ahargana are computed through
 * PureSuryaSiddhanta (सूर्यसिद्धान्त ११-चरणीय शास्त्रीय गणित क्रम).
 */
function getPureSSEngine() {
    if (typeof PureSuryaSiddhanta !== 'undefined') {
        return PureSuryaSiddhanta;
    }
    if (typeof require === 'function') {
        try {
            return require('./pure_surya_siddhanta.js');
        } catch (e) {}
    }
    return null;
}

function calculateLagna(jd, lat, lon, ayanamsha) {
    const ayan = (typeof ayanamsha === "number") ? ayanamsha : getSuryaSiddhantaAyanamsha(jd);
    return calculateSuryaSiddhantaLagna(jd, lat, lon, ayan);
}

function calculatePlanetPositions(jd, ayanamsha, lat = 27.7172, lon = 85.324) {
    const ps = getPureSSEngine();
    if (ps && typeof ps.calculatePureSuryaSiddhantaPlanets === 'function') {
        return ps.calculatePureSuryaSiddhantaPlanets(jd, lat, lon);
    }
    throw new Error("PureSuryaSiddhanta इन्जिन लोड हुन सकेन।");
}

/**
 * Calculates Local Sunrise and Sunset
 * @param {Date} dateUtc 
 * @param {number} lat - Latitude N
 * @param {number} lon - Longitude E
 * @param {number} tzOffset - Hours from UTC (e.g. +5.75 for Nepal)
 */
function calculateSunRiseSet(dateUtc, lat, lon, tzOffset) {
    const jd = getJulianDay(dateUtc);
    const T = (jd - 2451545.0) / 36525.0;

    // Solar mean anomaly and ecliptic longitude
    const M = normalizeDeg(357.5291 + 35999.0503 * T) * DEG2RAD;
    const L = normalizeDeg(280.4665 + 36000.7698 * T) + 1.9146 * Math.sin(M);
    const eps = getObliquity(jd) * DEG2RAD;

    // Declination and Equation of time
    const sinDec = Math.sin(eps) * Math.sin(L * DEG2RAD);
    const dec = Math.asin(sinDec);
    const cosDec = Math.cos(dec);

    // Standard atmospheric refraction + solar semi-diameter = -0.833°
    const h0 = -0.833 * DEG2RAD;
    const phi = lat * DEG2RAD;

    const cosH0 = (Math.sin(h0) - Math.sin(phi) * sinDec) / (Math.cos(phi) * cosDec);

    let sunriseHour = 6.0;
    let sunsetHour = 18.0;

    if (cosH0 >= -1 && cosH0 <= 1) {
        const H0 = Math.acos(cosH0) * RAD2DEG; // Hour angle in degrees

        // Solar noon in Local Mean Time (Equation of time effect)
        const y = Math.tan(eps / 2) * Math.tan(eps / 2);
        const eotMinutes = 4 * RAD2DEG * (y * Math.sin(2 * L * DEG2RAD) - 2 * 0.0167 * Math.sin(M) +
            4 * 0.0167 * y * Math.sin(M) * Math.cos(2 * L * DEG2RAD));

        // Solar noon in Standard Time
        const standardLon = tzOffset * 15.0; // e.g. 5.75 * 15 = 86.25° for Nepal
        const lonDiffMinutes = (standardLon - lon) * 4.0; // 4 minutes per degree
        const solarNoonHours = 12.0 + (lonDiffMinutes - eotMinutes) / 60.0;

        sunriseHour = solarNoonHours - (H0 * 4.0) / 60.0;
        sunsetHour = solarNoonHours + (H0 * 4.0) / 60.0;
    }

    return {
        sunrise: sunriseHour, // Decimal hours (e.g. 6.25 = 06:15 AM)
        sunset: sunsetHour,
        sunriseStr: formatDecimalTime(sunriseHour),
        sunsetStr: formatDecimalTime(sunsetHour)
    };
}

/**
 * Formats decimal hours into HH:MM:SS AM/PM string
 */
function formatDecimalTime(decHour) {
    let totalSec = Math.round(decHour * 3600);
    if (totalSec < 0) totalSec += 24 * 3600;
    totalSec = totalSec % (24 * 3600);

    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Calculates Dinamana (दिनमान) in Ghati and Pala
 * 1 Ghati = 24 minutes (Total 60 Ghati in 24 hours)
 */
function calculateDinamana(sunriseDecHour, sunsetDecHour) {
    let dayLengthHours = sunsetDecHour - sunriseDecHour;
    if (dayLengthHours < 0) dayLengthHours += 24.0;

    const totalGhati = dayLengthHours * 2.5; // 24 hours = 60 ghati -> 1 hr = 2.5 ghati
    const ghati = Math.floor(totalGhati);
    const totalPala = (totalGhati - ghati) * 60;
    const pala = Math.floor(totalPala);
    const vipala = Math.round((totalPala - pala) * 60);

    return {
        ghati,
        pala,
        vipala,
        formatted: `${ghati} घटी ${pala} पला ${vipala} विपला`
    };
}

/**
 * Calculates Ishtakala (इष्टकाल) from local sunrise to birth time
 */
function calculateIshtakala(birthDecHour, sunriseDecHour) {
    let diffHours = birthDecHour - sunriseDecHour;
    if (diffHours < 0) diffHours += 24.0;

    const totalGhati = diffHours * 2.5;
    const ghati = Math.floor(totalGhati);
    const totalPala = (totalGhati - ghati) * 60;
    const pala = Math.floor(totalPala);
    const vipala = Math.round((totalPala - pala) * 60);

    return {
        ghati,
        pala,
        vipala,
        formatted: `${ghati} घटी ${pala} पला ${vipala} विपला`
    };
}

/**
 * Classical Surya Siddhanta Planetary Engine (Offline Client-Side Engine)
 * Pure Classical Surya Siddhantika Astronomy & Astrology Manual
 * (Without Modern Bija Correction / शुद्ध पारम्परिक निष्ठा)
 */
function getSuryaSiddhantaAyanamsha(jd) {
    if (typeof PureSuryaSiddhanta !== 'undefined' && typeof PureSuryaSiddhanta.calculatePureSuryaSiddhantaAyanamsha === 'function') {
        return PureSuryaSiddhanta.calculatePureSuryaSiddhantaAyanamsha(jd);
    }
    const T = (jd - 2451545.0) / 36525.0;
    return 23.839495 + 1.39688 * T; // संशोधित सूर्यसिद्धान्त मानक: २४° १२' ५०" (२४.२१३८८९°)
}

function toNepaliDigitsEphem(num) {
    if (typeof toNepaliDigits === 'function') return toNepaliDigits(num);
    const nMap = ['०','१','२','३','४','५','६','७','८','९'];
    return String(num).replace(/[0-9]/g, d => nMap[d]);
}

function formatAyanamshaDMS(deg) {
    const absDeg = Math.abs(deg);
    const d = Math.floor(absDeg);
    const m = Math.floor((absDeg - d) * 60);
    const s = Math.round(((absDeg - d) * 60 - m) * 60);
    const raw = `${d}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    const np = `${toNepaliDigitsEphem(d)}:${toNepaliDigitsEphem(m.toString().padStart(2, '0'))}:${toNepaliDigitsEphem(s.toString().padStart(2, '0'))}`;
    return { deg, raw, np, formatted: np };
}

/**
 * सूर्यक्रान्ति (Sun Declination in Degrees, Minutes):
 * sin(delta) = sin(eps) * sin(sayanaSun)
 */
function calculateSuryaKranti(sunNirayana, ayanamsha) {
    const ayan = (typeof ayanamsha === 'number') ? ayanamsha : 24.213889;
    const sayanaSun = normalizeDeg(sunNirayana + ayan) * DEG2RAD;
    const eps = 24.0 * DEG2RAD; // सूर्यसिद्धान्तीय परम क्रान्ति २४°
    const sinDelta = Math.sin(eps) * Math.sin(sayanaSun);
    const deltaDeg = Math.asin(sinDelta) * RAD2DEG;
    
    const isSouth = (deltaDeg < 0);
    const absDeg = Math.abs(deltaDeg);
    const degPart = Math.floor(absDeg);
    const minPart = Math.round((absDeg - degPart) * 60);
    const prefix = isSouth ? 'द.' : 'उ.';
    
    return {
        deg: deltaDeg,
        direction: isSouth ? 'दक्षिण' : 'उत्तर',
        prefix: prefix,
        formattedRaw: `${prefix}${degPart}:${minPart.toString().padStart(2, '0')}`,
        formattedNp: `${prefix}${toNepaliDigitsEphem(degPart)}:${toNepaliDigitsEphem(minPart.toString().padStart(2, '0'))}`
    };
}

/**
 * चर संस्कार (Char Samskara - Ascensional Difference in Pala:Vipala):
 * sin(char) = tan(phi) * tan(delta)
 */
function calculateCharSamskara(lat, deltaDeg) {
    const phi = lat * DEG2RAD;
    const delta = deltaDeg * DEG2RAD;
    const val = Math.max(-1, Math.min(1, Math.tan(phi) * Math.tan(delta)));
    const charDeg = Math.asin(val) * RAD2DEG;
    // 360 deg = 60 ghati = 3600 pala => 1 deg = 10 pala
    const charPalaTotal = charDeg * 10.0;
    const isNeg = (charPalaTotal < 0);
    const absPala = Math.abs(charPalaTotal);
    const palaPart = Math.floor(absPala);
    const vipalaPart = Math.round((absPala - palaPart) * 60);
    const sign = isNeg ? '-' : '+';
    
    return {
        palaTotal: charPalaTotal,
        pala: palaPart,
        vipala: vipalaPart,
        formattedRaw: `${sign}${palaPart}:${vipalaPart.toString().padStart(2, '0')}`,
        formattedNp: `${sign}${toNepaliDigitsEphem(palaPart)}:${toNepaliDigitsEphem(vipalaPart.toString().padStart(2, '0'))}`
    };
}

/**
 * बेलान्तर (Belantara - Equation of Time in Minutes:Seconds):
 * Difference between Apparent Solar Time and Mean Solar Time.
 */
function calculateBelantara(jd) {
    const d = jd - 2451545.0;
    const L0 = (280.4664567 + 0.98564736 * d) % 360.0;
    const M = normalizeDeg(357.5291 + 0.98560028 * d) * DEG2RAD;
    const C = (1.914602 - 0.004817 * (d / 36525.0)) * Math.sin(M) +
              (0.019993 - 0.000101 * (d / 36525.0)) * Math.sin(2 * M) +
              0.000289 * Math.sin(3 * M);
    const lambda = (L0 + C) * DEG2RAD;
    const eps = 23.43929111 * DEG2RAD;
    const alpha = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * RAD2DEG;
    const alphaNorm = normalizeDeg(alpha);
    
    const eotDeg = ((alphaNorm - L0 + 540.0) % 360.0) - 180.0;
    const eotMinutes = eotDeg * 4.0;
    const isNeg = (eotMinutes < 0);
    const absMin = Math.abs(eotMinutes);
    const mPart = Math.floor(absMin);
    const sPart = Math.round((absMin - mPart) * 60);
    const sign = isNeg ? '-' : '+';
    
    return {
        minutesTotal: eotMinutes,
        minutes: mPart,
        seconds: sPart,
        formattedRaw: `${sign}${mPart}:${sPart.toString().padStart(2, '0')}`,
        formattedNp: `${sign}${toNepaliDigitsEphem(mPart)}:${toNepaliDigitsEphem(sPart.toString().padStart(2, '0'))}`
    };
}

/**
 * शुद्ध पारम्परिक सूर्यसिद्धान्त खगोलीय प्राचल (Pure Classical Parameters):
 */
function getSuryaSiddhantaParameters(jd, lat, lon) {
    const ps = getPureSSEngine();
    if (ps) {
        const purePlanets = ps.calculatePureSuryaSiddhantaPlanets(jd, lat, lon);
        const ahar = purePlanets.ahargana;
        const ayan = ps.calculatePureSuryaSiddhantaAyanamsha(jd);
        const triprasna = ps.calculatePureTriprasna(purePlanets.Surya.deg, ayan, lat, lon);
        const ayanDMS = formatAyanamshaDMS(ayan);

        const prefix = triprasna.isNorth ? 'उ.' : 'द.';
        const absKranti = Math.abs(triprasna.krantiDeg);
        let krantiDegPart = Math.floor(absKranti);
        let krantiMinPart = Math.round((absKranti - krantiDegPart) * 60);
        if (krantiMinPart >= 60) {
            krantiDegPart += 1;
            krantiMinPart -= 60;
        }
        const krantiNp = `${prefix}${toNepaliDigitsEphem(krantiDegPart)}:${toNepaliDigitsEphem(krantiMinPart.toString().padStart(2, '0'))}`;

        const charSign = triprasna.charPalaTotal >= 0 ? '+' : '-';
        const absChar = Math.abs(triprasna.charPalaTotal);
        let charPalaPart = Math.floor(absChar);
        let charVipalaPart = Math.round((absChar - charPalaPart) * 60);
        if (charVipalaPart >= 60) {
            charPalaPart += 1;
            charVipalaPart -= 60;
        }
        const charNp = `${charSign}${toNepaliDigitsEphem(charPalaPart)}:${toNepaliDigitsEphem(charVipalaPart.toString().padStart(2, '0'))}`;

        const dinamanaNp = `${toNepaliDigitsEphem(triprasna.dinamanaGhati.toFixed(2))} घटी`;
        const belantara = calculateBelantara(jd);

        return {
            siddhantaName: 'सूर्यसिद्धान्त (संशोधित)',
            ahargana: ahar.aharganaInt,
            vaara: ahar.vaaraName,
            ayanamshaDeg: ayan,
            ayanamshaDMS: ayanDMS.np,
            ayanamshaRaw: ayanDMS.raw,
            suryaKranti: krantiNp,
            suryaKrantiRaw: `${prefix}${krantiDegPart}:${krantiMinPart.toString().padStart(2, '0')}`,
            krantiDeg: triprasna.krantiDeg,
            charSamskara: charNp,
            charSamskaraRaw: `${charSign}${charPalaPart}:${charVipalaPart}`,
            charPala: triprasna.charPalaTotal,
            dinamana: dinamanaNp,
            belantara: belantara.formattedNp,
            belantaraRaw: belantara.formattedRaw,
            bannerTextNp: `गणना सिद्धान्त:- सूर्यसिद्धान्त (संशोधित) | अहर्गण:- ${toNepaliDigitsEphem(ahar.aharganaInt)} | अयनांश:- ${ayanDMS.np} | सूर्यक्रान्ति:- ${krantiNp} | चर:- ${charNp} पला | बेलान्तर:- ${belantara.formattedNp} | दिनमान:- ${dinamanaNp}`
        };
    }
    throw new Error("PureSuryaSiddhanta इन्जिन लोड हुन सकेन।");
}

function calculateSuryaSiddhantaLagna(jd, lat, lon, ayanamsha) {
    const ps = getPureSSEngine();
    if (ps && typeof ps.calculatePureSuryaSiddhantaLagna === 'function') {
        const ayan = (typeof ayanamsha === "number") ? ayanamsha : ps.calculatePureSuryaSiddhantaAyanamsha(jd);
        return ps.calculatePureSuryaSiddhantaLagna(jd, lat, lon, ayan);
    }
    throw new Error("PureSuryaSiddhanta इन्जिन लोड हुन सकेन।");
}

function calculateSuryaSiddhantaPlanets(jd, ayanamsha, lat = 27.7172, lon = 85.324) {
    return calculatePlanetPositions(jd, ayanamsha, lat, lon);
}

if (typeof window !== "undefined") {
    window.normalizeDeg = normalizeDeg;
    window.getJulianDay = getJulianDay;
    window.getLahiriAyanamsha = getLahiriAyanamsha;
    window.getSuryaSiddhantaAyanamsha = getSuryaSiddhantaAyanamsha;
    window.formatAyanamshaDMS = formatAyanamshaDMS;
    window.calculateSuryaKranti = calculateSuryaKranti;
    window.calculateCharSamskara = calculateCharSamskara;
    window.calculateBelantara = calculateBelantara;
    window.getSuryaSiddhantaParameters = getSuryaSiddhantaParameters;
    window.getObliquity = getObliquity;
    window.getGMST = getGMST;
    window.calculateLagna = calculateLagna;
    window.calculateSuryaSiddhantaLagna = calculateSuryaSiddhantaLagna;
    window.calculatePlanetPositions = calculatePlanetPositions;
    window.calculateSuryaSiddhantaPlanets = calculateSuryaSiddhantaPlanets;
    window.calculateSunRiseSet = calculateSunRiseSet;
    window.calculateDinamana = calculateDinamana;
    window.calculateIshtakala = calculateIshtakala;
    window.formatDecimalTime = formatDecimalTime;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        normalizeDeg,
        getJulianDay,
        getLahiriAyanamsha,
        getSuryaSiddhantaAyanamsha,
        formatAyanamshaDMS,
        calculateSuryaKranti,
        calculateCharSamskara,
        calculateBelantara,
        getSuryaSiddhantaParameters,
        getObliquity,
        getGMST,
        calculateLagna,
        calculateSuryaSiddhantaLagna,
        calculatePlanetPositions,
        calculateSuryaSiddhantaPlanets,
        calculateSunRiseSet,
        calculateDinamana,
        calculateIshtakala,
        formatDecimalTime
    };
}
