// your-script.js
document.addEventListener('DOMContentLoaded', function() {
    // Load the header dynamically
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            // After loading the header, set up event listeners for the menu toggle
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
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
});