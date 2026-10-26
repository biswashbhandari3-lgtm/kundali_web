# Surya Siddhanta China API

A self-hosted FastAPI microservice for generating Jyotisha birth-chart data according to the classical **Surya Siddhanta (सूर्य-सिद्धान्त)** planetary principles, using the `kiranojhanp/surya-siddanta` Python engine.

---

## Features

- **Full Navagraha Calculation**: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu (Mean Lunar Node), and Ketu.
- **Accurate Nirayana Lagna (Ascendant)** calculation using Surya Siddhanta sidereal time and geographic coordinates.
- **Retrograde State Detection** for all Tara-grahas (Mars, Mercury, Jupiter, Venus, Saturn).
- **Panchanga Helpers**: Tithi, Nakshatra, Yoga, Karana, Paksha, Season.
- **Frontend-Ready Format**: Seamlessly connects to Kundali Darsan Web frontend via `kundali_planets` and `lagna_deg`.
- **CORS Support**: Direct browser access from `http://127.0.0.1` and `file://`.
- **1-Click Launcher**: Includes `run_surya_api.bat` for quick startup on Windows.

---

## 1-Click Startup (Windows)

Simply double-click:
```
run_surya_api.bat
```
This activates the `.venv` virtual environment and launches Uvicorn on `http://127.0.0.1:8000`.

---

## Manual Startup

```bash
# In Windows PowerShell:
cd surya_siddhanta_api
.\.venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive Swagger documentation is available at:
`http://127.0.0.1:8000/docs`

---

## Endpoints

### 1. `POST /api/v1/chart`
Generates full planetary chart, Lagna, and Panchanga.

**Sample Request:**
```json
{
  "name": "राम शर्मा",
  "birth_datetime": "2026-10-16T12:00:00+05:45",
  "latitude": 27.7172,
  "longitude": 85.3240,
  "timezone_name": "Asia/Kathmandu",
  "ayanamsa": "surya_siddhanta"
}
```

**Key Response Fields:**
- `siddhanta`: `"Surya Siddhanta (सूर्य-सिद्धान्त)"`
- `lagna_deg`: Nirayana Lagna longitude in degrees [0, 360)
- `kundali_planets`: Object containing `deg` and `isRetrograde` for `Surya`, `Chandra`, `Mangal`, `Budha`, `Guru`, `Shukra`, `Shani`, `Rahu`, `Ketu`.
- `panchanga`: Tithi, Nakshatra, Yoga, Karana, Paksha, Season.
- `graha_sthiti`: Rashi, Degree, Nakshatra pada per planet.
- `vimshottari_dasha_seed`: Vimshottari Mahadasha balance at birth.

### 2. `GET /health`
Returns health status and whether the underlying Surya Siddhanta engine is loaded.

---

## License
Wrapper code under the MIT License. Upstream astronomy library follows its open-source license.
