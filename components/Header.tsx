
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../services/firebase';
import Button from './common/Button';

const Header: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Failed to sign out.");
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-indigo-600">My Vibe Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 hidden sm:block">
              Welcome, {user?.displayName || user?.email}
            </span>
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
