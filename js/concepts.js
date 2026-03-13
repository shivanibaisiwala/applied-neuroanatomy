(function() {
  var cards = [];
  var filtered = [];
  var currentIndex = 0;
  var revealed = false;
  var activeTab = 'all';

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function normalizeCategory(cat) {
    if (!cat) return '';
    var value = String(cat).toLowerCase().trim();
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
    if (activeTab === 'all') {
      filtered = shuffle(cards.slice());
    } else {
      filtered = shuffle(cards.filter(function(c) { return c.cat === activeTab; }));
    }
    currentIndex = 0;
    revealed = false;
    render();
  }

  function render() {
    var cardArea = document.getElementById('concept-card');
    var counter = document.getElementById('concept-counter');
    var prevBtn = document.getElementById('concept-prev');
    var nextBtn = document.getElementById('concept-next');
    var hint = document.getElementById('concept-hint');
    var secCount = document.getElementById('concept-sec-count');

    if (!cardArea) return;

    if (filtered.length === 0) {
      cardArea.innerHTML = '<div class="cc-empty">No cards in this category</div>';
      if (counter) counter.textContent = '0 / 0';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (secCount) secCount.textContent = '0 cards';
      return;
    }

    var card = filtered[currentIndex];
    var html = '<div class="cc-front">';

    if (card.frontImgs && card.frontImgs.length > 0) {
      for (var i = 0; i < card.frontImgs.length; i++) {
        html += '<img class="cc-img" src="' + card.frontImgs[i] + '" alt="">';
      }
    }

    html += '<div class="cc-question">' + promptForCard(card).replace(/\n/g, '<br>') + '</div>';

    html += '</div>';

    if (revealed) {
      html += '<div class="cc-divider"></div>';
      html += '<div class="cc-back">';
      if (card.backImgs && card.backImgs.length > 0) {
        for (var j = 0; j < card.backImgs.length; j++) {
          html += '<img class="cc-img cc-back-img" src="' + card.backImgs[j] + '" alt="">';
        }
      }
      if (card.back && card.back.trim().length > 0) {
        html += '<div class="cc-answer">' + card.back.replace(/\n/g, '<br>') + '</div>';
      }
      html += '</div>';
    }

    cardArea.innerHTML = html;
    if (hint) hint.style.opacity = revealed ? '0' : '1';
    if (counter) counter.textContent = (currentIndex + 1) + ' / ' + filtered.length;
    if (prevBtn) prevBtn.disabled = (currentIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentIndex >= filtered.length - 1);
    if (secCount) secCount.textContent = filtered.length + ' cards';
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
    var tabs = document.querySelectorAll('.cc-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    }
    filterCards();
  }

  function buildTabs() {
    var cats = {};
    cards.forEach(function(c) { cats[c.cat] = (cats[c.cat] || 0) + 1; });
    var tabBar = document.getElementById('concept-tabs');
    if (tabBar) {
      var h = '<button class="cc-tab active" data-tab="all" onclick="window._setConceptTab(\'all\')">All <span class="cc-tab-count">' + cards.length + '</span></button>';
      var order = ['pathology','radiology','anatomy','surgical','surgical-steps','clinical'];
      var labels = {pathology:'Path',radiology:'Rad',anatomy:'Anatomy',surgical:'Surgical', 'surgical-steps':'Surg Steps', clinical:'Clinical'};
      order.forEach(function(cat) {
        if (cats[cat]) {
          h += '<button class="cc-tab" data-tab="'+cat+'" onclick="window._setConceptTab(\''+cat+'\')">'+labels[cat]+' <span class="cc-tab-count">'+cats[cat]+'</span></button>';
        }
      });
      tabBar.innerHTML = h;
    }
    var cardArea = document.getElementById('concept-card');
    if (cardArea) {
      cardArea.addEventListener('click', function() {
        if (!revealed) reveal();
      });
    }

    // Arrow key navigation
    document.addEventListener('keydown', function(e) {
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

  window.initConcepts = function(jsonPath) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', jsonPath, true);
    xhr.onload = function() {
      if (xhr.responseText && xhr.responseText.length > 0) {
        try {
          cards = JSON.parse(xhr.responseText).map(function(card) {
            var next = Object.assign({}, card);
            next.cat = normalizeCategory(next.cat);
            return next;
          });
          buildTabs();
        } catch(e) {
          console.error('Failed to parse concepts JSON:', e);
        }
      }
    };
    xhr.onerror = function() {
      console.error('Failed to load concepts JSON');
    };
    xhr.send();
  };

  window._conceptNext = goNext;
  window._conceptPrev = goPrev;
  window._setConceptTab = setTab;
})();
