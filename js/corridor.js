// Corridor page renderer
// Fetches corridor-data.json and builds page content dynamically,
// eliminating duplication across the 8 near-identical corridor HTML files.

function initCorridor(dataFile) {
  fetch(dataFile)
    .then(r => {
      if (!r.ok) throw new Error('Failed to load ' + dataFile);
      return r.json();
    })
    .then(data => {
      document.title = data.pageTitle;
      document.getElementById('corridor-content').innerHTML = buildCorridorHTML(data);
      if (typeof initViewer === 'function') {
        initViewer('../../cards.json', parseInt(data.num, 10));
      }
      if (data.concepts && data.concepts.type === 'live' && typeof initConcepts === 'function') {
        initConcepts(data.concepts.file || 'concepts.json');
      }
    })
    .catch(e => {
      console.error('Corridor load error:', e);
    });
}

function buildCorridorHTML(data) {
  return (
    '<div class="cor-num">Corridor ' + data.num + '</div>' +
    '<h1 class="cor-title">' + data.title + '</h1>' +
    buildOverviewSection(data.overview) +
    buildAnatomySection(data.anatomy) +
    buildRadiologySection(data.radiology) +
    buildConceptsSection(data.concepts) +
    buildOrPearlsSection(data.orPearls)
  );
}

function buildOverviewSection(ov) {
  const approachCards = ov.approaches.map(a =>
    '<div class="appr-card">' +
      '<div class="appr-name">' + a.name + '</div>' +
      '<div class="appr-desc">' + a.desc + '</div>' +
    '</div>'
  ).join('');
  return (
    '<div class="section">' +
      '<div class="sec-head"><div class="sec-title">Overview</div></div>' +
      '<div class="overview">' +
        '<p class="ov-desc">' + ov.description + '</p>' +
        '<div class="ov-h">Approaches</div>' +
        '<div class="appr-grid">' + approachCards + '</div>' +
      '</div>' +
    '</div>'
  );
}

function buildAnatomySection(anatomy) {
  return (
    '<div class="section">' +
      '<div class="sec-head"><div class="sec-title">Anatomy</div><div class="sec-count">' + anatomy.count + '</div></div>' +
      '<div class="viewer">' +
        '<div class="v-tb"><span class="v-info" id="info"></span><div class="mode-tog"><button class="active" id="m-study" onclick="setMode(\'study\')">Study</button><button id="m-quiz" onclick="setMode(\'quiz\')">Quiz</button></div></div>' +
        '<div class="sl-nav" id="slide-nav"></div>' +
        '<div class="img-area">' +
          '<img id="img-base" src="" alt="Rhoton anatomy">' +
          '<img id="img-hl" src="" alt="">' +
          '<div class="dot" id="dot" onclick="revealCurrent()"><div class="dot-inner"></div></div>' +
          '<div class="float-label" id="flabel"></div>' +
          '<div class="hint" id="hint">click dot to reveal</div>' +
        '</div>' +
        '<div class="v-ctrl"><button class="btn" id="bp" onclick="goPrev()" disabled>\u2190 Prev</button><div class="spacer"></div><button class="btn primary" id="bn" onclick="goNext()">Next \u2192</button></div>' +
        '<div class="v-attr">Adapted from the Rhoton Cranial Anatomy and Surgical Approaches collection. Images used for educational purposes with attribution to Albert L. Rhoton Jr. and the Rhoton Collection at neurosurgicalatlas.com.</div>' +
      '</div>' +
    '</div>'
  );
}

function buildRadiologySection(radiology) {
  return (
    '<div class="section">' +
      '<div class="sec-head"><div class="sec-title">Radiology & Pathology</div><div class="sec-count">Coming soon</div></div>' +
      '<div class="placeholder pink-zone"><div class="ph-title">Imaging cases for this corridor</div><div class="ph-sub">' + radiology.cases + '</div></div>' +
    '</div>'
  );
}

function buildConceptsSection(concepts) {
  if (concepts && concepts.type === 'live') {
    return (
      '<div class="section">' +
        '<div class="sec-head">' +
          '<div class="sec-title">Key Concepts</div>' +
          '<div class="sec-count" id="concept-sec-count"></div>' +
        '</div>' +
        '<div class="concepts-viewer">' +
          '<div id="concept-tabs"></div>' +
          '<div id="concept-card"></div>' +
          '<div id="concept-hint">click to reveal</div>' +
          '<div class="cc-nav">' +
            '<button class="btn" id="concept-prev" onclick="window._conceptPrev()" disabled>\u2190 Prev</button>' +
            '<div class="spacer"></div>' +
            '<span id="concept-counter"></span>' +
            '<div class="spacer"></div>' +
            '<button class="btn primary" id="concept-next" onclick="window._conceptNext()">Next \u2192</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }
  const sub = (concepts && concepts.sub) ? concepts.sub : 'Text-based cards tagged by category';
  return (
    '<div class="section">' +
      '<div class="sec-head"><div class="sec-title">Key Concepts</div><div class="sec-count">Coming soon</div></div>' +
      '<div class="placeholder pink-zone"><div class="ph-title">Management, boards-relevant facts, and discussion points</div><div class="ph-sub">' + sub + '</div></div>' +
    '</div>'
  );
}

function buildOrPearlsSection(pearls) {
  const decCards = pearls.decisions.map(d =>
    '<div class="dec-card"><div class="dec-label">' + d.label + '</div><div class="dec-val">' + d.val + '</div></div>'
  ).join('');
  return (
    '<div class="section">' +
      '<div class="sec-head"><div class="sec-title">OR Pearls</div></div>' +
      '<div class="pearls-card">' +
        '<div class="pearls-h">Imaging Review</div>' +
        '<p class="or-text">' + pearls.imagingReview + '</p>' +
        '<div class="pearls-h">Setup</div>' +
        '<p class="or-text">' + pearls.setup + '</p>' +
        '<div class="pearls-h">Decision Points</div>' +
        '<div class="dec-grid">' + decCards + '</div>' +
      '</div>' +
    '</div>'
  );
}
