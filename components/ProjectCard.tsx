import React from 'react';
import { Project } from '../types';
import Button from './common/Button';
import Icon from './common/Icon';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {

  const handleQuickResume = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    if (project.chatThreadUrl) {
      window.open(project.chatThreadUrl, '_blank', 'noopener,noreferrer');
    }
    if (project.githubRef && project.githubRef.startsWith('http')) {
       window.open(project.githubRef, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="p-5 flex-grow cursor-pointer" onClick={() => onEdit(project)}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-slate-800 pr-2">{project.appName}</h3>
          <span className="flex-shrink-0 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{project.llmName}</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Last chat: {new Date(project.lastChatDate).toLocaleDateString()}</p>
        <p className="text-sm text-slate-600 mt-3 line-clamp-2" title={project.chatThreadTitle}>{project.chatThreadTitle}</p>
        <div className="mt-4 space-y-1 text-xs text-slate-500">
            <p>Last Updated: {new Date(project.lastUpdatedAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="border-t border-slate-200 p-3 bg-slate-50 rounded-b-lg flex justify-between items-center gap-2">
         <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-full transition-colors"><Icon name="edit" className="w-5 h-5"/></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full transition-colors"><Icon name="delete" className="w-5 h-5"/></button>
          <a 
            href={project.appUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`p-2 text-slate-500 rounded-full transition-colors ${project.appUrl ? 'hover:text-indigo-600 hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}
            onClick={(e) => { e.stopPropagation(); if (!project.appUrl) e.preventDefault(); }}
            aria-disabled={!project.appUrl}
            title={project.appUrl ? 'Open App URL' : 'App URL not set'}
          >
            <Icon name="globe" className="w-5 h-5"/>
          </a>
          <a
            href={project.vscodeUrl || '#'}
            className={`p-2 text-slate-500 rounded-full transition-colors ${project.vscodeUrl ? 'hover:text-indigo-600 hover:bg-slate-200' : 'opacity-50 cursor-not-allowed'}`}
            onClick={(e) => { e.stopPropagation(); if (!project.vscodeUrl) e.preventDefault(); }}
            aria-disabled={!project.vscodeUrl}
            title={project.vscodeUrl ? 'Open in VS Code' : 'VS Code URL not set'}
          >
            <Icon name="code" className="w-5 h-5"/>
          </a>
        </div>
        <Button onClick={handleQuickResume} variant="secondary" size="sm">Quick Resume</Button>
      </div>
    </div>
  );
};

export default ProjectCard;