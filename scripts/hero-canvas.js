const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const {width, height} = canvas.getBoundingClientRect();
    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function wave(yBase, hue) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x+=8) {
      const y = yBase + Math.sin((x + t) * 0.01) * 14 + Math.cos((x - t) * 0.008) * 10;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, .7)`;
    ctx.lineWidth = 2 * DPR;
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    wave(canvas.height*0.3, 160);
    wave(canvas.height*0.5, 190);
    wave(canvas.height*0.7, 150);
    t+=1.2;
    requestAnimationFrame(animate);
  }
  animate();
}

