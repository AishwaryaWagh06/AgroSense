const forecastDiv = document.getElementById('forecast');
const currentForecastDiv = document.getElementById('currentForecast');
const currentTitle = document.getElementById('currentTitle');
const otherTitle = document.getElementById('otherTitle');
const cityInput = document.getElementById('city');
const searchResultsDiv = document.getElementById('search-results');

// Default API key for OpenWeatherMap (you can replace this with your own)
const DEFAULT_API_KEY = '1a2b3c4d5e6f7g8h9i0j';

// Store the current search results
let searchResults = [];

async function getForecastByCoords(lat, lon){
  const key = localStorage.getItem('OWM_KEY') || DEFAULT_API_KEY;
  
  try {
    // Try OpenWeatherMap 5-day/3-hour forecast
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const res = await fetch(url);
    
    if(res.ok){ 
      const data = await res.json(); 
      renderForecast(data); 
      
      // Get location name from coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`;
      const geoRes = await fetch(geoUrl);
      if(geoRes.ok) {
        const geoData = await geoRes.json();
        if(geoData && geoData.length > 0) {
          const location = geoData[0];
          updateLocationHeader(location.name, location.country, lat, lon);
        }
      }
      return; 
    }
    console.warn('OWM fetch failed, falling back to Open-Meteo');
  } catch(err) {
    console.error('Error fetching from OpenWeatherMap:', err);
  }
  
  try {
    // Fallback: Open-Meteo daily forecast (no API key required)
    const mUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const mRes = await fetch(mUrl);
    
    if(mRes.ok){ 
      const mData = await mRes.json();
      renderMeteoForecast(mData);
      
      // Get location name from coordinates using Open-Meteo's reverse geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1`;
      const geoRes = await fetch(geoUrl);
      if(geoRes.ok) {
        const geoData = await geoRes.json();
        if(geoData && geoData.results && geoData.results.length > 0) {
          const location = geoData.results[0];
          updateLocationHeader(location.name, location.country, lat, lon);
        }
      }
      return;
    }
    alert('Weather fetch failed');
  } catch(err) {
    console.error('Error fetching from Open-Meteo:', err);
    alert('Weather fetch failed');
  }
}

async function getForecastByCity(city){
  const key = localStorage.getItem('OWM_KEY') || DEFAULT_API_KEY;
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
    const res = await fetch(url);
    
    if(res.ok){ 
      const data = await res.json(); 
      renderForecast(data); 
      updateLocationHeader(data.city?.name, data.city?.country, data.city?.coord?.lat, data.city?.coord?.lon);
      return; 
    }
    console.warn('OWM city fetch failed, falling back to Open-Meteo');
  } catch(err) {
    console.error('Error fetching from OpenWeatherMap:', err);
  }
  
  try {
    // Fallback: geocode with Open-Meteo and fetch daily forecast
    const gUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const gRes = await fetch(gUrl);
    
    if(!gRes.ok){ 
      alert('City not found'); 
      return; 
    }
    
    const g = await gRes.json();
    const loc = g.results && g.results[0];
    
    if(!loc){ 
      alert('City not found'); 
      return; 
    }
    
    updateLocationHeader(loc.name, loc.country, loc.latitude, loc.longitude);
    return getForecastByCoords(loc.latitude, loc.longitude);
  } catch(err) {
    console.error('Error with geocoding:', err);
    alert('City not found');
  }
}

// Function to search for locations
async function searchLocations(query) {
  if (!query || query.trim().length < 2) {
    searchResultsDiv.style.display = 'none';
    return;
  }
  
  try {
    // Use Open-Meteo's geocoding API (no API key required)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    searchResults = data.results || [];
    
    // Display search results
    displaySearchResults(searchResults);
  } catch (error) {
    console.error('Error searching locations:', error);
    searchResultsDiv.style.display = 'none';
  }
}

