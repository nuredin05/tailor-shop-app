import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'superadmin':
        return <SuperAdminDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <UserDashboard user={user} />;
    }
  };

  return (
    <div className="w-full">
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
