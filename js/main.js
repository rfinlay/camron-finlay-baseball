/* ===== Camron Finlay Baseball ===== */

/* ---- CONFIG: connect these when ready (see CONTENT-TODO.md) ---- */
const HR_SHEET_CSV_URL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHGBy28PYzahjIOLdcBJT6LkdrIW8dDJlEZVF9egSo6GFpChUqoa-sjsrezpfUSDW8UTRT8YxcRZc0/pub?output=csv"; // live stats sheet (Rick + Ryan edit; site reads)
const ICS_FEED_URL       = ""; // published Outlook calendar .ics feed (blank = use data/schedule.json)
const WEB3FORMS_ACCESS_KEY = "GET-FREE-KEY"; // create free key for ryanfinlay13@gmail.com at web3forms.com

/* ---- nav: scroll state + mobile toggle ---- */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40));
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav__links');
toggle.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

/* ---- year ---- */
document.getElementById('yr').textContent = new Date().getFullYear();

/* ---- scroll reveal ---- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---- animated counter ---- */
function animateCount(el, target){
  const dur = 1400, t0 = performance.now();
  function step(t){
    const p = Math.min((t - t0)/dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1-p,3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- stats: load from Google Sheet CSV or local fallback ---- */
async function loadStats(){
  let sheet = null, local = null;
  try { local = await (await fetch('data/stats.json')).json(); } catch(e){}
  if (HR_SHEET_CSV_URL){
    try { sheet = parseSheet(await (await fetch(HR_SHEET_CSV_URL)).text()); } catch(e){}
  }
  const base = local || fallbackStats();
  // stat cards + HR count come from the live sheet; HR log stays in stats.json
  const data = {
    homeRuns: sheet ? sheet.homeRuns : base.homeRuns,
    cards:    (sheet && sheet.cards.length) ? sheet.cards : base.cards,
    hrLog:    (base.hrLog && base.hrLog.length) ? base.hrLog : (sheet ? sheet.hrLog : [])
  };
  renderStats(data);
}
function fallbackStats(){
  return { homeRuns:14, season:"2026 Travel Season",
    cards:[{k:"AVG",v:".412"},{k:"Home Runs",v:"14"},{k:"RBI",v:"38"},{k:"Stolen Bases",v:"21"}],
    hrLog:[{n:14,note:"Championship weekend blast",date:"Jun 2026"},{n:13,note:"2-run shot vs. rival club",date:"Jun 2026"},{n:12,note:"Opposite-field bomb",date:"May 2026"}] };
}
function fmtStat(v){
  // baseball averages: show .412 instead of 0.412
  return /^0\.\d+$/.test(v) ? v.replace(/^0/, '') : v;
}
function parseSheet(csv){
  // Sheet format: two columns "Stat, Value" with a header row.
  const rows = csv.trim().split(/\r?\n/).map(r => r.split(','));
  const cards = []; let homeRuns = 0;
  rows.forEach((cells, i) => {
    const label = (cells[0] || '').trim();
    const val   = (cells[1] || '').trim();
    if (!label) return;
    if (i === 0 && /^(stat|label|metric|name)$/i.test(label)) return; // skip header
    cards.push({ k: label, v: fmtStat(val) });
    if (/home\s*runs?/i.test(label)) homeRuns = parseInt(val, 10) || 0;
  });
  return { homeRuns, cards, hrLog: [] };
}
function renderStats(d){
  const hr = document.getElementById('hrTicker');
  const doCount = () => animateCount(hr, d.homeRuns || 0);
  const hio = new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){doCount();hio.disconnect();}})},{threshold:.4});
  hio.observe(document.querySelector('.metrics'));

  const cards = (d.cards && d.cards.length) ? d.cards : fallbackStats().cards;
  document.getElementById('statCards').innerHTML = cards.slice(0,8).map(c =>
    `<div class="statcard"><div class="statcard__val">${c.v}</div><div class="statcard__key">${c.k}</div></div>`).join('');

  const log = (d.hrLog && d.hrLog.length) ? d.hrLog : fallbackStats().hrLog;
  document.getElementById('hrLog').innerHTML = log.map(h =>
    `<li><span class="hr__no">#${h.n}</span> <b>${h.note||'Home run'}</b> <span>${h.date||''}</span></li>`).join('');
}

