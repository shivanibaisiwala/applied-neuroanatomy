(function() {
  let cards = [];
  let filtered = [];
  let currentIndex = 0;
  let revealed = false;
  let activeTab = 'all';

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalizeCategory(cat) {
    if (!cat) return '';
    const value = String(cat).toLowerCase().trim();
    if (value === 'surgical_steps' || value === 'surgical-steps' || value === 'steps') return 'surgical-steps';
    return value;
  }

  function promptForCard(card) {
    if (card.front && card.front.trim().length > 0) return card.front;
    if (card.prompt && card.prompt.trim().length > 0) return card.prompt;
    if (card.frontImgs && card.frontImgs.length > 0) return 'Identify the key concept shown.';
    return 'Identify the diagnosis';
  }

  function filterCards() {
    filtered = activeTab === 'all'
      ? shuffle(cards.slice())
      : shuffle(cards.filter(c => c.cat === activeTab));
    currentIndex = 0;
    revealed = false;
    render();
  }

  function render() {
    const cardArea  = document.getElementById('concept-card');
    const counter   = document.getElementById('concept-counter');
    const prevBtn   = document.getElementById('concept-prev');
    const nextBtn   = document.getElementById('concept-next');
    const hint      = document.getElementById('concept-hint');
    const secCount  = document.getElementById('concept-sec-count');

    if (!cardArea) return;

    if (filtered.length === 0) {
      cardArea.innerHTML = '<div class="cc-empty">No cards in this category</div>';
      if (counter)  counter.textContent = '0 / 0';
      if (prevBtn)  prevBtn.disabled = true;
      if (nextBtn)  nextBtn.disabled = true;
      if (secCount) secCount.textContent = '0 cards';
      return;
    }

    const card = filtered[currentIndex];
    let html = '<div class="cc-front">';

    if (card.frontImgs && card.frontImgs.length > 0) {
      card.frontImgs.forEach(src => { html += '<img class="cc-img" src="' + src + '" alt="">'; });
    }

    html += '<div class="cc-question">' + promptForCard(card).replace(/\n/g, '<br>') + '</div>';
    html += '</div>';

    if (revealed) {
      html += '<div class="cc-divider"></div>';
      html += '<div class="cc-back">';
      if (card.backImgs && card.backImgs.length > 0) {
        card.backImgs.forEach(src => { html += '<img class="cc-img cc-back-img" src="' + src + '" alt="">'; });
      }
      if (card.back && card.back.trim().length > 0) {
        html += '<div class="cc-answer">' + card.back.replace(/\n/g, '<br>') + '</div>';
      }
      html += '</div>';
    }

    cardArea.innerHTML = html;
    if (hint)     hint.style.opacity = revealed ? '0' : '1';
    if (counter)  counter.textContent = (currentIndex + 1) + ' / ' + filtered.length;
    if (prevBtn)  prevBtn.disabled = (currentIndex === 0);
    if (nextBtn)  nextBtn.disabled = (currentIndex >= filtered.length - 1);
    if (secCount) secCount.textContent = filtered.length + ' cards';

    // Prefetch next card's images so they load in the background
    if (currentIndex + 1 < filtered.length) {
      const next = filtered[currentIndex + 1];
      if (next.frontImgs) next.frontImgs.forEach(src => { new Image().src = src; });
      if (next.backImgs)  next.backImgs.forEach(src  => { new Image().src = src; });
    }
  }

  function reveal() {
    if (filtered.length === 0) return;
    revealed = true;
    render();
  }

  function goNext() {
    if (currentIndex < filtered.length - 1) {
      currentIndex++;
      revealed = false;
      render();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      revealed = false;
      render();
    }
  }

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.cc-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });
    filterCards();
  }

  function buildTabs() {
    const cats = {};
    cards.forEach(c => { cats[c.cat] = (cats[c.cat] || 0) + 1; });

    const tabBar = document.getElementById('concept-tabs');
    if (tabBar) {
      const order = ['anatomy', 'clinical', 'radiology', 'pathology', 'surgical', 'surgical-steps'];
      const labels = { anatomy: 'Anatomy', clinical: 'Clinical', radiology: 'Rad', pathology: 'Path', surgical: 'Surgical', 'surgical-steps': 'Surg Steps' };
      let h = '<button class="cc-tab active" data-tab="all" onclick="window._setConceptTab(\'all\')">All <span class="cc-tab-count">' + cards.length + '</span></button>';
      order.forEach(cat => {
        if (cats[cat]) {
          h += '<button class="cc-tab" data-tab="' + cat + '" onclick="window._setConceptTab(\'' + cat + '\')">' + labels[cat] + ' <span class="cc-tab-count">' + cats[cat] + '</span></button>';
        }
      });
      tabBar.innerHTML = h;
    }

    const cardArea = document.getElementById('concept-card');
    if (cardArea) {
      cardArea.addEventListener('click', () => { if (!revealed) reveal(); });
    }

    // Arrow key navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'Right') {
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        goPrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) reveal();
      }
    });

    filterCards();
  }

  window.initConcepts = jsonPath => {
    fetch(jsonPath)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load ' + jsonPath);
        return r.json();
      })
      .then(data => {
        cards = data.map(card => ({ ...card, cat: normalizeCategory(card.cat) }));
        buildTabs();
      })
      .catch(e => {
        console.error('Failed to load concepts JSON:', e);
      });
  };

  window._conceptNext = goNext;
  window._conceptPrev = goPrev;
  window._setConceptTab = setTab;
})();
