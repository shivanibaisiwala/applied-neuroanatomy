// Shared navigation, sidebar, and footer components
// Update this file once to change all pages

(function() {
  // Determine path depth from current page to site root
  const path = window.location.pathname;
  let root = '';
  if (path.includes('/corridors/')) {
    root = '../../';
  } else if (path.includes('/cases/')) {
    root = '../';
  }

  // Determine active nav link
  const isAbout = path.includes('about');
  const isResources = path.includes('resources');
  const isCases = path.includes('cases');
  const isApproaches = !isAbout && !isResources && !isCases;

  // Determine active corridor
  const corridorMatch = path.match(/corridor-(\d+)/);
  const activeCorridor = corridorMatch ? parseInt(corridorMatch[1]) : 0;

  // Cranial corridors data - ADD NEW CRANIAL CORRIDORS HERE
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

  // Spine corridors data - ADD NEW SPINE CORRIDORS HERE
  const spineCorridors = [
    { num: 9, name: 'Anterior Cervical', ready: false },
    { num: 10, name: 'Posterior Cervical', ready: false },
    { num: 11, name: 'Thoracic', ready: false },
    { num: 12, name: 'Lumbar', ready: false }
  ];

  // Build corridor sidebar links
  function corridorHref(num, ready) {
    if (!ready) return '#';
    if (path.includes('/corridors/')) {
      return '../corridor-' + num + '/index.html';
    }
    if (path.includes('/cases/')) {
      return '../corridors/corridor-' + num + '/index.html';
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
        '<a href="' + root + 'cases/index.html"' + (isCases ? ' class="active"' : '') + '>Cases</a>' +
        '<a href="' + root + 'resources.html"' + (isResources ? ' class="active"' : '') + '>Resources</a>' +
      '</div>';
  }

  // SIDEBAR
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    if (isAbout || isResources) {
      // No corridor sidebar on About or Resources pages
      sidebar.style.display = 'none';
      const main = document.querySelector('.main');
      if (main) main.style.marginLeft = '0';
    } else if (!isCases) {
      // Corridor sidebar for Approaches pages
      let html = '<div class="sb-label">Cranial</div>';
      corridors.forEach(c => {
        const isActive = c.num === activeCorridor;
        const href = corridorHref(c.num, c.ready);
        html += '<a class="sb-item' + (isActive ? ' active' : '') + '" href="' + href + '">' +
          '<span class="num">' + c.num + '.</span> ' + c.name + '</a>';
      });
      html += '<div class="sb-label">Spine</div>';
      spineCorridors.forEach(c => {
        html += '<a class="sb-item not-ready" href="#">' +
          '<span class="num">' + c.num + '.</span> ' + c.name + '</a>';
      });
      sidebar.innerHTML = html;
    }
    // Cases pages: sidebar left empty — populated when cases are built
  }

  // FOOTER
  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML =
      '<p class="footer-note">Applied Neuroanatomy is a free educational resource for neurosurgery residents, designed as a jumping-off point for structured anatomy review and case-based discussion. Supplement your study with publicly available resources, such as papers and operative videos.</p>' +
      '<p class="footer-credit">Built by Shivani Baisiwala, MD with Claude as co-author</p>' +
      '<p class="footer-disclaimer">This site is for educational purposes only and does not constitute medical advice. Clinical decisions should be based on individual patient assessment, current evidence, and attending physician guidance.</p>' +
      '<p class="footer-report"><a href="https://docs.google.com/forms/d/e/1FAIpQLSc_p0-l9zT8aS7VppSJhd8hRdc094Dq8QindA-Aj7H0K_Eh5w/viewform" id="report-link" target="_blank">Report an issue</a></p>';
  }
})();
