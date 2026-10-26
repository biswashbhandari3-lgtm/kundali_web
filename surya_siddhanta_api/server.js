const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8000;
const WORKER_SCRIPT = path.join(__dirname, 'app', 'skyvision_worker.ps1');
const POWERSHELL_32 = 'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe';

let worker = null;
let pendingQueue = [];
let isReady = false;

function startWorker() {
    console.log('[SkyVision] Spawning 32-bit SkyVision worker process...');
    worker = spawn(POWERSHELL_32, [
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', WORKER_SCRIPT
    ], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let buffer = '';

    worker.stdout.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        let lines = buffer.split(/\r?\n/);
        buffer = lines.pop(); // keep last incomplete line

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed === 'READY') {
                console.log('[SkyVision] 32-bit SkyVision COM Engine is READY.');
                isReady = true;
                processQueue();
            } else {
                // Response to query
                if (pendingQueue.length > 0) {
                    const { resolve, reject } = pendingQueue.shift();
                    try {
                        const json = JSON.parse(trimmed);
                        resolve(json);
                    } catch (e) {
                        reject(new Error('Invalid JSON from SkyVision worker: ' + trimmed));
                    }
                }
            }
        }
    });

    worker.stderr.on('data', (chunk) => {
        console.error('[SkyVision Worker STDERR]:', chunk.toString('utf8'));
    });

    worker.on('close', (code) => {
        console.warn(`[SkyVision] Worker exited with code ${code}. Restarting in 1s...`);
        isReady = false;
        setTimeout(startWorker, 1000);
    });
}

function processQueue() {
    if (!isReady || pendingQueue.length === 0) return;
    const item = pendingQueue[0];
    if (!item.sent) {
        item.sent = true;
        worker.stdin.write(JSON.stringify(item.payload) + '\n');
    }
}

function calculateChart(payload) {
    return new Promise((resolve, reject) => {
        pendingQueue.push({ payload, resolve, reject, sent: false });
        processQueue();
    });
}

startWorker();

const server = http.createServer(async (req, res) => {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && (req.url === '/health' || req.url === '/api/v1/health')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            engine_loaded: isReady,
            engine_type: 'SkyVision 32-bit Native Engine (Astro_function.dll)'
        }));
        return;
    }

    if (req.method === 'POST' && (req.url === '/api/v1/chart' || req.url === '/chart')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const dt = data.birth_datetime || data.datetime;
                const lat = parseFloat(data.latitude) || 27.7172;
                const lon = parseFloat(data.longitude) || 85.3240;
                const sid = (data.siddhanta || 'surya').toLowerCase();

                const workerReq = {
                    datetime: dt,
                    latitude: lat,
                    longitude: lon,
                    siddhanta: sid.includes('surya') ? 'surya' : 'drik'
                };

                const calcRes = await calculateChart(workerReq);
                if (calcRes.status === 'error') {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ detail: calcRes.message || 'SkyVision error' }));
                    return;
                }

                // Format response matching FastAPI main.py schema expected by app.js
                const responseData = {
                    status: 'success',
                    siddhanta: calcRes.siddhanta,
                    lagna_deg: calcRes.lagna_deg,
                    ayanamsha: {
                        degrees: calcRes.ayanamsha,
                        dms: calcRes.ayanamsha_dms,
                        system: calcRes.siddhanta
                    },
                    surya_kranti: calcRes.surya_kranti,
                    char_samskara: calcRes.char_samskara,
                    belantara: calcRes.belantara,
                    kundali_planets: calcRes.kundali_planets,
                    houses: calcRes.houses,
                    sunrise_hour: calcRes.sunrise_hour,
                    sunset_hour: calcRes.sunset_hour
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responseData));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ detail: err.message }));
            }
        });
        return;
    }

    if (req.method === 'POST' && (req.url === '/api/v1/panchang' || req.url === '/panchang')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const dt = data.datetime || data.birth_datetime || new Date().toISOString();
                const lat = parseFloat(data.latitude) || 27.7172;
                const lon = parseFloat(data.longitude) || 85.3240;
                const sid = (data.siddhanta || 'surya').toLowerCase();

                const workerReq = {
                    datetime: dt,
                    latitude: lat,
                    longitude: lon,
                    siddhanta: sid.includes('surya') ? 'surya' : 'drik'
                };

                const calcRes = await calculateChart(workerReq);
                if (calcRes.status === 'error') {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ detail: calcRes.message || 'SkyVision error' }));
                    return;
                }

                const sunDeg = calcRes.kundali_planets.Surya.deg;
                const moonDeg = calcRes.kundali_planets.Chandra.deg;
                const diff = (moonDeg - sunDeg + 360.0) % 360.0;
                const tithiNum = Math.floor(diff / 12.0) + 1;
                const nakNum = Math.floor(moonDeg / (360.0 / 27.0)) + 1;
                const yogaNum = Math.floor(((sunDeg + moonDeg) % 360.0) / (360.0 / 27.0)) + 1;
                const karanaNum = Math.floor(diff / 6.0) + 1;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    siddhanta: calcRes.siddhanta,
                    ayanamsha: calcRes.ayanamsha,
                    sun_deg: sunDeg,
                    moon_deg: moonDeg,
                    tithi_num: tithiNum,
                    nakshatra_num: nakNum,
                    yoga_num: yogaNum,
                    karana_num: karanaNum,
                    sunrise_hour: calcRes.sunrise_hour,
                    sunset_hour: calcRes.sunset_hour,
                    planets: calcRes.kundali_planets
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ detail: err.message }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[SkyVision API] Server listening on http://127.0.0.1:${PORT}`);
});
