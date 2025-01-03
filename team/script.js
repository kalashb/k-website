import {firebaseOps} from './firebase.js';
// Constants for team size limits
const MAX_MEMBERS = {
    'ECE297': 3,
    'ECE295': 3,
    'default': 2
};

class TeamManager {
    constructor() {
        this.teams = [];
        this.memberCard = null;
        this.currentTeamIndex = null;
    }

    async init() {
        console.log('Initializing application');

        // Add event listeners
        this.setupEventListeners();

        // Load teams
        await this.loadTeamsFromFirebase();

        // Initialize UI
        this.setupErrorHandling();
        this.renderTeams();
        this.setupModalListeners();
    }

    setupEventListeners() {
        const createTeamForm = document.getElementById('create-team-form');
        const memberCardForm = document.getElementById('member-card-form');
        const filterCourses = document.getElementById('filter-courses');

        if (createTeamForm) {
            createTeamForm.addEventListener('submit', this.handleTeamCreate.bind(this));
        }

        if (memberCardForm) {
            memberCardForm.addEventListener('submit', this.handleMemberCardCreate.bind(this));
        }

        if (filterCourses) {
            filterCourses.addEventListener('change', this.handleTeamFilter.bind(this));
        }
    }

    async loadTeamsFromFirebase() {
        try {
            this.teams = await firebaseOps.getTeams();
            console.log('Teams loaded from Firebase:', this.teams);
        } catch (error) {
            console.error('Error loading teams from Firebase:', error);
            this.showNotification('Error loading teams', 'error');
        }
    }

    async saveTeamToFirebase(teamData) {
        try {
            const teamId = await firebaseOps.addTeam(teamData);
            teamData.id = teamId; // Store the ID for future reference
            console.log('Team saved to Firebase:', teamData);
        } catch (error) {
            console.error('Error saving team to Firebase:', error);
            this.showNotification('Error saving team', 'error');
        }
    }