/* ---- schedule: ICS feed or local fallback ---- */
async function loadSchedule(){
  const opts = {
    initialView:'dayGridMonth', height:'auto', firstDay:0,
    headerToolbar:{left:'prev,next',center:'title',right:'today'},
    // single source of truth: rebuild the "Upcoming" list from whatever the
    // calendar actually has (ICS feed OR local JSON), so the two never diverge.
    eventsSet:(events)=>renderUpcoming(events.map(e=>({
      title:e.title, startStr:e.startStr, start:e.start,
      location:(e.extendedProps && e.extendedProps.location) || ''
    })))
  };
  if (ICS_FEED_URL){
    opts.events = { url: ICS_FEED_URL, format:'ics' };
  } else {
    try { opts.events = await (await fetch('data/schedule.json')).json(); }
    catch(e){ opts.events = []; }
  }
  const cal = new FullCalendar.Calendar(document.getElementById('calendar'), opts);
  cal.render();
}
function renderUpcoming(events){
  const up = document.getElementById('upcoming');
  const today = new Date(); today.setHours(0,0,0,0);
  const list = events.map(e => {
    // Use the date exactly as authored (startStr) built in LOCAL time, so the
    // label never shifts a day from timezone parsing. Falls back to start.
    const ds = (e.startStr || '').slice(0,10).split('-').map(Number);
    const d = (ds.length===3 && ds[0]) ? new Date(ds[0], ds[1]-1, ds[2]) : new Date(e.start);
    return { title:e.title, location:e.location, d };
  }).filter(e => e.d >= new Date(today.getFullYear(), today.getMonth(), today.getDate()-1))
    .sort((a,b)=>a.d-b.d).slice(0,5);
  if (!list.length){ up.innerHTML = '<li class="upcoming__meta">Schedule updates coming soon — check back for game dates.</li>'; return; }
  up.innerHTML = list.map(e => {
    const dt = e.d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return `<li><div class="upcoming__date">${dt}</div><div class="upcoming__game">${e.title}</div><div class="upcoming__meta">${e.location||''}</div></li>`;
  }).join('');
}

/* ---- recruiter form (Web3Forms) ---- */
const form = document.getElementById('recruitForm');
const status = document.getElementById('rformStatus');
const btn = document.getElementById('rformBtn');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'rform__status';
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'GET-FREE-KEY'){
    status.className = 'rform__status err';
    status.textContent = 'Form not connected yet — email ryanfinlay13@gmail.com directly for now.';
    return;
  }
  btn.disabled = true; btn.textContent = 'Sending…';
  const fd = new FormData(form);
  fd.append('access_key', WEB3FORMS_ACCESS_KEY);
  fd.append('subject', 'New recruiter inquiry — Camron Finlay');
  fd.append('from_name', 'CamronFinlayBaseball.com');
  try {
    const r = await fetch('https://api.web3forms.com/submit', { method:'POST', body:fd });
    const j = await r.json();
    if (j.success){ status.className='rform__status ok'; status.textContent='Thanks! Camron’s family will be in touch soon.'; form.reset(); }
    else throw new Error();
  } catch(err){ status.className='rform__status err'; status.textContent='Something went wrong — please email ryanfinlay13@gmail.com.'; }
  btn.disabled = false; btn.textContent = 'Send to Camron’s Family';
});

/* ---- one-pager placeholder ---- */
document.getElementById('onePager').addEventListener('click', (e) => {
  e.preventDefault();
  alert('One-page recruiting profile (PDF) coming soon. For now, use the form or email ryanfinlay13@gmail.com.');
});

/* ---- init ---- */
loadStats();
loadSchedule();
