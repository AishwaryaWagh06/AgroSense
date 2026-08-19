// Fetch live soil data from Firebase Realtime Database (REST) and update dashboard charts
(function(){
  const FIREBASE_HOST = "sampleproject-6c947-default-rtdb.firebaseio.com"; // provided
  // Multiple tokens: will try in order until one succeeds
  const FIREBASE_AUTHS = [
    // New long token provided by user
    "BAnPxdvlLo4kZrnEwCzTcLDus3PBUTdhwVCdjX_Q9k0aUJs8r7Ixhf5Z3lQnb0_94HdxaRbMIiIR0Hct3pNnzE4",
    // Previous key
    "AIzaSyBNrytQc4ffx4W_FcThrZlRtPwqnp6GSZY"
  ];

  const connectBtn = document.getElementById('connectFirebase');
  const recommendationDiv = document.getElementById('recommendation');

  let pollTimer = null;

  function buildUrl(path, auth){
    const p = path.startsWith('/') ? path : '/' + path;
    const token = auth || '';
    return `https://${FIREBASE_HOST}${p}.json${token ? `?auth=${encodeURIComponent(token)}` : ''}`;
  }

  async function tryFetch(path){
    for(const token of FIREBASE_AUTHS){
      try {
        const url = buildUrl(path, token);
        const res = await fetch(url, { cache: 'no-store' });
        if(!res.ok) continue;
        const data = await res.json();
        if(data === null || typeof data === 'undefined') continue;
        return data;
      } catch(e){ /* try next token */ }
    }
    return null;
  }

  function pickLatestFromArray(arr){
    if(!Array.isArray(arr) || arr.length === 0) return null;
    // Try to find last non-null object
    for(let i=arr.length-1;i>=0;i--){
      const item = arr[i];
      if(item && typeof item === 'object') return item;
    }
    return arr[arr.length-1];
  }

  function extractReadings(obj){
    if(!obj || typeof obj !== 'object') return {};
    let candidate = obj;
    // If data is wrapped under known containers
    if(Array.isArray(candidate)) candidate = pickLatestFromArray(candidate) || {};
    if(candidate.telemetry) candidate = candidate.telemetry;
    if(candidate.sensors) candidate = candidate.sensors;
    if(candidate.soil && typeof candidate.soil === 'object') candidate = candidate.soil;
    if(candidate.sensorData && typeof candidate.sensorData === 'object') candidate = candidate.sensorData;

    let moisture = Number(
      candidate.moisture ?? candidate.soilMoisture ?? candidate.moisture_percent ?? candidate.humidity ?? candidate.moisturePct
    );
    let temperature = Number(
      candidate.temperature ?? candidate.temp ?? candidate.soilTemp ?? candidate.temperature_c
    );
    const rainProb = Number(candidate.rainProb ?? candidate.rain_probability ?? 40);
    const condition = String(candidate.status ?? candidate.condition ?? '');

    // Normalize moisture to percentage if in 0..1 range
    if(Number.isFinite(moisture) && moisture >= 0 && moisture <= 1) moisture = moisture * 100;
    // Clamp to expected ranges
    if(Number.isFinite(moisture)) moisture = Math.max(0, Math.min(100, moisture));
    if(Number.isFinite(temperature)) temperature = Math.max(-10, Math.min(60, temperature));
    return { moisture, temperature, rainProb, condition };
  }

  async function fetchSoil(){
    // Try common paths: /soil, /sensors/soil, root keys
    const candidates = ['soil', 'sensors/soil', 'telemetry/soil', ''];
    for(const c of candidates){
      const data = await tryFetch(c);
      if(!data) continue;

      // Render entire payload
      const pre = document.getElementById('firebaseAllData');
      if(pre){
        try { pre.textContent = JSON.stringify(data, null, 2); } catch { pre.textContent = String(data); }
      }

      // Extract readings and update UI
      // Update structured boxes if present in payload
      try {
        const thr = Number(
          (data.settings && data.settings.threshold)
        );
        if(Number.isFinite(thr)){
          window.MonitorConfig.threshold = thr;
          const highDefault = Math.max(thr + 5, 95);
          window.MonitorConfig.high = highDefault;
          const tv = document.getElementById('thresholdVal');
          if(tv) tv.textContent = `${thr}% / ${window.MonitorConfig.high}%`;
        }
        const sys = (data.systemStatus && (data.systemStatus.status || data.systemStatus.state)) || '';
        const sysEl = document.getElementById('systemStatusVal');
        if(sysEl && sys){ sysEl.textContent = sys; }
      } catch{}

      const { moisture, temperature, rainProb, condition } = extractReadings(data);
      if(Number.isFinite(moisture)){
        if(typeof moistureChart !== 'undefined' && moistureChart){
          pushPoint(moistureChart, moisture);
        }
        const mv = document.getElementById('moistureVal');
        if(mv) mv.textContent = `${moisture.toFixed(1)}%`;
      }
      if(Number.isFinite(temperature)){
        if(typeof tempChart !== 'undefined' && tempChart){
          pushPoint(tempChart, temperature);
        }
      }
      const cv = document.getElementById('conditionVal');
      if(cv && condition) cv.textContent = condition;
      // Update summary even if we only have one reading
      if(Number.isFinite(moisture) || Number.isFinite(temperature)){
        updateSummary(moisture, temperature);
        if(Number.isFinite(moisture) && Number.isFinite(temperature)){
          const rec = ruleBasedRecommendation(moisture, temperature, rainProb);
          if(recommendationDiv) recommendationDiv.textContent = rec.msg;
        }
      }
      return true;
    }
    return false;
  }

  async function startPolling(){
    if(pollTimer) return;
    // immediate fetch then every 5s
    await fetchSoil();
    pollTimer = setInterval(fetchSoil, 5000);
    if(connectBtn){
      connectBtn.textContent = 'Connected to Firebase';
      connectBtn.disabled = true;
      connectBtn.classList.add('primary');
    }
  }

  connectBtn && connectBtn.addEventListener('click', startPolling);
})();


