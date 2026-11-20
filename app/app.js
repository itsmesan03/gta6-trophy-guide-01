// Leonida Trophy Guide: a tracker over app/data/trophies.json.
// Progress lives in localStorage, exports to a JSON file and imports back.
// No network at run time: the only request is the relative fetch of data/trophies.json.
const KEY = 'gta6-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

// Roadmap stages, by trophy id, in the order a player should take them.
const STAGES = [
  { id: 1, title: 'Stage 1 — Play the story', hours: '60–80 hours',
    blurb: 'Finish Chapters 1 to 5 and take the side quests as they appear. Scan every new vehicle with the WAiNK app, study animals through binoculars, and do the Chapter 1 balcony meditation for Positive Mental Attitude before Chapter 1 ends. Everything you do now already counts toward the 100% checklist.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 29] },
  { id: 2, title: 'Stage 2 — The 100% checklist', hours: 'about 100 hours',
    blurb: 'After the credits, open Progress, then Stats, then 100% Completion and work through what is left: every robbery, shooting range and drone race, 70 of 80 challenges, 300 stunts, 15 card sets and 15 meditations. This is the long grind, and most of the count trophies pop along the way.',
    ids: [14, 15, 17, 18, 19, 30, 31, 32, 35, 40, 42, 43, 52, 53, 54, 55] },
  { id: 3, title: 'Stage 3 — Strangers, partners and odd jobs', hours: 'about 10 hours',
    blurb: 'Strangers & Freaks are not part of 100%, so they are usually what is left, together with the partner crimes, the one-off hidden trophies and anything you skipped. Clean these up last and the platinum lands with the final one.',
    ids: [16, 20, 21, 25, 28, 33, 34, 36, 37, 38, 39, 41, 44, 45, 46, 47, 48, 49, 50, 51] },
];

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const detailEl = $('detail');

let doc = { trophies: [] };
let byId = new Map();
let earned = new Set();
let hideSpoilers = false;
let kind = 'all';
let grade = 'all';
let query = '';
let earnedOnly = false;
let selected = null;

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    earned = new Set(Array.isArray(raw.earned) ? raw.earned : []);
    hideSpoilers = raw.spoilers === true;
  } catch { earned = new Set(); hideSpoilers = false; }
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, earned: [...earned], spoilers: hideSpoilers }));
}

function gradeLabel(g) {
  return g === 'platinum' ? 'Platinum' : g[0].toUpperCase() + g.slice(1);
}

function isMasked(t) {
  return hideSpoilers && t.hidden && !earned.has(t.name);
}

function displayName(t) {
  return isMasked(t) ? 'Hidden story trophy' : t.name;
}

function displayDescription(t) {
  return isMasked(t) ? 'Earn this trophy to reveal its name and description.' : t.description;
}

function filtered() {
  const q = query.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (earnedOnly && !earned.has(t.name)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  $('earnedCount').textContent = n;
  $('barFill').style.width = total ? (n / total * 100) + '%' : '0%';
  $('barWrap').setAttribute('aria-valuenow', String(n));
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) if (earned.has(t.name)) counts[t.grade]++;
  $('gradeCounts').textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
  const next = [...STAGES.flatMap((s) => s.ids), 1]
    .map((id) => byId.get(id)).find((t) => t && !earned.has(t.name));
  $('nextUp').textContent = next ? `Next up: ${next.name}` : (n === total ? 'Platinum earned. Leonida legend.' : '');
}

