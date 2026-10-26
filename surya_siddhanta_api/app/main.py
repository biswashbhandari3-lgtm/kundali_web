from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
import math
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from app.skyvision_bridge import SkyVisionEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skyvision_api")

app = FastAPI(
    title="SkyVision Vedic Astrology Engine API",
    description=(
        "Standard high-precision Vedic astrology API based on the SKYVISION 2.0 engine "
        "(Astro_function.dll & Swiss Ephemeris), supporting both Classical Surya Siddhanta "
        "and Drik Siddhanta."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIGNS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena",
]
SIGNS_NE = [
    "मेष", "वृष", "मिथुन", "कर्कट", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha",
    "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha",
    "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati",
]
NAKSHATRAS_NE = [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा",
    "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी",
    "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा",
    "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढा", "उत्तराषाढा",
    "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपदा",
    "उत्तराभाद्रपदा", "रेवती",
]

TITHIS_NE = [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी",
    "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
    "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी",
    "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी",
    "त्रयोदशी", "चतुर्दशी", "औँसी",
]

YOGAS_NE = [
    "विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड",
    "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव",
    "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्",
    "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल",
    "ब्रह्म", "ऐन्द्र", "वैधृति",
]

KARANAS_NE = [
    "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)",
    "शकुनि", "चतुष्पाद", "नाग", "किंस्तुघ्न",
]

DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_LORDS_NE = ["केतु", "शुक्र", "सूर्य", "चन्द्र", "मङ्गल", "राहु", "गुरु", "शनि", "बुध"]
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}

class BirthChartRequest(BaseModel):
    birth_datetime: datetime = Field(..., description="Local birth time with UTC offset, e.g. 2026-10-17T06:30:00+05:45")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone_name: Optional[str] = Field(None, description="IANA timezone, e.g. Asia/Kathmandu")
    name: Optional[str] = None
    siddhanta: str = Field("surya", description="'surya' for Surya Siddhanta, 'drik' for Drik Siddhanta")
    ayanamsa: Optional[str] = None

    @field_validator("birth_datetime")
    @classmethod
    def require_timezone(cls, v: datetime):
        if v.tzinfo is None or v.utcoffset() is None:
            raise ValueError("birth_datetime must include UTC offset, e.g. +05:45")
        return v

def norm360(val: float) -> float:
    return float(val) % 360.0

