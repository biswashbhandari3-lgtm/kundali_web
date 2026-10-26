/**
 * ==============================================================================
 * drik_ephemeris_archive.js - आधुनिक दृग्गणित (Drik / Swiss Ephemeris) सङ्ग्रह
 * ==============================================================================
 * 
 * [अभिलेख सूचना / Archive Notice]:
 * यो फाईलमा वेबसाइटमा पहिले प्रयोग गरिएको आधुनिक दृग्गणित (Drik / Lahiri Chitra-Paksha / 
 * Swiss Ephemeris / VSOP87 Analytical Meeus Engine) का सम्पूर्ण गणना विधिहरू सुरक्षित 
 * सङ्ग्रह (Archive) गरेर राखिएको छ।
 * 
 * वेबसाइटलाई १००% पारम्परिक "सूर्यसिद्धान्त (संशोधित)" मा आधारित बनाउनका लागि सक्रिय 
 * वेबसाइट इन्टरफेसबाट दृग्गणित पद्धतिलाई निष्क्रिय (Deactivated) गरिएको छ।
 * 
 * भविष्यमा अनुसन्धान, तुलनात्मक अध्ययन वा पुनः प्रयोग गर्नुपरेमा यस फाईलका फङ्सनहरू 
 * सिधै प्रयोग गर्न सकिन्छ।
 * ==============================================================================
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DrikEphemerisArchive = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    const DEG2RAD = Math.PI / 180.0;
    const RAD2DEG = 180.0 / Math.PI;

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
     * True Lahiri (Chitra Paksha) Ayanamsha for a given Julian Day
     * Reference: 2000.0 (JD 2451545.0) = 23° 51' 25.5" = 23.85709°
     * Lahiri rate: 50.290966 arcsec per year = 1.396971° per century
     */
    function getLahiriAyanamsha(jd) {
        const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000
        const ayan = 23.85709 + 1.396971 * T + 0.000308 * T * T;
        return ayan;
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
     * Calculates Modern Nirayana Lagna (Ascendant in degrees: 0 - 360)
     * Standard Meeus Formula (Astronomical Algorithms Ch. 14) with Lahiri Ayanamsha
     */
    function calculateDrikLagna(jd, lat, lon, ayanamsha) {
        const ayan = (typeof ayanamsha === 'number') ? ayanamsha : getLahiriAyanamsha(jd);
        const gmst = getGMST(jd);
        const ramc = normalizeDeg(gmst + lon); // Local Sidereal Time (RAMC / LST) in degrees
        const eps = getObliquity(jd) * DEG2RAD;
        const phi = lat * DEG2RAD;
        const theta = ramc * DEG2RAD;

        // Sayana Ascendant (Tropical)
        const y = Math.cos(theta);
        const x = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
        let sayanaAsc = Math.atan2(y, x) * RAD2DEG;
        sayanaAsc = normalizeDeg(sayanaAsc);

        // Nirayana Ascendant (Sidereal / चित्रापक्षीय लाहिडी लग्न)
        const nirayanaAsc = normalizeDeg(sayanaAsc - ayan);
        return nirayanaAsc;
    }

    /**
     * Planetary Calculation Algorithms (High-Precision Analytical VSOP/Meeus / Drik)
     */
    function calculateDrikPlanetPositions(jd, ayanamsha) {
        const ayan = (typeof ayanamsha === 'number') ? ayanamsha : getLahiriAyanamsha(jd);
        const T = (jd - 2451545.0) / 36525.0;
        const T2 = T * T;
        const T3 = T2 * T;

        // 1. SUN (सूर्य - दृक्)
        const L0_sun = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T2);
        const M_sun = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T2) * DEG2RAD;
        const C_sun = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M_sun) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun) +
            0.000289 * Math.sin(3 * M_sun);
        const sunSayana = normalizeDeg(L0_sun + C_sun);
        const sunNirayana = normalizeDeg(sunSayana - ayan);

        // 2. MOON (चन्द्र - दृक्)
        const L_moon = normalizeDeg(218.3164477 + 481267.8812773 * T - 0.0015786 * T2 + T3 / 538841.0);
        const D_moon = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868.0) * DEG2RAD;
        const M_moon = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699.0) * DEG2RAD;
        const F_moon = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000.0) * DEG2RAD;

        let moonEvection = 6.288774 * Math.sin(M_moon) +
            1.274027 * Math.sin(2 * D_moon - M_moon) +
            0.658314 * Math.sin(2 * D_moon) +
            0.213618 * Math.sin(2 * M_moon) -
            0.185116 * Math.sin(M_sun) -
            0.114332 * Math.sin(2 * F_moon) +
            0.058793 * Math.sin(2 * D_moon - 2 * M_moon) +
            0.057066 * Math.sin(2 * D_moon - M_sun - M_moon) +
            0.053322 * Math.sin(2 * D_moon + M_moon);

        const moonSayana = normalizeDeg(L_moon + moonEvection);
        const moonNirayana = normalizeDeg(moonSayana - ayan);

        // 3. RAHU & KETU (राहु र केतु - Mean Lunar Ascending Node)
        const omega = normalizeDeg(125.04452 - 1934.136261 * T + 0.0020708 * T2 + T3 / 450000.0);
        const rahuNirayana = normalizeDeg(omega - ayan);
        const ketuNirayana = normalizeDeg(rahuNirayana + 180.0);

        // Keplerian orbit helper:
        function calcPlanet(meanLong, semiMajor, meanAnomaly, ecc, argPeri, node, T) {
            let M = normalizeDeg(meanAnomaly) * DEG2RAD;
            let E = M + ecc * Math.sin(M);
            for (let i = 0; i < 3; i++) {
                E = E + (M - (E - ecc * Math.sin(E))) / (1 - ecc * Math.cos(E));
            }
            let v = 2 * Math.atan(Math.sqrt((1 + ecc) / (1 - ecc)) * Math.tan(E / 2));
            let r = semiMajor * (1 - ecc * Math.cos(E));
            let helioLon = normalizeDeg(v * RAD2DEG + argPeri);
            return { helioLon, r };
        }

        // Earth
        const earth = calcPlanet(L0_sun + 180, 1.00000011, M_sun * RAD2DEG, 0.01671022 - 0.000038 * T, 102.937, 0, T);

        // MARS (मङ्गल)
        const marsM = 19.373 + 19140.299 * T;
        const mars = calcPlanet(355.433 + 19140.299 * T, 1.523662, marsM, 0.093405, 336.060 + 0.444 * T, 49.558, T);
        const marsGeoSayana = geocentricLong(earth.r, earth.helioLon, mars.r, mars.helioLon);

        // MERCURY (बुध)
        const mercM = 174.7947 + 149472.515 * T;
        const merc = calcPlanet(252.251 + 149472.515 * T, 0.387098, mercM, 0.205631, 77.456 + 0.159 * T, 48.331, T);
        const mercGeoSayana = geocentricLong(earth.r, earth.helioLon, merc.r, merc.helioLon);

        // JUPITER (गुरु)
        const jupM = 20.020 + 3034.696 * T;
        const jup = calcPlanet(34.351 + 3034.696 * T, 5.20260, jupM, 0.048498, 14.331 + 0.215 * T, 100.464, T);
        const jupGeoSayana = geocentricLong(earth.r, earth.helioLon, jup.r, jup.helioLon);

        // VENUS (शुक्र)
        const venM = 50.116 + 58517.804 * T;
        const ven = calcPlanet(181.979 + 58517.804 * T, 0.723332, venM, 0.006772, 131.564 + 0.005 * T, 76.680, T);
        const venGeoSayana = geocentricLong(earth.r, earth.helioLon, ven.r, ven.helioLon);

        // SATURN (शनि)
        const satM = 317.021 + 1222.114 * T;
        const sat = calcPlanet(50.077 + 1222.114 * T, 9.55491, satM, 0.055548, 93.057 + 0.540 * T, 113.666, T);
        const satGeoSayana = geocentricLong(earth.r, earth.helioLon, sat.r, sat.helioLon);

        return {
            Surya: { deg: sunNirayana, speed: 0.9856, isRetrograde: false },
            Chandra: { deg: moonNirayana, speed: 13.176, isRetrograde: false },
            Mangal: { deg: normalizeDeg(marsGeoSayana - ayan), isRetrograde: checkRetrograde(sunSayana, marsGeoSayana, 135) },
            Budha: { deg: normalizeDeg(mercGeoSayana - ayan), isRetrograde: checkRetrogradeInner(sunSayana, mercGeoSayana) },
            Guru: { deg: normalizeDeg(jupGeoSayana - ayan), isRetrograde: checkRetrograde(sunSayana, jupGeoSayana, 120) },
            Shukra: { deg: normalizeDeg(venGeoSayana - ayan), isRetrograde: checkRetrogradeInner(sunSayana, venGeoSayana) },
            Shani: { deg: normalizeDeg(satGeoSayana - ayan), isRetrograde: checkRetrograde(sunSayana, satGeoSayana, 105) },
            Rahu: { deg: rahuNirayana, isRetrograde: true },
            Ketu: { deg: ketuNirayana, isRetrograde: true }
        };
    }

    function geocentricLong(rEarth, lEarth, rPlanet, lPlanet) {
        const le = lEarth * DEG2RAD;
        const lp = lPlanet * DEG2RAD;
        const xe = rEarth * Math.cos(le);
        const ye = rEarth * Math.sin(le);
        const xp = rPlanet * Math.cos(lp);
        const yp = rPlanet * Math.sin(lp);

        const x = xp - xe;
        const y = yp - ye;
        let geo = Math.atan2(y, x) * RAD2DEG;
        return normalizeDeg(geo);
    }

    function checkRetrograde(sunLon, planetLon, threshold) {
        let diff = Math.abs(sunLon - planetLon);
        if (diff > 180) diff = 360 - diff;
        return diff >= threshold;
    }

    function checkRetrogradeInner(sunLon, planetLon) {
        let diff = Math.abs(sunLon - planetLon);
        if (diff > 180) diff = 360 - diff;
        return diff <= 12;
    }

    /**
     * Complete Drik Horoscope Calculation Package (for external/reference use)
     */
    function calculateFullDrikChart(dateUtc, lat, lon) {
        const jd = getJulianDay(dateUtc);
        const ayan = getLahiriAyanamsha(jd);
        const lagna = calculateDrikLagna(jd, lat, lon, ayan);
        const planets = calculateDrikPlanetPositions(jd, ayan);
        return {
            status: "archived",
            siddhanta: "दृक्-सिद्धान्त (चित्रापक्षीय लाहिडी)",
            jd,
            ayanamsha: ayan,
            lagnaDeg: lagna,
            planets
        };
    }

    return {
        getJulianDay,
        getLahiriAyanamsha,
        getObliquity,
        getGMST,
        calculateDrikLagna,
        calculateDrikPlanetPositions,
        geocentricLong,
        checkRetrograde,
        checkRetrogradeInner,
        calculateFullDrikChart
    };
}));
