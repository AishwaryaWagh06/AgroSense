const toggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const stored = localStorage.getItem('theme');
if (stored === 'light') document.documentElement.classList.add('light');
if (!stored && !prefersDark) document.documentElement.classList.add('light');

toggle?.addEventListener('click',()=>{
  document.documentElement.classList.toggle('light');
  const mode = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  toggle.textContent = mode === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', mode);
});

