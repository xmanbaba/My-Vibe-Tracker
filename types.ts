export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Project {
  id: string;
  userId: string;
  appName: string;
  appUrl?: string;
  vscodeUrl?: string;
  lastChatDate: string;
  llmName: string;
  chatThreadTitle: string;
  chatThreadUrl: string;
  lastSolvedProblem: string;
  nextProblemToSolve: string;
  githubRef: string;
  firebaseRulesFileUrl?: string;
  firebaseRulesFileName?: string;
  notes: string;
  lastUpdatedAt: number;
}