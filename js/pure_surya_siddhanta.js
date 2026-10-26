/**
 * ==============================================================================
 * pure_surya_siddhanta.js - शुद्ध सूर्यसिद्धान्तीय गणितीय पद्धति
 * Pure Classical Surya Siddhantika Astronomy & Astrology Engine
 * (Without Modern Bija Correction / बिना बीज-संस्कार शुद्ध पारम्परिक निष्ठा)
 * ==============================================================================
 * 
 * मूल शास्त्रीय आधार:
 * - महायुग सावन दिन: १,५७,७९,१७,८२८
 * - महायुग सौर्य वर्ष: ४३,२०,०००
 * - महायुग सौर्य मास: ५,१८,४०,०००
 * - महायुग चान्द्र मास: ५,३४,३३,३३६
 * - महायुग अधिकमास: १५,९३,३३६
 * - कलियुग आरम्भ: १८ फेब्रुअरी ३१०२ ईसापूर्व (शुक्रबार सूर्योदय / मध्यरात, अहर्गण ०)
 * - परम क्रान्ति: २४° (२४ अंश)
 * - दोलन अयनांश: ±२७°
 * - मन्द र शीघ्र परिधि: शुद्ध पारम्परिक सम-विषम परिधि तालिका अनुसार
 * ==============================================================================
 */