// Function to display search results
function displaySearchResults(results) {
  if (!results || results.length === 0) {
    searchResultsDiv.style.display = 'none';
    return;
  }
  
  searchResultsDiv.innerHTML = '';
  
  results.forEach((result, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <svg class="search-result-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <div>
        <div class="search-result-name">${result.name}</div>
        <div class="search-result-details">${result.country}${result.admin1 ? `, ${result.admin1}` : ''}</div>
      </div>
    `;
    
    resultItem.addEventListener('click', () => {
      // When a result is clicked, get weather for that location
      cityInput.value = result.name;
      searchResultsDiv.style.display = 'none';
      getForecastByCoords(result.latitude, result.longitude);
    });
    
    searchResultsDiv.appendChild(resultItem);
  });
  
  searchResultsDiv.style.display = 'block';
}

// Function to update the location header with location info
function updateLocationHeader(name, country, lat, lon) {
  if (currentTitle) {
    currentTitle.innerHTML = `
      <svg class="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      ${name || 'Current Location'}${country ? `, ${country}` : ''}
    `;
  }
}

function groupByDay(list){
  const days = {};
  list.forEach(item=>{
    const day = item.dt_txt.split(' ')[0];
    if(!days[day]) days[day] = [];
    days[day].push(item);
  });
  return Object.entries(days).slice(0,5);
}

function rainProbability(items){
  const pop = items.reduce((acc,i)=>acc + (i.pop || 0), 0) / items.length;
  return Math.round(pop*100);
}

function renderForecast(data, target = forecastDiv){
  if(!forecastDiv) return;
  target.innerHTML = '';
  const days = groupByDay(data.list);
  if(currentTitle && target === currentForecastDiv){
    currentTitle.textContent = data.city?.name || 'Current Location';
  }
  if(otherTitle && target === forecastDiv){
    otherTitle.textContent = data.city?.name || 'Other City';
    otherTitle.style.display = 'block';
  }
  if(days.length){
    // Row 1: today's big card
    const row1 = document.createElement('div');
    row1.style.display = 'grid';
    row1.style.gridTemplateColumns = '1fr';
    row1.style.gap = '10px';
    const [day0, items0] = days[0];
    const min0 = Math.min(...items0.map(i=>i.main.temp_min));
    const max0 = Math.max(...items0.map(i=>i.main.temp_max));
    const pop0 = rainProbability(items0);
    const big = document.createElement('div');
    big.style.background = 'var(--panel)';
    big.style.border = '1px solid var(--border)';
    big.style.borderRadius = '12px';
    big.style.padding = '18px';
    big.style.fontSize = '18px';
    big.innerHTML = `<h2 style="margin:0 0 6px">${new Date(day0).toLocaleDateString()}</h2>
      <div style="color:var(--muted);font-size:16px">Max ${max0.toFixed(0)}°C / Min ${min0.toFixed(0)}°C</div>
      <div style="margin-top:8px;${pop0>=60?'color:#4ade80;':''};font-size:16px">Rain probability: ${pop0}%</div>`;
    row1.appendChild(big);
    target.appendChild(row1);

    // Row 2: next days small cards
    const row2 = document.createElement('div');
    row2.style.display = 'grid';
    row2.style.gridTemplateColumns = 'repeat(4,1fr)';
    row2.style.gap = '10px';
    days.slice(1).forEach(([day, items])=>{
      const min = Math.min(...items.map(i=>i.main.temp_min));
      const max = Math.max(...items.map(i=>i.main.temp_max));
      const pop = rainProbability(items);
      const el = document.createElement('div');
      el.style.background = 'var(--panel)';
      el.style.border = '1px solid var(--border)';
      el.style.borderRadius = '12px';
      el.style.padding = '12px';
      el.innerHTML = `<h4 style=\"margin:0 0 6px\">${new Date(day).toLocaleDateString()}</h4>
        <div style=\"color:var(--muted)\">Max ${max.toFixed(0)}°C / Min ${min.toFixed(0)}°C</div>
        <div style=\"margin-top:6px;${pop>=60?'color:#4ade80;':''}\">Rain probability: ${pop}%</div>`;
      row2.appendChild(el);
    });
    target.appendChild(row2);
  }
}

