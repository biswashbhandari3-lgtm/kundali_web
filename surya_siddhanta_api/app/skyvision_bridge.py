from __future__ import annotations

import json
import logging
import os
import subprocess
import threading
from typing import Any, Optional

logger = logging.getLogger(__name__)

WORKER_SCRIPT = os.path.join(os.path.dirname(__file__), "skyvision_worker.ps1")
POWERSHELL_32 = r"C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"

class SkyVisionEngine:
    _instance: Optional[SkyVisionEngine] = None
    _lock = threading.Lock()

    def __init__(self):
        self.proc: Optional[subprocess.Popen] = None
        self.cmd_lock = threading.Lock()
        self._start_worker()

    @classmethod
    def get_instance(cls) -> SkyVisionEngine:
        with cls._lock:
            if cls._instance is None:
                cls._instance = SkyVisionEngine()
            return cls._instance

    def _start_worker(self):
        if not os.path.exists(POWERSHELL_32):
            raise RuntimeError(f"32-bit PowerShell not found at {POWERSHELL_32}")

        cmd = [
            POWERSHELL_32,
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-File", WORKER_SCRIPT,
        ]
        logger.info("Starting SkyVision 32-bit worker process...")
        self.proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            encoding="utf-8",
        )

        # Wait for "READY"
        ready_line = self.proc.stdout.readline().strip()
        if ready_line != "READY":
            err = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"SkyVision worker failed to initialize: {ready_line} {err}")
        logger.info("SkyVision 32-bit worker initialized successfully.")

    def calculate(self, dt_iso: str, latitude: float, longitude: float, siddhanta: str = "surya") -> dict[str, Any]:
        with self.cmd_lock:
            # Check if process is still alive
            if self.proc is None or self.proc.poll() is not None:
                logger.warning("SkyVision worker was down, restarting...")
                self._start_worker()

            payload = {
                "datetime": dt_iso,
                "latitude": latitude,
                "longitude": longitude,
                "siddhanta": "surya" if siddhanta.lower() in ("surya", "surya_siddhanta") else "drik",
            }
            line = json.dumps(payload) + "\n"
            try:
                self.proc.stdin.write(line)
                self.proc.stdin.flush()
                resp_line = self.proc.stdout.readline()
                if not resp_line:
                    raise RuntimeError("Empty response from SkyVision worker")
                res = json.loads(resp_line)
                if res.get("status") == "error":
                    raise RuntimeError(res.get("message", "SkyVision computation error"))
                return res
            except Exception as e:
                logger.error(f"SkyVision worker communication failed: {e}")
                # Try restarting once
                try:
                    if self.proc:
                        self.proc.kill()
                except Exception:
                    pass
                self._start_worker()
                raise
