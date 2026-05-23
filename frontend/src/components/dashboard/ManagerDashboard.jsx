import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  RefreshCw,
  UserCheck,
  Percent,
  Receipt
} from 'lucide-react';

const ManagerDashboard = ({ user }) => {
  const [metrics, setMetrics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch shop metrics
      const metricsRes = await api.get('/orders/metrics');
      setMetrics(metricsRes.data);

      // Fetch employees for reassignment list
      const usersRes = await api.get('/auth/users');
      // Filter users with role cutter
      const cutters = usersRes.data.filter(u => u.role === 'cutter' || u.role === 'admin');
      setEmployees(cutters);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReassignModal = (order) => {
    setSelectedOrder(order);
    setTargetEmployeeId(order.assignedTo?._id || '');
    setReassigning(true);
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.put(`/orders/${selectedOrder._id}/assign`, {
        employeeId: targetEmployeeId || null
      });
      
      // Refresh metrics
      const metricsRes = await api.get('/orders/metrics');
      setMetrics(metricsRes.data);
      
      setReassigning(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reassign order');
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-primaryClr w-12 h-12" />
        <p className="text-secondaryClr/60 font-semibold animate-pulse">Loading tailorshop performance metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="mx-auto w-12 h-12 mb-3" />
        <p className="font-bold text-lg mb-2">Metrics Unavailable</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={fetchDashboardData} className="w-auto px-6 mx-auto" icon={RefreshCw}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const { performance, bottlenecks, employeeRates, financials } = metrics;
  
  // Format currency
  const formatCurrency = (val) => `${new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)} Birr`;

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome & Refresh Header */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Manager Portal: Welcome, {user?.name}!</h1>
            <p className="text-sm text-primaryClr/60">Overviewing tailoring workshops, active tasks, employees, and profits.</p>
          </div>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 border border-primaryClr/15 text-primaryClr hover:bg-primaryClr/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Revenue (Paid)" 
          value={formatCurrency(performance.totalRevenue)} 
          trend={TrendingUp} 
          trendColor="text-green-600"
          changes="Total cash in"
        />
        <Card 
          title="Expenses & Payroll" 
          value={formatCurrency(performance.totalExpenses)} 
          trend={TrendingDown} 
          trendColor="text-red-500"
          changes="Operational outflow"
        />
        <Card 
          title="Net Profit" 
          value={formatCurrency(performance.profit)} 
          trend={performance.profit >= 0 ? TrendingUp : TrendingDown} 
          trendColor={performance.profit >= 0 ? "text-green-600" : "text-red-500"}
          changes="Margin after expenses"
        />
        <Card 
          title="Completion Rate" 
          value={`${performance.totalOrders > 0 ? Math.round((performance.completedOrders / performance.totalOrders) * 100) : 0}%`} 
          trend={Percent} 
          changes={`${performance.completedOrders} of ${performance.totalOrders} orders`}
        />
      </div>

      {/* Active Bottlenecks & Reassign Tasks */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
        <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          Active Production Bottlenecks
          {bottlenecks.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              {bottlenecks.length} Overdue
            </span>
          )}
        </h3>

        {bottlenecks.length === 0 ? (
          <div className="py-12 text-center text-secondaryClr/40 italic text-sm bg-backgroundClr/10 rounded-2xl border border-dashed border-secondaryClr/10">
            No active bottlenecks detected. All orders are on schedule!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Current Stage</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Assigned Tailor</th>
                  <th className="px-6 py-4">Days Overdue</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondaryClr/5">
                {bottlenecks.map((order) => (
                  <tr key={order._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-primaryClr">{order.orderNumber}</td>
                    <td className="px-6 py-4 font-semibold text-sm">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'cutting' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'sewing' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-secondaryClr/70 font-semibold">
                      {new Date(order.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-secondaryClr/80">
                      {order.assignedTo}
                    </td>
                    <td className="px-6 py-4 font-black text-red-600 text-sm">
                      {order.daysOverdue} days
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReassignModal(order)}
                        className="px-3 py-1.5 bg-primaryClr/10 hover:bg-primaryClr text-primaryClr hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Reassign Task
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employees & Production Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Rates */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-primaryClr/5">
          <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
            <div className="p-2 bg-primaryClr/10 rounded-lg text-primaryClr">
              <Users size={20} />
            </div>
            Employee Production Rates
          </h3>
          
          <div className="space-y-6">
            {employeeRates.map((emp) => (
              <div key={emp._id} className="p-4 bg-backgroundClr/20 hover:bg-backgroundClr/40 border border-secondaryClr/5 rounded-2xl transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-primaryClr">{emp.name}</h4>
                    <p className="text-xs text-secondaryClr/50">{emp.email} • Cutter/Tailor</p>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-secondaryClr/70">
                    <div>Assigned: <span className="font-bold text-primaryClr">{emp.totalAssigned}</span></div>
                    <div>Active: <span className="font-bold text-amber-600">{emp.active}</span></div>
                    <div>Completed: <span className="font-bold text-green-600">{emp.completed}</span></div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-secondaryClr/40">
                    <span>Completion Efficiency</span>
                    <span>{emp.completionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondaryClr/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        emp.completionRate > 75 ? 'bg-green-500' :
                        emp.completionRate > 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${emp.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Profit summaries breakdown */}
        <div className="bg-secondaryClr text-white rounded-[2rem] p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-white/80" />
              Financial Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm text-white/60">Gross Revenue</span>
                <span className="font-bold text-sm text-green-400">{formatCurrency(financials.totalRevenue)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm text-white/60">Operating Expenses</span>
                <span className="font-bold text-sm text-red-400">({formatCurrency(financials.totalExpenses)})</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm font-semibold">Net Operating Income</span>
                <span className="font-black text-sm text-white">{formatCurrency(financials.profit)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/40 mb-2">Expenses by Category</h4>
              {Object.entries(financials.expenseBreakdown).map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize">{category}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/70"
                      style={{ 
                        width: `${financials.totalExpenses > 0 ? (amount / financials.totalExpenses) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Net Profit Margin</p>
            <p className="text-xl font-black text-green-400 mt-1">
              {financials.totalRevenue > 0 
                ? `${((financials.profit / financials.totalRevenue) * 100).toFixed(1)}%` 
                : '0.0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Task Reassignment Modal */}
      <Modal
        isOpen={reassigning}
        onClose={() => { setReassigning(false); setSelectedOrder(null); }}
        title={`Reassign Production Task: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <p className="font-bold">Overdue Alert</p>
              <p className="mt-0.5">This task is currently assigned to <span className="font-bold">{selectedOrder?.assignedTo?.name || 'Unassigned'}</span>. Changing assignment updates work schedules immediately.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">
              Select Tailor / Cutter
            </label>
            <select
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
              required
            >
              <option value="">-- Unassigned --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setReassigning(false); setSelectedOrder(null); }}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Assign Tailor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