// Render for Open-Meteo daily data
function renderMeteoForecast(m, target = forecastDiv){
  if(!forecastDiv) return;
  target.innerHTML = '';
  if(currentTitle && target === currentForecastDiv){ currentTitle.textContent = 'Current Location'; }
  const days = m?.daily?.time || [];
  const tMax = m?.daily?.temperature_2m_max || [];
  const tMin = m?.daily?.temperature_2m_min || [];
  const pop = m?.daily?.precipitation_probability_max || [];
  const count = Math.min(5, days.length);
  if(count){
    const row1 = document.createElement('div');
    row1.style.display = 'grid';
    row1.style.gridTemplateColumns = '1fr';
    row1.style.gap = '10px';
    const big = document.createElement('div');
    big.style.background = 'var(--panel)';
    big.style.border = '1px solid var(--border)';
    big.style.borderRadius = '12px';
    big.style.padding = '18px';
    big.style.fontSize = '18px';
    big.innerHTML = `<h2 style=\"margin:0 0 6px\">${new Date(days[0]).toLocaleDateString()}</h2>
      <div style=\"color:var(--muted);font-size:16px\">Max ${Math.round(tMax[0])}°C / Min ${Math.round(tMin[0])}°C</div>
      <div style=\"margin-top:8px;${(pop[0]||0)>=60?'color:#4ade80;':''};font-size:16px\">Rain probability: ${pop[0] ?? 0}%</div>`;
    row1.appendChild(big);
    target.appendChild(row1);

    const row2 = document.createElement('div');
    row2.style.display = 'grid';
    row2.style.gridTemplateColumns = 'repeat(4,1fr)';
    row2.style.gap = '10px';
    for(let i=1;i<count;i++){
      const el = document.createElement('div');
      el.style.background = 'var(--panel)';
      el.style.border = '1px solid var(--border)';
      el.style.borderRadius = '12px';
      el.style.padding = '12px';
      el.innerHTML = `<h4 style=\"margin:0 0 6px\">${new Date(days[i]).toLocaleDateString()}</h4>
        <div style=\"color:var(--muted)\">Max ${Math.round(tMax[i])}°C / Min ${Math.round(tMin[i])}°C</div>
        <div style=\"margin-top:6px;${(pop[i]||0)>=60?'color:#4ade80;':''}\">Rain probability: ${pop[i] ?? 0}%</div>`;
      row2.appendChild(el);
    }
    target.appendChild(row2);
  }
}

// Continuous tracking of current location forecast
let geoWatchId = null;
function startGeoWatch(){
  if(!navigator.geolocation) return;
  if(geoWatchId) navigator.geolocation.clearWatch(geoWatchId);
  geoWatchId = navigator.geolocation.watchPosition(pos=>{
    getForecastByCoords(pos.coords.latitude, pos.coords.longitude, true);
  });
}

// Overload getForecastByCoords to render to currentForecastDiv when tracking
async function getForecastByCoords(lat, lon, toCurrent=false){
  const key = localStorage.getItem('OWM_KEY') || '';
  if(key){
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
    const res = await fetch(url);
    if(res.ok){ const data = await res.json(); renderForecast(data, toCurrent? currentForecastDiv : forecastDiv); return; }
    console.warn('OWM fetch failed, falling back to Open-Meteo');
  }
  const mUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const mRes = await fetch(mUrl);
  if(!mRes.ok){ alert('Weather fetch failed'); return; }
  const mData = await mRes.json();
  renderMeteoForecast(mData, toCurrent? currentForecastDiv : forecastDiv);
}

// Event listeners for search functionality
cityInput?.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 2) {
    // Debounce the search to avoid too many API calls
    clearTimeout(cityInput.searchTimeout);
    cityInput.searchTimeout = setTimeout(() => {
      searchLocations(query);
    }, 300);
  } else {
    searchResultsDiv.style.display = 'none';
  }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
  if (!cityInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
    searchResultsDiv.style.display = 'none';
  }
});

document.getElementById('fetchCity')?.addEventListener('click', ()=>{
  if(!cityInput.value.trim()) return;
  searchResultsDiv.style.display = 'none';
  otherTitle && (otherTitle.style.display = 'block');
  getForecastByCity(cityInput.value.trim());
});

document.getElementById('useGeo')?.addEventListener('click', ()=>{
  navigator.geolocation.getCurrentPosition(pos=>{
    searchResultsDiv.style.display = 'none';
    getForecastByCoords(pos.coords.latitude, pos.coords.longitude, true);
  }, ()=> alert('Location permission denied'));
});

// Handle Enter key in search input
cityInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if(cityInput.value.trim()) {
      searchResultsDiv.style.display = 'none';
      getForecastByCity(cityInput.value.trim());
    }
  }
});

// Start continuous tracking on load for current location
startGeoWatch();

