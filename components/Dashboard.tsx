import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { Project } from '../types';
import Header from './Header';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Icon from './common/Icon';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userProjects = await db.getProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error("Error fetching projects: ", error);
      alert("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await db.deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project.");
      }
    }
  };
  
  const handleExportCSV = () => {
    if (projects.length === 0) {
        alert("No projects to export.");
        return;
    }
    const headers = Object.keys(projects[0]).join(',');
    const rows = projects.map(project => Object.values(project).map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vibe-tracker-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.llmName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or Vibe Platform..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="secondary">
                <Icon name="export" className="w-4 h-4 mr-2" />
                Export CSV
            </Button>
            <Button onClick={handleAddProject}>
                <Icon name="plus" className="w-4 h-4 mr-2"/>
                Add New Project
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center mt-16">
            <Spinner />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">No projects found.</h3>
            <p className="mt-2 text-sm text-slate-500">Get started by adding your first project vibe!</p>
            <Button onClick={handleAddProject} className="mt-4">
              <Icon name="plus" className="w-4 h-4 mr-2"/>
              Add First Project
            </Button>
          </div>
        )}
      </main>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSave={fetchProjects}
      />
    </>
  );
};

export default Dashboard;