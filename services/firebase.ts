// MOCK FIREBASE SERVICE
// This file simulates Firebase services using localStorage to provide a
// fully functional demo without requiring a real Firebase backend.

import { User, Project } from '../types';

// --- MOCK AUTH ---
const MOCK_USER_KEY = 'firebase_mock_user';

const mockAuth = {
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    const handleStorageChange = () => {
      const userJson = localStorage.getItem(MOCK_USER_KEY);
      callback(userJson ? JSON.parse(userJson) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial check

    const interval = setInterval(handleStorageChange, 500); // Poll for changes across tabs

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  },
  // FIX: Add password parameter to match function call in Auth.tsx
  signInWithEmailAndPassword: async (email: string, _password: string): Promise<{ user: User }> => {
    const user: User = { uid: `uid_${email}`, email, displayName: email.split('@')[0] };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    return { user };
  },
  // FIX: Add password parameter to match function call in Auth.tsx
  createUserWithEmailAndPassword: async (email: string, _password: string): Promise<{ user: User }> => {
    const user: User = { uid: `uid_${email}`, email, displayName: email.split('@')[0] };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    return { user };
  },
  signInWithGoogle: async (): Promise<{ user: User }> => {
    const user: User = { uid: 'uid_google_user', email: 'google.user@example.com', displayName: 'Google User' };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    return { user };
  },
  signOut: async (): Promise<void> => {
    localStorage.removeItem(MOCK_USER_KEY);
    window.dispatchEvent(new Event('storage'));
  },
};

// --- MOCK FIRESTORE & STORAGE ---
const MOCK_DB_KEY = 'firestore_mock_db';
const MOCK_STORAGE_URL = 'https://picsum.photos/100';

const getProjectsFromStorage = (): Project[] => {
  const dbJson = localStorage.getItem(MOCK_DB_KEY);
  return dbJson ? JSON.parse(dbJson) : [];
};

const saveProjectsToStorage = (projects: Project[]) => {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(projects));
};

const mockDb = {
  getProjects: async (userId: string): Promise<Project[]> => {
    const allProjects = getProjectsFromStorage();
    return allProjects.filter(p => p.userId === userId).sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  },
  addProject: async (userId: string, projectData: Omit<Project, 'id' | 'userId' | 'lastUpdatedAt'>): Promise<Project> => {
    const allProjects = getProjectsFromStorage();
    const newProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      userId,
      lastUpdatedAt: Date.now(),
    };
    saveProjectsToStorage([...allProjects, newProject]);
    return newProject;
  },
  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    const allProjects = getProjectsFromStorage();
    let updatedProject: Project | null = null;
    const newProjects = allProjects.map(p => {
      if (p.id === projectId) {
        updatedProject = { ...p, ...updates, lastUpdatedAt: Date.now() };
        return updatedProject;
      }
      return p;
    });
    if (!updatedProject) throw new Error("Project not found");
    saveProjectsToStorage(newProjects);
    return updatedProject;
  },
  deleteProject: async (projectId: string): Promise<void> => {
    const allProjects = getProjectsFromStorage();
    const newProjects = allProjects.filter(p => p.id !== projectId);
    saveProjectsToStorage(newProjects);
  },
};

const mockStorage = {
  uploadFile: async (userId: string, file: File): Promise<{ url: string, name: string }> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      url: `${MOCK_STORAGE_URL}?random=${Date.now()}`, // Fake URL
      name: file.name,
    };
  },
  deleteFile: async (fileUrl: string): Promise<void> => {
    console.log(`Simulating deletion of file at ${fileUrl}`);
    // No-op for mock
    return Promise.resolve();
  }
}

export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;