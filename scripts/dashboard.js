const moistureCtx = document.getElementById('moistureChart');
const tempCtx = document.getElementById('tempChart');

// Config for thresholds/bands; can be updated by Firebase script
window.MonitorConfig = window.MonitorConfig || { threshold: 90, high: 95 };

// Chart plugin to draw moisture bands and threshold lines
const percentBandsPlugin = {
  id: 'percentBands',
  beforeDraw(chart){
    if(!chart?.scales?.y) return;
    const {ctx, chartArea, scales:{y}} = chart;
    const top = chartArea.top, bottom = chartArea.bottom, left = chartArea.left, right = chartArea.right;
    const toY = (v)=> y.getPixelForValue(v);
    // Bands: Dry(0-30), Medium(30-60), Wet(60-100)
    const bands = [
      {from:0, to:30, color:'rgba(239, 68, 68, 0.10)'},
      {from:30, to:60, color:'rgba(234, 179, 8, 0.10)'},
      {from:60, to:100, color:'rgba(34, 197, 94, 0.10)'}
    ];
    ctx.save();
    for(const b of bands){
      const y1 = toY(b.to);
      const y2 = toY(b.from);
      ctx.fillStyle = b.color;
      ctx.fillRect(left, Math.min(y1,y2), right-left, Math.abs(y2-y1));
    }
    // Threshold lines
    const t1 = window.MonitorConfig?.threshold ?? 90;
    const t2 = window.MonitorConfig?.high ?? 95;
    const lines = [
      {v:t1, color:'#f59e0b', label:`Threshold ${t1}%`},
      {v:t2, color:'#ef4444', label:`High ${t2}%`}
    ];
    ctx.setLineDash([6,4]);
    ctx.lineWidth = 1;
    for(const l of lines){
      const yPx = toY(l.v);
      ctx.strokeStyle = l.color;
      ctx.beginPath();
      ctx.moveTo(left, yPx);
      ctx.lineTo(right, yPx);
      ctx.stroke();
      ctx.fillStyle = l.color;
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(l.label, right-110, yPx-4);
    }
    ctx.restore();
  }
};
const summaryList = document.getElementById('summary');
const recommendationDiv = document.getElementById('recommendation');

function createLineChart(ctx, label, color, yMin, yMax){
  if(!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label, data: [], borderColor: color, tension: .25, pointRadius: 0, borderWidth: 2 }] },
    options: {
      animation: false,
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,.08)' },
          suggestedMin: typeof yMin === 'number' ? yMin : undefined,
          suggestedMax: typeof yMax === 'number' ? yMax : undefined,
          ticks: { stepSize: 10 }
        },
        x: { grid: { display:false } }
      },
      plugins: { legend: { display: true, labels: { color:'#9fb3c8' } } }
    }
  , plugins: label.includes('Moisture') ? [percentBandsPlugin] : []});
}

const moistureChart = createLineChart(moistureCtx, 'Moisture %', '#22d3ee', 0, 100);
const tempChart = createLineChart(tempCtx, 'Soil Temp °C', '#10b981', 0, 60);

let t = 0;
function pushPoint(chart, value){
  const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);
  if(chart.data.labels.length > 20){ chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
  chart.update();
}

function ruleBasedRecommendation(moisture, temp, rainProbability){
  // Simple rule engine demo; replace with server logic later
  if (rainProbability >= 60 && moisture >= 25) return {need:false, msg:`Likely rain soon (≥${rainProbability}%). Hold irrigation.`};
  if (moisture < 15) return {need:true, when:'today', amount:'8–12 mm', msg:'Critical low moisture. Irrigate today: 8–12 mm.'};
  if (moisture < 22) return {need:true, when:'within 24h', amount:'6–8 mm', msg:'Low moisture. Irrigate in 24h: 6–8 mm.'};
  if (moisture < 30 && temp > 32) return {need:true, when:'36–48h', amount:'4–6 mm', msg:'Hot and drying. Irrigate in 36–48h: 4–6 mm.'};
  return {need:false, msg:'No irrigation needed for next 2 days. Monitor.'};
}

function updateSummary(moisture, temp){
  const li = document.createElement('li');
  const parts = [];
  parts.push(new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + ':');
  if(Number.isFinite(moisture)) parts.push(`Moisture ${moisture.toFixed(1)}%`);
  if(Number.isFinite(temp)) parts.push(`Temp ${temp.toFixed(1)}°C`);
  li.textContent = parts.join(' ');
  summaryList?.prepend(li);
  while(summaryList && summaryList.children.length>8) summaryList.lastChild.remove();
}

function simulateTick(){
  t+=1;
  const moisture = 20 + Math.sin(t*0.2)*6 + (Math.random()-0.5)*2;
  const temp = 26 + Math.cos(t*0.15)*3 + (Math.random()-0.5)*1.5;
  const rainProb = 40 + Math.sin(t*0.05)*25;
  if(moistureChart) pushPoint(moistureChart, Math.max(5, Math.min(45, moisture)));
  if(tempChart) pushPoint(tempChart, Math.max(15, Math.min(40, temp)));
  updateSummary(moisture, temp);
  const rec = ruleBasedRecommendation(moisture, temp, rainProb);
  if(recommendationDiv) recommendationDiv.textContent = rec.msg;
}

let simInterval = null;
document.getElementById('simulateData')?.addEventListener('click', ()=>{
  if(simInterval){ clearInterval(simInterval); simInterval=null; return; }
  simulateTick();
  simInterval = setInterval(simulateTick, 3000);
});

