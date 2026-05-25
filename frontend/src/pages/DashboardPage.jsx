import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import OfficerDashboard from '../components/dashboard/OfficerDashboard';
import CutterDashboard from '../components/dashboard/CutterDashboard';
import TailorDashboard from '../components/dashboard/TailorDashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'superadmin':
        return <SuperAdminDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return (
          <div className="flex flex-col gap-12">
            <ManagerDashboard user={user} />
            <OfficerDashboard user={user} hideHeader={true} />
          </div>
        );
      case 'officer':
        return <OfficerDashboard user={user} />;
      case 'cutter':
        return <CutterDashboard user={user} />;
      case 'tailor':
        return <TailorDashboard user={user} />;
      case 'customer':
        return <ClientDashboard user={user} />;
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
