import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Download,
  Search,
  BarChart3,
  FileText
} from 'lucide-react';

const SkeletonRow = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-3 sm:px-6 py-2 sm:py-4">
        <div className="h-3 bg-secondaryClr/10 rounded-full animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
      </td>
    ))}
  </tr>
);

const ReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = ordersLoading || metricsLoading || usersLoading;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError(null);
    setOrdersLoading(true);
    setMetricsLoading(true);
    setUsersLoading(true);

    // Fetch each independently so UI renders as soon as any one resolves
    api.get('/orders/metrics')
      .then(r => setMetrics(r.data))
      .catch(() => setError('Failed to load metrics.'))
      .finally(() => setMetricsLoading(false));

    api.get('/orders')
      .then(r => setAllOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setOrdersLoading(false));

    api.get('/auth/users')
      .then(r => setEmployees(r.data.filter(u => ['cutter', 'tailor', 'admin'].includes(u.role))))
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setUsersLoading(false));
  };

  const formatCurrency = (val) =>
    `${new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0)} Birr`;

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (startDate && new Date(o.createdAt || o.dueDate) < new Date(startDate)) return false;
      if (endDate && new Date(o.createdAt || o.dueDate) > new Date(endDate)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.phone?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allOrders, startDate, endDate, searchQuery]);

  // Filtered Employees with stats
  const filteredEmployees = useMemo(() => {
    const empRates = metrics?.employeeRates || [];
    return employees
      .map(emp => {
        const rate = empRates.find(r => r._id === emp._id) || {
          totalAssigned: 0, active: 0, completed: 0, completionRate: 0
        };
        return { ...emp, ...rate };
      })
      .filter(emp => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
        }
        return true;
      });
  }, [employees, metrics, searchQuery]);

  // Garment stats
  const garmentStats = useMemo(() => {
    const stats = {};
    allOrders.forEach(o => {
      o.items?.forEach(item => {
        if (!stats[item.itemType]) {
          stats[item.itemType] = { type: item.itemType, orderCount: 0, totalQuantity: 0, totalRevenue: 0 };
        }
        stats[item.itemType].orderCount += 1;
        stats[item.itemType].totalQuantity += item.quantity || 1;
        stats[item.itemType].totalRevenue += (item.price * (item.quantity || 1)) || 0;
      });
    });
    return Object.values(stats)
      .map(g => ({ ...g, avgPrice: g.totalQuantity > 0 ? g.totalRevenue / g.totalQuantity : 0 }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [allOrders]);

  // CSV Export
  const handleExportCSV = () => {
    let headers = [], rows = [], filename = `report_${reportType}.csv`;
    if (reportType === 'sales') {
      headers = ['Order Number','Customer Name','Phone','Total Amount','Amount Paid','Unpaid Balance','Payment Status','Order Status','Due Date'];
      rows = filteredOrders.map(o => [
        o.orderNumber, o.customer?.name || 'Unknown', o.customer?.phone || '',
        o.totalAmount, o.amountPaid, o.totalAmount - o.amountPaid,
        o.paymentStatus === 'fully_paid' ? 'Paid' : o.paymentStatus === 'partial' ? 'Partial' : 'Unpaid',
        o.status,
        o.dueDate ? new Date(o.dueDate).toLocaleDateString() : ''
      ]);
    } else if (reportType === 'production') {
      headers = ['Employee Name','Email','Role','Total Assigned','Active','Completed','Efficiency (%)'];
      rows = filteredEmployees.map(emp => [emp.name, emp.email, emp.role, emp.totalAssigned, emp.active, emp.completed, emp.completionRate]);
    } else if (reportType === 'garments') {
      headers = ['Garment Type','Orders Count','Total Quantity','Total Revenue (Birr)','Avg Unit Price (Birr)'];
      rows = garmentStats.map(g => [g.type, g.orderCount, g.totalQuantity, g.totalRevenue, g.avgPrice.toFixed(2)]);
    }
    const csv = "data:text/csv;charset=utf-8," +
      [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error && !allOrders.length && !employees.length && !metrics) return (
    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center max-w-lg mx-auto mt-12">
      <AlertTriangle className="mx-auto w-12 h-12 mb-3" />
      <p className="font-bold text-lg mb-2">Reports Unavailable</p>
      <p className="text-sm mb-4">{error}</p>
      <Button onClick={fetchData} className="w-auto px-6 mx-auto"><RefreshCw size={14} className="mr-2" />Retry</Button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="bg-primaryClr/5 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-primaryClr/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <BarChart3 size={18} className="sm:hidden" />
            <BarChart3 size={24} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-primaryClr">Reports & Analytics</h1>
            <p className="text-xs text-primaryClr/60 hidden sm:block">Detailed insights into sales, production, and garment trends</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 self-start sm:self-auto px-3 py-1.5 sm:px-4 sm:py-2 border border-primaryClr/15 text-primaryClr hover:bg-primaryClr/5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Report Type Selector + Export */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 border border-primaryClr/5 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: 'sales', label: 'Sales & Payments', icon: TrendingUp },
            { id: 'production', label: 'Production', icon: FileText },
            { id: 'garments', label: 'Garments', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setReportType(id); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                reportType === id
                  ? 'bg-primaryClr text-white shadow-md'
                  : 'bg-backgroundClr text-primaryClr/70 hover:bg-primaryClr/5'
              }`}
            >
              <Icon size={11} className="sm:hidden" />
              <Icon size={13} className="hidden sm:block" />
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors self-start shadow-md"
        >
          <Download size={12} className="sm:hidden" />
          <Download size={14} className="hidden sm:block" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 border border-primaryClr/5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-secondaryClr/40 tracking-wider">Start Date</label>
          <input
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full bg-backgroundClr border border-secondaryClr/10 rounded-xl px-3 py-2 text-xs font-bold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-secondaryClr/40 tracking-wider">End Date</label>
          <input
            type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="w-full bg-backgroundClr border border-secondaryClr/10 rounded-xl px-3 py-2 text-xs font-bold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-secondaryClr/40 tracking-wider">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryClr/40" />
            <input
              type="text"
              placeholder={reportType === 'production' ? 'Search staff name...' : 'Search order # or customer...'}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-backgroundClr border border-secondaryClr/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* ── SALES REPORT ── */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ordersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-secondaryClr/5 shadow-sm animate-pulse">
                  <div className="h-3 bg-secondaryClr/10 rounded-full w-2/3 mb-3" />
                  <div className="h-6 bg-secondaryClr/10 rounded-full w-full" />
                </div>
              ))
            ) : (
              <>
                <Card title="Total Booked" value={formatCurrency(filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))} trend={TrendingUp} />
                <Card title="Amount Collected" value={formatCurrency(filteredOrders.reduce((s, o) => s + (o.amountPaid || 0), 0))} trend={TrendingUp} trendColor="text-green-600" />
                <Card title="Outstanding Balance" value={formatCurrency(filteredOrders.reduce((s, o) => s + ((o.totalAmount - o.amountPaid) || 0), 0))} trend={TrendingDown} trendColor="text-red-500" />
                <Card
                  title="Total Unpaid"
                  value={formatCurrency(
                    filteredOrders
                      .filter(o => o.paymentStatus === 'unpaid')
                      .reduce((s, o) => s + (o.totalAmount || 0), 0)
                  )}
                  trend={TrendingDown}
                  trendColor="text-orange-500"
                />
              </>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h4 className="text-xs sm:text-sm font-bold text-primaryClr mb-3 sm:mb-4">Revenue Distribution — Latest 10 Orders</h4>
            {filteredOrders.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No orders for selected criteria.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 500 200" className="w-full min-w-[450px] h-52">
                  {[20, 80, 140].map(y => <line key={y} x1="40" y1={y} x2="480" y2={y} stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />)}
                  <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(0,0,0,0.08)" />
                  {(() => {
                    const count = Math.min(filteredOrders.length, 10);
                    const slice = filteredOrders.slice(0, count);
                    const maxVal = Math.max(...slice.map(o => o.totalAmount), 1);
                    const bw = 30, gap = (440 - count * bw) / (count + 1);
                    return slice.map((o, i) => {
                      const h = (o.totalAmount / maxVal) * 140;
                      const x = 40 + gap + i * (bw + gap);
                      return (
                        <g key={o._id} className="group cursor-pointer">
                          <rect x={x} y={170 - h} width={bw} height={h} fill="url(#bgrad)" rx="5" className="hover:opacity-75 transition-opacity" />
                          <text x={x + bw / 2} y={170 - h - 6} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e3a8a" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {Math.round(o.totalAmount)}
                          </text>
                          <text x={x + bw / 2} y="186" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6c757d">{o.orderNumber}</text>
                        </g>
                      );
                    });
                  })()}
                  <defs>
                    <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-primaryClr mb-3 sm:mb-6">Detailed Transactions</h3>
            {filteredOrders.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No orders match the selected filters.</p>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[9px] sm:text-[10px] font-bold">
                      {['Order #','Customer','Status','Total','Paid','Unpaid','Pay Status','Method'].map(h => <th key={h} className="px-3 sm:px-6 py-2 sm:py-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondaryClr/5 text-[10px] sm:text-xs font-semibold">
                    {ordersLoading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
                      : filteredOrders.map(o => (
                      <tr key={o._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 font-bold text-primaryClr">{o.orderNumber}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-secondaryClr/80">{o.customer?.name || 'Unknown'}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${o.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr font-bold">{formatCurrency(o.totalAmount)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-green-600">{formatCurrency(o.amountPaid)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-red-500 font-bold">{formatCurrency(o.totalAmount - o.amountPaid)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                            o.paymentStatus === 'fully_paid' ? 'bg-green-100 text-green-700' :
                            o.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {o.paymentStatus === 'fully_paid' ? 'Paid' : o.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 uppercase text-secondaryClr/50">{o.paymentMethod || 'cash'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primaryClr/5 border-t-2 border-primaryClr/10 text-[10px] sm:text-xs font-black">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr/50 uppercase tracking-widest" colSpan={3}>
                        Totals — {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr">
                        {formatCurrency(filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-green-600">
                        {formatCurrency(filteredOrders.reduce((s, o) => s + (o.amountPaid || 0), 0))}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-red-500">
                        {formatCurrency(filteredOrders.reduce((s, o) => s + ((o.totalAmount - o.amountPaid) || 0), 0))}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4" colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRODUCTION REPORT ── */}
      {reportType === 'production' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Radial Gauge Cards */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h4 className="text-xs sm:text-sm font-bold text-primaryClr mb-4 sm:mb-6">Staff Efficiency — Radial Gauges</h4>
            {filteredEmployees.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No production staff found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                {filteredEmployees.slice(0, 4).map(emp => {
                  const rate = emp.completionRate || 0;
                  const r = 30, sw = 6;
                  const circ = 2 * Math.PI * r;
                  const offset = circ - (rate / 100) * circ;
                  return (
                    <div key={emp._id} className="flex flex-col items-center p-3 sm:p-4 bg-backgroundClr/25 rounded-xl sm:rounded-2xl border border-secondaryClr/5 text-center">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={r} stroke="rgba(0,0,0,0.05)" strokeWidth={sw} fill="transparent" />
                        <circle cx="40" cy="40" r={r}
                          stroke={rate > 70 ? '#10b981' : rate > 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth={sw} fill="transparent"
                          strokeDasharray={circ} strokeDashoffset={offset}
                          strokeLinecap="round" className="transition-all duration-700"
                        />
                      </svg>
                      <span className="text-sm sm:text-base font-black text-primaryClr mt-2">{rate}%</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-secondaryClr/60 truncate w-full mt-1">{emp.name}</span>
                      <span className="text-[8px] sm:text-[9px] font-bold text-secondaryClr/30 uppercase tracking-widest">{emp.role}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-primaryClr mb-3 sm:mb-6">Staff Output & Assignment Metrics</h3>
            {filteredEmployees.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No staff matching criteria.</p>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[9px] sm:text-[10px] font-bold">
                      {['Employee','Role','Assigned','Completed','Active','Efficiency'].map(h => <th key={h} className="px-3 sm:px-6 py-2 sm:py-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondaryClr/5 text-[10px] sm:text-xs font-semibold">
                    {filteredEmployees.map(emp => (
                      <tr key={emp._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <span className="font-bold text-primaryClr">{emp.name}</span>
                          <p className="text-[9px] sm:text-[10px] text-secondaryClr/40">{emp.email}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 uppercase text-[9px] sm:text-[10px] tracking-wider text-secondaryClr/60">{emp.role}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-primaryClr font-bold">{emp.totalAssigned || 0}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-green-600 font-bold">{emp.completed || 0}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-amber-600 font-bold">{emp.active || 0}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-secondaryClr/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${(emp.completionRate || 0) > 75 ? 'bg-green-500' : (emp.completionRate || 0) > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${emp.completionRate || 0}%` }}
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-secondaryClr/60">{emp.completionRate || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primaryClr/5 border-t-2 border-primaryClr/10 text-[10px] sm:text-xs font-black">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr/50 uppercase tracking-widest" colSpan={2}>
                        Totals — {filteredEmployees.length} staff member{filteredEmployees.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-primaryClr">
                        {filteredEmployees.reduce((s, e) => s + (e.totalAssigned || 0), 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-green-600">
                        {filteredEmployees.reduce((s, e) => s + (e.completed || 0), 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-center text-amber-600">
                        {filteredEmployees.reduce((s, e) => s + (e.active || 0), 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-secondaryClr/60">
                        {filteredEmployees.length > 0
                          ? `${Math.round(filteredEmployees.reduce((s, e) => s + (e.completionRate || 0), 0) / filteredEmployees.length)}% avg`
                          : '—'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GARMENTS REPORT ── */}
      {reportType === 'garments' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Horizontal bars */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h4 className="text-xs sm:text-sm font-bold text-primaryClr mb-4 sm:mb-6">Garment Popularity — Quantity Ordered</h4>
            {garmentStats.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No garment data recorded.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {garmentStats.slice(0, 8).map(g => {
                  const maxQty = Math.max(...garmentStats.map(x => x.totalQuantity), 1);
                  const pct = (g.totalQuantity / maxQty) * 100;
                  return (
                    <div key={g.type} className="space-y-1 sm:space-y-1.5">
                      <div className="flex justify-between text-[10px] sm:text-xs font-bold text-secondaryClr/80">
                        <span className="capitalize">{g.type}</span>
                        <span>{g.totalQuantity} items · {g.orderCount} orders</span>
                      </div>
                      <div className="w-full h-2.5 sm:h-3.5 bg-secondaryClr/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-800 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 md:p-8 border border-primaryClr/5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-bold text-primaryClr mb-3 sm:mb-6">Garment Sales Breakdown & Pricing</h3>
            {garmentStats.length === 0 ? (
              <p className="text-sm italic text-secondaryClr/40 text-center py-10">No garment items data available.</p>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[9px] sm:text-[10px] font-bold">
                      {['Garment Type','Orders','Qty Sold','Total Revenue','Avg Unit Price'].map(h => <th key={h} className="px-3 sm:px-6 py-2 sm:py-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondaryClr/5 text-[10px] sm:text-xs font-semibold">
                    {garmentStats.map(g => (
                      <tr key={g.type} className="hover:bg-secondaryClr/[0.01] transition-colors">
                        <td className="px-3 sm:px-6 py-2 sm:py-4 capitalize font-bold text-primaryClr">{g.type}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-secondaryClr/70">{g.orderCount}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr font-bold">{g.totalQuantity}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-green-600 font-bold">{formatCurrency(g.totalRevenue)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-indigo-600">{formatCurrency(g.avgPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primaryClr/5 border-t-2 border-primaryClr/10 text-[10px] sm:text-xs font-black">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr/50 uppercase tracking-widest">
                        Totals — {garmentStats.length} type{garmentStats.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-secondaryClr/70">
                        {garmentStats.reduce((s, g) => s + g.orderCount, 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-primaryClr">
                        {garmentStats.reduce((s, g) => s + g.totalQuantity, 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-green-600">
                        {formatCurrency(garmentStats.reduce((s, g) => s + g.totalRevenue, 0))}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-indigo-600">
                        {(() => {
                          const totalQty = garmentStats.reduce((s, g) => s + g.totalQuantity, 0);
                          const totalRev = garmentStats.reduce((s, g) => s + g.totalRevenue, 0);
                          return formatCurrency(totalQty > 0 ? totalRev / totalQty : 0);
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
