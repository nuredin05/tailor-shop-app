import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
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
  // All-orders assign modal
  const [allOrders, setAllOrders] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch shop metrics & all orders
      const [metricsRes, ordersRes] = await Promise.all([
        api.get('/orders/metrics'),
        api.get('/orders')
      ]);
      setMetrics(metricsRes.data);
      setAllOrders(ordersRes.data);

      // Fetch employees for reassignment list
      const usersRes = await api.get('/auth/users');
      // Include all production staff: cutter, tailor, admin
      const staff = usersRes.data.filter(u => ['cutter', 'tailor', 'admin'].includes(u.role));
      setEmployees(staff);
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

  const openAssignModal = (order) => {
    setAssigningOrder(order);
    setAssignEmployeeId(order.assignedTo?._id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningOrder) return;
    setAssignLoading(true);
    try {
      const res = await api.put(`/orders/${assigningOrder._id}/assign`, {
        employeeId: assignEmployeeId || null
      });
      // Update allOrders list with new assignment
      setAllOrders(prev => prev.map(o => o._id === assigningOrder._id
        ? { ...o, assignedTo: employees.find(e => e._id === assignEmployeeId) || null }
        : o
      ));
      setIsAssignModalOpen(false);
      setAssigningOrder(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to assign tailor');
    } finally {
      setAssignLoading(false);
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
            <h1 className="text-xl font-bold text-primaryClr">{t('manager.title')}: {user?.name}!</h1>
            <p className="text-sm text-primaryClr/60">{t('manager.subtitle')}</p>
          </div>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 border border-primaryClr/15 text-primaryClr hover:bg-primaryClr/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('manager.refreshStats')}
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title={t('manager.revenue')} 
          value={formatCurrency(performance.totalRevenue)} 
          trend={TrendingUp} 
          trendColor="text-green-600"
        />
        <Card 
          title={t('manager.expensesPayroll')} 
          value={formatCurrency(performance.totalExpenses)} 
          trend={TrendingDown} 
          trendColor="text-red-500"
        />
        <Card 
          title={t('manager.netProfit')} 
          value={formatCurrency(performance.profit)} 
          trend={performance.profit >= 0 ? TrendingUp : TrendingDown} 
          trendColor={performance.profit >= 0 ? "text-green-600" : "text-red-500"}
        />
        <Card 
          title={t('manager.completionRate')} 
          value={`${performance.totalOrders > 0 ? Math.round((performance.completedOrders / performance.totalOrders) * 100) : 0}%`} 
          trend={Percent} 
        />
      </div>

      {/* Active Bottlenecks & Reassign Tasks */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
        <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          {t('manager.bottlenecks')}
          {bottlenecks.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
              {bottlenecks.length} {t('manager.daysOverdue').split(' ')[1]}
            </span>
          )}
        </h3>

        {bottlenecks.length === 0 ? (
          <div className="py-12 text-center text-secondaryClr/40 italic text-sm bg-backgroundClr/10 rounded-2xl border border-dashed border-secondaryClr/10">
            {t('manager.noBottlenecks')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                  <th className="px-6 py-4">{t('orders.orderNumber')}</th>
                  <th className="px-6 py-4">{t('orders.customer')}</th>
                  <th className="px-6 py-4">{t('orders.status')}</th>
                  <th className="px-6 py-4">{t('orders.dueDate')}</th>
                  <th className="px-6 py-4">{t('orders.assignedTo')}</th>
                  <th className="px-6 py-4">{t('manager.daysOverdue')}</th>
                  <th className="px-6 py-4 text-right">{t('orders.actions')}</th>
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
                      {order.daysOverdue} {t('common.days')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReassignModal(order)}
                        className="px-3 py-1.5 bg-primaryClr/10 hover:bg-primaryClr text-primaryClr hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        {t('manager.reassignTask')}
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
            {t('manager.employeeRates')}
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
              {t('manager.financialBreakdown')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm text-white/60">{t('manager.grossRevenue')}</span>
                <span className="font-bold text-sm text-green-400">{formatCurrency(financials.totalRevenue)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm text-white/60">{t('manager.operatingExpenses')}</span>
                <span className="font-bold text-sm text-red-400">({formatCurrency(financials.totalExpenses)})</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm font-semibold">{t('manager.netIncome')}</span>
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
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">{t('manager.profitMargin')}</p>
            <p className="text-xl font-black text-green-400 mt-1">
              {financials.totalRevenue > 0 
                ? `${((financials.profit / financials.totalRevenue) * 100).toFixed(1)}%` 
                : '0.0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* All Orders — Assign Tailor Table */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
        <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
          <div className="p-2 bg-primaryClr/10 rounded-lg text-primaryClr">
            <UserCheck size={20} />
          </div>
          {t('manager.assignTailors')}
        </h3>

        {allOrders.length === 0 ? (
          <div className="py-12 text-center text-secondaryClr/40 italic text-sm bg-backgroundClr/10 rounded-2xl border border-dashed border-secondaryClr/10">
            No active orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                  <th className="px-6 py-4">{t('orders.orderNumber')}</th>
                  <th className="px-6 py-4">{t('orders.customer')}</th>
                  <th className="px-6 py-4">{t('orders.status')}</th>
                  <th className="px-6 py-4">{t('orders.assignedTo')}</th>
                  <th className="px-6 py-4">{t('orders.dueDate')}</th>
                  <th className="px-6 py-4 text-right">{t('orders.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondaryClr/5">
                {allOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-primaryClr">{order.orderNumber}</td>
                    <td className="px-6 py-4 font-semibold text-sm">
                      {order.customer?.name || 'Unknown'}
                      <p className="text-xs text-secondaryClr/50">{order.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'cutting' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'sewing' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'fitting' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {order.assignedTo ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-primaryClr">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {order.assignedTo.name}
                          <span className="text-[10px] text-secondaryClr/50 font-normal">({t(`users.roles.${order.assignedTo.role}`) || order.assignedTo.role})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-secondaryClr/40 italic">{t('manager.unassigned')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondaryClr/70">
                      {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAssignModal(order)}
                        className="px-3 py-1.5 bg-primaryClr/10 hover:bg-primaryClr text-primaryClr hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        {order.assignedTo ? t('orders.reassign') : t('orders.assignTailor')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overdue Bottleneck Task Reassignment Modal */}
      <Modal
        isOpen={reassigning}
        onClose={() => { setReassigning(false); setSelectedOrder(null); }}
        title={`Reassign Overdue Task: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <p className="font-bold">Overdue Alert</p>
              <p className="mt-0.5">Currently assigned to <span className="font-bold">{selectedOrder?.assignedTo?.name || 'Unassigned'}</span>. Changing assignment updates work schedules immediately.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Select Tailor / Cutter</label>
            <select
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
              required
            >
              <option value="">-- Unassigned --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setReassigning(false); setSelectedOrder(null); }} className="w-1/2">Cancel</Button>
            <Button type="submit" className="w-1/2">Assign Tailor</Button>
          </div>
        </form>
      </Modal>

      {/* Direct Assign Tailor Modal (all orders) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setAssigningOrder(null); }}
        title={`Assign Tailor: ${assigningOrder?.orderNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-5">
          <div className="p-4 bg-primaryClr/5 rounded-xl border border-primaryClr/10 text-sm">
            <p className="text-xs text-secondaryClr/60">Customer</p>
            <p className="font-bold text-primaryClr">{assigningOrder?.customer?.name || '—'}</p>
            <p className="text-xs text-secondaryClr/50 mt-1">Current stage: <span className="font-bold capitalize">{assigningOrder?.status}</span></p>
          </div>

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Assign to Tailor / Cutter</label>
            <select
              value={assignEmployeeId}
              onChange={(e) => setAssignEmployeeId(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="">-- Remove Assignment --</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.role.charAt(0).toUpperCase() + emp.role.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-secondaryClr/40 mt-2">Select a tailor or cutter from your production staff.</p>
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setIsAssignModalOpen(false); setAssigningOrder(null); }} className="w-1/2">Cancel</Button>
            <Button type="submit" className="w-1/2" disabled={assignLoading}>
              {assignLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
