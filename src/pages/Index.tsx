import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LotteryHome from './LotteryHome';
import ResultsHistory from './ResultsHistory';
import AdminAuth from './AdminAuth';
import AdminDashboard from './AdminDashboard';

type View = 'home' | 'results' | 'admin-auth' | 'admin-dashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // For admin authentication, we'll use a simple state approach
  // since admin_users is a separate table

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleAdminLogin = () => {
    // Use a complex route path for admin access
    if (window.location.pathname === '/admin-secret-access-2024') {
      setCurrentView('admin-auth');
    } else {
      // Navigate to the secret admin route
      window.history.pushState({}, '', '/admin-secret-access-2024');
      setCurrentView('admin-auth');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (currentView === 'results') {
    return <ResultsHistory onBack={() => handleViewChange('home')} />;
  }

  if (currentView === 'admin-auth') {
    return (
      <AdminAuth
        onBack={() => handleViewChange('home')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentView === 'admin-dashboard' && isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <LotteryHome
      onViewResults={() => handleViewChange('results')}
      onAdminLogin={handleAdminLogin}
    />
  );
};

export default Index;
