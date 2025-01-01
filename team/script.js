// Constants for team size limits
const MAX_MEMBERS = {
  'ECE297': 3,
  'ECE295': 3,
  'default': 2
};

class TeamManager {
  constructor() {
    this.teams = JSON.parse(localStorage.getItem('teams')) || [];
    this.memberCard = JSON.parse(localStorage.getItem('memberCard')) || null;
    this.currentTeamIndex = null;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.renderTeams = this.renderTeams.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  init() {
    console.log('Initial teams:', this.teams);
    
    // Add event listeners
    document.getElementById('create-team-form')?.addEventListener('submit', this.handleTeamCreate.bind(this));
    document.getElementById('member-card-form')?.addEventListener('submit', this.handleMemberCardCreate.bind(this));
    document.getElementById('filter-courses')?.addEventListener('change', this.handleTeamFilter.bind(this));

    // Initialize tooltips and error handling
    this.setupErrorHandling();
    this.renderTeams();
    this.setupModalListeners();
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Application error:', event.error);
      this.showNotification('An error occurred. Please try again.', 'error');
    });
  }

  setupModalListeners() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.handleModalClose(modal.id);
        }
      });
    });
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

  handleTeamCreate(event) {
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

    this.teams.push(teamData);
    this.saveTeams();
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

    const existingTeam = this.teams.find(team => 
      team.course === teamData.course && 
      team.section === teamData.section &&
      team.creator.contact === this.memberCard.contact
    );

    if (existingTeam) {
      this.showNotification('You already have a team in this section', 'error');
      return false;
    }

    return true;
  }

  handleJoinRequest(teamIndex) {
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
    this.saveTeams();
    this.showNotification('Join request sent successfully!', 'success');
    this.renderTeams();
  }

  handleMemberCardCreate(event) {
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
    localStorage.setItem('memberCard', JSON.stringify(cardData));
    this.handleModalClose('member-card-modal');
    this.showNotification('Member card created successfully!', 'success');
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

  handleRequestDelete(teamIndex, requestIndex) {
    if (!confirm('Are you sure you want to cancel your join request?')) {
      return;
    }

    const team = this.teams[teamIndex];
    team.requests.splice(requestIndex, 1);
    this.saveTeams();
    this.showNotification('Join request cancelled successfully', 'success');
    this.renderTeams();
  }

  handleTeamDelete(index) {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }

    this.teams.splice(index, 1);
    this.saveTeams();
    this.showNotification('Team deleted successfully', 'success');
    this.renderTeams();
  }

  handleModalClose(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      if (modal.querySelector('form')) {
        modal.querySelector('form').reset();
      }
    }
  }

  saveTeams() {
    localStorage.setItem('teams', JSON.stringify(this.teams));
    console.log('Teams saved:', this.teams);
  }
}

// Initialize the application
const teamManager = new TeamManager();
document.addEventListener('DOMContentLoaded', teamManager.init);