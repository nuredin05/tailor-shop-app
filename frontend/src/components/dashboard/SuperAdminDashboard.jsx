import React from 'react';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Terminal, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

const SuperAdminDashboard = ({ user }) => {
  const stats = [
    { title: 'Server Status', value: 'Healthy', changes: '100% Up', trend: Server, color: 'text-primaryClr' },
    { title: 'DB Queries/s', value: '1.2k', changes: '+5%', trend: Database, color: 'text-primaryClr' },
    { title: 'API Latency', value: '42ms', changes: '-8ms', trend: Activity, color: 'text-primaryClr' },
    { title: 'Threats Blocked', value: '1,420', changes: 'Last 24h', trend: ShieldAlert, color: 'text-primaryClr' }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Message */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondaryClr text-primaryClr flex items-center justify-center shadow-lg">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Root Access: {user?.name}</h1>
            <p className="text-sm text-primaryClr/60">System core monitor and infrastructure management.</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <Button className="!w-auto !h-10 !px-6 !mt-0 !rounded-xl text-xs font-bold uppercase tracking-wider bg-secondaryClr text-primaryClr" icon={Terminal}>
            Open Terminal
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
              <Activity size={20} className="text-primaryClr" />
            </div>
            Infrastructure Health
          </h3>
          <div className="space-y-6">
            {[
              { name: 'US-East-1 (Primary)', status: 'Operational', load: '45%' },
              { name: 'EU-West-1 (Secondary)', status: 'Operational', load: '32%' },
              { name: 'Main Database Cluster', status: 'Healthy', load: '18%' },
              { name: 'Cache Layer (Redis)', status: 'Optimal', load: '12%' }
            ].map((node, i) => (
              <div key={i} className="p-5 rounded-2xl bg-backgroundClr/30 border border-primaryClr/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Server size={18} className="text-primaryClr" />
                    <span className="font-bold text-sm text-primaryClr">{node.name}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                    {node.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-primaryClr/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primaryClr rounded-full transition-all duration-1000" 
                      style={{ width: node.load }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-primaryClr/60">{node.load} Load</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-secondaryClr text-primaryClr rounded-[2rem] p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
              <ShieldAlert size={20} />
              Security Node
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group border border-white/5">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-sm font-medium">Critical Alerts (0)</span>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all group border border-white/5">
                <Terminal size={20} className="text-primaryClr" />
                <span className="text-sm font-medium">Audit Trail</span>
              </button>
            </div>
          </div>

          <div className="bg-primaryClr text-white rounded-[2rem] p-8 shadow-lg shadow-primaryClr/20">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-60">Memory Usage</h4>
            <div className="flex justify-between items-end mb-2">
              <p className="text-3xl font-black">4.2<span className="text-lg opacity-60">GB</span></p>
              <p className="text-xs font-bold text-white/60 mb-1">/ 16GB Total</p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[26%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
