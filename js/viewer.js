// Anatomy viewer - loads cards.json and manages study/quiz modes
let cards = [];
let N = 0;
let idx = 0;
let revealed = false;
let mode = 'study';
const doneSet = new Set();
let order = [];
let slidesOrder = [];

// O(1) slide lookup: maps slide number -> first order-index for that slide
let slideIndex = new Map();

// Cached DOM references (populated after first render)
let domCache = null;

function getDom() {
  if (!domCache) {
    domCache = {
      dot:    document.getElementById('dot'),
      fl:     document.getElementById('flabel'),
      hl:     document.getElementById('img-hl'),
      hint:   document.getElementById('hint'),
      imgBase: document.getElementById('img-base'),
      info:   document.getElementById('info'),
      bp:     document.getElementById('bp'),
    };
  }
  return domCache;
}

async function initViewer(cardsUrl, corridorNum) {
  const resp = await fetch(cardsUrl).catch(err => {
    console.error('Failed to load cards:', err);
    return null;
  });
  if (!resp || !resp.ok) {
    console.error('Cards fetch failed:', cardsUrl);
    return;
  }
  const allCards = await resp.json();
  cards = corridorNum ? allCards.filter(c => c.corridors && c.corridors.includes(corridorNum)) : allCards;
  N = cards.length;
  order = cards.map((_, i) => i);

  const seen = new Set();
  cards.forEach(c => { if (!seen.has(c.s)) { seen.add(c.s); slidesOrder.push(c.s); } });

  // Build O(1) slideIndex map
  buildSlideIndex();

  const snav = document.getElementById('slide-nav');
  slidesOrder.forEach(s => {
    const b = document.createElement('button');
    b.className = 'sl-btn'; b.textContent = s;
    b.onclick = () => jumpToSlide(s); b.dataset.slide = s;
    snav.appendChild(b);
  });

  render();
}

// Rebuild slideIndex after order changes (study vs quiz mode)
function buildSlideIndex() {
  slideIndex.clear();
  for (let i = 0; i < N; i++) {
    const s = cards[order[i]].s;
    if (!slideIndex.has(s)) slideIndex.set(s, i);
  }
}

// Debounced resize handler
let _resizeTimer = null;
function fitImage() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(_doFitImage, 100);
}

function _doFitImage() {
  const { imgBase } = getDom();
  const area = document.querySelector('.img-area');
  const maxH = window.innerHeight * 0.85;
  const ratio = imgBase.naturalWidth / imgBase.naturalHeight;
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

  const { dot, fl, hl, hint, imgBase, info, bp } = getDom();

  // Hide everything immediately
  dot.style.display = 'none';
  fl.classList.remove('show');
  fl.textContent = '';
  hl.classList.remove('show');
  hint.classList.add('hide');

  // Load base image, then set up everything else after it loads
  imgBase.onload = () => {
    _doFitImage();

    // Load highlight
    hl.src = card.img;
    hl.onload = () => {
      hl.classList.add('show');

      // Now position and show dot
      dot.style.left = card.dx + '%';
      dot.style.top = card.dy + '%';
      dot.classList.remove('revealed');
      dot.style.display = '';

      // Set up label (hidden until click)
      fl.textContent = card.l;
      fl.className = 'float-label ' + (card.side === 'r' ? 'r' : 'l');
      if (card.side === 'r') { fl.style.left = (card.dx + 3.5) + '%'; fl.style.right = ''; }
      else { fl.style.right = (100 - card.dx + 3.5) + '%'; fl.style.left = ''; }
      fl.style.top = card.dy + '%';

      // Show hint
      hint.classList.remove('hide');
    };
  };
  imgBase.src = card.base;

  // Update UI controls (these can happen immediately)
  if (mode === 'study') {
    let ss = 0, sc = 0;
    for (let i = 0; i < N; i++) { if (cards[order[i]].s === card.s) { if (sc === 0) ss = i; sc++; } }
    info.textContent = (idx - ss + 1) + ' / ' + sc + ' \u00b7 Slide ' + card.s;
  } else {
    info.textContent = (idx + 1) + ' / ' + N;
  }

  document.querySelectorAll('.sl-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.slide) === card.s);
  });

  bp.disabled = (idx === 0);
}

function revealCurrent() {
  if (revealed) return;
  revealed = true; doneSet.add(order[idx]);
  const { fl, dot, hint } = getDom();
  fl.classList.add('show');
  dot.classList.add('revealed');
  hint.classList.add('hide');
}

function goNext() {
  if (!revealed) revealCurrent();
  else if (idx < N - 1) { idx++; render(); }
}

function goPrev() { if (idx > 0) { idx--; render(); } }

function jumpToSlide(s) {
  // O(1) lookup via slideIndex map
  const i = slideIndex.get(s);
  if (i !== undefined) { idx = i; render(); }
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
  buildSlideIndex();
  idx = 0; doneSet.clear(); render();
}

window.addEventListener('resize', fitImage);

document.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); revealCurrent(); }
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft') goPrev();
});
