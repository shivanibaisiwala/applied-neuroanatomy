(function() {
  // Creates an isolated concept viewer instance bound to a container element.
  // container: a DOM element whose descendants are queried by data-cc attribute.
  // For the corridor pages the container is the document (uses legacy IDs).
  function createInstance(container) {
    let cards = [];
    let filtered = [];
    let currentIndex = 0;
    let revealed = false;
    let activeTab = 'all';

    function el(role) {
      if (container === document) {
        return document.getElementById('concept-' + role);
      }
      return container.querySelector('[data-cc="' + role + '"]');
    }

    function secCountEl() {
      if (container === document) {
        return document.getElementById('concept-sec-count');
      }
      // data-cc-count attribute on the section header count element
      const id = container.id;
      return document.querySelector('[data-cc-count="' + id + '"]');
    }

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
      const cardArea = el('card');
      const counter  = el('counter');
      const prevBtn  = el('prev');
      const nextBtn  = el('next');
      const hint     = el('hint');
      const secCount = secCountEl();

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

      if (card.boards) {
        html += '<span class="cc-boards-badge">Boards</span>';
      }

      cardArea.innerHTML = html;
      if (hint)     hint.style.opacity = revealed ? '0' : '1';
      if (counter)  counter.textContent = (currentIndex + 1) + ' / ' + filtered.length;
      if (prevBtn)  prevBtn.disabled = (currentIndex === 0);
      if (nextBtn)  nextBtn.disabled = (currentIndex >= filtered.length - 1);
      if (secCount) secCount.textContent = filtered.length + ' cards';

      // Prefetch next card's images
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
      const tabsEl = el('tabs');
      if (tabsEl) {
        tabsEl.querySelectorAll('.cc-tab').forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-tab') === tab);
        });
      }
      filterCards();
    }

    function buildTabs() {
      const cats = {};
      cards.forEach(c => { cats[c.cat] = (cats[c.cat] || 0) + 1; });

      const tabBar = el('tabs');
      if (tabBar) {
        const order = ['anatomy', 'clinical', 'radiology', 'pathology', 'surgical', 'surgical-steps'];
        const labels = { anatomy: 'Anatomy', clinical: 'Clinical', radiology: 'Rad', pathology: 'Path', surgical: 'Surgical', 'surgical-steps': 'Surg Steps' };

        // Build onclick that routes to the right instance
        const instanceId = container === document ? '_global' : container.id;
        const tabFn = 'window._setConceptTab_' + instanceId;

        let h = '<button class="cc-tab active" data-tab="all" onclick="' + tabFn + '(\'all\')">'
          + 'All <span class="cc-tab-count">' + cards.length + '</span></button>';
        order.forEach(cat => {
          if (cats[cat]) {
            h += '<button class="cc-tab" data-tab="' + cat + '" onclick="' + tabFn + '(\'' + cat + '\')">'
              + labels[cat] + ' <span class="cc-tab-count">' + cats[cat] + '</span></button>';
          }
        });
        tabBar.innerHTML = h;
      }

      const cardArea = el('card');
      if (cardArea) {
        cardArea.addEventListener('click', () => { if (!revealed) reveal(); });
      }

      // Arrow key / space navigation — only if this container is document (corridor pages)
      // For cases page, each section handles its own keyboard nav when active
      if (container === document) {
        document.addEventListener('keydown', e => {
          if (e.key === 'ArrowRight' || e.key === 'Right') goNext();
          else if (e.key === 'ArrowLeft' || e.key === 'Left') goPrev();
          else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!revealed) reveal(); }
        });
      }

      filterCards();
    }

    function load(jsonPath) {
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
    }

    // Wire up nav buttons via global references keyed by instance id
    const instanceId = container === document ? '_global' : container.id;
    window['_conceptNext_' + instanceId] = goNext;
    window['_conceptPrev_' + instanceId] = goPrev;
    window['_setConceptTab_' + instanceId] = setTab;

    // For corridor pages: keep legacy global names
    if (container === document) {
      window._conceptNext = goNext;
      window._conceptPrev = goPrev;
      window._setConceptTab = setTab;
    }

    return { load };
  }

  // Corridor pages: single global instance using legacy IDs
  window.initConcepts = function(jsonPath) {
    createInstance(document).load(jsonPath);
  };

  // Cases page: container-based instance
  window.initConceptsIn = function(containerId, jsonPath) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('initConceptsIn: container not found:', containerId);
      return;
    }
    createInstance(container).load(jsonPath);
  };
})();
