// REAL FIREBASE SERVICE - IMPROVED GOOGLE SIGN-IN
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { User, Project } from '../types';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`Missing Firebase config: VITE_FIREBASE_${key.toUpperCase()}`);
    }
  }
};

validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

// Helper to convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});

// Check for redirect result on app load and handle it
getRedirectResult(authInstance)
  .then((result) => {
    if (result) {
      console.log('Google Sign-In successful after redirect:', result.user.email);
    }
  })
  .catch((error) => {
    console.error('Google Sign-In redirect error:', error);
    // Show user-friendly error
    if (error.code === 'auth/popup-blocked') {
      alert('Popup was blocked. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // User closed popup, ignore this error
    } else {
      alert(`Sign-in error: ${error.message}`);
    }
  });

// --- AUTH SERVICE ---
export const auth = {
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(authInstance, (firebaseUser) => {
      callback(firebaseUser ? convertFirebaseUser(firebaseUser) : null);
    });
  },

  signInWithEmailAndPassword: async (email: string, password: string): Promise<{ user: User }> => {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return { user: convertFirebaseUser(userCredential.user) };
  },

  createUserWithEmailAndPassword: async (email: string, password: string): Promise<{ user: User }> => {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return { user: convertFirebaseUser(userCredential.user) };
  },

  signInWithGoogle: async (): Promise<{ user: User }> => {
    const provider = new GoogleAuthProvider();
    
    // Try popup first (better UX), fall back to redirect if blocked
    try {
      const result = await signInWithPopup(authInstance, provider);
      return { user: convertFirebaseUser(result.user) };
    } catch (error: any) {
      // If popup is blocked or fails, try redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        console.log('Popup blocked, trying redirect...');
        await signInWithRedirect(authInstance, provider);
        // Redirect will happen, return placeholder
        return { user: { uid: '', email: null, displayName: null } };
      }
      throw error;
    }
  },

  signOut: async (): Promise<void> => {
    await signOut(authInstance);
  },
};

// --- FIRESTORE SERVICE ---
export const db = {
  getProjects: async (userId: string): Promise<Project[]> => {
    const projectsRef = collection(firestoreInstance, 'projects');
    const q = query(
      projectsRef, 
      where('userId', '==', userId),
      orderBy('lastUpdatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];
    
    querySnapshot.forEach((doc) => {
      projects.push({ id: doc.id, ...doc.data() } as Project);
    });
    
    return projects;
  },

  addProject: async (userId: string, projectData: Omit<Project, 'id' | 'userId' | 'lastUpdatedAt'>): Promise<Project> => {
    const projectsRef = collection(firestoreInstance, 'projects');
    const newProject = {
      ...projectData,
      userId,
      lastUpdatedAt: Date.now(),
    };
    
    const docRef = await addDoc(projectsRef, newProject);
    
    return {
      id: docRef.id,
      ...newProject,
    } as Project;
  },

  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    const projectRef = doc(firestoreInstance, 'projects', projectId);
    const updatedData = {
      ...updates,
      lastUpdatedAt: Date.now(),
    };
    
    await updateDoc(projectRef, updatedData);
    
    return {
      id: projectId,
      ...updatedData,
    } as Project;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    const projectRef = doc(firestoreInstance, 'projects', projectId);
    await deleteDoc(projectRef);
  },
};