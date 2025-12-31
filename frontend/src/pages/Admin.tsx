import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProjectManagement from '../components/admin/ProjectManagement';
import TestimonialManagement from '../components/admin/TestimonialManagement';
import { Building2, MessageCircle, Users, BarChart3, LogOut } from 'lucide-react';

const Admin = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const tabs = [
    { id: 'projects', name: 'Projects', icon: Building2 },
    { id: 'testimonials', name: 'Testimonials', icon: MessageCircle },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectManagement />;
      case 'testimonials':
        return <TestimonialManagement />;
      case 'users':
        return <div className="p-8 text-center"><p className="text-gray-500">User management coming soon...</p></div>;
      case 'analytics':
        return <div className="p-8 text-center"><p className="text-gray-500">Analytics dashboard coming soon...</p></div>;
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 mt-1">Welcome back, {user.name}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;