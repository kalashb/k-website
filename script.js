document.addEventListener('DOMContentLoaded', function() {
    const rootPath = location.pathname.split('/').slice(0, -1).join('/') + '/';

    fetch(rootPath + 'header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;
            
            while (tempDiv.firstChild) {
                headerPlaceholder.appendChild(tempDiv.firstChild);
            }

            updateHeaderLinks();
            setupMenuToggle();
            setActiveLink();
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
});

function updateHeaderLinks() {
    const links = document.querySelectorAll('#main-nav a');
    const rootPath = location.pathname.split('/').slice(0, -1).join('/') + '/';
    
    links.forEach(link => {
        if (!link.getAttribute('href').startsWith('http')) {
            link.href = rootPath + link.getAttribute('href');
        }
    });
}

function setupMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    const nav = document.getElementById('main-nav');

    if (menuToggle && menu && nav) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('visible');
            nav.classList.toggle('expanded');
            
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });

        document.addEventListener('click', function(event) {
            const isClickInside = nav.contains(event.target);
            if (!isClickInside && menu.classList.contains('visible')) {
                menu.classList.remove('visible');
                nav.classList.remove('expanded');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function setActiveLink() {
    const links = document.querySelectorAll('#main-nav a');
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}