    async updateTeamInFirebase(teamIndex, updatedTeam) {
        try {
            await firebaseOps.updateTeam(updatedTeam.id, updatedTeam);
            console.log('Team updated in Firebase:', updatedTeam);
        } catch (error) {
            console.error('Error updating team in Firebase:', error);
            this.showNotification('Error updating team', 'error');
        }
    }


    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Application error:', event.error);
            this.showNotification('An error occurred. Please try again.', 'error');
        });
    }

    setupModalListeners() {
        const modals = document.querySelectorAll('.modal');
        const closeBtns = document.querySelectorAll('.close-btn');

        console.log('Found modals:', modals.length);
        console.log('Found close buttons:', closeBtns.length);

        // Close modal when clicking outside
        modals.forEach(modal => {
            console.log('Setting up listener for modal:', modal.id);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('Clicked outside modal:', modal.id);
                    this.handleModalClose(modal.id);
                }
            });
        });

        // Close modal when clicking close button
        closeBtns.forEach(btn => {
            console.log('Setting up listener for close button');
            btn.addEventListener('click', (e) => {
                console.log('Close button clicked');
                const modal = e.target.closest('.modal');
                if (modal) {
                    console.log('Found parent modal:', modal.id);
                    this.handleModalClose(modal.id);
                }
            });
        });

        // Add direct handler for member card modal close button
        const memberCardCloseBtn = document.querySelector('#member-card-modal .close-btn');
        if (memberCardCloseBtn) {
            console.log('Found member card close button');
            memberCardCloseBtn.addEventListener('click', () => {
                console.log('Member card close button clicked');
                this.handleModalClose('member-card-modal');
            });
        }
    }


    handleModalClose(modalId) {
        console.log('Attempting to close modal:', modalId);
        const modal = document.getElementById(modalId);
        console.log('Found modal:', modal);

        if (modal) {
            modal.style.display = 'none';
            const form = modal.querySelector('form');
            if (form) {
                console.log('Resetting form');
                form.reset();
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async handleTeamCreate(event) {
        event.preventDefault();

        if (!this.memberCard) {
            this.showNotification('Please create a member card first', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const teamData = {
            course: formData.get('course'),
            section: formData.get('section'),
            creator: this.memberCard,
            members: [],
            requests: [],
            createdAt: new Date().toISOString()
        };

        if (!this.validateTeamData(teamData)) {
            return;
        }

        // Save team to Firebase
        await this.saveTeamToFirebase(teamData);

        this.teams.push(teamData);
        this.handleModalClose('create-team-modal');
        this.showNotification('Team created successfully!', 'success');
        this.renderTeams();
        event.target.reset();
    }

    validateTeamData(teamData) {
        if (!teamData.course || !teamData.section) {
            this.showNotification('Please fill all required fields', 'error');
            return false;
        }

        if (!Object.keys(MAX_MEMBERS).includes(teamData.course) &&
            !MAX_MEMBERS.default) {
            this.showNotification('Invalid course selected', 'error');
            return false;
        }

        if (isNaN(teamData.section) || teamData.section <= 0) {
            this.showNotification('Invalid section number', 'error');
            return false;
        }

        return true;
    }

    async handleJoinRequest(teamIndex) {
        if (!this.memberCard) {
            this.showNotification('Please create a member card first', 'error');
            return;
        }

        const team = this.teams[teamIndex];
        const maxMembers = MAX_MEMBERS[team.course] || MAX_MEMBERS.default;

        if (team.members.length >= maxMembers - 1) {
            this.showNotification('Team is full', 'error');
            return;
        }

        if (team.requests.some(request => request.contact === this.memberCard.contact)) {
            this.showNotification('You have already requested to join this team', 'error');
            return;
        }

        if (team.creator.contact === this.memberCard.contact) {
            this.showNotification('You cannot join your own team', 'error');
            return;
        }

        team.requests.push(this.memberCard);

        // Save updated team back to Firebase
        await this.updateTeamInFirebase(teamIndex, team);

        this.showNotification('Join request sent successfully!', 'success');
        this.renderTeams();
    }

    async handleMemberCardCreate(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const cardData = {
            name: formData.get('name'),
            contact: formData.get('contact'),
            description: formData.get('description'),
            createdAt: new Date().toISOString()
        };

        if (!this.validateMemberCard(cardData)) {
            return;
        }

        this.memberCard = cardData;
        this.handleModalClose('member-card-modal');
        this.showNotification('Member card created successfully!', 'success');
        event.target.reset(); // Reset the form
    }


    validateMemberCard(cardData) {
        if (!cardData.name || !cardData.contact || !cardData.description) {
            this.showNotification('Please fill all required fields', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cardData.contact)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    handleTeamFilter(event) {
        const filter = event.target.value;
        this.renderTeams(filter);
    }

    renderTeams(filter = '') {
        const container = document.getElementById('teams-container');
        if (!container) {
            console.error('Teams container not found');
            return;
        }

        container.innerHTML = '';

        let teamsToDisplay = this.teams;
        if (filter) {
            teamsToDisplay = this.teams.filter(team => team.course === filter);
        }

        console.log('Displaying teams:', teamsToDisplay);

        if (teamsToDisplay.length === 0) {
            container.innerHTML = '<div class="no-teams">No teams available. Create a new team to get started!</div>';
            return;
        }

        teamsToDisplay.forEach((team, index) => {
            const teamCard = this.createTeamCard(team, index);
            container.insertAdjacentHTML('beforeend', teamCard);
        });
    }

    createTeamCard(team, index) {
        const maxMembers = MAX_MEMBERS[team.course] || MAX_MEMBERS.default;
        const isFull = team.members.length >= maxMembers - 1;
        const isCreator = team.creator?.contact === this.memberCard?.contact;
        const hasRequestedToJoin = team.requests?.some(
            request => request.contact === this.memberCard?.contact
        );

        return `
      <div class="card" data-team-index="${index}">
        <div class="card-header">
          <div class="header-content">
            <h3>${team.course} - Section ${team.section}</h3>
            <span class="member-count">Members: ${(team.members?.length || 0) + 1}/${maxMembers}</span>
          </div>
          <button class="btn danger" onclick="teamManager.handleTeamDelete(${index})">
            Delete Team
          </button>
        </div>
        
        <div class="card-body">
          <div class="creator-info">
            <h4>Team Creator</h4>
            <div class="info-content">
              <p><strong>Name:</strong> ${team.creator?.name || 'Unknown'}</p>
              <p><strong>Contact:</strong> ${team.creator?.contact || 'No contact'}</p>
              <p><strong>Description:</strong> ${team.creator?.description || 'No description'}</p>
            </div>
          </div>

          ${this.renderMembers(team)}
          ${this.renderRequests(team, index)}
          
          <div class="card-actions">
            ${!isFull && !isCreator && !hasRequestedToJoin && this.memberCard ?
            `<button class="btn primary" onclick="teamManager.handleJoinRequest(${index})">
                Request to Join
              </button>` : ''
        }
          </div>
        </div>
      </div>
    `;
    }

    renderMembers(team) {
        if (!team.members?.length) return '';

        return `
      <div class="members-section">
        <h4>Team Members</h4>
        <div class="members-list">
          ${team.members.map(member => `
            <div class="member-info">
              <p><strong>Name:</strong> ${member.name}</p>
              <p><strong>Contact:</strong> ${member.contact}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }

    async handleTeamDelete(teamIndex) {
        if (!confirm('Are you sure you want to delete this team?')) {
            return;
        }

        try {
            const team = this.teams[teamIndex];
            // Only delete from Firebase if the team has an ID (was saved to Firebase)
            if (team.id) {
                await firebaseOps.deleteTeam(team.id);
            }
            this.teams.splice(teamIndex, 1);
            this.showNotification('Team deleted successfully', 'success');
            this.renderTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
            this.showNotification('Error deleting team', 'error');
        }
    }

    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.showNotification(
            `An error occurred while ${context}. Please try again.`,
            'error'
        );
    }

    handleDummy(){
        console.log("This is the dummy function");
    }

    cleanup() {
        // Remove event listeners
        const createTeamForm = document.getElementById('create-team-form');
        const memberCardForm = document.getElementById('member-card-form');
        const filterCourses = document.getElementById('filter-courses');

        if (createTeamForm) {
            createTeamForm.removeEventListener('submit', this.handleTeamCreate);
        }

        if (memberCardForm) {
            memberCardForm.removeEventListener('submit', this.handleMemberCardCreate);
        }

        if (filterCourses) {
            filterCourses.removeEventListener('change', this.handleTeamFilter);
        }

        // Clear any remaining notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }

    renderRequests(team, teamIndex) {
        if (!team.requests?.length) return '';

        return `
      <div class="requests-section">
        <h4>Join Requests</h4>
        <div class="requests-list">
          ${team.requests.map((request, requestIndex) => `
            <div class="request-info">
              <div class="request-content">
                <p><strong>Name:</strong> ${request.name}</p>
                <p><strong>Contact:</strong> ${request.contact}</p>
                <p><strong>Description:</strong> ${request.description || 'No description'}</p>
              </div>
              <button class="btn success" onclick="teamManager.handleRequestApproval(${teamIndex}, ${requestIndex})"> Approve </button>
              <button class="btn danger" onclick="teamManager.handleRequestRejection(${teamIndex}, ${requestIndex})"> Reject </button>
              ${request.contact === this.memberCard?.contact ?
            `<button class="btn danger" 
                  onclick="teamManager.handleRequestDelete(${teamIndex}, ${requestIndex})">
                  Cancel Request
                </button>` : ''
        }
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }

    async handleRequestApproval(teamIndex, requestIndex) {
        try {
            // Fetch latest team data first
            const freshTeamData = await firebaseOps.getTeam(this.teams[teamIndex].id);
            if (!freshTeamData) {
                this.showNotification('Team no longer exists', 'error');
                return;
            }

            const request = freshTeamData.requests[requestIndex];
            if (!request) {
                this.showNotification('Request no longer exists', 'error');
                return;
            }

            if (freshTeamData.members.length >= MAX_MEMBERS[freshTeamData.course] - 1) {
                this.showNotification('Team is now full', 'error');
                return;
            }

            freshTeamData.members.push(request);
            freshTeamData.requests.splice(requestIndex, 1);
            await this.updateTeamInFirebase(teamIndex, freshTeamData);
            this.teams[teamIndex] = freshTeamData;
            this.showNotification('Request approved. Member added to team!', 'success');
            this.renderTeams();
        } catch (error) {
            console.error('Error approving request:', error);
            this.showNotification('Error approving request', 'error');
        }
    }


    async handleRequestRejection(teamIndex, requestIndex) {
        const team = this.teams[teamIndex];
        const request = team.requests[requestIndex];

        if (!request) {
            this.showNotification('Request not found', 'error');
            return;
        }

        try {
            team.requests.splice(requestIndex, 1);
            await this.updateTeamInFirebase(teamIndex, team);
            this.showNotification('Request rejected', 'success');
            this.renderTeams();
        } catch (error) {
            console.error('Error rejecting request:', error);
            this.showNotification('Error rejecting request', 'error');
        }
    }

    async handleRequestDelete(teamIndex, requestIndex) {
        if (!confirm('Are you sure you want to cancel your join request?')) {
            return;
        }

        try {
            const team = this.teams[teamIndex];
            team.requests.splice(requestIndex, 1);
            await this.updateTeamInFirebase(teamIndex, team);
            this.showNotification('Join request cancelled successfully', 'success');
            this.renderTeams();
        } catch (error) {
            console.error('Error cancelling request:', error);
            this.showNotification('Error cancelling request', 'error');
        }
    }
}

// Export for use in other modules if needed
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTeamManager);
} else {
    initializeTeamManager();
}

function initializeTeamManager() {
    const teamManager = new TeamManager();
    window.teamManager = teamManager;
    teamManager.init();
}