function renderList() {
  const rows = filtered();
  listEl.replaceChildren();
  $('countLine').textContent = `Showing ${rows.length} of ${doc.trophies.length} trophies · ${earned.size} earned`;
  for (const t of rows) {
    const row = document.createElement('div');
    row.className = 'row' + (earned.has(t.name) ? ' earned' : '') + (selected === t.name ? ' selected' : '');
    row.setAttribute('role', 'listitem');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + displayName(t));
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveState(); renderAll();
    });
    const body = document.createElement('button');
    body.type = 'button';
    body.className = 'rowbody';
    body.addEventListener('click', () => { selected = t.name; renderList(); renderDetail(); });
    const name = document.createElement('span');
    name.className = 'rname';
    name.textContent = displayName(t);
    const desc = document.createElement('span');
    desc.className = 'rdesc';
    desc.textContent = displayDescription(t);
    const meta = document.createElement('span');
    meta.className = 'rmeta';
    const badge = document.createElement('span');
    badge.className = 'badge ' + t.grade;
    badge.textContent = gradeLabel(t.grade);
    meta.append(badge);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = t.kind;
    meta.append(kindTag);
    if (t.target) {
      const target = document.createElement('span');
      target.className = 'tag target';
      target.textContent = `${t.target.toLocaleString('en-US')} ${t.target_label ?? ''}`.trim();
      meta.append(target);
    }
    if (t.missable) {
      const warn = document.createElement('span');
      warn.className = 'tag missable';
      warn.textContent = 'Missable';
      meta.append(warn);
    }
    body.append(name, desc, meta);
    row.append(box, body);
    listEl.append(row);
  }
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Nothing matches these filters. Clear the search or pick another kind.';
    listEl.append(empty);
  }
}

function renderDetail() {
  const t = doc.trophies.find((x) => x.name === selected);
  if (!t) {
    detailEl.replaceChildren();
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy on the left to read its full guide, its sources and any missable warning.';
    detailEl.append(p);
    return;
  }
  detailEl.replaceChildren();
  const head = document.createElement('div');
  head.className = 'dhead';
  const badge = document.createElement('span');
  badge.className = 'badge ' + t.grade;
  badge.textContent = gradeLabel(t.grade);
  const title = document.createElement('h2');
  title.textContent = displayName(t);
  head.append(badge, title);
  detailEl.append(head);
  const desc = document.createElement('p');
  desc.className = 'ddesc';
  desc.textContent = displayDescription(t);
  detailEl.append(desc);
  if (isMasked(t)) {
    const note = document.createElement('p');
    note.className = 'dmasked';
    note.textContent = 'This is a hidden trophy on PlayStation. Tick it off once you have earned it, or turn off Hide story spoilers to see it now.';
    detailEl.append(note);
    return;
  }
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'dwarn';
    warn.textContent = 'Missable: ' + (t.missable_note ?? 'This trophy can be missed.');
    detailEl.append(warn);
  }
  const guide = document.createElement('p');
  guide.className = 'dguide';
  guide.textContent = t.guide;
  detailEl.append(guide);
  if (t.target) {
    const target = document.createElement('p');
    target.className = 'dtarget';
    target.textContent = `Target: ${t.target.toLocaleString('en-US')} ${t.target_label ?? ''}`.trim() + '.';
    detailEl.append(target);
  }
  const srcTitle = document.createElement('h3');
  srcTitle.textContent = 'Sources';
  detailEl.append(srcTitle);
  const srcList = document.createElement('ul');
  srcList.className = 'sources';
  for (const s of t.sources ?? []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    srcList.append(li);
  }
  if (!srcList.children.length) {
    const li = document.createElement('li');
    li.textContent = 'Official trophy list (see footer).';
    srcList.append(li);
  }
  detailEl.append(srcList);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'markbtn';
  toggle.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    saveState(); renderAll();
  });
  detailEl.append(toggle);
}

