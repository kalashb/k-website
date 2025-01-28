document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const nav = document.getElementById('main-nav');
  
    menuToggle.addEventListener('click', function() {
      menu.classList.toggle('visible');
      nav.classList.toggle('expanded');
      
      // Toggle aria-expanded attribute
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
  
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInside = nav.contains(event.target);
      if (!isClickInside && menu.classList.contains('visible')) {
        menu.classList.remove('visible');
        nav.classList.remove('expanded');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });