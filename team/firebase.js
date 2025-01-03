import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBEtASN95s4tmvLBxHvXmGD6VBlmETpdY8",
    authDomain: "teamselection-44ffc.firebaseapp.com",
    projectId: "teamselection-44ffc",
    storageBucket: "teamselection-44ffc.appspot.com",
    messagingSenderId: "429846007836",
    appId: "1:429846007836:web:d5be3b7686c22d344fcfd9",
    measurementId: "G-5F9QGWYJEH"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseOperations {
  constructor() {
    this.teamsCollection = collection(db, 'teams');
}

    async addTeam(teamData) {
        try {
            const docRef = await addDoc(this.teamsCollection, teamData);
            return docRef.id;
        } catch (error) {
            console.error('Error adding team:', error);
            throw error;
        }
    }

    async getTeams() {
        try {
            const snapshot = await getDocs(this.teamsCollection);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting teams:', error);
            throw error;
        }
    }

    async getTeam(teamId) {
        try {
            const teamRef = doc(this.teamsCollection, teamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
                return { id: teamSnap.id, ...teamSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting team:', error);
            throw error;
        }
    }

    async updateTeam(teamId, teamData) {
        try {
            const teamRef = doc(this.teamsCollection, teamId);
            await updateDoc(teamRef, teamData);
        } catch (error) {
            console.error('Error updating team:', error);
            throw error;
        }
    }

    async deleteTeam(teamId) {
        try {
            const teamRef = doc(this.teamsCollection, teamId);
            await deleteDoc(teamRef);
        } catch (error) {
            console.error('Error deleting team:', error);
            throw error;
        }
    }
}

export const firebaseOps = new FirebaseOperations();