import React from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Activity, Settings, Bell, ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';

const UserDashboard = ({ user }) => {
  const stats = [
    { title: 'Login Streak', value: '12 Days', changes: 'Best: 20', trend: Award, color: 'text-primaryClr' },
    { title: 'Profile Completion', value: '85%', changes: '+5%', trend: Activity, color: 'text-primaryClr' },
    { title: 'Notifications', value: '4 New', changes: 'Total 24', trend: Bell, color: 'text-primaryClr' },
    { title: 'Security Score', value: 'Strong', changes: 'Verified', trend: ShieldCheck, color: 'text-primaryClr' }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Message */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Hello, {user?.name.split(' ')[0]}!</h1>
            <p className="text-sm text-primaryClr/60">It's a great day to manage your profile.</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button className="!w-auto !h-10 !px-6 !mt-0 !rounded-xl text-xs font-bold uppercase tracking-wider" icon={Settings}>
            Edit Profile
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
              <Clock size={20} className="text-primaryClr" />
            </div>
            Your Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { title: 'Profile Updated', detail: 'Changed profile picture', time: '2 hours ago' },
              { title: 'Login Successful', detail: 'New login from Chrome / Windows', time: '5 hours ago' },
              { title: 'Password Changed', detail: 'Security update completed', time: '2 days ago' },
              { title: 'Email Verified', detail: 'Primary email confirmed', time: '1 week ago' }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-backgroundClr/50 transition-colors group border border-transparent hover:border-primaryClr/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primaryClr/10 rounded-xl flex items-center justify-center text-primaryClr group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primaryClr">{activity.title}</p>
                    <p className="text-xs text-primaryClr/50">{activity.detail}</p>
                  </div>
                </div>
                <p className="text-[10px] text-secondaryClr/40 font-medium">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-secondaryClr text-primaryClr rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-8">Quick Links</h3>
            <div className="space-y-3">
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <Bell size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Notifications</span>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <ShieldCheck size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Privacy Center</span>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group">
                <Settings size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Account Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-primaryClr text-white rounded-[2rem] p-8 shadow-lg shadow-primaryClr/20">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-60">Storage Used</h4>
            <p className="text-2xl font-black mb-4">1.2 GB / 5 GB</p>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[24%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
