import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Project } from '../types';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { VIBE_PLATFORM_OPTIONS } from '../constants';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import Select from './common/Select';
import Textarea from './common/Textarea';
import Spinner from './common/Spinner';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project, onSave }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'userId' | 'lastUpdatedAt'>>({
    appName: '',
    lastChatDate: new Date().toISOString().split('T')[0],
    llmName: VIBE_PLATFORM_OPTIONS[0],
    chatThreadTitle: '',
    chatThreadUrl: '',
    appUrl: '',
    vscodeUrl: '',
    lastSolvedProblem: '',
    nextProblemToSolve: '',
    githubRef: '',
    notes: '',
    firebaseRulesUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      // When a 'YYYY-MM-DD' string is passed to new Date(), it's treated as UTC.
      // However, converting it back can shift the date based on the local timezone.
      // To prevent this, we parse the date parts manually as UTC to ensure consistency.
      const dateParts = project.lastChatDate ? project.lastChatDate.split('-').map(s => parseInt(s, 10)) : [];
      let formattedDate = new Date().toISOString().split('T')[0]; // Default to today

      if (dateParts.length === 3 && !isNaN(dateParts[0]) && !isNaN(dateParts[1]) && !isNaN(dateParts[2])) {
        const [year, month, day] = dateParts;
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(utcDate.getTime())) {
          formattedDate = utcDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        appName: project.appName,
        lastChatDate: formattedDate,
        llmName: project.llmName,
        chatThreadTitle: project.chatThreadTitle,
        chatThreadUrl: project.chatThreadUrl,
        appUrl: project.appUrl || '',
        vscodeUrl: project.vscodeUrl || '',
        lastSolvedProblem: project.lastSolvedProblem,
        nextProblemToSolve: project.nextProblemToSolve,
        githubRef: project.githubRef,
        notes: project.notes,
        firebaseRulesUrl: project.firebaseRulesUrl || '',
      });
    } else {
      setFormData({
        appName: '',
        lastChatDate: new Date().toISOString().split('T')[0],
        llmName: VIBE_PLATFORM_OPTIONS[0],
        chatThreadTitle: '',
        chatThreadUrl: '',
        appUrl: '',
        vscodeUrl: '',
        lastSolvedProblem: '',
        nextProblemToSolve: '',
        githubRef: '',
        notes: '',
        firebaseRulesUrl: '',
      });
    }
    setError('');
  }, [project, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to save a project.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (project) {
        await db.updateProject(project.id, formData);
      } else {
        await db.addProject(user.uid, formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving project:", err);
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project Vibe' : 'Add New Project Vibe'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="App Name" name="appName" value={formData.appName} onChange={handleChange} required />
            <Input label="Last Chat Date" name="lastChatDate" type="date" value={formData.lastChatDate} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Vibe Platform" name="llmName" value={formData.llmName} onChange={handleChange}>
                {VIBE_PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Select>
            <Input label="GitHub Tag or Branch URL" name="githubRef" value={formData.githubRef} onChange={handleChange} placeholder="https://github.com/user/repo/tree/main" />
        </div>
        
        <Input label="Chat Thread Title" name="chatThreadTitle" value={formData.chatThreadTitle} onChange={handleChange} required />
        <Input label="Chat Thread URL" name="chatThreadUrl" type="url" value={formData.chatThreadUrl} onChange={handleChange} required placeholder="https://claude.ai/chat/..." />
        <Input label="App URL" name="appUrl" type="url" value={formData.appUrl} onChange={handleChange} placeholder="https://myapp.vercel.app" />
        <Input label="VS-CODE URL" name="vscodeUrl" value={formData.vscodeUrl} onChange={handleChange} placeholder="vscode://file/path/to/project" />
        
        <Textarea label="Last Solved Problem" name="lastSolvedProblem" value={formData.lastSolvedProblem} onChange={handleChange} />
        <Textarea label="Next Problem to Solve" name="nextProblemToSolve" value={formData.nextProblemToSolve} onChange={handleChange} />
        <Textarea label="Notes / Key Decisions" name="notes" value={formData.notes} onChange={handleChange} />
        
        <Input 
          label="Firebase Rules URL" 
          name="firebaseRulesUrl" 
          type="url" 
          value={formData.firebaseRulesUrl} 
          onChange={handleChange} 
          placeholder="https://example.com/my-rules.json" 
        />

        <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Saving...' : 'Save Project'}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;