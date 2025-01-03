// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBEtASN95s4tmvLBxHvXmGD6VBlmETpdY8",
    authDomain: "teamselection-44ffc.firebaseapp.com",
    projectId: "teamselection-44ffc",
    storageBucket: "teamselection-44ffc.firebasestorage.app",
    messagingSenderId: "429846007836",
    appId: "1:429846007836:web:d5be3b7686c22d344fcfd9",
    measurementId: "G-5F9QGWYJEH"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
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
      this.unsubscribe = null; // Store reference to unsubscribe from Firebase listener
      
      // Bind methods
      this.init = this.init.bind(this);
      this.renderTeams = this.renderTeams.bind(this);
      this.handleModalClose = this.handleModalClose.bind(this);
      
      // Load member card from localStorage if available
      const savedCard = localStorage.getItem('memberCard');
      if (savedCard) {
        this.memberCard = JSON.parse(savedCard);
      }
    }
  
    async init() {
      try {
        // Set up Firebase real-time listener
        this.setupFirebaseListener();
  
        // Add event listeners
        document.getElementById('create-team-form')?.addEventListener('submit', this.handleTeamCreate.bind(this));
        document.getElementById('member-card-form')?.addEventListener('submit', this.handleMemberCardCreate.bind(this));
        document.getElementById('filter-courses')?.addEventListener('change', this.handleTeamFilter.bind(this));
  
        this.setupErrorHandling();
        this.setupModalListeners();
      } catch (error) {
        console.error('Error initializing teams:', error);
        this.showNotification('Failed to initialize application. Please try again later.', 'error');
      }
    }
  
    setupFirebaseListener() {
      // Unsubscribe from previous listener if exists
      if (this.unsubscribe) {
        this.unsubscribe();
      }
  
      const teamsCollection = collection(db, "teams");
      this.unsubscribe = onSnapshot(teamsCollection, (snapshot) => {
        this.teams = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.renderTeams();
      }, (error) => {
        console.error("Error listening to teams:", error);
        this.showNotification('Error loading teams. Please refresh the page.', 'error');
      });
    }
  /*
    async fetchTeams() {
      const response = await fetch('https://www.kalashb.com/team');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return await response.json();
    }
  
    setupErrorHandling() {
      window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
        this.showNotification('An error occurred. Please try again.', 'error');
      });
    }
  */
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
  /*
    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  */
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
        description: formData.get('description') || '',
        creator: this.memberCard,
        members: [],
        requests: [],
        createdAt: new Date().toISOString(),
      };
    
      if (!this.validateTeamData(teamData)) {
        return;
      }
    
      try {
        const teamsCollection = collection(db, "teams");
        const newTeamRef = doc(teamsCollection);
        await setDoc(newTeamRef, teamData);
        
        this.handleModalClose('create-team-modal');
        this.showNotification('Team created successfully!', 'success');
        event.target.reset();
      } catch (error) {
        console.error('Error saving team:', error);
        this.showNotification('Failed to create team. Please try again.', 'error');
      }
    }
  
    /*
    // Save all teams to Firebase
    async saveTeams(teamData) {
      try {
          const teamsCollection = collection(db, "teams");
          const docRef = doc(teamsCollection); // This creates a new document with auto-generated ID
          teamData.id = docRef.id; // Save the ID in the team data
          await setDoc(docRef, teamData);
          console.log("Team successfully saved to Firebase!");
          return teamData;
      } catch (error) {
          console.error("Error saving team:", error);
          throw error;
      }
  }
  
  
  
  
  validateTeamData(teamData) {
    if (!teamData.course || !teamData.section) {
        this.showNotification('Please fill all required fields', 'error');
        return false;
    }
  
    /*const existingTeam = this.teams.find(team => 
        team.course === teamData.course && 
        team.section === teamData.section &&
        team.creator.contact === this.memberCard.contact
    );
  
    if (existingTeam) {
        this.showNotification('You already have a team in this section', 'error');
        return false;*
    
        
    return true;
  }
  */
  
  async handleJoinRequest(teamId) {
    if (!this.memberCard) {
      this.showNotification('Please create a member card first', 'error');
      return;
    }
  
    const team = this.teams.find(t => t.id === teamId);
    if (!team) {
      this.showNotification('Team not found', 'error');
      return;
    }
  
    const maxMembers = MAX_MEMBERS[team.course] || MAX_MEMBERS.default;
    if (team.members.length >= maxMembers - 1) {
      this.showNotification('Team is full', 'error');
      return;
    }
  
    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        requests: arrayUnion(this.memberCard)
      });
      this.showNotification('Join request sent successfully!', 'success');
    } catch (error) {
      console.error('Error sending join request:', error);
      this.showNotification('Failed to send join request. Please try again.', 'error');
    }
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
      
      // Reset the form
      event.target.reset();
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
          ${team.description ? `
            <div class="team-description">
                <h4>Team Description</h4>
                <p>${team.description}</p>
            </div>
            ` : ''}      
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
  
    async updateTeam(teamData) {
      const response = await fetch(`https://www.kalashb.com/team/${teamData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
    
      if (!response.ok) {
        throw new Error('Failed to update team');
      }
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
  
    async handleTeamDelete(teamId) {
      if (!confirm('Are you sure you want to delete this team?')) {
        return;
      }
  
      try {
        const teamRef = doc(db, "teams", teamId);
        await deleteDoc(teamRef);
        this.showNotification('Team deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting team:', error);
        this.showNotification('Failed to delete team. Please try again.', 'error');
      }
    }
  
    handleModalClose(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';  // Ensure this line is working as expected
        if (modal.querySelector('form')) {
          modal.querySelector('form').reset();
        }
      }
    }  
  
  }
  
  // Initialize the application
  const teamManager = new TeamManager();
  document.addEventListener('DOMContentLoaded', teamManager.init);