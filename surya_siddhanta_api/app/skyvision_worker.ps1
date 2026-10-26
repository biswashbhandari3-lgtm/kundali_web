[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PATH = "C:\Program Files (x86)\SKYVISION;C:\Program Files (x86)\SKYVISION\DLLs;" + $env:PATH
Set-Location "C:\Program Files (x86)\SKYVISION"

$pl = New-Object -ComObject "Astro_function.planet"
$sm = New-Object -ComObject "Astro_function.sun_moon"
$misc = New-Object -ComObject "Astro_function.misc"
$gc = New-Object -ComObject "Astro_function.geoCorr"

[Console]::Out.WriteLine("READY")
[Console]::Out.Flush()

while ($line = [Console]::In.ReadLine()) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -eq "QUIT") { break }
    try {
        $req = $line | ConvertFrom-Json
        $dt = [DateTime]::Parse($req.datetime)
        
        # DayNumber since 0001-01-01 (Diff = 731224 on 2003-01-10; do not add +1)
        $dayNumber = ($dt.Date - [DateTime]::new(1, 1, 1)).TotalDays
        
        $lon = [double]$req.longitude
        $lat = [double]$req.latitude
        $tzOffset = if ($null -ne $req.tz_offset) { [double]$req.tz_offset } else { 5.75 }

        # Local time day number for Ascendant (AscDeg expects local clock time)
        $timeFractionLocal = ($dt.Hour + ($dt.Minute / 60.0) + ($dt.Second / 3600.0)) / 24.0
        $totalDayLocal = $dayNumber + $timeFractionLocal
        
        # Universal Time (UTC) day number for Swiss Ephemeris planetary positions
        $utcHour = ($dt.Hour + ($dt.Minute / 60.0) + ($dt.Second / 3600.0)) - $tzOffset
        $totalDayUTC = $dayNumber + ($utcHour / 24.0)
        
        $sid = if ($req.siddhanta -eq "surya") { 1 } else { 2 }
        
        $step = 0.01
        $totalDayUTCNext = $totalDayUTC + $step

        $sunDeg = ($sm.TrueSun($totalDayUTC, $sid) % 360.0 + 360.0) % 360.0
        $sunDegNext = ($sm.TrueSun($totalDayUTCNext, $sid) % 360.0 + 360.0) % 360.0
        $sunSpeed = (($sunDegNext - $sunDeg + 540.0) % 360.0 - 180.0) / $step

        $moonDeg = ($sm.TrueMoon($totalDayUTC, $sid) % 360.0 + 360.0) % 360.0
        $moonDegNext = ($sm.TrueMoon($totalDayUTCNext, $sid) % 360.0 + 360.0) % 360.0
        $moonSpeed = (($moonDegNext - $moonDeg + 540.0) % 360.0 - 180.0) / $step

        $ayanDeg = $misc.Ayanmsha($totalDayUTC, $sid)
        
        $marsDeg = ($pl.TruePlanet($totalDayUTC, 3, $sid, 0) % 360.0 + 360.0) % 360.0
        $marsDegNext = ($pl.TruePlanet($totalDayUTCNext, 3, $sid, 0) % 360.0 + 360.0) % 360.0
        $marsSpeed = (($marsDegNext - $marsDeg + 540.0) % 360.0 - 180.0) / $step

        $mercDeg = ($pl.TruePlanet($totalDayUTC, 4, $sid, 0) % 360.0 + 360.0) % 360.0
        $mercDegNext = ($pl.TruePlanet($totalDayUTCNext, 4, $sid, 0) % 360.0 + 360.0) % 360.0
        $mercSpeed = (($mercDegNext - $mercDeg + 540.0) % 360.0 - 180.0) / $step

        $jupDeg  = ($pl.TruePlanet($totalDayUTC, 5, $sid, 0) % 360.0 + 360.0) % 360.0
        $jupDegNext = ($pl.TruePlanet($totalDayUTCNext, 5, $sid, 0) % 360.0 + 360.0) % 360.0
        $jupSpeed = (($jupDegNext - $jupDeg + 540.0) % 360.0 - 180.0) / $step

        $venDeg  = ($pl.TruePlanet($totalDayUTC, 6, $sid, 0) % 360.0 + 360.0) % 360.0
        $venDegNext = ($pl.TruePlanet($totalDayUTCNext, 6, $sid, 0) % 360.0 + 360.0) % 360.0
        $venSpeed = (($venDegNext - $venDeg + 540.0) % 360.0 - 180.0) / $step

        $satDeg  = ($pl.TruePlanet($totalDayUTC, 7, $sid, 0) % 360.0 + 360.0) % 360.0
        $satDegNext = ($pl.TruePlanet($totalDayUTCNext, 7, $sid, 0) % 360.0 + 360.0) % 360.0
        $satSpeed = (($satDegNext - $satDeg + 540.0) % 360.0 - 180.0) / $step

        $rahuDeg = ($pl.TruePlanet($totalDayUTC, 8, $sid, 0) % 360.0 + 360.0) % 360.0
        $ketuDeg = ($rahuDeg + 180.0) % 360.0
        
        # AscDeg takes (Longitude, Latitude, totalDayLocal, cusps)
        [double[]]$cusps = New-Object double[] 13
        $sm.AscDeg($lon, $lat, $totalDayLocal, [ref]$cusps)
        $lagnaDeg = ($cusps[1] % 360.0 + 360.0) % 360.0
        
        # Bija Samskara Parameters: Kranti, Char, Belantara
        $rad = [Math]::PI / 180.0
        $sayanaSun = (($sunDeg + $ayanDeg) % 360.0) * $rad
        $eps = 23.43929 * $rad
        $deltaRad = [Math]::Asin([Math]::Sin($eps) * [Math]::Sin($sayanaSun))
        $deltaDeg = $deltaRad / $rad
        $isSouth = ($deltaDeg -lt 0)
        $dAbs = [Math]::Abs($deltaDeg)
        $dDeg = [Math]::Floor($dAbs)
        $dMin = [Math]::Round(($dAbs - $dDeg) * 60)
        $prefix = if ($isSouth) { "द." } else { "उ." }
        $krantiStr = "$prefix$dDeg`:" + $dMin.ToString("00")

        $phi = $lat * $rad
        $tanVal = [Math]::Max(-1.0, [Math]::Min(1.0, [Math]::Tan($phi) * [Math]::Tan($deltaRad)))
        $charDeg = [Math]::Asin($tanVal) / $rad
        $charPalaTotal = $charDeg * 10.0
        $cpAbs = [Math]::Abs($charPalaTotal)
        $pPart = [Math]::Floor($cpAbs)
        $vpPart = [Math]::Round(($cpAbs - $pPart) * 60)
        $signChar = if ($charPalaTotal -lt 0) { "-" } else { "+" }
        $charStr = "$signChar$pPart`:" + $vpPart.ToString("00")

        # Belantara (Equation of Time)
        $dJ2000 = ($totalDayUTC - 730119.5)
        $L0 = (280.4664567 + 0.98564736 * $dJ2000) % 360.0
        $M = ((357.5291 + 0.98560028 * $dJ2000) % 360.0) * $rad
        $C = (1.914602 - 0.004817 * ($dJ2000 / 36525.0)) * [Math]::Sin($M) + (0.019993 - 0.000101 * ($dJ2000 / 36525.0)) * [Math]::Sin(2 * $M) + 0.000289 * [Math]::Sin(3 * $M)
        $lam = ($L0 + $C) * $rad
        $alpha = [Math]::Atan2([Math]::Cos($eps) * [Math]::Sin($lam), [Math]::Cos($lam)) / $rad
        $alphaNorm = ($alpha % 360.0 + 360.0) % 360.0
        $eotDeg = (($alphaNorm - $L0 + 540.0) % 360.0) - 180.0
        $eotMinutes = $eotDeg * 4.0
        $emAbs = [Math]::Abs($eotMinutes)
        $mPart = [Math]::Floor($emAbs)
        $sPart = [Math]::Round(($emAbs - $mPart) * 60)
        $signBelan = if ($eotMinutes -lt 0) { "-" } else { "+" }
        $belanStr = "$signBelan$mPart`:" + $sPart.ToString("00")

        $ayAbs = [Math]::Abs($ayanDeg)
        $ayD = [Math]::Floor($ayAbs)
        $ayM = [Math]::Floor(($ayAbs - $ayD) * 60)
        $ayS = [Math]::Round((($ayAbs - $ayD) * 60 - $ayM) * 60)
        $ayanDMS = "$ayD`:" + $ayM.ToString("00") + "`:" + $ayS.ToString("00")
        
        # Sunrise and Sunset
        $riseDay = $sm.rSetplanet($lat, $lon, $dayNumber, 1, 1)
        $setDay  = $sm.rSetplanet($lat, $lon, $dayNumber, 2, 1)
        $riseHour = ($riseDay - [Math]::Floor($riseDay)) * 24.0
        $setHour  = ($setDay - [Math]::Floor($setDay)) * 24.0
        
        $res = @{
            status = "ok"
            siddhanta = if ($sid -eq 1) { "Surya Siddhanta (संशोधित)" } else { "Drik Siddhanta" }
            dayNumber = $totalDayLocal
            dayNumberUTC = $totalDayUTC
            ayanamsha = $ayanDeg
            ayanamsha_dms = $ayanDMS
            surya_kranti = $krantiStr
            char_samskara = $charStr
            belantara = $belanStr
            lagna_deg = $lagnaDeg
            houses = $cusps[1..12]
            sunrise_hour = $riseHour
            sunset_hour = $setHour
            kundali_planets = @{
                Surya = @{ deg = [Math]::Round($sunDeg, 6); speed = [Math]::Round($sunSpeed, 4); isRetrograde = $false }
                Chandra = @{ deg = [Math]::Round($moonDeg, 6); speed = [Math]::Round($moonSpeed, 4); isRetrograde = $false }
                Mangal = @{ deg = [Math]::Round($marsDeg, 6); speed = [Math]::Round($marsSpeed, 4); isRetrograde = ($marsSpeed -lt 0) }
                Budha = @{ deg = [Math]::Round($mercDeg, 6); speed = [Math]::Round($mercSpeed, 4); isRetrograde = ($mercSpeed -lt 0) }
                Guru = @{ deg = [Math]::Round($jupDeg, 6); speed = [Math]::Round($jupSpeed, 4); isRetrograde = ($jupSpeed -lt 0) }
                Shukra = @{ deg = [Math]::Round($venDeg, 6); speed = [Math]::Round($venSpeed, 4); isRetrograde = ($venSpeed -lt 0) }
                Shani = @{ deg = [Math]::Round($satDeg, 6); speed = [Math]::Round($satSpeed, 4); isRetrograde = ($satSpeed -lt 0) }
                Rahu = @{ deg = [Math]::Round($rahuDeg, 6); speed = -0.053; isRetrograde = $true }
                Ketu = @{ deg = [Math]::Round($ketuDeg, 6); speed = -0.053; isRetrograde = $true }
            }
        }
        [Console]::Out.WriteLine(($res | ConvertTo-Json -Compress))
        [Console]::Out.Flush()
    } catch {
        $err = @{ status = "error"; message = "$($_.Exception.Message)" }
        [Console]::Out.WriteLine(($err | ConvertTo-Json -Compress))
        [Console]::Out.Flush()
    }
}
