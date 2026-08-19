// Simple client-side notifications fetcher for farming-related news
// Uses newsdata.io API (compatible with 32-hex style keys)

(function(){
  const API_KEY = "1ac765b8b47a42849304de77a718c814"; // provided by user
  const DEFAULT_QUERY = "farming OR agriculture";
  const MAX_RECENT = 5;

  const recentUl = document.getElementById('recentNotifications');
  const allUl = document.getElementById('allNotifications');
  const searchInput = document.getElementById('notifSearch');
  const refreshBtn = document.getElementById('notifRefresh');

  if(!recentUl && !allUl) return; // Not on dashboard

  let lastQuery = DEFAULT_QUERY;

  async function fetchNews(query){
    const base = 'https://newsdata.io/api/1/news';
    const params = new URLSearchParams({
      apikey: API_KEY,
      q: query || DEFAULT_QUERY,
      language: 'en',
      // You can set country or category if needed: country: 'in', category: 'agriculture'
    });
    const url = `${base}?${params.toString()}`;
    try {
      const res = await fetch(url);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.results) ? data.results : [];
    } catch (e) {
      console.error('Failed to fetch news', e);
      // Fallback demo data so UI still shows
      return [
        { title: 'Irrigation advisory update', link: '#', source: 'Demo', publishedAt: new Date().toISOString() },
        { title: 'Monsoon outlook: prepare mulching', link: '#', source: 'Demo', publishedAt: new Date(Date.now()-3600e3).toISOString() },
        { title: 'Soil health week: best practices for nitrogen use', link: '#', source: 'Demo', publishedAt: new Date(Date.now()-7200e3).toISOString() }
      ];
    }
  }

  function formatDate(iso){
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return ''; }
  }

  function renderList(ul, items, opts){
    if(!ul) return;
    ul.innerHTML = '';
    ul.style.listStyle = 'disc';
    ul.style.minHeight = '40px';
    for(const item of items){
      const li = document.createElement('li');
      li.style.marginBottom = '8px';
      const a = document.createElement('a');
      a.href = item.link || item.url || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = item.title || item.description || 'Untitled';
      a.style.color = 'var(--text)';
      a.style.textDecoration = 'underline';
      const meta = document.createElement('div');
      meta.style.fontSize = '12px';
      meta.style.color = 'var(--muted)';
      const src = item.source_id || item.source || (item.creator && item.creator[0]) || 'Unknown';
      const time = formatDate(item.pubDate || item.published_at || item.pub_date || item.publishedAt);
      meta.textContent = `${src}${time ? ' • ' + time : ''}`;
      li.appendChild(a);
      li.appendChild(meta);
      ul.appendChild(li);
    }
    if(items.length === 0){
      const li = document.createElement('li');
      li.textContent = 'No notifications found.';
      li.style.color = 'var(--muted)';
      ul.appendChild(li);
    }
  }

  async function load(query){
    lastQuery = query || DEFAULT_QUERY;
    const items = await fetchNews(lastQuery);
    renderList(recentUl, items.slice(0, MAX_RECENT));
    renderList(allUl, items);
  }

  // Debounce helper
  function debounce(fn, wait){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=>fn.apply(this, args), wait);
    };
  }

  const handleSearch = debounce(()=>{
    const q = (searchInput && searchInput.value || '').trim();
    load(q || DEFAULT_QUERY);
  }, 500);

  searchInput && searchInput.addEventListener('input', handleSearch);
  refreshBtn && refreshBtn.addEventListener('click', ()=> load(lastQuery));

  // initial load
  load(DEFAULT_QUERY);
})();


