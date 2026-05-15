import React from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Activity, Users, CreditCard, ShieldCheck, TrendingUp, BarChart3, Globe } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const stats = [
    { title: 'Total Users', value: '1,284', changes: '+12%', trend: TrendingUp, color: 'text-primaryClr' },
    { title: 'Active Sessions', value: '842', changes: '+5.4%', trend: Activity, color: 'text-primaryClr' },
    { title: 'Total Revenue', value: '$12,400', changes: '+18.2%', trend: TrendingUp, color: 'text-primaryClr' },
    { title: 'System Load', value: '24%', changes: '-2%', trend: Activity, color: 'text-primaryClr' }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Message */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Admin Portal: Welcome, {user?.name.split(' ')[0]}!</h1>
            <p className="text-sm text-primaryClr/60">System overview and management dashboard.</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button className="!w-auto !h-10 !px-6 !mt-0 !rounded-xl text-xs font-bold uppercase tracking-wider" icon={Activity}>
            System Logs
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            title={stat.title}
            value={stat.value}
            changes={stat.changes}
            trend={stat.trend}
            trendColor={stat.color}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-primaryClr/5 min-h-[400px]">
          <h3 className="text-lg font-bold text-primaryClr mb-8 flex items-center gap-3">
            <div className="p-2 bg-primaryClr/10 rounded-lg">
              <BarChart3 size={20} className="text-primaryClr" />
            </div>
            Global Analytics
          </h3>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-backgroundClr/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primaryClr/10 rounded-xl flex items-center justify-center text-primaryClr">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primaryClr">Traffic Source: Region #{i + 1}</p>
                    <p className="text-xs text-primaryClr/50">Active users from this location • Live</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primaryClr">{Math.floor(Math.random() * 500)} Users</p>
                  <p className="text-[10px] text-green-500 font-bold">+{(Math.random() * 10).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-secondaryClr text-primaryClr rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-8">Admin Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <Users size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">User Management</span>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <CreditCard size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Payment Gateway</span>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <ShieldCheck size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Security Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-primaryClr text-white rounded-[2rem] p-8 shadow-lg shadow-primaryClr/20">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">System Stability</h4>
            <p className="text-2xl font-black mb-4">99.99%</p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[99.99%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