function renderRoadmap() {
  const wrap = $('stages');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const card = document.createElement('article');
    card.className = 'stage';
    const got = stage.ids.filter((id) => earned.has(byId.get(id).name)).length;
    const head = document.createElement('div');
    head.className = 'stagehead';
    const title = document.createElement('h2');
    title.textContent = stage.title;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = `${stage.hours} · ${got}/${stage.ids.length} earned`;
    head.append(title, hours);
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const list = document.createElement('ul');
    list.className = 'stagelist';
    for (const id of stage.ids) {
      const t = byId.get(id);
      const li = document.createElement('li');
      li.className = earned.has(t.name) ? 'done' : '';
      const jump = document.createElement('button');
      jump.type = 'button';
      jump.textContent = (earned.has(t.name) ? '✓ ' : '') + displayName(t);
      jump.addEventListener('click', () => {
        selected = t.name;
        switchView('tracker');
        renderList(); renderDetail();
        document.querySelector('.layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.append(jump);
      list.append(li);
    }
    card.append(head, blurb, list);
    wrap.append(card);
  }
  const plat = document.createElement('article');
  plat.className = 'stage plat';
  const ph = document.createElement('h2');
  ph.textContent = 'Vice Got a Price! — the platinum';
  const pp = document.createElement('p');
  pp.textContent = earned.has('Vice Got a Price!')
    ? 'Earned. You are a Leonida Legend.'
    : 'Earn the other 54 trophies and the platinum lands on its own. Nothing here needs a second playthrough, an online match or DLC.';
  plat.append(ph, pp);
  wrap.append(plat);
}

function renderMissables() {
  const wrap = $('missableList');
  wrap.replaceChildren();
  const bad = doc.trophies.filter((t) => t.missable);
  for (const t of bad) {
    const card = document.createElement('article');
    card.className = 'misscard';
    const title = document.createElement('h2');
    title.textContent = t.name;
    const desc = document.createElement('p');
    desc.textContent = t.description;
    const note = document.createElement('p');
    note.className = 'dwarn';
    note.textContent = t.missable_note ?? '';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Open in tracker';
    open.addEventListener('click', () => {
      selected = t.name;
      switchView('tracker');
      renderList(); renderDetail();
    });
    card.append(title, desc, note, guide, open);
    wrap.append(card);
  }
  const ok = document.createElement('p');
  ok.className = 'fine';
  ok.textContent = `${doc.trophies.length - bad.length} of ${doc.trophies.length} trophies cannot be missed.`;
  wrap.append(ok);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function switchView(view) {
  for (const btn of document.querySelectorAll('.tabs button')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  $('view-tracker').hidden = view !== 'tracker';
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-missables').hidden = view !== 'missables';
}

document.querySelectorAll('.tabs button').forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});
document.querySelectorAll('#kinds button').forEach((btn) => {
  btn.addEventListener('click', () => {
    kind = btn.dataset.kind;
    document.querySelectorAll('#kinds button').forEach((b) => b.classList.toggle('active', b === btn));
    renderList();
  });
});
$('grade').addEventListener('change', (e) => { grade = e.target.value; renderList(); });
$('search').addEventListener('input', (e) => { query = e.target.value; renderList(); });
$('search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const first = filtered()[0];
    if (first) { selected = first.name; renderList(); renderDetail(); }
  }
});
// Press / anywhere to jump to search.
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== $('search')) {
    e.preventDefault();
    $('search').focus();
  }
});
$('earnedOnly').addEventListener('change', (e) => { earnedOnly = e.target.checked; renderList(); });
$('spoilers').addEventListener('change', (e) => { hideSpoilers = e.target.checked; saveState(); renderAll(); });
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, earned: [...earned], spoilers: hideSpoilers }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    const names = Array.isArray(raw) ? raw : raw.earned;
    const known = new Set(doc.trophies.map((t) => t.name));
    earned = new Set((names ?? []).filter((n) => known.has(n)));
    if (typeof raw.spoilers === 'boolean') hideSpoilers = raw.spoilers;
    $('spoilers').checked = hideSpoilers;
    saveState(); renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  selected = null;
  saveState(); renderAll();
});

loadState();
$('spoilers').checked = hideSpoilers;
doc = await (await fetch(DATA_URL)).json();
byId = new Map(doc.trophies.map((t) => [t.id, t]));
renderAll();