def sign_info(longitude: float) -> dict[str, Any]:
    lon = norm360(longitude)
    idx = int(lon // 30)
    deg_in_sign = lon % 30.0
    return {
        "index": idx + 1,
        "name": SIGNS[idx],
        "name_ne": SIGNS_NE[idx],
        "degree_in_sign": round(deg_in_sign, 6),
        "longitude": round(lon, 6),
    }

def nakshatra_info(longitude: float) -> dict[str, Any]:
    span = 360.0 / 27.0
    lon = norm360(longitude)
    idx = min(26, int(lon / span))
    within = lon - idx * span
    pada = min(4, int(within / (span / 4)) + 1)
    return {
        "index": idx + 1,
        "name": NAKSHATRAS[idx],
        "name_ne": NAKSHATRAS_NE[idx],
        "pada": pada,
        "longitude": round(lon, 6),
    }

def calculate_panchanga_elements(sun_deg: float, moon_deg: float) -> dict[str, Any]:
    diff = norm360(moon_deg - sun_deg)
    sum_deg = norm360(moon_deg + sun_deg)

    # Tithi: 0-360 / 12 = 0 to 29.99
    tithi_idx = int(diff // 12)
    tithi_deg = diff % 12.0
    paksha = "शुक्ल पक्ष" if tithi_idx < 15 else "कृष्ण पक्ष"
    tithi_name = TITHIS_NE[tithi_idx % 30]

    # Nakshatra
    nak_idx = int(moon_deg // (360.0 / 27.0))
    nak_name = NAKSHATRAS_NE[nak_idx % 27]

    # Yoga: (Moon + Sun) / (360/27)
    yoga_idx = int(sum_deg // (360.0 / 27.0))
    yoga_name = YOGAS_NE[yoga_idx % 27]

    # Karana: half tithi (6 degrees each)
    karana_idx = int(diff // 6)
    if karana_idx == 0:
        karana_name = "किंस्तुघ्न"
    elif karana_idx >= 57:
        if karana_idx == 57:
            karana_name = "शकुनि"
        elif karana_idx == 58:
            karana_name = "चतुष्पाद"
        else:
            karana_name = "नाग"
    else:
        # Movable karana: 1 to 7 repeating
        movable_idx = (karana_idx - 1) % 7
        karana_name = KARANAS_NE[movable_idx]

    return {
        "paksha": paksha,
        "tithi": {
            "index": tithi_idx + 1,
            "name_ne": tithi_name,
            "progress_percent": round((tithi_deg / 12.0) * 100.0, 2),
        },
        "nakshatra": {
            "index": nak_idx + 1,
            "name_ne": nak_name,
        },
        "yoga": {
            "index": yoga_idx + 1,
            "name_ne": yoga_name,
        },
        "karana": {
            "index": karana_idx + 1,
            "name_ne": karana_name,
        },
    }

def vimshottari_dasha(moon_longitude: float) -> dict[str, Any]:
    span = 360.0 / 27.0
    idx = int(norm360(moon_longitude) / span)
    lord = DASHA_LORDS[idx % 9]
    lord_ne = DASHA_LORDS_NE[idx % 9]
    elapsed_fraction = (norm360(moon_longitude) % span) / span
    remaining_fraction = 1.0 - elapsed_fraction
    balance = DASHA_YEARS[lord] * remaining_fraction
    return {
        "system": "Vimshottari",
        "birth_mahadasha_lord": lord,
        "birth_mahadasha_lord_ne": lord_ne,
        "balance_years_at_birth": round(balance, 4),
    }

@app.get("/api/v1/health")
@app.get("/health")
def health():
    try:
        eng = SkyVisionEngine.get_instance()
        return {"status": "ok", "engine_loaded": True, "engine_type": "SkyVision 32-bit Native Engine"}
    except Exception as exc:
        return {"status": "error", "engine_loaded": False, "detail": str(exc)}


@app.post("/api/v1/chart")
def create_chart(req: BirthChartRequest):
    dt = req.birth_datetime
    # Determine siddhanta mode
    sid_mode = req.siddhanta.lower()
    if req.ayanamsa and "surya" in req.ayanamsa.lower():
        sid_mode = "surya"

    eng = SkyVisionEngine.get_instance()
    iso_str = dt.strftime("%Y-%m-%dT%H:%M:%S")

    try:
        raw_res = eng.calculate(iso_str, req.latitude, req.longitude, sid_mode)
    except Exception as exc:
        logger.exception("Calculation error in SkyVisionEngine")
        raise HTTPException(status_code=500, detail=f"Calculation engine error: {exc}")

    planets = raw_res["kundali_planets"]
    lagna_deg = raw_res["lagna_deg"]
    ayanamsha_deg = raw_res["ayanamsha"]

    sun_deg = planets["Surya"]["deg"]
    moon_deg = planets["Chandra"]["deg"]

    # Structured details for grahas
    graha_sthiti: dict[str, Any] = {}
    name_map = {
        "Surya": "Sun", "Chandra": "Moon", "Mangal": "Mars",
        "Budha": "Mercury", "Guru": "Jupiter", "Shukra": "Venus",
        "Shani": "Saturn", "Rahu": "Rahu", "Ketu": "Ketu",
    }
    for np_name, pdata in planets.items():
        en_name = name_map.get(np_name, np_name)
        graha_sthiti[en_name] = {
            "longitude": pdata["deg"],
            "rashi": sign_info(pdata["deg"]),
            "nakshatra": nakshatra_info(pdata["deg"]),
            "is_retrograde": pdata.get("isRetrograde", False),
        }

    # Panchanga details
    panchanga = calculate_panchanga_elements(sun_deg, moon_deg)

    # 12 Houses (Bhavas)
    houses = []
    first_sign = int(lagna_deg // 30)
    for h in range(1, 13):
        idx = (first_sign + h - 1) % 12
        houses.append({
            "house": h,
            "rashi": SIGNS[idx],
            "rashi_ne": SIGNS_NE[idx],
            "cusp_degree": round(raw_res["houses"][h - 1], 6) if h - 1 < len(raw_res.get("houses", [])) else None,
        })

    siddhanta_title = "सूर्य-सिद्धान्त (Surya Siddhanta - SkyVision Standard)" if sid_mode == "surya" else "दृक्-सिद्धान्त (Drik Siddhanta - SkyVision/SwissEph)"

    return {
        "api_version": "v2",
        "engine": "SKYVISION 2.0 (Astro_function.dll)",
        "siddhanta": siddhanta_title,
        "siddhanta_mode": sid_mode,
        "birth": {
            "name": req.name,
            "datetime_local": dt.isoformat(),
            "datetime_utc": dt.astimezone(timezone.utc).isoformat(),
            "timezone_name": req.timezone_name,
            "latitude": req.latitude,
            "longitude": req.longitude,
        },
        "ayanamsha": {
            "degrees": round(ayanamsha_deg, 6),
            "label": "SkyVision Calibrated Traditional Ayanamsha" if sid_mode == "surya" else "Lahiri / SwissEphemeris Ayanamsha",
        },
        "lagna_deg": round(lagna_deg, 6),
        "lagna": {
            "longitude": round(lagna_deg, 6),
            "rashi": sign_info(lagna_deg),
        },
        "kundali_planets": planets,
        "graha_sthiti": graha_sthiti,
        "panchanga": panchanga,
        "bhava_chakra": houses,
        "vimshottari_dasha_seed": vimshottari_dasha(moon_deg),
        "sun_times": {
            "sunrise_hour": round(raw_res.get("sunrise_hour", 6.0), 4),
            "sunset_hour": round(raw_res.get("sunset_hour", 18.0), 4),
        },
    }

import os
from fastapi.staticfiles import StaticFiles

WEB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if os.path.exists(os.path.join(WEB_DIR, "index.html")):
    logger.info(f"Mounting Kundali Web static files from: {WEB_DIR}")
    app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="static_web")

