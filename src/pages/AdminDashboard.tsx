import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Upload, BarChart3, Calendar } from 'lucide-react';
import AdminResultUpload from '@/components/AdminResultUpload';

interface AdminDashboardProps {
  onLogout: () => void;
}

type ViewType = 'dashboard' | 'upload';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  if (currentView === 'upload') {
    return <AdminResultUpload onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setCurrentView('upload')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload and manage lottery results for any date. Select date and add 6-digit numbers for all time slots.
              </p>
            </CardContent>
          </Card>

          {/* <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View lottery statistics and analytics dashboard.
              </p>
            </CardContent>
          </Card> */}

          {/* <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Manage Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage lottery draw schedules and time slots.
              </p>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;