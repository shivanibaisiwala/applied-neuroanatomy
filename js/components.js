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
  const isResources = path.includes('resources');
  const isApproaches = !isResources;

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
        '<a href="' + root + 'index.html"' + (isApproaches ? ' class="active"' : '') + '>Approaches</a>' +
        '<a href="' + root + 'resources.html"' + (isResources ? ' class="active"' : '') + '>Resources</a>' +
      '</div>';
  }

  // SIDEBAR
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    if (isResources) {
      // No corridor sidebar on Resources page
      sidebar.style.display = 'none';
      const main = document.querySelector('.main');
      if (main) main.style.marginLeft = '0';
    } else {
      // Corridor sidebar for Approaches pages
      let html = '';
      corridors.forEach(c => {
        const isActive = c.num === activeCorridor;
        const href = corridorHref(c.num, c.ready);
        html += '<a class="sb-item' + (isActive ? ' active' : '') + '" href="' + href + '">' +
          '<span class="num">' + c.num + '.</span> ' + c.name + '</a>';
      });
      sidebar.innerHTML = html;
    }
  }

  // FOOTER
  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML =
      '<p class="footer-note">Applied Neuroanatomy is a free educational resource for neurosurgery residents, designed as a jumping-off point for structured anatomy review and case-based discussion. Supplement your study with publicly available resources, such as papers and operative videos.</p>' +
      '<p class="footer-meta"><span>Built by Shivani Baisiwala, MD with Claude as co-author</span><a href="https://docs.google.com/forms/d/e/1FAIpQLSc_p0-l9zT8aS7VppSJhd8hRdc094Dq8QindA-Aj7H0K_Eh5w/viewform" id="report-link" target="_blank">Report an issue</a></p>' +
      '<p class="footer-disclaimer">This site is for educational purposes only and does not constitute medical advice. Clinical decisions should be based on individual patient assessment, current evidence, and attending physician guidance.</p>';
  }
})();