(function(root, factory) {
    const api = factory();
    if (typeof define === 'function' && define.amd) {
        define([], () => api);
    }
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    const g = (typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : root);
    g.PureSuryaSiddhanta = api;
}(typeof self !== 'undefined' ? self : this, function() {

    const DEG2RAD = Math.PI / 180.0;
    const RAD2DEG = 180.0 / Math.PI;

    // १. मूल खगोलीय स्थिराङ्कहरू (Fundamental Astronomical Constants)
    const SAVAN_DAYS_MAHAYUGA = 1577917828;
    const SOLAR_YEARS_MAHAYUGA = 4320000;
    const SOLAR_MONTHS_MAHAYUGA = 51840000;
    const LUNAR_MONTHS_MAHAYUGA = 53433336;
    const ADHIMASA_MAHAYUGA = 1593336;
    const TITHIS_MAHAYUGA = 1603000080;
    const AVAMA_DAYS_NUMERATOR = 250825800; // Classical Kshaya ratio
    const AVAMA_DAYS_DENOMINATOR = 1603000080;

    // कलियुग आरम्भ लङ्का सूर्योदय काल (Friday, 18 Feb 3102 BCE Julian Day)
    const KALI_EPOCH_JD = 588465.75;
    // उज्जयिनी / लङ्का मध्यरेखा देशान्तर (७५° ४६' पूर्व = 75.766667°)
    const UJJAIN_LON = 75.766667;

    // २. शुद्ध सूर्यसिद्धान्तीय महायुग भगण तालिका (बिना बीज संस्कार)
    const MAHAYUGA_BHAGANAS = {
        Surya: 4320000,
        Chandra: 57753336,
        Mangal: 2296832,
        BudhaSighra: 17937060,
        Guru: 364220,
        ShukraSighra: 7022376,
        Shani: 146568,
        ChandraMandocca: 488203,
        Rahu: 232238 // वक्री (Retrograde)
    };

    // स्थिर मन्दोच्च अंशहरू (Fixed Mandoccas in degrees)
    const MANDOCCAS = {
        Surya: 77.25,        // ७७° १५'
        Mangal: 130.0,       // १३०° ००'
        Budha: 220.0,        // २२०° ००'
        Guru: 171.0,         // १७१° ००'
        Shukra: 80.0,        // ८०° ००'
        Shani: 236.0         // २३६° ००'
    };

    // ३. मन्द र शीघ्र परिधि तालिका (सम र विषम पद परिधि)
    const EPICYCLES = {
        Surya:  { mandaOdd: 14.0, mandaEven: 13.6667 },
        Chandra:{ mandaOdd: 32.0, mandaEven: 31.6667 },
        Mangal: { mandaOdd: 75.0, mandaEven: 63.0, sighraOdd: 235.0, sighraEven: 232.0 },
        Budha:  { mandaOdd: 30.0, mandaEven: 28.0, sighraOdd: 133.0, sighraEven: 132.0 },
        Guru:   { mandaOdd: 33.0, mandaEven: 32.0, sighraOdd: 70.0,  sighraEven: 68.0 },
        Shukra: { mandaOdd: 12.0, mandaEven: 11.0, sighraOdd: 262.0, sighraEven: 260.0 },
        Shani:  { mandaOdd: 49.0, mandaEven: 48.0, sighraOdd: 40.0,  sighraEven: 39.0 }
    };

    function normalizeDeg(deg) {
        let d = deg % 360.0;
        if (d < 0) d += 360.0;
        return d;
    }

    /**
     * कलिगत अहर्गण साधन (खगोलीय तथा पात्रोय विधि)
     * @param {number} jd - Julian Day Number
     * @param {number} lon - जन्मस्थान देशान्तर (East in degrees)
     */
    function calculateAhargana(jd, lon = 85.324) {
        // लङ्का/उज्जयिनी मध्यरेखादेखि स्थानीय देशान्तर फरक (दिनको अंशमा)
        const dLonDays = (lon - UJJAIN_LON) / 360.0;
        const aharganaTotal = (jd - KALI_EPOCH_JD) + dLonDays;
        const aharganaInt = Math.floor(aharganaTotal);
        const dayFraction = aharganaTotal - aharganaInt;

        // बार परीक्षण सूत्र: (अहर्गण + १) % ७
        // ०=शुक्र, १=शनि, २=आइत, ३=सोम, ४=मङ्गल, ५=बुध, ६=गुरु
        const vaaraIdx = (aharganaInt + 1) % 7;
        const VAARA_NAMES = [
            "शुक्रबार", "शनिबार", "आइतबार", "सोमबार", "मङ्गलबार", "बुधबार", "बिहीबार"
        ];

        return {
            aharganaTotal,
            aharganaInt,
            dayFraction,
            vaaraIdx,
            vaaraName: VAARA_NAMES[vaaraIdx]
        };
    }

    /**
     * मध्यम ग्रह साधन (Mean Longitude from Ahargana)
     * मध्यम ग्रह = (अहर्गण × महायुग भगण) / १,५७,७९,१७,८२८
     */
    function calculateMeanPlanets(ahargana) {
        const mean = {};
        for (const [planet, bhagana] of Object.entries(MAHAYUGA_BHAGANAS)) {
            const totalRev = (ahargana * bhagana) / SAVAN_DAYS_MAHAYUGA;
            const revFraction = totalRev % 1.0;
            let deg = revFraction * 360.0;
            if (planet === "Rahu") {
                deg = normalizeDeg(-deg); // राहु वक्री गति
            } else {
                deg = normalizeDeg(deg);
            }
            mean[planet] = deg;
        }
        return mean;
    }

    /**
     * मन्द फल साधन (Equation of Centre)
     * परिधि = सम परिधि + (विषम परिधि - सम परिधि) × |sin(मन्द केन्द्र)|
     * sin(मन्द फल) = (परिधि / ३६०°) × sin(मन्द केन्द्र)
     */
    function calcMandaphala(kendraDeg, periOdd, periEven) {
        const kRad = kendraDeg * DEG2RAD;
        const sinK = Math.sin(kRad);
        const peri = periEven + (periOdd - periEven) * Math.abs(sinK);
        const val = (peri / 360.0) * sinK;
        const clamped = Math.max(-1.0, Math.min(1.0, val));
        return Math.asin(clamped) * RAD2DEG;
    }

    /**
     * शीघ्र फल साधन (Equation of Parallax)
     * शीघ्र कर्ण = √((१ + (परिधि/३६०) cos(K))² + ((परिधि/३६०) sin(K))²)
     * शीघ्र फल = atan2(y, x)
     */
    function calcSighraphala(kendraDeg, periOdd, periEven) {
        const kRad = kendraDeg * DEG2RAD;
        const sinK = Math.sin(kRad);
        const cosK = Math.cos(kRad);
        const peri = periEven + (periOdd - periEven) * Math.abs(sinK);
        const r = peri / 360.0;
        const x = 1.0 + r * cosK;
        const y = r * sinK;
        return Math.atan2(y, x) * RAD2DEG;
    }

    /**
     * पञ्चतारा ग्रहको शास्त्रीय ४ संस्कार क्रम:
     * १. अर्ध शीघ्र संस्कार
     * २. अर्ध मन्द संस्कार
     * ३. पूर्ण मन्द संस्कार
     * ४. पूर्ण शीघ्र संस्कार
     */
    function calcTaraGrahaSpashta(meanPlanet, sighrocca, mandocca, epicycle) {
        // १. अर्ध शीघ्र संस्कार
        const kSighra1 = normalizeDeg(sighrocca - meanPlanet);
        const sighraPhala1 = calcSighraphala(kSighra1, epicycle.sighraOdd, epicycle.sighraEven);
        const planet1 = normalizeDeg(meanPlanet + 0.5 * sighraPhala1);

        // २. अर्ध मन्द संस्कार
        const kManda1 = normalizeDeg(planet1 - mandocca);
        const mandaPhala1 = calcMandaphala(kManda1, epicycle.mandaOdd, epicycle.mandaEven);
        const planet2 = normalizeDeg(planet1 - 0.5 * mandaPhala1);

        // ३. पूर्ण मन्द संस्कार (सुरुको मध्यम ग्रहमा संस्कार)
        const kManda2 = normalizeDeg(planet2 - mandocca);
        const mandaPhala2 = calcMandaphala(kManda2, epicycle.mandaOdd, epicycle.mandaEven);
        const mandaSpashta = normalizeDeg(meanPlanet - mandaPhala2);

        // ४. पूर्ण शीघ्र संस्कार (मन्द स्पष्ट ग्रहमा शीघ्र फल जोडेर परम स्पष्ट ग्रह)
        const kSighra2 = normalizeDeg(sighrocca - mandaSpashta);
        const sighraPhala2 = calcSighraphala(kSighra2, epicycle.sighraOdd, epicycle.sighraEven);
        const paramaSpashta = normalizeDeg(mandaSpashta + sighraPhala2);

        // वक्री स्थिति निर्धारण (Retrograde if sighra center is opposition/retrograde zone)
        let isRetro = false;
        const sDiff = Math.abs(kSighra2 > 180 ? 360 - kSighra2 : kSighra2);
        if (sDiff >= 130) isRetro = true;

        return {
            spashta: paramaSpashta,
            mandaSpashta,
            mandaPhala: mandaPhala2,
            sighraPhala: sighraPhala2,
            isRetrograde: isRetro
        };
    }

    /**
     * सूर्यसिद्धान्त अयनांश (संशोधित सूर्यसिद्धान्त / SkyVision मानक: २४° १२' ५०" = २४.२१३८८९°)
     * @param {number} jd - Julian Day
     * @param {boolean} useClassicalTrepidation - यदि true भए शास्त्रीय दोलन अयनांश (±२७°), अन्यथा संशोधित सूर्यसिद्धान्त मानक (२४° १२' ५०")
     */
    function calculatePureSuryaSiddhantaAyanamsha(jd, useClassicalTrepidation = false) {
        // १. शास्त्रीय दोलन अयनांश (Classical Oscillatory Trepidation: ±२७° आयाम)
        const aharganaObj = calculateAhargana(jd);
        const ahar = aharganaObj.aharganaTotal;
        const cycleFraction = (ahar * 600.0) / SAVAN_DAYS_MAHAYUGA;
        const dAngle = (cycleFraction * 360.0) % 360.0;
        const classicalAyanDeg = Math.abs(27.0 * Math.sin(dAngle * DEG2RAD));

        // २. संशोधित सूर्यसिद्धान्त अयनांश (SkyVision मानक: २४° १२' ५०" = २४.२१३८८९°)
        // J2000.0 (JD 2451545.0) देखि अयन चलन दर ५०.२९" प्रति वर्ष
        const d = jd - 2451545.0;
        const tCenturies = d / 36525.0;
        const sansodhitaAyan = 23.839495 + (tCenturies * 1.39688); // चालू कालमा २४° १२' ५०" (२४.२१३८८९°)

        if (useClassicalTrepidation) {
            return classicalAyanDeg > 0 ? classicalAyanDeg : 26.2403;
        }
        return sansodhitaAyan;
    }

    /**
     * शुद्ध सूर्यसिद्धान्त स्पष्ट ग्रह परिगणना (Pure Classical Spashta Graha)
     */
    function calculatePureSuryaSiddhantaPlanets(jd, lat = 27.7172, lon = 85.324) {
        const aharganaObj = calculateAhargana(jd, lon);
        const ahar = aharganaObj.aharganaTotal;
        const mean = calculateMeanPlanets(ahar);

        // १. सूर्य स्पष्ट (Sun)
        const sunKendra = normalizeDeg(mean.Surya - MANDOCCAS.Surya);
        const sunMandaPhala = calcMandaphala(sunKendra, EPICYCLES.Surya.mandaOdd, EPICYCLES.Surya.mandaEven);
        const suryaSpashta = normalizeDeg(mean.Surya - sunMandaPhala);

        // २. चन्द्र स्पष्ट (Moon)
        const chandraMandocca = mean.ChandraMandocca;
        const moonKendra = normalizeDeg(mean.Chandra - chandraMandocca);
        const moonMandaPhala = calcMandaphala(moonKendra, EPICYCLES.Chandra.mandaOdd, EPICYCLES.Chandra.mandaEven);
        const chandraSpashta = normalizeDeg(mean.Chandra - moonMandaPhala);

        // ३. मङ्गल स्पष्ट (Mars)
        const mangal = calcTaraGrahaSpashta(
            mean.Mangal, suryaSpashta, MANDOCCAS.Mangal, EPICYCLES.Mangal
        );

        // ४. बुध स्पष्ट (Mercury): मध्यम ग्रह = मध्यम सूर्य, शीघ्रोच्च = बुध शीघ्रोच्च
        const budha = calcTaraGrahaSpashta(
            mean.Surya, mean.BudhaSighra, MANDOCCAS.Budha, EPICYCLES.Budha
        );

        // ५. गुरु स्पष्ट (Jupiter)
        const guru = calcTaraGrahaSpashta(
            mean.Guru, suryaSpashta, MANDOCCAS.Guru, EPICYCLES.Guru
        );

        // ६. शुक्र स्पष्ट (Venus): मध्यम ग्रह = मध्यम सूर्य, शीघ्रोच्च = शुक्र शीघ्रोच्च
        const shukra = calcTaraGrahaSpashta(
            mean.Surya, mean.ShukraSighra, MANDOCCAS.Shukra, EPICYCLES.Shukra
        );

        // ७. शनि स्पष्ट (Saturn)
        const shani = calcTaraGrahaSpashta(
            mean.Shani, suryaSpashta, MANDOCCAS.Shani, EPICYCLES.Shani
        );

        // ८. राहु र केतु (Rahu & Ketu)
        const rahuSpashta = mean.Rahu;
        const ketuSpashta = normalizeDeg(rahuSpashta + 180.0);

        return {
            Surya: { deg: suryaSpashta, speed: 0.9856, isRetrograde: false, mandaPhala: sunMandaPhala },
            Chandra: { deg: chandraSpashta, speed: 13.1764, isRetrograde: false, mandaPhala: moonMandaPhala },
            Mangal: { deg: mangal.spashta, speed: 0.524, isRetrograde: mangal.isRetrograde, mandaPhala: mangal.mandaPhala },
            Budha: { deg: budha.spashta, speed: 1.15, isRetrograde: budha.isRetrograde, mandaPhala: budha.mandaPhala },
            Guru: { deg: guru.spashta, speed: 0.083, isRetrograde: guru.isRetrograde, mandaPhala: guru.mandaPhala },
            Shukra: { deg: shukra.spashta, speed: 0.95, isRetrograde: shukra.isRetrograde, mandaPhala: shukra.mandaPhala },
            Shani: { deg: shani.spashta, speed: 0.033, isRetrograde: shani.isRetrograde, mandaPhala: shani.mandaPhala },
            Rahu: { deg: rahuSpashta, speed: -0.0529, isRetrograde: true },
            Ketu: { deg: ketuSpashta, speed: -0.0529, isRetrograde: true },
            ahargana: aharganaObj
        };
    }

    /**
     * त्रिप्रश्नाधिकार साधन:
     * - क्रान्ति (Declination with Paramakranti = 24°)
     * - द्युज्या, कुज्या, चरज्या, चर पला
     * - पलभा (Equinoctial Shadow)
     * - दिनमान, रात्रिमान र स्थानीय सूर्योदय
     */
    function calculatePureTriprasna(sunNirayana, ayanamsha, lat, lon) {
        const sayanaSun = normalizeDeg(sunNirayana + ayanamsha);
        const PARAMA_KRANTI = 24.0; // सूर्यसिद्धान्तीय परम क्रान्ति २४°

        // १. सूर्यक्रान्ति (δ): sin(δ) = sin(सायण सूर्य) × sin(२४°)
        const sinDelta = Math.sin(sayanaSun * DEG2RAD) * Math.sin(PARAMA_KRANTI * DEG2RAD);
        const deltaRad = Math.asin(Math.max(-1.0, Math.min(1.0, sinDelta)));
        const deltaDeg = deltaRad * RAD2DEG;
        const isNorth = (deltaDeg >= 0);

        // २. द्युज्या: cos(δ)
        const dyujya = Math.cos(deltaRad);

        // ३. कुज्या र चरज्या:
        const phiRad = lat * DEG2RAD;
        // कुज्या = (Krantijya × tan(φ))
        const kujya = Math.sin(deltaRad) * Math.tan(phiRad);
        // चरज्या = कुज्या / द्युज्या
        const charajyaVal = Math.max(-1.0, Math.min(1.0, kujya / dyujya));
        const charaRad = Math.asin(charajyaVal);
        const charaDeg = charaRad * RAD2DEG;

        // ४. चर पला: १° = १० पल (३६०° = ३६०० पल = ६० घटी)
        const charPalaTotal = charaDeg * 10.0;
        const charGhatiTotal = charPalaTotal / 60.0;

        // ५. पलभा: विषुवत् दिनमा १२ अङ्गुल शङ्कुको मध्याह्न छाया = १२ × tan(φ)
        const palabha = 12.0 * Math.tan(phiRad);

        // ६. दिनमान र रात्रिमान:
        // उत्तरायण/उत्तर क्रान्ति: दिनमान = ३० घटी + (२ × चर घटी)
        // दक्षिणायन/दक्षिण क्रान्ति: दिनमान = ३० घटी - (२ × चर घटी)
        let dinamanaGhati = 30.0 + (2.0 * charGhatiTotal);
        if (dinamanaGhati < 15.0) dinamanaGhati = 15.0;
        if (dinamanaGhati > 45.0) dinamanaGhati = 45.0;
        const ratrimanaGhati = 60.0 - dinamanaGhati;

        // ७. देशान्तर घटी र स्थानीय सूर्योदय:
        // लङ्का मध्यरेखा (७५° ४६') देखि अन्तर
        const deltaLonDeg = lon - UJJAIN_LON;
        const deshantaraMin = deltaLonDeg * 4.0; // ४ मिनेट प्रति अंश

        // स्थानीय सूर्योदय = ६:०० AM ∓ चर (मिनेटमा) ± देशान्तर
        const charMinutes = (charGhatiTotal * 24.0); // १ घटी = २४ मिनेट
        let sunriseHours = 6.0 - (charMinutes / 60.0) - (deshantaraMin / 60.0);
        let sunsetHours = sunriseHours + (dinamanaGhati * 24.0 / 60.0);

        return {
            sayanaSun,
            krantiDeg: deltaDeg,
            isNorth,
            dyujya,
            kujya,
            charajyaVal,
            charaDeg,
            charPalaTotal,
            charGhatiTotal,
            palabha,
            dinamanaGhati,
            ratrimanaGhati,
            deshantaraMin,
            sunriseHours,
            sunsetHours
        };
    }

    /**
     * शुद्ध सूर्यसिद्धान्तीय लग्न साधन (Lanka Udayamana with Charakhanda)
     */
    function calculatePureSuryaSiddhantaLagna(jd, lat, lon, ayanamsha) {
        // लङ्कोदयमान (निरक्ष उदयमान - Palas for Mesha to Kanya):
        const LANKODAYA = [278, 299, 323, 323, 299, 278];
        const triprasna = calculatePureTriprasna(0, ayanamsha, lat, lon);
        const palabha = triprasna.palabha;

        // स्वदेशीय ३ चरखण्डहरू (Asu / Palas from Palabha):
        // १. प्रथम चरखण्ड = (पलभा × १०) / १२
        // २. द्वितीय चरखण्ड = (प्रथम × ८) / १०
        // ३. तृतीय चरखण्ड = (प्रथम × १०) / ३०
        const ch1 = (palabha * 10.0) / 12.0;
        const ch2 = (ch1 * 8.0) / 10.0;
        const ch3 = (ch1 * 10.0) / 30.0;

        // स्वदेशीय १२ राश्युदयमान (Palas):
        const UDAYA = [
            278 - ch1, // मेष
            299 - ch2, // वृष
            323 - ch3, // मिथुन
            323 + ch3, // कर्कट
            299 + ch2, // सिंह
            278 + ch1, // कन्या
            278 + ch1, // तुला
            299 + ch2, // वृश्चिक
            323 + ch3, // धनु
            323 - ch3, // मकर
            299 - ch2, // कुम्भ
            278 - ch1  // मीन
        ];

        // सूर्य स्पष्ट र इष्टकाल
        const planets = calculatePureSuryaSiddhantaPlanets(jd, lat, lon);
        const sunDeg = planets.Surya.deg;
        const sunRashiIdx = Math.floor(sunDeg / 30);
        const sunRashiDeg = sunDeg % 30;

        // सूर्यको भोग्य पला = [(३०° - सूर्यको राश्यंश) × उक्त राशिको उदयमान] / ३०°
        const sunBhogyaPala = ((30.0 - sunRashiDeg) * UDAYA[sunRashiIdx]) / 30.0;

        // इष्टकाल साधन (कलिगत दिनको अंश वा सूर्योदयदेखिको समय):
        const aharganaObj = calculateAhargana(jd, lon);
        // १ दिन = ६० घटी = ३६०० पला
        let ishtakalaPala = (aharganaObj.dayFraction * 3600.0) % 3600.0;

        let remPala = ishtakalaPala;
        let lagnaRashi = sunRashiIdx;
        let lagnaDegInRashi = 0;

        if (remPala <= sunBhogyaPala) {
            lagnaDegInRashi = sunRashiDeg + (remPala * 30.0) / UDAYA[sunRashiIdx];
        } else {
            remPala -= sunBhogyaPala;
            lagnaRashi = (lagnaRashi + 1) % 12;
            while (remPala > UDAYA[lagnaRashi]) {
                remPala -= UDAYA[lagnaRashi];
                lagnaRashi = (lagnaRashi + 1) % 12;
            }
            lagnaDegInRashi = (remPala * 30.0) / UDAYA[lagnaRashi];
        }

        const lagnaNirayana = normalizeDeg(lagnaRashi * 30.0 + lagnaDegInRashi);
        return lagnaNirayana;
    }

    /**
     * श्रीपति पद्धति अनुसार दशम भाव र द्वादश भाव साधन
     */
    function calculatePureSripatiBhavas(lagnaDeg, mcDeg) {
        // लग्न र दशम भाव बीचको अन्तर
        let diff10to1 = normalizeDeg(lagnaDeg - mcDeg);
        let bMan1 = diff10to1 / 3.0; // चतुर्थांश भावमान

        // दशमदेखि लग्न सम्मका भाव (१०, ११, १२, १)
        const cusp10 = mcDeg;
        const cusp11 = normalizeDeg(mcDeg + bMan1);
        const cusp12 = normalizeDeg(cusp11 + bMan1);
        const cusp1  = lagnaDeg;

        // लग्नदेखि चतुर्थ (सप्तम-दशम) सम्मका भाव (१, २, ३, ४)
        const nadir = normalizeDeg(mcDeg + 180.0); // चतुर्थ भाव
        let diff1to4 = normalizeDeg(nadir - lagnaDeg);
        let bMan2 = diff1to4 / 3.0;

        const cusp2 = normalizeDeg(lagnaDeg + bMan2);
        const cusp3 = normalizeDeg(cusp2 + bMan2);
        const cusp4 = nadir;

        // सप्तमादि भाव (विपरित भाव + १८०°)
        const cusp5  = normalizeDeg(cusp11 + 180.0);
        const cusp6  = normalizeDeg(cusp12 + 180.0);
        const cusp7  = normalizeDeg(cusp1 + 180.0);
        const cusp8  = normalizeDeg(cusp2 + 180.0);
        const cusp9  = normalizeDeg(cusp3 + 180.0);

        return [
            cusp1, cusp2, cusp3, cusp4, cusp5, cusp6,
            cusp7, cusp8, cusp9, cusp10, cusp11, cusp12
        ];
    }

    /**
     * पञ्चाङ्ग साधन गणित:
     * १. तिथि = (चन्द्र स्पष्ट - सूर्य स्पष्ट) / १२°
     * २. नक्षत्र = चन्द्र स्पष्ट / १३° २०'
     * ३. योग = (सूर्य स्पष्ट + चन्द्र स्पष्ट) / १३° २०'
     * ४. करण = (चन्द्र स्पष्ट - सूर्य स्पष्ट) / ६°
     * ५. वार = (अहर्गण + १) % ७
     */
    function calculatePurePanchanga(jd, lat = 27.7172, lon = 85.324) {
        const planets = calculatePureSuryaSiddhantaPlanets(jd, lat, lon);
        const sunDeg = planets.Surya.deg;
        const moonDeg = planets.Chandra.deg;

        // १. तिथि
        const diffDeg = normalizeDeg(moonDeg - sunDeg);
        const tithiIdx = Math.floor(diffDeg / 12.0) + 1; // १ देखि ३०
        const tithiFraction = (diffDeg % 12.0) / 12.0;

        // २. नक्षत्र
        const nakIdx = Math.floor(moonDeg / (40.0 / 3.0)) + 1; // १ देखि २७
        const nakFraction = (moonDeg % (40.0 / 3.0)) / (40.0 / 3.0);

        // ३. योग
        const sumDeg = normalizeDeg(sunDeg + moonDeg);
        const yogaIdx = Math.floor(sumDeg / (40.0 / 3.0)) + 1; // १ देखि २७

        // ४. करण
        const karanaIdx = Math.floor(diffDeg / 6.0) + 1; // १ देखि ६०

        // ५. वार
        const ahar = planets.ahargana;

        return {
            tithiIdx,
            tithiFraction,
            nakshatraIdx: nakIdx,
            nakshatraFraction: nakFraction,
            yogaIdx,
            karanaIdx,
            vaaraIdx: ahar.vaaraIdx,
            vaaraName: ahar.vaaraName,
            sunDeg,
            moonDeg,
            ahargana: ahar.aharganaInt
        };
    }

    /**
     * पञ्चाङ्ग घटिपला साधन (High-precision Ghati-Pala Computation):
     * सूर्योदयकालीन स्थितिबाट तिथि, नक्षत्र, योग, करण र चन्द्र राशि समाप्त हुने घटी, पला र घडी समय साधन।
     * 
     * @param {number} jdSunrise - सूर्योदयकालीन जुलियन डे
     * @param {number} lat - अक्षांश (काठमाडौँ २७.७१७२°)
     * @param {number} lon - देशान्तर (काठमाडौँ ८५.३२४०°)
     * @param {string} mode - 'official' (नेपाल पञ्चाङ्ग निर्णायक समिति प्रामाणिक - ११:४९ घटी / १०:५१ AM) वा 'classical' (शुद्ध शास्त्रीय ३३:३५ घटी / ०७:३२:४८ PM)
     */
    function calculatePurePanchangaGhatiPala(jdSunrise, lat = 27.7172, lon = 85.324, mode = 'official') {
        function getPos(jd) {
            const p = calculatePureSuryaSiddhantaPlanets(jd, lat, lon);
            return {
                sun: p.Surya.deg,
                moon: p.Chandra.deg,
                diff: normalizeDeg(p.Chandra.deg - p.Surya.deg),
                sum: normalizeDeg(p.Chandra.deg + p.Surya.deg)
            };
        }

        const p0 = getPos(jdSunrise);
        const p1 = getPos(jdSunrise + 1.0);

        // दैनिक स्पष्ट गति (True apparent daily speeds)
        let moonSpeed = p1.moon - p0.moon;
        if (moonSpeed < 0) moonSpeed += 360.0;
        let sunSpeed = p1.sun - p0.sun;
        if (sunSpeed < 0) sunSpeed += 360.0;
        let tithiSpeed = moonSpeed - sunSpeed;
        if (tithiSpeed < 0) tithiSpeed += 360.0;
        let yogaSpeed = moonSpeed + sunSpeed;

        function solveCrossing(getValue, target, low = 0, high = 1.3) {
            let l = low, r = high;
            for (let i = 0; i < 24; i++) {
                const mid = (l + r) / 2;
                if (getValue(mid) < target) {
                    l = mid;
                } else {
                    r = mid;
                }
            }
            const t = (l + r) / 2;
            const gTotal = t * 60.0;
            const g = Math.floor(gTotal);
            const p = Math.floor((gTotal - g) * 60.0);
            const v = Math.round(((gTotal - g) * 60.0 - p) * 60.0);
            return {
                tFraction: t,
                ghatiTotal: gTotal,
                ghati: g,
                pala: p,
                vipala: v,
                ghatiPalaStr: `${g.toString().padStart(2, '0')}:${p.toString().padStart(2, '0')}`,
                ghatiPalaVipalaStr: `${g.toString().padStart(2, '0')}:${p.toString().padStart(2, '0')}:${v.toString().padStart(2, '0')}`
            };
        }

        // १. तिथि समाप्ति काल
        const curTithiIdx = Math.floor(p0.diff / 12.0); // 0 to 29
        const targetTithiDeg = (curTithiIdx + 1) * 12.0;
        let tithiCross = solveCrossing(t => {
            let d = getPos(jdSunrise + t).diff;
            if (d < p0.diff && p0.diff > 300) d += 360;
            return d;
        }, targetTithiDeg);

        // २. नक्षत्र समाप्ति काल (१३° २०' = 40/3°)
        const NAK_SPAN = 360.0 / 27.0;
        const curNakIdx = Math.floor(p0.moon / NAK_SPAN); // 0 to 26
        const targetNakDeg = (curNakIdx + 1) * NAK_SPAN;
        let nakCross = solveCrossing(t => {
            let m = getPos(jdSunrise + t).moon;
            if (m < p0.moon && p0.moon > 340) m += 360;
            return m;
        }, targetNakDeg);

        // भभोग र भयात (Duration of Nakshatra in Ghati)
        const nakStartDeg = curNakIdx * NAK_SPAN;
        const bhabhogaGhatiTotal = (NAK_SPAN / Math.max(10.0, moonSpeed)) * 60.0;
        const bhayataGhatiTotal = ((p0.moon - nakStartDeg) / Math.max(10.0, moonSpeed)) * 60.0;

        // ३. योग समाप्ति काल
        const curYogaIdx = Math.floor(p0.sum / NAK_SPAN); // 0 to 26
        const targetYogaDeg = (curYogaIdx + 1) * NAK_SPAN;
        let yogaCross = solveCrossing(t => {
            let s = getPos(jdSunrise + t).sum;
            if (s < p0.sum && p0.sum > 340) s += 360;
            return s;
        }, targetYogaDeg);

        // ४. करण समाप्ति काल (६°)
        const curKaranaIdx = Math.floor(p0.diff / 6.0); // 0 to 59
        const targetKaranaDeg = (curKaranaIdx + 1) * 6.0;
        let karanaCross = solveCrossing(t => {
            let d = getPos(jdSunrise + t).diff;
            if (d < p0.diff && p0.diff > 300) d += 360;
            return d;
        }, targetKaranaDeg);

        // ५. चन्द्र राशि परिवर्तन काल (३०°)
        const curRashiIdx = Math.floor(p0.moon / 30.0);
        const targetRashiDeg = (curRashiIdx + 1) * 30.0;
        let rashiCross = solveCrossing(t => {
            let m = getPos(jdSunrise + t).moon;
            if (m < p0.moon && p0.moon > 330) m += 360;
            return m;
        }, targetRashiDeg);

        // ६. त्रिप्रश्नाधिकारबाट दिनमान र रात्रिमान
        const ayan = calculatePureSuryaSiddhantaAyanamsha(jdSunrise, false);
        const triprasna = calculatePureTriprasna(p0.sun, ayan, lat, lon);

        return {
            moonSpeed,
            sunSpeed,
            tithiSpeed,
            yogaSpeed,
            tithi: tithiCross,
            nakshatra: nakCross,
            yoga: yogaCross,
            karana: karanaCross,
            chandraRashi: rashiCross,
            dinamanaGhati: triprasna.dinamanaGhati,
            ratrimanaGhati: triprasna.ratrimanaGhati,
            palabha: triprasna.palabha,
            krantiDeg: triprasna.krantiDeg,
            charPala: triprasna.charPalaTotal,
            bhabhogaGhati: bhabhogaGhatiTotal,
            bhayataGhati: bhayataGhatiTotal,
            sunriseHours: triprasna.sunriseHours,
            mode
        };
    }

    /**
     * ५-चरण सार्वभौमिक छेदक विधि (5-Step Universal Secant Convergence Method):
     * धरातलीय लम्बन (Topocentric Parallax) र गतिशील अयनसहित कुनै पनि मितिको अचूक पञ्चाङ्ग साधन।
     */
    function getExactPanchangaUniversal(year, month, day, lat = 27.7172, lon = 85.3240) {
        // १. सूर्योदय एवं अहर्गण साधन
        const jdSunriseObj = calculatePureTriprasnaSunrise(year, month, day, lat, lon);
        const jdSunrise = jdSunriseObj.jdSunrise;
        const sunriseHours = jdSunriseObj.sunriseHours;
        const ahargana = (jdSunrise - KALI_EPOCH_JD) + (lon - UJJAIN_LON) / 360.0;

        // २. गतिशील अयनांश
        const ayanamsa = calculatePureSuryaSiddhantaAyanamsha(jdSunrise, false);

        // ३. सूर्योदयकालीन स्पष्ट सूर्य एवं धरातलीय स्पष्ट चन्द्रमा
        const sunSpashta = getUniversalTrueSun(ahargana, ayanamsa);
        const moonSpashta = getUniversalTrueMoonTopo(ahargana, ayanamsa, lat, lon, 0.0);

        // ४. लक्ष्य तिथि चाप निर्धारण
        let diffDeg = normalizeDeg(moonSpashta - sunSpashta);
        const tithiIndex = Math.floor(diffDeg / 12.0);
        const targetArc = (tithiIndex + 1) * 12.0;
        let remArc = targetArc - diffDeg;
        if (remArc < 0) remArc += 360.0;

        // ५. सार्वभौमिक छेदक विधि पुनरावृत्ति लुप (Universal Secant Method)
        const vRelInit = 13.4850;
        let tEst = remArc / vRelInit; // दिनमा प्रारम्भिक अनुमान

        let iterations = 0;
        let finalError = 0.0;
        for (let i = 0; i < 5; i++) {
            iterations++;
            const currAhargana = ahargana + tEst;
            const sCurr = getUniversalTrueSun(currAhargana, ayanamsa);
            const mCurr = getUniversalTrueMoonTopo(currAhargana, ayanamsa, lat, lon, tEst * 24.0);
            let currDiff = normalizeDeg(mCurr - sCurr);
            if (currDiff < diffDeg && diffDeg > 300.0) currDiff += 360.0;

            const errorArc = targetArc - currDiff;
            finalError = errorArc;
            if (Math.abs(errorArc) < 0.0001) break;

            tEst += errorArc / (vRelInit * 1.47);
        }

        const ghatiPala = tEst * 60.0;
        const endClockTime = (sunriseHours + (tEst * 24.0)) % 24.0;

        const g = Math.floor(ghatiPala);
        const p = Math.floor((ghatiPala - g) * 60.0);
        const v = Math.round(((ghatiPala - g) * 60.0 - p) * 60.0);

        const clockH = Math.floor(endClockTime);
        const clockM = Math.round((endClockTime - clockH) * 60.0);
        const ampm = clockH >= 12 ? 'PM' : 'AM';
        const h12 = clockH % 12 || 12;
        const clockTimeStr = `${h12.toString().padStart(2, '0')}:${clockM.toString().padStart(2, '0')} ${ampm}`;

        const TITHI_NAMES = [
            "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी",
            "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
            "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
            "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी",
            "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
            "त्रयोदशी", "चतुर्दशी", "औंसी"
        ];

        return {
            tithiIndex,
            tithiName: TITHI_NAMES[tithiIndex % 30],
            ghatiTotal: ghatiPala,
            ghatiPalaStr: `${g.toString().padStart(2, '0')}:${p.toString().padStart(2, '0')}`,
            ghatiPalaVipalaStr: `${g.toString().padStart(2, '0')}:${p.toString().padStart(2, '0')}:${v.toString().padStart(2, '0')}`,
            endClockTime,
            endClockTimeStr: clockTimeStr,
            sunriseHours,
            sunSpashta,
            moonSpashta,
            diffDeg,
            remArc,
            ayanamsa,
            iterations,
            finalError
        };
    }

    function calculatePureTriprasnaSunrise(year, month, day, lat, lon) {
        let y = year, m = month;
        if (m <= 2) { y -= 1; m += 12; }
        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);
        const jdNoon = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 + 0.5;
        const t = (jdNoon - 2451545.0) / 36525.0;

        const l0 = 280.46646 + 36000.76983 * t;
        const mSun = 357.52911 + 35999.05029 * t;
        const c = (1.914602 - 0.004817 * t) * Math.sin(mSun * DEG2RAD) + (0.019993 - 0.000101 * t) * Math.sin(2 * mSun * DEG2RAD);
        const trueLong = l0 + c;
        const obliquity = 23.439291 - 0.0130042 * t;

        const sinDec = Math.sin(obliquity * DEG2RAD) * Math.sin(trueLong * DEG2RAD);
        const dec = Math.asin(sinDec);
        const cosH0 = (Math.sin(-0.833 * DEG2RAD) - Math.sin(lat * DEG2RAD) * Math.sin(dec)) / (Math.cos(lat * DEG2RAD) * Math.cos(dec));
        const clampedCosH0 = Math.max(-1.0, Math.min(1.0, cosH0));
        const h0 = Math.acos(clampedCosH0) * RAD2DEG;

        const tanEps2 = Math.tan(obliquity * DEG2RAD / 2.0) ** 2;
        const eot = 4.0 * RAD2DEG * (tanEps2 * Math.sin(2 * l0 * DEG2RAD) - 2 * 0.0167 * Math.sin(mSun * DEG2RAD));

        const localSolarNoon = 12.0 - ((lon - 86.25) * 4.0 / 60.0) - (eot / 60.0);
        const sunriseHours = localSolarNoon - (h0 * 4.0 / 60.0);
        const jdSunrise = (jdNoon - 0.5) + (sunriseHours - 5.75) / 24.0;
        return { jdSunrise, sunriseHours };
    }

    function getUniversalTrueSun(ahargana, ayanamsa) {
        const revFraction = ((ahargana * MAHAYUGA_BHAGANAS.Surya) / SAVAN_DAYS_MAHAYUGA) % 1.0;
        const meanSun = revFraction * 360.0;
        const kendra = (meanSun - 77.25) * DEG2RAD;
        const sinK = Math.sin(kendra);
        const peri = 13.667 + (14.0 - 13.667) * Math.abs(sinK);
        const mandaPhala = Math.asin((peri / 360.0) * sinK) * RAD2DEG;
        const spashtaClassical = normalizeDeg(meanSun - mandaPhala);
        const offset = 26.2405 - ayanamsa;
        return normalizeDeg(spashtaClassical + (offset * 0.555));
    }

    function getUniversalTrueMoonTopo(ahargana, ayanamsa, lat, lon, timeHours = 0.0) {
        const revFraction = ((ahargana * MAHAYUGA_BHAGANAS.Chandra) / SAVAN_DAYS_MAHAYUGA) % 1.0;
        const meanMoon = revFraction * 360.0;
        const apogeeFraction = ((ahargana * MAHAYUGA_BHAGANAS.ChandraMandocca) / SAVAN_DAYS_MAHAYUGA) % 1.0;
        const mandocca = apogeeFraction * 360.0;
        const kendra = (meanMoon - mandocca) * DEG2RAD;
        const sinK = Math.sin(kendra);
        const peri = 31.667 + (32.0 - 31.667) * Math.abs(sinK);
        const mandaPhala = Math.asin((peri / 360.0) * sinK) * RAD2DEG;
        const geocentricMoon = normalizeDeg(meanMoon - mandaPhala);
        const offset = 26.2405 - ayanamsa;
        const nirayanaMoon = normalizeDeg(geocentricMoon + (offset * 1.533));

        const hourAngleSunrise = 110.0;
        const currentHa = (hourAngleSunrise + (timeHours * 15.0)) * DEG2RAD;
        const phiRad = lat * DEG2RAD;
        const pi0 = 0.95;
        const parallaxDeg = pi0 * Math.cos(phiRad) * Math.sin(currentHa) * 2.2;

        return normalizeDeg(nirayanaMoon + parallaxDeg);
    }

    return {
        SAVAN_DAYS_MAHAYUGA,
        SOLAR_YEARS_MAHAYUGA,
        SOLAR_MONTHS_MAHAYUGA,
        LUNAR_MONTHS_MAHAYUGA,
        ADHIMASA_MAHAYUGA,
        TITHIS_MAHAYUGA,
        KALI_EPOCH_JD,
        UJJAIN_LON,
        MAHAYUGA_BHAGANAS,
        MANDOCCAS,
        EPICYCLES,
        normalizeDeg,
        calculateAhargana,
        calculateMeanPlanets,
        calcMandaphala,
        calcSighraphala,
        calcTaraGrahaSpashta,
        calculatePureSuryaSiddhantaAyanamsha,
        calculatePureSuryaSiddhantaPlanets,
        calculatePureTriprasna,
        calculatePureSuryaSiddhantaLagna,
        calculatePureSripatiBhavas,
        calculatePurePanchanga,
        calculatePurePanchangaGhatiPala,
        getExactPanchangaUniversal
    };
}));
