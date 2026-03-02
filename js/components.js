// Shared navigation, sidebar, and footer components
// Update this file once to change all pages

(function() {
  // Determine path depth from current page to site root
  const path = window.location.pathname;
  let root = '';
  if (path.includes('/corridors/')) {
    root = '../../';
  }

  // Determine active nav link
  const isAbout = path.includes('about');
  const isResources = path.includes('resources');
  const isApproaches = !isAbout && !isResources;

  // Determine active corridor
  const corridorMatch = path.match(/corridor-(\d+)/);
  const activeCorridor = corridorMatch ? parseInt(corridorMatch[1]) : 0;

  // Corridors data - ADD NEW CORRIDORS HERE
  const corridors = [
    { num: 1, name: 'Fronto-Temporal', ready: true },
    { num: 2, name: 'Midline Anterior Skull Base', ready: true },
    { num: 3, name: 'Middle Fossa & Petroclival', ready: true },
    { num: 4, name: 'Cerebellopontine Angle', ready: true },
    { num: 5, name: 'Midline Posterior Fossa', ready: true },
    { num: 6, name: 'Craniovertebral Junction', ready: true },
    { num: 7, name: 'Intraventricular', ready: true },
    { num: 8, name: 'Transorbital & Orbital', ready: true }
  ];

  // Build corridor sidebar links
  function corridorHref(num, ready) {
    if (!ready) return '#';
    if (path.includes('/corridors/')) {
      return '../corridor-' + num + '/index.html';
    }
    return 'corridors/corridor-' + num + '/index.html';
  }

  // TOP NAV
  const nav = document.getElementById('top-nav');
  if (nav) {
    nav.innerHTML =
      '<a class="brand" href="' + root + 'index.html"><span class="accent">Applied </span><span class="solid">Neuroanatomy</span></a>' +
      '<div class="nav-links">' +
        '<a href="' + root + 'about.html"' + (isAbout ? ' class="active"' : '') + '>About</a>' +
        '<a href="' + root + 'index.html"' + (isApproaches ? ' class="active"' : '') + '>Approaches</a>' +
        '<a href="' + root + 'resources.html"' + (isResources ? ' class="active"' : '') + '>Resources</a>' +
      '</div>';
  }

  // SIDEBAR
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    let html = '<div class="sb-label">Cranial</div>';
    corridors.forEach(function(c) {
      const isActive = c.num === activeCorridor;
      const href = corridorHref(c.num, c.ready);
      html += '<a class="sb-item' + (isActive ? ' active' : '') + '" href="' + href + '">' +
        '<span class="num">' + c.num + '.</span> ' + c.name + '</a>';
    });
    html += '<div class="sb-label">Spine</div>';
    html += '<a class="sb-item" href="#"><span class="num">1.</span> Coming soon</a>';
    sidebar.innerHTML = html;
  }

  // FOOTER
  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML =
      '<p class="footer-note">Applied Neuroanatomy is a free educational resource for neurosurgery residents, designed as a jumping-off point for structured anatomy review and case-based discussion. Supplement your study with publicly available resources, such as papers and operative videos.</p>' +
      '<p class="footer-credit">Built by Shivani Baisiwala, MD with Claude as co-author</p>' +
      '<p class="footer-disclaimer">This site is for educational purposes only and does not constitute medical advice. Clinical decisions should be based on individual patient assessment, current evidence, and attending physician guidance.</p>' +
      '<p class="footer-report"><a href="#" id="report-link">Report an issue</a></p>';
  }
})();
