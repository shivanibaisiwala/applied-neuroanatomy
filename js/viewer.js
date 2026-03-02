// Anatomy viewer - loads cards.json and manages study/quiz modes
let cards = [];
let N = 0;
let idx = 0;
let revealed = false;
let mode = 'study';
const doneSet = new Set();
let order = [];
let slidesOrder = [];

async function initViewer(cardsUrl) {
  const resp = await fetch(cardsUrl);
  cards = await resp.json();
  N = cards.length;
  order = cards.map((_, i) => i);

  const seen = new Set();
  cards.forEach(c => { if (!seen.has(c.s)) { seen.add(c.s); slidesOrder.push(c.s); } });

  const snav = document.getElementById('slide-nav');
  slidesOrder.forEach(s => {
    const b = document.createElement('button');
    b.className = 'sl-btn'; b.textContent = s;
    b.onclick = () => jumpToSlide(s); b.dataset.slide = s;
    snav.appendChild(b);
  });

  render();
}

function fitImage() {
  const img = document.getElementById('img-base');
  const area = document.querySelector('.img-area');
  const maxH = window.innerHeight * 0.85;
  const ratio = img.naturalWidth / img.naturalHeight;
  const fullW = area.parentElement.clientWidth;
  const heightAtFullW = fullW / ratio;
  if (heightAtFullW > maxH) {
    area.style.maxWidth = Math.floor(maxH * ratio) + 'px';
  } else {
    area.style.maxWidth = '';
  }
}

function render() {
  const ci = order[idx], card = cards[ci];
  revealed = false;

  const imgBase = document.getElementById('img-base');
  imgBase.onload = fitImage;
  imgBase.src = card.base;
  const hl = document.getElementById('img-hl');
  hl.classList.remove('show');
  hl.src = card.img;
  hl.onload = function(){ hl.classList.add('show'); };

  const dot = document.getElementById('dot');
  dot.style.left = card.dx + '%'; dot.style.top = card.dy + '%';
  dot.classList.remove('revealed');

  const fl = document.getElementById('flabel');
  fl.textContent = ''; fl.classList.remove('show'); fl.textContent = card.l;
  fl.className = 'float-label ' + (card.side === 'r' ? 'r' : 'l');
  if (card.side === 'r') { fl.style.left = (card.dx + 3.5) + '%'; fl.style.right = ''; }
  else { fl.style.right = (100 - card.dx + 3.5) + '%'; fl.style.left = ''; }
  fl.style.top = card.dy + '%';

  document.getElementById('hint').classList.remove('hide');

  if (mode === 'study') {
    let ss = 0, sc = 0;
    for (let i = 0; i < N; i++) { if (cards[order[i]].s === card.s) { if (sc === 0) ss = i; sc++; } }
    document.getElementById('info').textContent = (idx - ss + 1) + ' / ' + sc + ' \u00b7 Slide ' + card.s;
  } else {
    document.getElementById('info').textContent = (idx + 1) + ' / ' + N;
  }

  document.querySelectorAll('.sl-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.slide) === card.s);
  });

  document.getElementById('bp').disabled = (idx === 0);
}

function revealCurrent() {
  if (revealed) return;
  revealed = true; doneSet.add(order[idx]);
  document.getElementById('flabel').classList.add('show');
  document.getElementById('dot').classList.add('revealed');
  document.getElementById('hint').classList.add('hide');
}

function goNext() {
  if (!revealed) revealCurrent();
  else if (idx < N - 1) { idx++; render(); }
}

function goPrev() { if (idx > 0) { idx--; render(); } }

function jumpToSlide(s) {
  for (let i = 0; i < N; i++) { if (cards[order[i]].s === s) { idx = i; render(); return; } }
}

function setMode(m) {
  mode = m;
  document.getElementById('m-study').classList.toggle('active', m === 'study');
  document.getElementById('m-quiz').classList.toggle('active', m === 'quiz');
  if (m === 'quiz') {
    order = cards.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } else {
    order = cards.map((_, i) => i);
  }
  idx = 0; doneSet.clear(); render();
}

window.addEventListener('resize', fitImage);

document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); revealCurrent(); }
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft') goPrev();
});
