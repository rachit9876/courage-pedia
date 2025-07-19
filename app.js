// app.js – Simple page navigation for Courage-pedia

window.addEventListener('load', function() {
  console.log('App loaded');
  
  // Get all page sections and nav links
  const allPages = document.querySelectorAll('.page-section');
  const allNavLinks = document.querySelectorAll('.nav__link');
  const titleLink = document.querySelector('.site-title');
  
  console.log('Found pages:', allPages.length);
  console.log('Found nav links:', allNavLinks.length);
  
  function showPage(targetPageId) {
    console.log('Attempting to show page:', targetPageId);
    
    // Hide all pages, show target page
    allPages.forEach(function(page) {
      const pageId = page.getAttribute('data-page');
      if (pageId === targetPageId) {
        page.classList.remove('hidden');
        console.log('Showing page:', pageId);
      } else {
        page.classList.add('hidden');
        console.log('Hiding page:', pageId);
      }
    });
    
    // Update active nav states
    allNavLinks.forEach(function(link) {
      const linkPageId = link.getAttribute('data-page');
      if (linkPageId === targetPageId) {
        link.classList.add('nav__link--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('nav__link--active');
        link.removeAttribute('aria-current');
      }
    });
    
    // Update URL
    window.location.hash = targetPageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
  
  // Add click handlers to navigation links
  allNavLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      console.log('Nav link clicked:', pageId);
      showPage(pageId);
    });
  });
  
  // Add click handler to site title
  if (titleLink) {
    titleLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Title clicked');
      showPage('overview');
    });
  }
  
  // Handle hash changes (back/forward buttons)
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.querySelector('[data-page="' + hash + '"]')) {
      showPage(hash);
    }
  });
  
  // Initial page load
  const initialHash = window.location.hash.substring(1);
  const validPages = ['overview', 'characters', 'episodes', 'themes', 'production', 'legacy'];
  
  if (initialHash && validPages.includes(initialHash)) {
    showPage(initialHash);
  } else {
    showPage('overview');
  }
});