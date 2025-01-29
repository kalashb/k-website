// Determine the path to the root directory
const rootPath = location.pathname.split('/').slice(0, -1).join('/') + '/';

// Load the header dynamically
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
        
        // Insert the header content
        while (tempDiv.firstChild) {
            headerPlaceholder.appendChild(tempDiv.firstChild);
        }

        // After loading the header, update the links
        updateHeaderLinks();

        // Set up event listeners for the menu toggle
        setupMenuToggle();

        // Set active link
        setActiveLink();
    })
    .catch(error => {
        console.error('Error loading header:', error);
    });

// Placeholder for other functions: updateHeaderLinks, setupMenuToggle, setActiveLink
function updateHeaderLinks() {
  // Your code to update header links here
}

function setupMenuToggle() {
  // Your code to set up menu toggle event listeners here
}

function setActiveLink() {
  // Your code to set the active link here
}