/**
 * full_report.js - पूर्ण वैदिक जन्मपत्रिका प्रतिवेदन तथा A4 PDF प्रणाली
 * Full Vedic Janmapatrika Multi-Page Report & PDF Export System
 * Vedashchakshu - Kundali Darsan Web
 */

(function () {
    'use strict';

    /**
     * अङ्कहरूलाई नेपाली देवनागरी अङ्कमा रूपान्तरण गर्छ
     */
    function toNepaliDigits(val) {
        if (typeof window !== "undefined" && typeof window.toNepaliDigits === "function" && window.toNepaliDigits !== toNepaliDigits) {
            return window.toNepaliDigits(val);
        }
        if (val === undefined || val === null) return "";
        const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return String(val).replace(/[0-9]/g, d => nepaliDigits[Number(d)]);
    }

    const AD_MONTH_NAMES_NP = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्त", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];
    const LOCAL_SAMVATSARAS = [
        "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव", "युवा", "धाता",
        "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु", "सुभानु", "तारण", "पार्थिव", "व्यय",
        "सर्वजित्", "सर्वधारी", "विरोधी", "विकृत", "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख",
        "हेमलम्ब", "विलम्ब", "विकारी", "शार्वरी", "प्लव", "शुभकृत", "शोभन", "क्रोधी", "विश्वावसु", "पराभव",
        "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत", "परिधावी", "प्रमादी", "आनन्द", "राक्षस", "नल",
        "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभि", "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय"
    ];
    const LOCAL_VAARA_NAMES = ["सूर्य", "सोम", "भौम", "बुध", "गुरु", "भृगु", "शनि"];

    // ==========================================
    // १. प्रिती फन्टबाट देवनागरी युनिकोड रूपान्तरण
    // (Preeti to Devanagari Unicode Converter)
    // Ensures classical Sanskrit shlokas render in pure Unicode
    // ==========================================
    function convertPreetiToUnicode(str) {
        if (!str || typeof str !== 'string') return '';
        // यदि पहिले नै देवनागरी युनिकोड छ भने जस्ताको तस्तै फर्काउने
        if (/[\u0900-\u097F]/.test(str)) {
            return str;
        }

        let s = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // 1. Classical Sanskrit & Nepali Preeti ligatures
        const ligatures = [
            ['..', '॥'],
            ['.', '।'],
            ['–', '-'],
            ['—', '-'],
            ['˜', 'ऽ'],
            ['nUg]z]', 'लग्नेशे'],
            ['nUgu]', 'लग्नगे'],
            ['x[i6–k\'i6fË·', 'हृष्ट-पुष्टाङ्गः'],
            ['x[i6', 'हृष्ट'],
            ['k\'i6', 'पुष्ट'],
            ['qm', 'क्र'],
            ['qm]', 'क्रो'],
            ['If', 'क्ष'],
            ['q', 'त्र'],
            ['1', 'ज्ञ'],
            ['km', 'फ'],
            ['km\\', 'फ्'],
            ['k\\', 'फ्'],
            ['k\'', 'पु'],
            ['k"', 'पू'],
            ['v\\', 'ख्'],
            ['u\\', 'ग्'],
            ['3\\', 'घ्'],
            ['r\\', 'च्'],
            ['h\\', 'ज्'],
            ['t\\', 'त्'],
            ['y\\', 'थ्'],
            ['b\\', 'द्'],
            ['w\\', 'ध्'],
            ['g\\', 'न्'],
            ['a\\', 'ब्'],
            ['e\\', 'भ्'],
            ['d\\', 'म्'],
            ['o\\', 'य्'],
            ['n\\', 'ल्'],
            ['j\\', 'व्'],
            ['z\\', 'श्'],
            [';\\', 'स्'],
            ['x\\', 'ह्'],
            ['lå', 'द्वि'],
            ['å', 'द्व'],
            ['l;+', 'सिंह्'],
            [';+', 'सं'],
            ['x[', 'हृ'],
            ['i0', 'ष्ण'],
            ['i6', 'ष्ट'],
            ['i7', 'ष्ठ'],
            ['eQ', 'भक्त'],
            ['fË·', 'ाङ्गः'],
            ['fË', 'ाङ्ग'],
            ['Ë', 'ङ्ग'],
            ['ª', 'ङ'],
            ['cf\]', 'ओ'],
            ['cf\}', 'औ'],
            ['cf', 'आ'],
            ['c', 'अ'],
            ['O\{', 'ई'],
            ['O', 'इ'],
            ['p', 'उ'],
            ['P\]', 'ऐ'],
            ['P', 'ए'],
            ['f\]', 'ो'],
            ['f\}', 'ौ'],
            ['f', 'ा'],
            ['L', 'ी'],
            ['\'', 'ु'],
            ['"', 'ू'],
            ['[', 'ृ'],
            [']', 'े'],
            ['}', 'ै'],
            ['+', 'ं'],
            ['F', 'ँ'],
            ['M', 'ः'],
            ['\\\\', '्'],
            ['\\', '्']
        ];

        for (const [p, u] of ligatures) {
            s = s.split(p).join(u);
        }

        // 2. Base consonants and shift variants
        const chars = {
            's': 'क', 'S': 'क्',
            'v': 'ख', 'V': 'ख्',
            'u': 'ग', 'U': 'ग्',
            '3': 'घ',
            'r': 'च', 'R': 'च्',
            '5': 'छ',
            'h': 'ज', 'H': 'ज्',
            '~': 'ञ',
            '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण',
            't': 'त', 'T': 'त्',
            'y': 'थ', 'Y': 'थ्',
            'b': 'द', 'B': 'द्',
            'w': 'ध', 'W': 'ध्',
            'g': 'न', 'G': 'न्',
            'k': 'प', 'K': 'प्',
            'a': 'ब', 'A': 'ब्',
            'e': 'भ', 'E': 'भ्',
            'd': 'म', 'D': 'म्',
            'o': 'य',
            '/': 'र', '?': 'रु',
            'n': 'ल', 'N': 'ल्',
            'j': 'व', 'J': 'व्',
            'z': 'श', 'Z': 'श्',
            'i': 'ष',
            ';': 'स', ':': 'स्',
            'x': 'ह', 'X': 'ह्',
            '·': 'न्', '`': 'न्',
            'm': '्र'
        };

        let res = '';
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            if (chars[c]) {
                res += chars[c];
            } else {
                res += c;
            }
        }

        // 3. Post-process: Hraswa Ikara 'l' precedes consonant in Preeti, e.g. 'l' + consonant -> consonant + 'ि'
        res = res.replace(/l([\u0900-\u097F](?:्[\u0900-\u097F])?)/g, '$1ि');

        // 4. Post-process: Reph '{' in Preeti comes after consonant, e.g. 'य{' -> 'र्य'
        res = res.replace(/([\u0900-\u097F](?:्[\u0900-\u097F])?)\{/g, 'र्$1');

        return res;
    }

    // ==========================================
    // २. कन्फिगरेसन तथा स्टेट व्यवस्थापन
    // (Configuration & State Management)
    // ==========================================
    const fullReportConfig = {
        lang: 'ne', // 'ne' | 'sa-ne' | 'en'
        chartsLayout: '6perpage', // '6perpage' | '4perpage' | '2perpage' | '1perpage'
        astrologerName: (typeof localStorage !== 'undefined' && localStorage.getItem('vedashchakshu_astrologer_name')) || 'पं. ज्योतिषाचार्य',
        dashaScope: 'full', // 'full' | 'current'
        charts: {
            d1: true,
            d2: true,
            d3: true,
            d4: true,
            d7: true,
            d9: true,
            d10: true,
            d12: true,
            d16: true,
            d20: true,
            d24: true,
            d27: true,
            d30: true,
            d40: true,
            d45: true,
            d60: true
        },
        sections: {
            cover: true,
            grahaSpashta: true,
            panchadhaMaitri: true,
            charts: true,
            vimshottariDasha: true,
            tribhagiDasha: true,
            yoginiDasha: true,
            dashaPhaladesh: true,
            shlokasPhaladesh: true,
            bhavaPhaladesh: true,
            yogasAndDoshas: true,
            remedies: true
        }
    };

    let reportZoomLevel = 1.0;
    let isFullReportPrinting = false;

    // ==========================================
    // ३. षोडशवर्ग कुण्डलीहरूको शास्त्रीय विवरण पञ्जिका
    // (All 16 Shodasha Varga + Chandra Registry)
    // ==========================================
    const SHODASHA_VARGA_REGISTRY = [
        {
            id: 'd1',
            vargaNum: 'D1',
            nameNp: 'लग्न कुण्डली (D1)',
            subTitle: 'तनु चक्र',
            desc: 'शरीर, स्वास्थ्य, स्वरूप, आयु, स्वभाव तथा समग्र जीवन आधार',
            getLagna: (d) => (d.lagnaRashi ? d.lagnaRashi.rashiId : 1),
            getPlanets: (d) => getVargaPlanetList(d, null)
        },
        {
            id: 'd2',
            vargaNum: 'D2',
            nameNp: 'होरा कुण्डली (D2)',
            subTitle: 'धन चक्र',
            desc: 'सम्पत्ति, धन-धान्य, ऐश्वर्य, आर्थिक कोष तथा पैतृक सम्पन्नता',
            getLagna: (d) => (d.horaLagna ? d.horaLagna.id : 5),
            getPlanets: (d) => getVargaPlanetList(d, d.horaPlanets)
        },
        {
            id: 'd3',
            vargaNum: 'D3',
            nameNp: 'द्रेष्काण कुण्डली (D3)',
            subTitle: 'पराक्रम चक्र',
            desc: 'भ्रातृ-भगिनी, पराक्रम, साहस, ऊर्जा, शौर्य तथा उद्यमशीलता',
            getLagna: (d) => (d.drekkanaLagna ? d.drekkanaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.drekkanaPlanets)
        },
        {
            id: 'd4',
            vargaNum: 'D4',
            nameNp: 'चतुर्थांश कुण्डली (D4)',
            subTitle: 'सम्पत्ति चक्र',
            desc: 'अचल सम्पत्ति, घर, जग्गाजमिन, भवन सुख तथा सवारी साधन',
            getLagna: (d) => (d.chaturthamshaLagna ? d.chaturthamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.chaturthamshaPlanets)
        },
        {
            id: 'd7',
            vargaNum: 'D7',
            nameNp: 'सप्तमांश कुण्डली (D7)',
            subTitle: 'सन्तति चक्र',
            desc: 'सन्तान सुख, सन्तति, नाति-नातिना, वंश विस्तार तथा पारिवारिक निरन्तरता',
            getLagna: (d) => (d.saptamamshaLagna ? d.saptamamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.saptamamshaPlanets)
        },

        {
            id: 'd9',
            vargaNum: 'D9',
            nameNp: 'नवमांश कुण्डली (D9)',
            subTitle: 'धर्म / भाग्य चक्र',
            desc: 'भाग्य, धर्म, दाम्पत्य जीवन, जीवनसाथी, स्वभाव तथा सूक्ष्म ग्रहबल',
            getLagna: (d) => (d.navamshaLagna ? d.navamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.navamshaPlanets)
        },
        {
            id: 'd10',
            vargaNum: 'D10',
            nameNp: 'दशमांश कुण्डली (D10)',
            subTitle: 'कर्म चक्र',
            desc: 'कर्म, पेशा, व्यवसाय, पद-प्रतिष्ठा, राज्यसम्मान, सफलता र ख्याति',
            getLagna: (d) => (d.dashamshaLagna ? d.dashamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.dashamshaPlanets)
        },

        {
            id: 'd12',
            vargaNum: 'D12',
            nameNp: 'द्वादशांश कुण्डली (D12)',
            subTitle: 'पितृ चक्र',
            desc: 'मातापिता, कुल-परम्परा, पूर्वज, पैतृक संस्कार तथा वंशावली सुख',
            getLagna: (d) => (d.dwadashamshaLagna ? d.dwadashamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.dwadashamshaPlanets)
        },
        {
            id: 'd16',
            vargaNum: 'D16',
            nameNp: 'षोडशांश कुण्डली (D16)',
            subTitle: 'सुख चक्र',
            desc: 'वाहन सुख, विलासिता, आन्तरिक सुख, मानसिक शान्ति तथा शुभ यात्रा',
            getLagna: (d) => (d.shodashamshaLagna ? d.shodashamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.shodashamshaPlanets)
        },
        {
            id: 'd20',
            vargaNum: 'D20',
            nameNp: 'विंशांश कुण्डली (D20)',
            subTitle: 'उपासना चक्र',
            desc: 'उपासना, भक्ति, आध्यात्मिक साधना, मन्त्र सिद्धि, ज्ञान तथा तपोबल',
            getLagna: (d) => (d.vimshamshaLagna ? d.vimshamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.vimshamshaPlanets)
        },
        {
            id: 'd24',
            vargaNum: 'D24',
            nameNp: 'चतुर्विंशांश / सिद्धांश (D24)',
            subTitle: 'विद्या चक्र',
            desc: 'विद्या, उच्च ज्ञान, अध्ययन, बुद्धि, कला, कौशल, शोध तथा प्राज्ञिक ख्याति',
            getLagna: (d) => (d.chaturvimshamshaLagna ? d.chaturvimshamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.chaturvimshamshaPlanets)
        },
        {
            id: 'd27',
            vargaNum: 'D27',
            nameNp: 'सप्तविंशांश / भांश (D27)',
            subTitle: 'बल चक्र',
            desc: 'शारीरिक बल, सामर्थ्य, सहनशीलता, शक्ति तथा दुर्बलता विचार',
            getLagna: (d) => (d.saptavimshamshaLagna ? d.saptavimshamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.saptavimshamshaPlanets)
        },
        {
            id: 'd30',
            vargaNum: 'D30',
            nameNp: 'त्रिंशांश कुण्डली (D30)',
            subTitle: 'अरिष्ट चक्र',
            desc: 'अनिष्ट, संकट, रोग, दुर्घटना, दुर्भाग्य, विपत्ति तथा अरिष्ट विचार',
            getLagna: (d) => (d.trimshamshaLagna ? d.trimshamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.trimshamshaPlanets)
        },
        {
            id: 'd40',
            vargaNum: 'D40',
            nameNp: 'खवेदांश / चत्वारिंशांश (D40)',
            subTitle: 'संस्कार चक्र',
            desc: 'शुभ-अशुभ फल, कुल परम्परा, आनुवंशिक प्रभाव तथा पूर्वजन्मको संस्कार',
            getLagna: (d) => (d.chatvarimshamshaLagna ? d.chatvarimshamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.chatvarimshamshaPlanets)
        },
        {
            id: 'd45',
            vargaNum: 'D45',
            nameNp: 'अक्षवेदांश कुण्डली (D45)',
            subTitle: 'चरित्र चक्र',
            desc: 'चरित्र, नैतिक आचरण, शुद्धाशुद्धता, सद्व्यवहार तथा समग्र सद्गुण',
            getLagna: (d) => (d.akshavedamshaLagna ? d.akshavedamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.akshavedamshaPlanets)
        },
        {
            id: 'd60',
            vargaNum: 'D60',
            nameNp: 'षष्ट्यंश कुण्डली (D60)',
            subTitle: 'प्रारब्ध चक्र',
            desc: 'सूक्ष्म प्रारब्ध, पूर्वजन्मको कर्मफल, सूक्ष्म अंश तथा सर्वाङ्गीण विश्लेषण',
            getLagna: (d) => (d.shashtyamshaLagna ? d.shashtyamshaLagna.id : 1),
            getPlanets: (d) => getVargaPlanetList(d, d.shashtyamshaPlanets)
        }
    ];

    /**
     * कुनै पनि वर्ग चक्रका लागि ग्रहहरूको सूची (Planet List) निकाल्छ
     */
    function getVargaPlanetList(data, vargaMap) {
        const keys = ["Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu"];
        if (!vargaMap) {
            // D1 / Chandra (Direct Rashi ID from deg)
            return keys.map(k => {
                const deg = data.planets && data.planets[k] ? data.planets[k].deg : 0;
                const rashiId = typeof getRashiDetails === "function" ? getRashiDetails(deg).rashiId : (Math.floor(deg / 30) + 1);
                return {
                    name: k,
                    rashiId: rashiId,
                    isRetrograde: (k === "Rahu" || k === "Ketu") ? true : (data.planets[k]?.isRetrograde || false)
                };
            });
        }
        return keys.map(k => ({
            name: k,
            rashiId: vargaMap[k] ? vargaMap[k].id : 1,
            isRetrograde: (k === "Rahu" || k === "Ketu") ? true : (data.planets[k]?.isRetrograde || false)
        }));
    }

    // ==========================================
    // ४. बहु-पृष्ठीय A4 प्रतिवेदन निर्माण इन्जिन
    // (Multi-Page A4 Report Pages Builder)
    // ==========================================
    function buildFullReportPages(data, config) {
        if (!data) return [];

        const pages = [];
        let totalEstimatedPages = 0;

        // १. आवरण पृष्ठ तथा जन्म विवरण (Page 1: Cover & Avakahada)
        if (config.sections.cover) {
            totalEstimatedPages++;
            pages.push({
                type: 'cover',
                html: buildCoverPageHTML(data, config)
            });
        }

        // २. ग्रहस्पष्ट सारिणी एवं प्रधान कुण्डली (Page 2: Graha Spashta & D1/Chandra)
        if (config.sections.grahaSpashta || config.sections.panchadhaMaitri) {
            totalEstimatedPages++;
            pages.push({
                type: 'grahaSpashta',
                html: buildGrahaSpashtaPageHTML(data, config)
            });
        }

        // ३. छानिएका षोडशवर्ग कुण्डली चक्रहरू (Selected Divisional Charts)
        if (config.sections.charts) {
            const selectedChartItems = SHODASHA_VARGA_REGISTRY.filter(item => config.charts[item.id]);
            const chartsPerPage = config.chartsLayout === '6perpage' ? 6 : (config.chartsLayout === '1perpage' ? 1 : (config.chartsLayout === '2perpage' ? 2 : 4));

            for (let i = 0; i < selectedChartItems.length; i += chartsPerPage) {
                totalEstimatedPages++;
                const batch = selectedChartItems.slice(i, i + chartsPerPage);
                pages.push({
                    type: 'charts',
                    html: buildChartsPageHTML(data, config, batch, Math.floor(i / chartsPerPage) + 1, Math.ceil(selectedChartItems.length / chartsPerPage))
                });
            }
        }

        // ४. विंशोत्तरी महादशा कालचक्र (Page: Vimshottari Dasha - Dedicated 1 Page)
        if (config.sections.vimshottariDasha) {
            totalEstimatedPages++;
            pages.push({
                type: 'dasha',
                html: buildDashaPageHTML(data, config)
            });
        }

        // त्रिभागी महादशा कालचक्र (Page: Tribhagi Dasha - Dedicated 1 Page)
        if (config.sections.tribhagiDasha) {
            totalEstimatedPages++;
            pages.push({
                type: 'tribhagi_dasha',
                html: buildTribhagiDashaPageHTML(data, config)
            });
        }

        // योगिनी महादशा कालचक्र (Page: Yogini Dasha - Dedicated 1 Page)
        if (config.sections.yoginiDasha) {
            totalEstimatedPages++;
            pages.push({
                type: 'yogini_dasha',
                html: buildYoginiDashaPageHTML(data, config)
            });
        }

        // विंशोत्तरी महादशा तथा अन्तर्दशा फल (पाराशर श्लोकबद्ध विस्तृत फलादेश)
        if (config.sections.dashaPhaladesh) {
            const dashaPhalaPages = buildDashaPhaladeshPagesHTML(data, config);
            dashaPhalaPages.forEach(html => {
                totalEstimatedPages++;
                pages.push({
                    type: 'dasha_phaladesh',
                    html: html
                });
            });
        }

        // ५. शास्त्रीय श्लोकबद्ध फलादेश (Page: Sanskrit Shlokas & Bhava Predictions)
        if (config.sections.shlokasPhaladesh || config.sections.bhavaPhaladesh) {
            totalEstimatedPages++;
            pages.push({
                type: 'shlokas',
                html: buildShlokasPhaladeshPageHTML(data, config)
            });
        }

        // ६. योग-दोष विचार, अनुकूलता एवं शास्त्रीय उपाय (Final Page: Remedies & Yogas)
        if (config.sections.yogasAndDoshas || config.sections.remedies) {
            totalEstimatedPages++;
            pages.push({
                type: 'remedies',
                html: buildRemediesPageHTML(data, config)
            });
        }

        // Wrap each page in standard A4 frame with SVG border and page number
        const totalPages = pages.length;
        return pages.map((p, idx) => {
            const pageNum = idx + 1;
            return wrapInA4PageFrame(p.html, pageNum, totalPages, data);
        });
    }

    /**
     * प्रत्येक पानालाई कलात्मक SVG फ्रेम, A4 साइज र फुटर सहित बेर्छ
     */
    function wrapInA4PageFrame(pageBodyHTML, pageNum, totalPages, data) {
        const nativeName = data.name || "श्री जातक";
        const astrologerName = (fullReportConfig && fullReportConfig.astrologerName) || (typeof localStorage !== 'undefined' && localStorage.getItem('vedashchakshu_astrologer_name')) || "पं. ज्योतिषाचार्य";
        const borderSvgPath = "assets/kundali-border.svg.svg";

        return `
        <div class="report-page a4-page" data-page="${pageNum}">
            <!-- पृष्ठभूमि पारम्परिक कलात्मक SVG फ्रेम (Decorative Vector Frame) -->
            <div class="report-border-frame" aria-hidden="true">
                <img src="${borderSvgPath}" class="report-border-svg-img" alt="Ornamental Border" />
            </div>

            <!-- मुख्य पृष्ठ सामग्री क्षेत्र (Usable Content Area - Safe Inside Border) -->
            <div class="report-page-content">
                <div class="report-page-inner-body">
                    ${pageBodyHTML}
                </div>

                <!-- प्रत्येक पानाको फुटर (Running Footer with Page Number & Astrologer Name) -->
                <div class="report-page-footer">
                    <div class="footer-left-tag">
                        <span class="footer-om">ॐ</span>
                        <span>वेदश्चक्षु वैदिक जन्मपत्रिका</span>
                    </div>
                    <div class="footer-center-page">
                        पृष्ठ <span class="page-current">${toNepaliDigits(pageNum)}</span> / <span class="page-total">${toNepaliDigits(totalPages)}</span>
                    </div>
                    <div class="footer-right-native">
                        <span class="footer-native-name">जातक: <strong>${nativeName}</strong></span>
                        <span class="footer-sep-dot">•</span>
                        <span class="footer-astrologer-name">ज्योतिषी: <strong>${astrologerName}</strong></span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // ५. पृष्ठ १: आवरण पृष्ठ तथा वैदिक मंगलाचरण
    // (Page 1: Cover & Avakahada HTML)
    // ==========================================
    function buildCoverPageHTML(data, config) {
        const bsYearNp = toNepaliDigits(data.bsYear);
        const bsMonthName = data.bsMonthName || "कार्तिक";
        const bsDayNp = toNepaliDigits(data.bsDay);
        const adYearNp = toNepaliDigits(data.adYear);
        const adMonthNp = AD_MONTH_NAMES_NP ? (AD_MONTH_NAMES_NP[data.adMonth - 1] || "अक्टोबर") : data.adMonth;
        const adDayNp = toNepaliDigits(data.adDay);
        const birthTimeNp = toNepaliDigits(data.birthTimeStr || "१०:३०:००");
        const ishtakalaNp = toNepaliDigits(data.ishtakalaColonStr || data.ishtakalaStr || "--");
        const shakaNp = toNepaliDigits(data.bsYear - 135);
        const samvatsara = (typeof SAMVATSARAS !== "undefined" && SAMVATSARAS[((data.bsYear - 2030) % 60 + 60) % 60]) || LOCAL_SAMVATSARAS[((data.bsYear - 2030) % 60 + 60) % 60] || "रौद्र";
        const ayana = typeof getAyana === "function" ? getAyana(data.planets.Surya.deg) : "दक्षिणायन";
        const ritu = data.ritu || (typeof getRitu === "function" ? getRitu(data.bsMonth) : "शरद");
        const tithiName = data.tithi ? data.tithi.name : "सप्तमी";
        const paksha = data.tithi && data.tithi.paksha ? data.tithi.paksha : "शुक्ल पक्ष";
        const vaar = (typeof SANSKRIT_VAARA_NAMES !== "undefined" && data.adDateObj ? SANSKRIT_VAARA_NAMES[data.adDateObj.getDay()] : (data.adDateObj ? LOCAL_VAARA_NAMES[data.adDateObj.getDay()] : "शनि")) || "शनि";
        const nakshatraName = data.moonNak ? data.moonNak.nakshatraNameNp : "ज्येष्ठा";
        const nakPada = data.moonNak ? toNepaliDigits(data.moonNak.pada) : "१";
        const namaakshar = (data.moonNak && data.moonNak.namaakshar) || data.namaakshar || "नो";
        const gana = (data.moonNak && data.moonNak.gana) || data.gana || "राक्षस";
        const nadi = (data.moonNak && data.moonNak.nadi) || data.nadi || "आद्य";
        const varna = (data.moonNak && data.moonNak.varna) || "विप्र";
        const vashya = (data.moonNak && data.moonNak.vashya) || "कीट";
        const yoni = (data.moonNak && data.moonNak.yoni) || "मृग";
        const lagnaName = data.lagnaRashi ? data.lagnaRashi.rashiNameNp : "धनु";
        const moonRashi = data.moonRashi ? data.moonRashi.rashiNameNp : "वृश्चिक";
        const placeName = data.placeName || "काठमाडौँ";
        const countryName = data.countryName || "नेपाल";
        const latNp = toNepaliDigits(data.lat ? data.lat.toFixed(4) : "२७.७१७२");
        const lonNp = toNepaliDigits(data.lon ? data.lon.toFixed(4) : "८५.३२४०");

        return `
        <div class="report-cover-wrapper">
            <!-- मांगलिक मङ्गल प्रतीक तथा शीर्ष भाग -->
            <div class="report-auspicious-header">
                <div class="sacred-om-badge">॥ श्री गणेशाय नमः ॥</div>
                <div class="sacred-shloka-verse">
                    ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
                </div>
            </div>

            <!-- मुख्य शीर्षक ब्यानर -->
            <div class="report-title-banner">
                <div class="report-main-title">जन्मपत्रिका</div>
                <div class="report-sub-title">वैदिक जन्मकुण्डली, षोडशवर्ग एवं सम्पूर्ण फलादेश</div>
                <div class="report-title-ornament">❖ ══════════ 𑁍 ══════════ ❖</div>
            </div>

            <!-- दुई स्तम्भीय मुख्य विवरण (Personal Details & Astrological Signature) -->
            <div class="report-two-col-grid">
                <!-- स्तम्भ १: जातक परिचय विवरण -->
                <div class="report-info-card">
                    <div class="card-mini-title">
                        <span class="icon">👤</span>
                        <span>जातक परिचय विवरण</span>
                    </div>
                    <table class="report-table-compact">
                        <tr>
                            <td class="lbl">जातकको नाम:</td>
                            <td class="val-bold text-maroon">${data.name || 'श्री जातक'}</td>
                        </tr>
                        <tr>
                            <td class="lbl">लिङ्ग / गोत्र:</td>
                            <td class="val">${data.gender || 'पुरुष'} / ${data.gotra || 'काश्यप'}</td>
                        </tr>
                        <tr>
                            <td class="lbl">पिताको नाम:</td>
                            <td class="val">${data.fatherName || 'श्री पिता'}</td>
                        </tr>
                        <tr>
                            <td class="lbl">माताको नाम:</td>
                            <td class="val">${data.motherName || 'श्रीमती माता'}</td>
                        </tr>
                        <tr>
                            <td class="lbl">जन्म मिति (वि.सं.):</td>
                            <td class="val-bold text-dark">${bsYearNp} साल ${bsMonthName} ${bsDayNp} गते</td>
                        </tr>
                        <tr>
                            <td class="lbl">जन्म मिति (ई.सं.):</td>
                            <td class="val">${data.adYear}-${String(data.adMonth).padStart(2,'0')}-${String(data.adDay).padStart(2,'0')} AD (${adMonthNp} ${adDayNp})</td>
                        </tr>
                        <tr>
                            <td class="lbl">जन्म समय:</td>
                            <td class="val-bold text-maroon">${birthTimeNp} (वार: ${vaar}वासरः)</td>
                        </tr>
                        <tr>
                            <td class="lbl">जन्म स्थान / देश:</td>
                            <td class="val">${placeName}, ${countryName}</td>
                        </tr>
                        <tr>
                            <td class="lbl">अक्षांश / देशान्तर:</td>
                            <td class="val font-mono">${latNp}° N, ${lonNp}° E</td>
                        </tr>
                        <tr>
                            <td class="lbl">इष्टकाल:</td>
                            <td class="val-bold font-mono text-dark">${ishtakalaNp} घटी:पला</td>
                        </tr>
                        ${data.suryaSiddhantaBija ? `
                        <tr>
                            <td class="lbl">गणना सिद्धान्त:</td>
                            <td class="val-bold text-maroon">${data.siddhanta || "सूर्यसिद्धान्त (संशोधित)"}</td>
                        </tr>
                        <tr>
                            <td class="lbl">अयनांश / क्रान्ति:</td>
                            <td class="val font-mono">${data.suryaSiddhantaBija.ayanamshaDMS} / ${data.suryaSiddhantaBija.suryaKranti}</td>
                        </tr>
                        <tr>
                            <td class="lbl">चर / बेलान्तर:</td>
                            <td class="val font-mono">${data.suryaSiddhantaBija.charSamskara} / ${data.suryaSiddhantaBija.belantara}</td>
                        </tr>
                        ` : `
                        <tr>
                            <td class="lbl">गणना सिद्धान्त:</td>
                            <td class="val">${data.siddhanta || "सूर्यसिद्धान्त"}</td>
                        </tr>
                        `}
                    </table>
                </div>

                <!-- स्तम्भ २: पञ्चाङ्ग एवं अवकहडा चक्र -->
                <div class="report-info-card">
                    <div class="card-mini-title">
                        <span class="icon">🌟</span>
                        <span>पञ्चाङ्ग एवं अवकहडा चक्र</span>
                    </div>
                    <table class="report-table-compact">
                        <tr>
                            <td class="lbl">संवत्सर / शाके:</td>
                            <td class="val">${samvatsara} / शाके ${shakaNp}</td>
                        </tr>
                        <tr>
                            <td class="lbl">अयन / ऋतु:</td>
                            <td class="val">${ayana} / ${ritu} ऋतु</td>
                        </tr>
                        <tr>
                            <td class="lbl">पक्ष / तिथि:</td>
                            <td class="val-bold">${paksha} / ${tithiName} तिथि</td>
                        </tr>
                        <tr>
                            <td class="lbl">जन्म नक्षत्र:</td>
                            <td class="val-bold text-maroon">${nakshatraName} (चरण ${nakPada})</td>
                        </tr>
                        <tr>
                            <td class="lbl">नामाक्षर:</td>
                            <td class="val-bold text-maroon text-lg">${namaakshar}</td>
                        </tr>
                        <tr>
                            <td class="lbl">लग्न राशि:</td>
                            <td class="val-bold text-dark">${lagnaName} लग्न</td>
                        </tr>
                        <tr>
                            <td class="lbl">चन्द्र राशि:</td>
                            <td class="val-bold text-dark">${moonRashi} राशि</td>
                        </tr>
                        <tr>
                            <td class="lbl">गण / नाडी:</td>
                            <td class="val">${gana} गण / ${nadi} नाडी</td>
                        </tr>
                        <tr>
                            <td class="lbl">वर्ण / वश्य:</td>
                            <td class="val">${varna} / ${vashya}</td>
                        </tr>
                        <tr>
                            <td class="lbl">योनि / पाया:</td>
                            <td class="val">${yoni} योनि / रजत पाया</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // ६. पृष्ठ २: ग्रहस्पष्ट सारिणी एवं मुख्य कुण्डली चक्रहरू
    // (Page 2: Graha Spashta & D1/Chandra Charts)
    // ==========================================
    function buildGrahaSpashtaPageHTML(data, config) {
        // Build table rows
        const planetsOrder = ["Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu"];
        const grahaNamesNp = {
            Surya: "सूर्य", Chandra: "चन्द्र", Mangal: "मङ्गल", Budha: "बुध",
            Guru: "गुरु", Shukra: "शुक्र", Shani: "शनि", Rahu: "राहु", Ketu: "केतु"
        };

        const lagnaDeg = data.lagnaDeg || 0;
        const lagnaDegInRashi = lagnaDeg % 30;
        const lagnaDMS = formatDMS(lagnaDegInRashi);
        const lagnaRashiName = data.lagnaRashi ? data.lagnaRashi.rashiNameNp : "धनु";
        const lagnaNakName = data.lagnaNak ? data.lagnaNak.nakshatraNameNp : "--";
        const lagnaPada = data.lagnaNak ? toNepaliDigits(data.lagnaNak.pada) : "१";

        let rowsHtml = `
            <tr class="lagna-row">
                <td class="p-name"><strong>लग्न (तनु)</strong></td>
                <td class="p-rashi font-bold">${lagnaRashiName}</td>
                <td class="p-deg font-mono">${toNepaliDigits(lagnaDMS.deg)}° ${toNepaliDigits(lagnaDMS.min)}' ${toNepaliDigits(lagnaDMS.sec)}"</td>
                <td class="p-nak">${lagnaNakName}</td>
                <td class="p-pada">${lagnaPada}</td>
                <td class="p-speed font-mono">--</td>
                <td class="p-status font-bold text-maroon">केन्द्र (१)</td>
            </tr>
        `;

        planetsOrder.forEach(k => {
            const p = data.planets[k];
            if (!p) return;
            const deg = p.deg;
            const degInRashi = deg % 30;
            const dms = formatDMS(degInRashi);
            const rashiDetails = typeof getRashiDetails === "function" ? getRashiDetails(deg) : { rashiNameNp: "मेष" };
            const nakDetails = typeof getNakshatraDetails === "function" ? getNakshatraDetails(deg) : { nakshatraNameNp: "--", pada: 1 };
            const house = typeof getHouseOfPlanet === "function" ? getHouseOfPlanet(rashiDetails.rashiId, data.lagnaRashi.rashiId) : 1;
            const isVakri = (k === "Rahu" || k === "Ketu") ? true : Boolean(p.isRetrograde);
            const speedStr = p.speed !== undefined ? toNepaliDigits(p.speed.toFixed(2)) : "--";

            // Status label (उच, नीच, स्वगृह, वक्री)
            let statusBadge = isVakri ? '<span class="status-vakri">वक्री</span>' : '<span class="status-margi">मार्गी</span>';
            if (p.isExalted) statusBadge += ' <span class="status-uchha">उच्च</span>';
            if (p.isDebilitated) statusBadge += ' <span class="status-neecha">नीच</span>';
            if (p.isOwnSign) statusBadge += ' <span class="status-own">स्वगृही</span>';

            rowsHtml += `
                <tr>
                    <td class="p-name"><strong>${grahaNamesNp[k]}</strong></td>
                    <td class="p-rashi">${rashiDetails.rashiNameNp}</td>
                    <td class="p-deg font-mono">${toNepaliDigits(dms.deg)}° ${toNepaliDigits(dms.min)}' ${toNepaliDigits(dms.sec)}"</td>
                    <td class="p-nak">${nakDetails.nakshatraNameNp}</td>
                    <td class="p-pada">${toNepaliDigits(nakDetails.pada)}</td>
                    <td class="p-speed font-mono">${speedStr}</td>
                    <td class="p-status">${statusBadge} (भाव ${toNepaliDigits(house)})</td>
                </tr>
            `;
        });

        // २. पञ्चधा ग्रहमैत्री चक्र (Panchadha Maitri Matrix Table)
        let panchadhaHtml = "";
        let pmData = data.panchadhaMaitri;
        if (!pmData && typeof calculatePanchadhaMaitri === "function" && data.planets) {
            pmData = calculatePanchadhaMaitri(data.planets);
        }
        if (pmData && pmData.summary) {
            const pmPlanets = pmData.planets || ["सूर्य", "चन्द्र", "मङ्गल", "बुध", "गुरु", "शुक्र", "शनि"];
            const pmSummary = pmData.summary;
            const relationshipRows = [
                { key: "atimitra", label: "अतिमित्र", rowClass: "pm-row-atimitra", color: "#065F46" },
                { key: "mitra", label: "मित्र", rowClass: "pm-row-mitra", color: "#1D4ED8" },
                { key: "sama", label: "सम", rowClass: "pm-row-sama", color: "#4B5563" },
                { key: "shatru", label: "शत्रु", rowClass: "pm-row-shatru", color: "#B45309" },
                { key: "atishatru", label: "अतिशत्रु", rowClass: "pm-row-atishatru", color: "#991B1B" }
            ];

            const planetShortMap = {
                "सूर्य": "सू", "चन्द्र": "चं", "मङ्गल": "मं", "बुध": "बु",
                "गुरु": "गु", "शुक्र": "शु", "शनि": "श", "राहु": "रा", "केतु": "के"
            };

            let pmBodyRows = "";
            relationshipRows.forEach(rel => {
                let cells = `<td style="font-weight: 700; color: ${rel.color}; background: #FFFDF9; border: 1px solid #E7E5E4; padding: 4px;">${rel.label}</td>`;
                pmPlanets.forEach(p => {
                    const list = (pmSummary[p] && pmSummary[p][rel.key]) ? pmSummary[p][rel.key] : [];
                    const content = list.length > 0
                        ? list.map(item => `<span style="display: inline-block; padding: 1px 4px; margin: 1px 2px; border-radius: 3px; font-weight: 700; font-size: 0.72rem; color: ${rel.color}; background: #F3F4F6;">${planetShortMap[item.trim()] || item}</span>`).join("")
                        : `<span style="color: #9CA3AF;">—</span>`;
                    cells += `<td style="border: 1px solid #E7E5E4; padding: 3px 2px; font-size: 0.74rem;">${content}</td>`;
                });
                pmBodyRows += `<tr>${cells}</tr>`;
            });

            panchadhaHtml = `
            <div class="report-table-box" style="margin-top: 14px;">
                <div class="table-box-title">॥ पञ्चधा ग्रहमैत्री चक्र (नैसर्गिक + तात्कालिक = पञ्चधा सम्बन्ध) ॥</div>
                <table class="report-data-table pm-report-table">
                    <thead>
                        <tr>
                            <th style="width: 14%; background: #881337; color: #FFF; padding: 5px;">सम्बन्ध</th>
                            ${pmPlanets.map(p => `<th style="background: #881337; color: #FFF; padding: 5px;">${p}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${pmBodyRows}
                    </tbody>
                </table>
            </div>
            `;
        }

        return `
        <div class="report-section-page">
            <div class="section-page-header">
                <h3 class="section-title">🪐 ग्रहस्पष्ट सारिणी एवं पञ्चधा ग्रहमैत्री चक्र</h3>
                ${data.suryaSiddhantaBija ? `
                <p class="section-sub" style="font-weight: 600; color: #78350f;">
                    गणना सिद्धान्त:- सूर्यसिद्धान्त (संशोधित) &nbsp;|&nbsp;
                    अयनांश:- ${data.suryaSiddhantaBija.ayanamshaDMS} &nbsp;|&nbsp;
                    सूर्यक्रान्ति:- ${data.suryaSiddhantaBija.suryaKranti} &nbsp;|&nbsp;
                    चर:- ${data.suryaSiddhantaBija.charSamskara} &nbsp;|&nbsp;
                    बेलान्तर:- ${data.suryaSiddhantaBija.belantara}
                </p>
                ` : `
                <p class="section-sub">${data.siddhanta || "सूर्यसिद्धान्त"} सम्मत शुद्ध ग्रहस्थिति एवं पञ्चधा ग्रहमैत्री साधन</p>
                `}
                <div class="header-divider-line"></div>
            </div>

            <!-- १. ग्रहस्पष्ट तालिका -->
            <div class="report-table-box">
                <table class="report-data-table">
                    <thead>
                        <tr>
                            <th>ग्रह</th>
                            <th>राशि</th>
                            <th>स्पष्ट मान (अंश-कला-विकला)</th>
                            <th>नक्षत्र</th>
                            <th>पाद</th>
                            <th>गति (°/दिन)</th>
                            <th>अवस्था एवं भाव</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- २. पञ्चधा ग्रहमैत्री तालिका (No duplicate charts on this page) -->
            ${panchadhaHtml}
        </div>
        `;
    }

    /**
     * अंश, कला र विकला ढाँचामा रूपान्तरण गर्छ
     */
    function formatDMS(degDecimal) {
        const d = Math.floor(degDecimal);
        const minFloat = (degDecimal - d) * 60;
        const m = Math.floor(minFloat);
        const s = Math.round((minFloat - m) * 60);
        return {
            deg: String(d).padStart(2, '0'),
            min: String(m).padStart(2, '0'),
            sec: String(s).padStart(2, '0')
        };
    }

    // ==========================================
    // ७. पृष्ठ: षोडशवर्ग कुण्डली चक्रहरू
    // (Page: Selected Divisional Charts HTML)
    // ==========================================
    function buildChartsPageHTML(data, config, batch, currentBatchNum, totalBatches) {
        let chartsHtml = '';

        const isGrid6 = config.chartsLayout === '6perpage' || batch.length > 4;
        const isGrid4 = !isGrid6 && (batch.length > 2 || config.chartsLayout === '4perpage');
        const chartSvgSize = isGrid6 ? 225 : (isGrid4 ? 280 : (batch.length > 1 ? 340 : 420));

        batch.forEach(item => {
            const lagnaId = item.getLagna(data);
            const planets = item.getPlanets(data);
            let svgChart = '';

            // Handle Hora chart special case if desired, otherwise render classic North Indian
            if (item.id === 'd2' && typeof renderHoraTwoChamberChart === 'function') {
                svgChart = renderHoraTwoChamberChart(data, "", chartSvgSize);
            } else if (typeof renderNorthIndianChart === 'function') {
                svgChart = renderNorthIndianChart(lagnaId, planets, "", chartSvgSize);
            }

            // Strip any <h4 class="chart-title"> inside svgChart so ONLY the top badge remains
            svgChart = svgChart.replace(/<h4 class="chart-title"[^>]*>[\s\S]*?<\/h4>/gi, '');

            chartsHtml += `
                <div class="report-chart-cell varga-chart-cell">
                    <div class="varga-card-top-badge">
                        <span class="varga-code">${item.vargaNum}</span>
                        <span class="varga-name">${item.nameNp}</span>
                        <span class="varga-sub">${item.subTitle}</span>
                    </div>
                    ${svgChart}
                </div>
            `;
        });

        let layoutClass = 'report-charts-grid-4';
        if (isGrid6) {
            layoutClass = 'report-charts-grid-6';
        } else if (!isGrid4) {
            layoutClass = batch.length > 1 ? 'report-charts-row two-charts-row' : 'report-charts-row single-chart-row';
        }

        return `
        <div class="report-section-page report-charts-section-page">
            <div class="${layoutClass}">
                ${chartsHtml}
            </div>
        </div>
        `;
    }

    // ==========================================
    // ८. पृष्ठ: विंशोत्तरी, त्रिभागी एवं योगिनी दशान्तर्दशा कालचक्र
    // (Pages: Dedicated 1-Page Dasha Block Grids - No Pratyantardasha)
    // ==========================================
    function formatReportDashaBsDate(date, isBeforeBirth = false) {
        if (isBeforeBirth || !date) return "-";
        try {
            const d = (date instanceof Date) ? date : new Date(date);
            if (isNaN(d.getTime())) return "-";
            let bsYear, bsMonth, bsDay;
            if (typeof adToBs === "function") {
                const bs = adToBs(d.getFullYear(), d.getMonth() + 1, d.getDate());
                bsYear = bs.year;
                bsMonth = bs.month;
                bsDay = bs.day;
            } else {
                bsYear = d.getFullYear() + 57;
                bsMonth = ((d.getMonth() + 8) % 12) + 1;
                bsDay = d.getDate();
            }
            const yStr = toNepaliDigits(bsYear);
            const mStr = toNepaliDigits(String(bsMonth).padStart(2, '0'));
            const dStr = toNepaliDigits(String(bsDay).padStart(2, '0'));
            return `${yStr}/${mStr}/${dStr}`;
        } catch (e) {
            return "-";
        }
    }

    function buildDashaPageHTML(data, config) {
        let dashaData = data.dasha;
        if ((!dashaData || !dashaData.timeline) && typeof calculateVimshottariDasha === "function" && data.planets && data.planets.Chandra) {
            const bDate = data.adDateObj || new Date(data.adYear, data.adMonth - 1, data.adDay);
            dashaData = calculateVimshottariDasha(data.planets.Chandra.deg, bDate);
        }

        if (!dashaData || !dashaData.timeline) {
            return `
            <div class="report-section-page">
                <div class="section-page-header">
                    <h3 class="section-title">⏳ विंशोत्तरी दशान्तर्दशा कालचक्र</h3>
                </div>
                <p style="text-align: center; padding: 40px; color: #78350f;">दशा विवरण उपलब्ध छैन।</p>
            </div>
            `;
        }

        const timeline = dashaData.timeline || [];
        const birthBalance = dashaData.balance || "-";
        const nakName = data.moonNak ? data.moonNak.nakshatraNameNp : "--";
        const nakPada = data.moonNak ? toNepaliDigits(data.moonNak.pada) : "१";

        let blocksHtml = "";
        timeline.slice(0, 9).forEach((m, mIdx) => {
            const lordName = m.lord || m.planet || "ग्रह";
            const mEndDateBs = formatReportDashaBsDate(m.endDate);
            let rowsHtml = "";
            (m.antardashas || []).forEach(a => {
                const aLordName = a.lord || a.planet || "ग्रह";
                const aEndDateBs = formatReportDashaBsDate(a.endDate, a.isBeforeBirth);
                const isCurrent = a.isCurrent;
                rowsHtml += `
                    <div class="dasha-ant-row ${isCurrent ? 'current-active' : ''}">
                        <span class="dasha-ant-name">${aLordName}</span>
                        <span class="dasha-ant-date ${a.isBeforeBirth ? 'dash-date' : ''}">${aEndDateBs}</span>
                    </div>
                `;
            });

            blocksHtml += `
                <div class="dasha-block ${m.isCurrent ? 'card-current-active' : ''}">
                    <div class="dasha-block-header">
                        <span class="dasha-block-lord">${lordName}</span>
                        <span class="dasha-block-date">${mEndDateBs}</span>
                    </div>
                    <div class="dasha-block-body">
                        ${rowsHtml}
                    </div>
                </div>
            `;
        });

        return `
        <div class="report-section-page report-dasha-page">
            <div class="section-page-header">
                <h3 class="section-title">⏳ विंशोत्तरी दशान्तर्दशा कालचक्र (१२० वर्ष)</h3>
                <p class="section-sub">जन्म नक्षत्र: ${nakName} (${nakPada} पाउ) | जन्म समय शेष भोग्य: ${birthBalance}</p>
                <div class="header-divider-line"></div>
            </div>

            <div class="report-dasha-grid-3x3">
                ${blocksHtml}
            </div>
        </div>
        `;
    }

    function buildTribhagiDashaPageHTML(data, config) {
        let tribhagiData = data.tribhagiDasha;
        if ((!tribhagiData || !tribhagiData.timeline) && typeof calculateTribhagiDasha === "function" && data.planets && data.planets.Chandra) {
            const bDate = data.adDateObj || new Date(data.adYear, data.adMonth - 1, data.adDay);
            tribhagiData = calculateTribhagiDasha(data.planets.Chandra.deg, bDate);
        }

        if (!tribhagiData || !tribhagiData.timeline) {
            return `
            <div class="report-section-page">
                <div class="section-page-header">
                    <h3 class="section-title">⌛ त्रिभागी दशान्तर्दशा कालचक्र</h3>
                </div>
                <p style="text-align: center; padding: 40px; color: #78350f;">त्रिभागी दशा विवरण उपलब्ध छैन।</p>
            </div>
            `;
        }

        const timeline = tribhagiData.timeline || [];
        const birthBalance = tribhagiData.balance || "-";
        const nakName = data.moonNak ? data.moonNak.nakshatraNameNp : "--";

        let blocksHtml = "";
        timeline.slice(0, 9).forEach((m, mIdx) => {
            const lordName = m.lord || m.planet || "ग्रह";
            const mEndDateBs = formatReportDashaBsDate(m.endDate);
            let rowsHtml = "";
            (m.antardashas || []).forEach(a => {
                const aLordName = a.lord || a.planet || "ग्रह";
                const aEndDateBs = formatReportDashaBsDate(a.endDate, a.isBeforeBirth);
                const isCurrent = a.isCurrent;
                rowsHtml += `
                    <div class="dasha-ant-row ${isCurrent ? 'current-active' : ''}">
                        <span class="dasha-ant-name">${aLordName}</span>
                        <span class="dasha-ant-date ${a.isBeforeBirth ? 'dash-date' : ''}">${aEndDateBs}</span>
                    </div>
                `;
            });

            blocksHtml += `
                <div class="dasha-block ${m.isCurrent ? 'card-current-active' : ''}">
                    <div class="dasha-block-header">
                        <span class="dasha-block-lord">${lordName}</span>
                        <span class="dasha-block-date">${mEndDateBs}</span>
                    </div>
                    <div class="dasha-block-body">
                        ${rowsHtml}
                    </div>
                </div>
            `;
        });

        return `
        <div class="report-section-page report-dasha-page">
            <div class="section-page-header">
                <h3 class="section-title">⌛ त्रिभागी दशान्तर्दशा कालचक्र</h3>
                <p class="section-sub">जन्म नक्षत्र: ${nakName} | जन्म समय शेष भोग्य: ${birthBalance}</p>
                <div class="header-divider-line"></div>
            </div>

            <div class="report-dasha-grid-3x3">
                ${blocksHtml}
            </div>
        </div>
        `;
    }

    function buildYoginiDashaPageHTML(data, config) {
        let yoginiData = data.yoginiDasha;
        if ((!yoginiData || !yoginiData.timeline) && typeof calculateYoginiDasha === "function" && data.planets && data.planets.Chandra) {
            const bDate = data.adDateObj || new Date(data.adYear, data.adMonth - 1, data.adDay);
            yoginiData = calculateYoginiDasha(data.planets.Chandra.deg, bDate);
        }

        if (!yoginiData || !yoginiData.timeline) {
            return `
            <div class="report-section-page">
                <div class="section-page-header">
                    <h3 class="section-title">🌸 योगिनी दशान्तर्दशा कालचक्र (३६ वर्ष)</h3>
                </div>
                <p style="text-align: center; padding: 40px; color: #78350f;">योगिनी दशा विवरण उपलब्ध छैन।</p>
            </div>
            `;
        }

        const timeline = yoginiData.timeline || [];
        const cycle1 = timeline.slice(0, 8);
        const birthBalance = yoginiData.balance || "-";
        const nakName = data.moonNak ? data.moonNak.nakshatraNameNp : "--";

        let blocksHtml = "";
        cycle1.forEach((m, mIdx) => {
            const yoginiName = m.displayName || (m.name && m.lord ? `${m.name} (${m.lord})` : (m.name || m.lord || "योगिनी"));
            const mEndDateBs = formatReportDashaBsDate(m.endDate);
            let rowsHtml = "";
            (m.antardashas || []).forEach(a => {
                const aName = a.displayName || (a.name && a.lord ? `${a.name} (${a.lord})` : (a.name || a.lord || "योगिनी"));
                const aEndDateBs = formatReportDashaBsDate(a.endDate, a.isBeforeBirth);
                const isCurrent = a.isCurrent;
                rowsHtml += `
                    <div class="dasha-ant-row ${isCurrent ? 'current-active' : ''}">
                        <span class="dasha-ant-name">${aName}</span>
                        <span class="dasha-ant-date ${a.isBeforeBirth ? 'dash-date' : ''}">${aEndDateBs}</span>
                    </div>
                `;
            });

            blocksHtml += `
                <div class="dasha-block ${m.isCurrent ? 'card-current-active' : ''}">
                    <div class="dasha-block-header">
                        <span class="dasha-block-lord">${yoginiName}</span>
                        <span class="dasha-block-date">${mEndDateBs}</span>
                    </div>
                    <div class="dasha-block-body">
                        ${rowsHtml}
                    </div>
                </div>
            `;
        });

        return `
        <div class="report-section-page report-dasha-page">
            <div class="section-page-header">
                <h3 class="section-title">🌸 योगिनी दशान्तर्दशा कालचक्र (३६ वर्ष)</h3>
                <p class="section-sub">जन्म नक्षत्र: ${nakName} | जन्म समय शेष भोग्य: ${birthBalance}</p>
                <div class="header-divider-line"></div>
            </div>

            <div class="report-dasha-grid-3x3 yogini-grid">
                ${blocksHtml}
            </div>
        </div>
        `;
    }

    function formatDateStr(dStr) {
        if (!dStr) return "--";
        try {
            const d = new Date(dStr);
            if (isNaN(d.getTime())) return toNepaliDigits(dStr);
            const yr = toNepaliDigits(d.getFullYear());
            const mo = toNepaliDigits(String(d.getMonth() + 1).padStart(2, '0'));
            const da = toNepaliDigits(String(d.getDate()).padStart(2, '0'));
            return `${yr}/${mo}/${da}`;
        } catch (e) {
            return toNepaliDigits(dStr);
        }
    }

    /**
     * विंशोत्तरी दशा ब्यानरका लागि मिति ढाँचा (२०५९ः०९ः२६ ढाँचामा)
     */
    function formatDashaPhalaBannerDate(date) {
        if (!date) return "--";
        try {
            const d = (date instanceof Date) ? date : new Date(date);
            if (isNaN(d.getTime())) return "--";
            let bsYear, bsMonth, bsDay;
            if (typeof adToBs === "function") {
                const bs = adToBs(d.getFullYear(), d.getMonth() + 1, d.getDate());
                bsYear = bs.year;
                bsMonth = bs.month;
                bsDay = bs.day;
            } else {
                bsYear = d.getFullYear() + 57;
                bsMonth = ((d.getMonth() + 8) % 12) + 1;
                bsDay = d.getDate();
            }
            const yStr = toNepaliDigits(bsYear);
            const mStr = toNepaliDigits(String(bsMonth).padStart(2, '0'));
            const dStr = toNepaliDigits(String(bsDay).padStart(2, '0'));
            return `${yStr}ः${mStr}ः${dStr}`;
        } catch (e) {
            return "--";
        }
    }

    // ==========================================
    // ८. ख. पृष्ठ: विंशोत्तरी महादशा तथा अन्तर्दशा फल (BPHS Classical Phala)
    // (Pages: Mahadasha & Antardasha Phaladesh with Exact BPHS Verses & Dates)
    // ==========================================
    function buildDashaPhaladeshPagesHTML(data, config) {
        let dashaData = data.dasha;
        const bDate = (data.birthDate instanceof Date) ? data.birthDate : new Date(data.birthYear, (data.birthMonth || 1) - 1, data.birthDay || 1, data.birthHour || 12, data.birthMinute || 0);

        if ((!dashaData || !dashaData.timeline) && typeof calculateVimshottariDasha === "function" && data.planets && data.planets.Chandra) {
            dashaData = calculateVimshottariDasha(data.planets.Chandra.deg, bDate);
        }

        if (!dashaData || !dashaData.timeline) return [];

        const timeline = dashaData.timeline || [];
        const isCurrentScopeOnly = config && config.dashaScope === 'current';
        const now = new Date();

        const antardashaItems = [];

        timeline.forEach((m, mIdx) => {
            const isFirstMaha = (mIdx === 0);
            let prevEnd = isFirstMaha ? bDate : (m.startDate || bDate);

            const isMahaCurrent = (now >= m.startDate && now < m.endDate);
            if (isCurrentScopeOnly && !isMahaCurrent) return;

            (m.antardashas || []).forEach(a => {
                if (a.isBeforeBirth) return; // Skip periods prior to birth

                const effectiveStart = (isFirstMaha && (!a.startDate || a.startDate < bDate)) ? bDate : (a.startDate || prevEnd);
                const effectiveEnd = a.endDate;
                prevEnd = effectiveEnd;

                const startBs = formatDashaPhalaBannerDate(effectiveStart);
                const endBs = formatDashaPhalaBannerDate(effectiveEnd);

                const phala = (typeof getBPHSDashaPhala === 'function')
                    ? getBPHSDashaPhala(m.lord, a.lord)
                    : null;

                const isCurrent = (now >= effectiveStart && now < effectiveEnd);

                antardashaItems.push({
                    mahaLord: m.lord,
                    antarLord: a.lord,
                    startBs,
                    endBs,
                    isCurrent,
                    phala: phala || {
                        title: `${a.lord}न्तर्दशाफल`,
                        mahaName: m.lord,
                        antarName: a.lord,
                        shlokas: '',
                        nepali: `${m.lord}को महादशामा ${a.lord}को अन्तर्दशा फल शुभ एवं कल्याणकारी रहनेछ ।`
                    }
                });
            });
        });

        if (antardashaItems.length === 0) return [];

        // Put 2 Antardasha cards per page to comfortably fit within ornamental border
        const CARDS_PER_PAGE = 2;
        const pages = [];
        const totalPages = Math.ceil(antardashaItems.length / CARDS_PER_PAGE);

        for (let i = 0; i < antardashaItems.length; i += CARDS_PER_PAGE) {
            const batch = antardashaItems.slice(i, i + CARDS_PER_PAGE);
            const pageNum = Math.floor(i / CARDS_PER_PAGE) + 1;

            let cardsHtml = '';
            batch.forEach(item => {
                const phala = item.phala;
                const activeBadge = item.isCurrent
                    ? '<span class="dasha-active-badge-pill">✨ हाल सक्रिय अन्तर्दशा</span>'
                    : '';

                // Sanskrit Shloka Box
                let shlokaHtml = '';
                if (phala.shlokas && phala.shlokas.trim()) {
                    const shlokaLines = phala.shlokas.split('\n').filter(Boolean).map(l => `<div class="shloka-line">${l.trim()}</div>`).join('');
                    shlokaHtml = `
                    <div class="dasha-phala-shloka-box">
                        <div class="shloka-source-badge">॥ बृहत्पाराशरहोराशास्त्रे दशाफलाध्याय प्रमाणम् ॥</div>
                        <div class="dasha-phala-shloka-text">${shlokaLines}</div>
                    </div>
                    `;
                }

                // Nepali Interpretation Paragraphs
                let nepaliHtml = '';
                if (phala.nepali && phala.nepali.trim()) {
                    const paras = phala.nepali.split('\n').filter(Boolean).map(p => {
                        const isRemedy = (p.includes('शान्ति') || p.includes('दोष निवारण') || p.includes('जप') || p.includes('दान') || p.includes('पूजा') || p.includes('रुद्र'));
                        const isMalefic = (p.includes('नीच') || p.includes('अस्त') || p.includes('६,८,१२') || p.includes('अशुभ') || p.includes('पीडा') || p.includes('विनाश') || p.includes('हानि'));

                        let cls = 'dasha-phala-para';
                        let prefix = '🌿 ';
                        if (isRemedy) {
                            cls += ' dasha-phala-remedy-para';
                            prefix = '📿 ';
                        } else if (isMalefic) {
                            cls += ' dasha-phala-warning-para';
                            prefix = '⚠️ ';
                        } else {
                            cls += ' dasha-phala-auspicious-para';
                        }
                        return `<p class="${cls}"><strong>${prefix}</strong>${p.trim()}</p>`;
                    }).join('');
                    nepaliHtml = `<div class="dasha-phala-nepali-content">${paras}</div>`;
                }

                cardsHtml += `
                <div class="dasha-phala-card ${item.isCurrent ? 'dasha-card-current-period' : ''}">
                    <!-- १. मिति दायरा ब्यानर (Exact format: YYYY:MM:DD देखी YYYY:MM:DD सम्म) -->
                    <div class="dasha-phala-date-banner">
                        <span class="dasha-date-text">${item.startBs} &nbsp;&nbsp;देखी&nbsp;&nbsp; ${item.endBs} &nbsp;&nbsp;सम्म</span>
                        ${activeBadge}
                    </div>

                    <!-- २. अन्तर्दशा शीर्षक -->
                    <div class="dasha-phala-header-row">
                        <h4 class="dasha-phala-heading">${phala.title}</h4>
                        <span class="dasha-phala-lord-subtitle">(${phala.mahaName} महादशा ➔ ${phala.antarName} अन्तर्दशा)</span>
                    </div>

                    <!-- ३. मूल संस्कृत श्लोक -->
                    ${shlokaHtml}

                    <!-- ४. शास्त्रीय नेपाली फलादेश एवं शान्ति उपाय -->
                    ${nepaliHtml}
                </div>
                `;
            });

            pages.push(`
            <div class="report-section-page dasha-phaladesh-report-page">
                <div class="section-page-header">
                    <h3 class="section-title">📜 महादशा तथा अन्तर्दशा फल</h3>
                    <p class="section-sub">बृहत्पाराशरहोराशास्त्र सम्मत मूल संस्कृत श्लोक, सूक्ष्म समयरेखा, फल-विचार एवं शान्ति उपाय (${toNepaliDigits(pageNum)}/${toNepaliDigits(totalPages)})</p>
                    <div class="header-divider-line"></div>
                </div>

                <div class="dasha-phaladesh-page-cards-wrap">
                    ${cardsHtml}
                </div>
            </div>
            `);
        }

        return pages;
    }

    // ==========================================
    // ९. पृष्ठ: शास्त्रीय श्लोकबद्ध फलादेश
    // (Page: Sanskrit Shlokas & Bhava Predictions HTML)
    // ==========================================
    function buildShlokasPhaladeshPageHTML(data, config) {
        const lagnaId = (data.lagnaRashi && data.lagnaRashi.rashiId) || 1;
        const planets = data.planets || {};

        // Key Bhaveshas
        const lagnesh = getHouseLordInfo(1, lagnaId, planets);
        const bhagyash = getHouseLordInfo(9, lagnaId, planets);
        const karmesh = getHouseLordInfo(10, lagnaId, planets);
        const saptamesh = getHouseLordInfo(7, lagnaId, planets);

        // Shlokas
        const lagneshShloka = getVerifiedShloka("1_" + lagnesh.currentHouse);
        const bhagyashShloka = getVerifiedShloka("9_" + bhagyash.currentHouse);
        const karmeshShloka = getVerifiedShloka("10_" + karmesh.currentHouse);
        const saptameshShloka = getVerifiedShloka("7_" + saptamesh.currentHouse);

        // Sun & Jupiter Bhavasta Shlokas
        const suryaRashiId = typeof getRashiDetails === "function" && planets.Surya ? getRashiDetails(planets.Surya.deg).rashiId : 1;
        const suryaHouse = typeof getHouseOfPlanet === "function" ? getHouseOfPlanet(suryaRashiId, lagnaId) : 1;
        const suryaShloka = (typeof MANSAGARI_SHLOKAS !== "undefined" && MANSAGARI_SHLOKAS[`${suryaHouse}_1`]) || "";
        const suryaInterp = (typeof BHAVASTA_GRAHA_INTERPRETATIONS !== "undefined" && BHAVASTA_GRAHA_INTERPRETATIONS[`${suryaHouse}_1`]) || [
            "तेजस्वी, दृढ निश्चयी र नेतृत्व क्षमता ।", "प्रतिष्ठा र मान-सम्मान", "संयम आवश्यक"
        ];

        return `
        <div class="report-section-page">
            <div class="section-page-header">
                <h3 class="section-title">🔮 शास्त्रीय श्लोकबद्ध कुण्डली फलादेश</h3>
                <p class="section-sub">महर्षि पराशर, मानसागरी एवं चमत्कार चिन्तामणि ग्रन्थ प्रमाण, मूल श्लोक एवं नेपाली व्याख्या</p>
                <div class="header-divider-line"></div>
            </div>

            <!-- १. लग्नेश फल (Lagna Lord Phala) -->
            <div class="report-shloka-card">
                <div class="shloka-card-header">
                    <span class="shloka-badge">प्रथम भाव (लग्नेश फल)</span>
                    <strong class="shloka-title">लग्नेश (${lagnesh.lordName}) : भाव ${toNepaliDigits(lagnesh.currentHouse)} मा स्थित फल</strong>
                </div>
                ${lagneshShloka ? `
                <div class="report-shloka-box">
                    <div class="shloka-source-tag">॥ बृहत्पाराशर होराशास्त्र / मानसागरी प्रमाण ॥</div>
                    <div class="shloka-sanskrit-verse">${convertPreetiToUnicode(lagneshShloka)}</div>
                </div>` : ''}
                <div class="shloka-interpretation">
                    <strong>नेपाली अनुवाद तथा फलादेश:</strong>
                    लग्नेश कुण्डलीको ${toNepaliDigits(lagnesh.currentHouse)} भावमा बस्नाले जातक शारीरिक रूपमा सुदृढ, आत्मविश्वासी, दृढ सङ्कल्पवान् र समाजमा सम्मानित हुनेछन् । आफ्नो पराक्रम र विद्याबाट जीवनमा विशिष्ट सफलता प्राप्त हुनेछ ।
                </div>
            </div>

            <!-- २. भाग्येश फल (9th Lord Phala) -->
            <div class="report-shloka-card">
                <div class="shloka-card-header">
                    <span class="shloka-badge">नवम भाव (भाग्येश फल)</span>
                    <strong class="shloka-title">भाग्येश (${bhagyash.lordName}) : भाव ${toNepaliDigits(bhagyash.currentHouse)} मा स्थित फल</strong>
                </div>
                ${bhagyashShloka ? `
                <div class="report-shloka-box">
                    <div class="shloka-source-tag">॥ मानसागरी प्रमाण ॥</div>
                    <div class="shloka-sanskrit-verse">${convertPreetiToUnicode(bhagyashShloka)}</div>
                </div>` : ''}
                <div class="shloka-interpretation">
                    <strong>नेपाली अनुवाद तथा फलादेश:</strong>
                    भाग्यभावको स्वामी ग्रह ${toNepaliDigits(bhagyash.currentHouse)} भावमा रहँदा जातक धर्मपरायण, ईश्वरभक्त, गुरुजनप्रति निष्ठावान् र भाग्यमानी रहनेछन् । सत्कर्म र पुरुषार्थद्वारा जीवनमा प्रचुर समृद्धि र मान-प्रतिष्ठा आर्जन हुनेछ ।
                </div>
            </div>

            <!-- ३. कर्मेश फल (10th Lord Phala) -->
            <div class="report-shloka-card">
                <div class="shloka-card-header">
                    <span class="shloka-badge">दशम भाव (कर्मेश फल)</span>
                    <strong class="shloka-title">कर्मेश (${karmesh.lordName}) : भाव ${toNepaliDigits(karmesh.currentHouse)} मा स्थित फल</strong>
                </div>
                ${karmeshShloka ? `
                <div class="report-shloka-box">
                    <div class="shloka-source-tag">॥ महर्षि पराशर सूत्र प्रमाण ॥</div>
                    <div class="shloka-sanskrit-verse">${convertPreetiToUnicode(karmeshShloka)}</div>
                </div>` : ''}
                <div class="shloka-interpretation">
                    <strong>नेपाली अनुवाद तथा फलादेश:</strong>
                    कर्मक्षेत्रको स्वामी ग्रह शुभ स्थानमा रहँदा जातकको पेशा, व्यवसाय तथा प्रशासनिक दायित्वमा निरन्तर उन्नति रहनेछ । कुलको कीर्ति बढाउने, जिम्मेवार र न्यायप्रिय व्यक्तित्व बन्ने योग बन्दछ ।
                </div>
            </div>

            <!-- ४. सूर्य ग्रहको भावगत फल (Sun Placement) -->
            <div class="report-shloka-card">
                <div class="shloka-card-header">
                    <span class="shloka-badge">ग्रहगत फल</span>
                    <strong class="shloka-title">सूर्य ग्रह : भाव ${toNepaliDigits(suryaHouse)} मा स्थित फल प्रभाव</strong>
                </div>
                ${suryaShloka ? `
                <div class="report-shloka-box">
                    <div class="shloka-source-tag">॥ मानसागरी प्रमाण ॥</div>
                    <div class="shloka-sanskrit-verse">${convertPreetiToUnicode(suryaShloka)}</div>
                </div>` : ''}
                <div class="shloka-interpretation">
                    <strong>नेपाली फल:</strong> ${suryaInterp[0]}<br>
                    <span class="text-emerald-800"><strong>शुभ फल:</strong> ${suryaInterp[1]}</span> | 
                    <span class="text-rose-800"><strong>सावधानी:</strong> ${suryaInterp[2]}</span>
                </div>
            </div>
        </div>
        `;
    }

    function getHouseLordInfo(houseNum, lagnaId, planets) {
        const houseRashiId = ((lagnaId - 1 + (houseNum - 1)) % 12) + 1;
        const rashiObj = (typeof RASHIS !== "undefined" && RASHIS[houseRashiId - 1]) ? RASHIS[houseRashiId - 1] : { lord: "सूर्य" };
        const lordName = rashiObj.lord;

        const lordToKey = {
            "सूर्य": "Surya", "चन्द्र": "Chandra", "मङ्गल": "Mangal",
            "बुध": "Budha", "गुरु": "Guru", "शुक्र": "Shukra", "शनि": "Shani"
        };
        const key = lordToKey[lordName];
        let currentHouse = 1;
        if (key && planets[key]) {
            const pDeg = planets[key].deg;
            const pRashiId = typeof getRashiDetails === "function" ? getRashiDetails(pDeg).rashiId : (Math.floor(pDeg / 30) + 1);
            currentHouse = typeof getHouseOfPlanet === "function" ? getHouseOfPlanet(pRashiId, lagnaId) : 1;
        }

        return {
            houseNum,
            rashiId: houseRashiId,
            lordName,
            currentHouse
        };
    }

    function getVerifiedShloka(key) {
        if (typeof BHAVESH_SHLOKAS !== "undefined" && BHAVESH_SHLOKAS[key]) {
            return BHAVESH_SHLOKAS[key];
        }
        return "";
    }

    // ==========================================
    // १०. पृष्ठ: योग-दोष विचार, अनुकूलता एवं शास्त्रीय उपाय
    // (Final Page: Yogas, Doshas, Remedies & Closing)
    // ==========================================
    function buildRemediesPageHTML(data, config) {
        const moonRashiId = (data.moonRashi && data.moonRashi.rashiId) || 1;
        const luckyInfo = (typeof LUCKY_FACTORS_DATA !== "undefined" && LUCKY_FACTORS_DATA[moonRashiId]) || {
            color: "रातो, पहेँलो",
            stone: "माणिक्य वा मुगा",
            metal: "स्वर्ण / तामा",
            day: "आइतबार, मंगलबार",
            deity: "श्री सूर्य / श्री हनुमान्",
            mantra: "ॐ सूर्याय नमः"
        };

        const isManglik = data.manglik ? data.manglik.isManglik : Boolean(data.isManglik);

        return `
        <div class="report-section-page">
            <div class="section-page-header">
                <h3 class="section-title">🌿 योग-दोष विचार, ग्रहानुकूलता एवं वैदिक उपाय</h3>
                <p class="section-sub">जीवन सन्तुलन, ग्रहशान्ति, शुभ रत्न तथा शास्त्रीय आध्यात्मिक विधान</p>
                <div class="header-divider-line"></div>
            </div>

            <!-- १. माङ्गलिक दोष विचार (Mangal Dosha Consideration) -->
            <div class="report-remedy-box">
                <div class="remedy-box-header">
                    <span class="remedy-icon">⚔️</span>
                    <strong class="remedy-title">माङ्गलिक दोष विचार:</strong>
                    <span class="${isManglik ? 'badge-manglik-yes' : 'badge-manglik-no'}">
                        ${isManglik ? 'माङ्गलिक कुण्डली' : 'अमाङ्गलिक (शुभ/निर्दोष)'}
                    </span>
                </div>
                <p class="remedy-desc">
                    ${isManglik
                        ? "कुण्डलीमा मङ्गल ग्रह विशेष स्थानमा रहेकाले माङ्गलिक योग देखिन्छ । विवाह मिलान गर्दा वर-कन्या दुवैको कुण्डली गुण मिलान एवं मङ्गल परिहार विचार गरी निर्णय लिनु श्रेयस्कर हुनेछ ।"
                        : "कुण्डलीमा मङ्गल दोष छैन । दाम्पत्य भावमा मङ्गलको अशुभ प्रभाव नदेखिनाले दाम्पत्य जीवन शुभ, सन्तुलित र सुखद रहनेछ ।"
                    }
                </p>
            </div>

            <!-- २. ग्रहानुकूलता तालिका (Auspicious Elements Table) -->
            <div class="report-table-box" style="margin-top: 10px;">
                <div class="table-box-title">॥ जातकका लागि शुभ एवं अनुकूल तत्वहरू ॥</div>
                <table class="report-data-table compact-table">
                    <tbody>
                        <tr>
                            <td class="font-bold lbl-col">इष्टदेव / आराध्य:</td>
                            <td class="val-col font-bold text-maroon">${luckyInfo.deity || "श्री गणेश / श्री नारायण"}</td>
                            <td class="font-bold lbl-col">शुभ रत्न (Life Stone):</td>
                            <td class="val-col font-bold text-dark">${luckyInfo.stone || "माणिक्य / पोखराज"}</td>
                        </tr>
                        <tr>
                            <td class="font-bold lbl-col">शुभ धातु:</td>
                            <td class="val-col">${luckyInfo.metal || "स्वर्ण / तामा"}</td>
                            <td class="font-bold lbl-col">शुभ रङ्ग:</td>
                            <td class="val-col">${luckyInfo.color || "पहेँलो, रातो, श्वेत"}</td>
                        </tr>
                        <tr>
                            <td class="font-bold lbl-col">शुभ वार:</td>
                            <td class="val-col">${luckyInfo.day || "आइतबार, बिहीबार"}</td>
                            <td class="font-bold lbl-col">वैदिक मूल मन्त्र:</td>
                            <td class="val-col font-bold text-maroon font-serif">${luckyInfo.mantra || "॥ ॐ नमो भगवते वासुदेवाय ॥"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ३. सामान्य ग्रह शान्ति एवं दैनिक साधना विधान -->
            <div class="report-remedy-box" style="margin-top: 12px;">
                <div class="remedy-box-header">
                    <span class="remedy-icon">🕉️</span>
                    <strong class="remedy-title">दैनिक वैदिक साधना एवं आध्यात्मिक उपाय:</strong>
                </div>
                <ul class="remedy-list">
                    <li><strong>सूर्योपासना:</strong> प्रतिदिन प्रातःकालमा तामाको पात्रबाट भगवान् सूर्यलाई जल अर्पण (अर्घ्य) गरी गायत्री मन्त्रको जप गर्नु सर्वाङ्गीण स्वास्थ्य र यशका लागि उत्तम हुनेछ ।</li>
                    <li><strong>मातापिता सेवा:</strong> मातापिता र गुरुजनहरूको आशीर्वाद लिनु तथा कुलदेवताको नियमित स्मरण गर्नु सबैभन्दा ठूलो ग्रह रक्षा कवच मानिन्छ ।</li>
                    <li><strong>दान एवं परोपकार:</strong> औंसी, पूर्णिमा वा संक्रान्ति पर्वहरूमा गाईलाई घाँस, पशुपन्छीलाई दाना र असहायहरूलाई भोजन गराउनाले कुण्डलीका अरिष्टहरू नष्ट हुन्छन् ।</li>
                </ul>
            </div>

            <!-- ४. अन्तिम आशिर्वचन एवं पूर्णता उद्घोष -->
            <div class="report-closing-benediction">
                <div class="closing-verse">
                    ॥ ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥<br>
                    ॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥<br>
                    ॥ ॐ शान्तिः शान्तिः शान्तिः ॥
                </div>
                <div class="closing-sign-line">
                    <div class="sign-block">
                        <span class="sign-tag">ज्योतिषी / प्रमाणीकरण:</span>
                        <strong class="sign-name" style="font-size: 1.05rem; color: #881337;">${(fullReportConfig && fullReportConfig.astrologerName) || (typeof localStorage !== 'undefined' && localStorage.getItem('vedashchakshu_astrologer_name')) || "पं. ज्योतिषाचार्य"}</strong>
                        <span class="sign-sub" style="display: block; font-size: 0.74rem; color: #78350F; margin-top: 2px;">वेदश्चक्षु वैदिक ज्योतिष अनुसन्धान केन्द्र</span>
                    </div>
                    <div class="sign-block" style="text-align: right;">
                        <span class="sign-tag">ज्योतिषी हस्ताक्षर:</span>
                        <span class="sign-line" style="display: inline-block; border-bottom: 1.5px dotted #78350F; width: 140px; margin-bottom: 4px;"></span>
                        <div style="font-size: 0.74rem; color: #78350F;">प्रतिवेदन मिति: <strong class="font-mono">${toNepaliDigits(data.bsYear || new Date().getFullYear())} साल (वि.सं.)</strong></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // ==========================================
    // ११. मोडल खोल्ने, बन्द गर्ने र पूर्वावलोकन
    // (Modal & Preview Event Handlers)
    // ==========================================
    function openFullReportConfigModal() {
        if (!window.currentKundaliData) {
            if (typeof showSiddhantaNotice === "function") {
                showSiddhantaNotice("कृपया पहिले जन्म विवरण भरेर कुण्डली निर्माण गर्नुहोस्।", "warning");
            } else {
                alert("कृपया पहिले जन्म विवरण भरेर कुण्डली निर्माण गर्नुहोस्।");
            }
            return;
        }

        const modal = document.getElementById("fullReportConfigModal");
        if (modal) {
            modal.style.display = "flex";
            syncConfigUI();
        }
    }

    function closeFullReportConfigModal() {
        const modal = document.getElementById("fullReportConfigModal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    function openFullReportPreviewModal() {
        if (!window.currentKundaliData) {
            openFullReportConfigModal();
            return;
        }

        readConfigFromUI();
        const modal = document.getElementById("fullReportPreviewModal");
        if (!modal) return;

        closeFullReportConfigModal();
        renderFullReportPreview();
        modal.style.display = "flex";
    }

    function closeFullReportPreviewModal() {
        const modal = document.getElementById("fullReportPreviewModal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    function syncConfigUI() {
        // Sync checkboxes
        Object.keys(fullReportConfig.charts).forEach(chartId => {
            const chk = document.querySelector(`input[data-chart="${chartId}"]`);
            if (chk) chk.checked = fullReportConfig.charts[chartId];
        });

        Object.keys(fullReportConfig.sections).forEach(secId => {
            const chk = document.querySelector(`input[data-sec="${secId}"]`);
            if (chk) chk.checked = fullReportConfig.sections[secId];
        });

        const langSel = document.getElementById("reportLanguageSelect");
        if (langSel) langSel.value = fullReportConfig.lang;

        const layoutSel = document.getElementById("reportChartsLayout");
        if (layoutSel) layoutSel.value = fullReportConfig.chartsLayout;

        const astroInput = document.getElementById("reportAstrologerName");
        if (astroInput) astroInput.value = fullReportConfig.astrologerName || "पं. ज्योतिषाचार्य";

        const dashaSel = document.getElementById("reportDashaScope");
        if (dashaSel) dashaSel.value = fullReportConfig.dashaScope;

        updateSelectionBadges();
    }

    function readConfigFromUI() {
        document.querySelectorAll("input[data-chart]").forEach(chk => {
            const chartId = chk.dataset.chart;
            if (chartId) fullReportConfig.charts[chartId] = chk.checked;
        });

        document.querySelectorAll("input[data-sec]").forEach(chk => {
            const secId = chk.dataset.sec;
            if (secId) fullReportConfig.sections[secId] = chk.checked;
        });

        const langSel = document.getElementById("reportLanguageSelect");
        if (langSel) fullReportConfig.lang = langSel.value;

        const layoutSel = document.getElementById("reportChartsLayout");
        if (layoutSel) fullReportConfig.chartsLayout = layoutSel.value;

        const astroInput = document.getElementById("reportAstrologerName");
        if (astroInput) {
            fullReportConfig.astrologerName = astroInput.value.trim() || "पं. ज्योतिषाचार्य";
            try {
                localStorage.setItem("vedashchakshu_astrologer_name", fullReportConfig.astrologerName);
            } catch (e) {}
        }

        const dashaSel = document.getElementById("reportDashaScope");
        if (dashaSel) fullReportConfig.dashaScope = dashaSel.value;

        updateSelectionBadges();
    }

    function updateSelectionBadges() {
        let chartCount = 0;
        Object.keys(fullReportConfig.charts).forEach(k => {
            if (fullReportConfig.charts[k]) chartCount++;
        });

        let secCount = 0;
        Object.keys(fullReportConfig.sections).forEach(k => {
            if (fullReportConfig.sections[k]) secCount++;
        });

        const chartBadge = document.getElementById("selectedChartsCountBadge");
        if (chartBadge) chartBadge.textContent = `${toNepaliDigits(chartCount)} छानिएका`;

        const secBadge = document.getElementById("selectedSectionsCountBadge");
        if (secBadge) secBadge.textContent = `${toNepaliDigits(secCount)} खण्डहरू`;

        // Estimate pages
        let estPages = 0;
        if (fullReportConfig.sections.cover) estPages++;
        if (fullReportConfig.sections.grahaSpashta || fullReportConfig.sections.panchadhaMaitri) estPages++;
        if (fullReportConfig.sections.charts) {
            const cpp = fullReportConfig.chartsLayout === '6perpage' ? 6 : (fullReportConfig.chartsLayout === '1perpage' ? 1 : (fullReportConfig.chartsLayout === '2perpage' ? 2 : 4));
            estPages += Math.ceil(chartCount / cpp);
        }
        if (fullReportConfig.sections.vimshottariDasha) estPages++;
        if (fullReportConfig.sections.tribhagiDasha) estPages++;
        if (fullReportConfig.sections.yoginiDasha) estPages++;
        if (fullReportConfig.sections.dashaPhaladesh) {
            estPages += (fullReportConfig.dashaScope === 'current' ? 5 : 21);
        }
        if (fullReportConfig.sections.shlokasPhaladesh || fullReportConfig.sections.bhavaPhaladesh) estPages++;
        if (fullReportConfig.sections.yogasAndDoshas || fullReportConfig.sections.remedies) estPages++;

        const estBadge = document.getElementById("configPageEstimateBadge");
        if (estBadge) {
            estBadge.innerHTML = `अनुमानित पृष्ठहरू: <strong>~${toNepaliDigits(estPages)} पाना</strong> (A4 Portrait)`;
        }

        const previewPageNum = document.getElementById("previewTotalPagesNum");
        if (previewPageNum) previewPageNum.textContent = toNepaliDigits(estPages);
    }

    /**
     * पूर्वावलोकन मोडलमा A4 पृष्ठहरू रेन्डर गर्छ
     */
    function renderFullReportPreview() {
        const wrap = document.getElementById("reportPreviewSheetsWrap");
        if (!wrap || !window.currentKundaliData) return;

        wrap.innerHTML = `<div style="text-align: center; padding: 40px; color: #fff; font-size: 1.2rem;">⏳ प्रतिवेदन निर्माण हुँदैछ...</div>`;

        setTimeout(() => {
            const pagesHtml = buildFullReportPages(window.currentKundaliData, fullReportConfig);
            wrap.innerHTML = pagesHtml.join('');

            applyZoom();

            const previewPageNum = document.getElementById("previewTotalPagesNum");
            if (previewPageNum) previewPageNum.textContent = toNepaliDigits(pagesHtml.length);
        }, 50);
    }

    function applyZoom() {
        const wrap = document.getElementById("reportPreviewSheetsWrap");
        const zoomText = document.getElementById("previewZoomVal");
        if (wrap) {
            wrap.style.transform = `scale(${reportZoomLevel})`;
            wrap.style.transformOrigin = 'top center';
        }
        if (zoomText) {
            zoomText.textContent = `${Math.round(reportZoomLevel * 100)}%`;
        }
    }

    // ==========================================
    // १२. प्रिन्ट तथा PDF डाउनलोड प्रणाली
    // (Print & PDF Export Workflow)
    // ==========================================
    function printFullReport() {
        if (!window.currentKundaliData) {
            openFullReportConfigModal();
            return;
        }

        readConfigFromUI();
        const printContainer = document.getElementById("fullReportPrintContainer");
        if (!printContainer) return;

        // Generate full report pages
        const pagesHtml = buildFullReportPages(window.currentKundaliData, fullReportConfig);
        printContainer.innerHTML = pagesHtml.join('');

        const originalTitle = document.title;
        const nativeName = (window.currentKundaliData.name || "Jataka").replace(/[^a-zA-Z0-9\u0900-\u097F_-]/g, "_");
        document.title = `Janmapatrika_Sampurna_${nativeName}`;

        // Ensure clean print state
        document.body.classList.remove("printing-patrika-only");
        document.body.classList.add("printing-full-report");
        isFullReportPrinting = true;

        let cleaned = false;
        const cleanupPrint = () => {
            if (cleaned) return;
            cleaned = true;
            document.body.classList.remove("printing-full-report");
            document.title = originalTitle;
            setTimeout(() => {
                if (!isFullReportPrinting) {
                    printContainer.innerHTML = '';
                }
            }, 1500);
            isFullReportPrinting = false;
            window.removeEventListener("afterprint", cleanupPrint);
        };
        window.addEventListener("afterprint", cleanupPrint);

        // Allow layout and background images to fully rasterize before invoking print
        setTimeout(() => {
            window.print();
            setTimeout(cleanupPrint, 3500);
        }, 320);
    }

    function downloadFullReportPDF() {
        if (!window.currentKundaliData) {
            openFullReportConfigModal();
            return;
        }

        // Show friendly user toast guidance
        if (typeof showSiddhantaNotice === "function") {
            showSiddhantaNotice("PDF सेभ गर्न खुल्ने प्रिन्ट विन्डोमा 'Destination / Printer' बाट 'Save as PDF' छान्नुहोस् ।", "info");
        }

        // Trigger printing directly which invokes system Save As PDF
        setTimeout(() => {
            printFullReport();
        }, 200);
    }

    // ==========================================
    // १३. बटन तथा इभेन्ट श्रोताहरू दर्ता (Event Listeners)
    // ==========================================
    function initFullReportEvents() {
        // Main action button on Kundali page
        const openConfigBtn = document.getElementById("openFullReportConfigBtn");
        if (openConfigBtn) openConfigBtn.addEventListener("click", openFullReportConfigModal);

        const previewReportBtn = document.getElementById("previewFullReportBtn");
        if (previewReportBtn) previewReportBtn.addEventListener("click", openFullReportPreviewModal);

        const quickKundalisBtn = document.getElementById("quickSelectKundalisBtn");
        if (quickKundalisBtn) {
            quickKundalisBtn.addEventListener("click", () => {
                openFullReportConfigModal();
                setTimeout(() => {
                    const el = document.getElementById("chartsChecklistGrid");
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });
        }

        const quickPhaladeshBtn = document.getElementById("quickSelectPhaladeshBtn");
        if (quickPhaladeshBtn) {
            quickPhaladeshBtn.addEventListener("click", () => {
                openFullReportConfigModal();
                setTimeout(() => {
                    const el = document.querySelector(".sections-checklist-list");
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });
        }

        const directDownloadBtn = document.getElementById("directDownloadPdfBtn");
        if (directDownloadBtn) directDownloadBtn.addEventListener("click", downloadFullReportPDF);

        const directPrintBtn = document.getElementById("directPrintFullReportBtn");
        if (directPrintBtn) directPrintBtn.addEventListener("click", printFullReport);

        // Config Modal Buttons
        const closeConfigBtn = document.getElementById("closeFullReportConfigBtn");
        if (closeConfigBtn) closeConfigBtn.addEventListener("click", closeFullReportConfigModal);

        const cancelConfigBtn = document.getElementById("cancelFullReportConfigBtn");
        if (cancelConfigBtn) cancelConfigBtn.addEventListener("click", closeFullReportConfigModal);

        const modalPreviewBtn = document.getElementById("modalPreviewReportBtn");
        if (modalPreviewBtn) modalPreviewBtn.addEventListener("click", openFullReportPreviewModal);

        const modalDownloadBtn = document.getElementById("modalDownloadPdfBtn");
        if (modalDownloadBtn) modalDownloadBtn.addEventListener("click", () => {
            readConfigFromUI();
            closeFullReportConfigModal();
            downloadFullReportPDF();
        });

        const modalPrintBtn = document.getElementById("modalPrintReportBtn");
        if (modalPrintBtn) modalPrintBtn.addEventListener("click", () => {
            readConfigFromUI();
            closeFullReportConfigModal();
            printFullReport();
        });

        // Config Quick Select / Clear Buttons
        const selectAllChartsBtn = document.getElementById("selectAllChartsBtn");
        if (selectAllChartsBtn) {
            selectAllChartsBtn.addEventListener("click", () => {
                document.querySelectorAll("input[data-chart]").forEach(c => c.checked = true);
                readConfigFromUI();
            });
        }

        const selectDefaultChartsBtn = document.getElementById("selectDefaultChartsBtn");
        if (selectDefaultChartsBtn) {
            selectDefaultChartsBtn.addEventListener("click", () => {
                document.querySelectorAll("input[data-chart]").forEach(c => {
                    c.checked = (c.dataset.chart === 'd1' || c.dataset.chart === 'chandra' || c.dataset.chart === 'd9');
                });
                readConfigFromUI();
            });
        }

        const clearAllChartsBtn = document.getElementById("clearAllChartsBtn");
        if (clearAllChartsBtn) {
            clearAllChartsBtn.addEventListener("click", () => {
                document.querySelectorAll("input[data-chart]").forEach(c => c.checked = false);
                readConfigFromUI();
            });
        }

        const selectAllSectionsBtn = document.getElementById("selectAllSectionsBtn");
        if (selectAllSectionsBtn) {
            selectAllSectionsBtn.addEventListener("click", () => {
                document.querySelectorAll("input[data-sec]").forEach(c => c.checked = true);
                readConfigFromUI();
            });
        }

        const selectStandardSectionsBtn = document.getElementById("selectStandardSectionsBtn");
        if (selectStandardSectionsBtn) {
            selectStandardSectionsBtn.addEventListener("click", () => {
                document.querySelectorAll("input[data-sec]").forEach(c => {
                    c.checked = true;
                });
                readConfigFromUI();
            });
        }

        // Preview Modal Controls
        const closePreviewBtn = document.getElementById("closeFullReportPreviewBtn");
        if (closePreviewBtn) closePreviewBtn.addEventListener("click", closeFullReportPreviewModal);

        const previewBackBtn = document.getElementById("previewBackToConfigBtn");
        if (previewBackBtn) {
            previewBackBtn.addEventListener("click", () => {
                closeFullReportPreviewModal();
                openFullReportConfigModal();
            });
        }

        const previewDownloadBtn = document.getElementById("previewDownloadPdfBtn");
        if (previewDownloadBtn) previewDownloadBtn.addEventListener("click", downloadFullReportPDF);

        const previewPrintBtn = document.getElementById("previewPrintBtn");
        if (previewPrintBtn) previewPrintBtn.addEventListener("click", printFullReport);

        // Zoom Controls
        const zoomInBtn = document.getElementById("previewZoomInBtn");
        if (zoomInBtn) {
            zoomInBtn.addEventListener("click", () => {
                if (reportZoomLevel < 1.6) {
                    reportZoomLevel += 0.1;
                    applyZoom();
                }
            });
        }

        const zoomOutBtn = document.getElementById("previewZoomOutBtn");
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener("click", () => {
                if (reportZoomLevel > 0.45) {
                    reportZoomLevel -= 0.1;
                    applyZoom();
                }
            });
        }

        const zoomResetBtn = document.getElementById("previewZoomResetBtn");
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener("click", () => {
                reportZoomLevel = 1.0;
                applyZoom();
            });
        }

        // Listen for changes in inputs to update badges
        document.addEventListener("change", (e) => {
            if (e.target && (e.target.matches("input[data-chart]") || e.target.matches("input[data-sec]") || e.target.id === "reportChartsLayout" || e.target.id === "reportAstrologerName")) {
                readConfigFromUI();
            }
        });

        document.addEventListener("input", (e) => {
            if (e.target && e.target.id === "reportAstrologerName") {
                fullReportConfig.astrologerName = e.target.value.trim() || "पं. ज्योतिषाचार्य";
                try {
                    localStorage.setItem("vedashchakshu_astrologer_name", fullReportConfig.astrologerName);
                } catch (err) {}
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFullReportEvents);
    } else {
        initFullReportEvents();
    }

    // Export globally for interoperability
    window.openFullReportConfigModal = openFullReportConfigModal;
    window.closeFullReportConfigModal = closeFullReportConfigModal;
    window.openFullReportPreviewModal = openFullReportPreviewModal;
    window.closeFullReportPreviewModal = closeFullReportPreviewModal;
    window.printFullReport = printFullReport;
    window.downloadFullReportPDF = downloadFullReportPDF;
    window.convertPreetiToUnicode = convertPreetiToUnicode;
    window.buildFullReportPages = buildFullReportPages;
    window.fullReportConfig = fullReportConfig;

})();

