import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Loader2, 
  Maximize2,
  Clock,
  AlertTriangle,
  Shirt
} from 'lucide-react';

const TailorDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    fetchStitchingOrders();
  }, []);

  const fetchStitchingOrders = async () => {
    try {
      setLoading(true);
      // Fetch only cutting (ready to stitch) and sewing orders for the Tailor's view
      const res = await api.get('/orders?status=cutting,sewing');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching tailor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (order) => {
    setStatusToUpdate(order);
    setOrderStatus(order.status === 'cutting' ? 'sewing' : order.status);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusToUpdate) return;

    try {
      const res = await api.put(`/orders/${statusToUpdate._id}/status`, {
        status: orderStatus
      });

      // If status goes beyond sewing (e.g., fitting or completed), we might remove it from view
      if (orderStatus !== 'cutting' && orderStatus !== 'sewing') {
        setOrders(orders.filter(o => o._id !== res.data._id));
      } else {
        setOrders(orders.map(o => o._id === res.data._id ? res.data : o));
      }
      
      setStatusToUpdate(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-primaryClr w-12 h-12" />
        <p className="text-secondaryClr/60 font-semibold animate-pulse">Loading stitching queue...</p>
      </div>
    );
  }

  const getUrgencyBadge = (dueDate) => {
    const today = new Date();
    const diffTime = new Date(dueDate) - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold text-[10px] flex items-center gap-1"><AlertTriangle size={12}/> Overdue by {Math.abs(diffDays)}d</span>;
    if (diffDays <= 2) return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold text-[10px] flex items-center gap-1"><Clock size={12}/> Due in {diffDays}d</span>;
    return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold text-[10px]">Due in {diffDays}d</span>;
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <Shirt size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Tailor Desk: Welcome, {user?.name}!</h1>
            <p className="text-sm text-primaryClr/60">Your priority queue of cut garments waiting to be stitched.</p>
          </div>
        </div>
      </div>

      {/* Stitching Queue Table */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
        <h3 className="text-lg font-bold text-primaryClr mb-6">Stitching Queue (Sorted by Priority)</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Garments</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondaryClr/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondaryClr/40 italic text-sm">
                    No garments waiting for stitching.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-primaryClr">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      {getUrgencyBadge(order.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs font-semibold">
                            {item.quantity}x {item.itemType}
                            {item.notes && <p className="text-[10px] text-secondaryClr/50 italic">{item.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-secondaryClr">{order.customer?.name}</p>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-primaryClr hover:underline flex items-center gap-1 mt-1"
                      >
                        <Maximize2 size={12} /> Design Notes
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${order.status === 'cutting' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="px-3 py-1.5 bg-primaryClr text-white hover:opacity-90 text-xs font-bold rounded-lg transition-all shadow-md shadow-primaryClr/20"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Design Details / Notes Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Design Details: ${selectedOrder.orderNumber}`}
        >
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Order Notes / Instructions</h4>
              <p className="text-sm font-medium text-amber-900">{selectedOrder.notes || 'No special order notes.'}</p>
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60 pt-2">Measurements (inches)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(selectedOrder.customer?.measurements || {}).map(([key, val]) => (
                <div key={key} className="bg-primaryClr/5 border border-primaryClr/10 p-3 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-secondaryClr/40">{key}</span>
                  <p className="text-lg font-black text-primaryClr mt-0.5">{val}"</p>
                </div>
              ))}
            </div>
            <div className="pt-4 text-right">
              <Button onClick={() => setSelectedOrder(null)}>Close Details</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Production Stage / Status Modal */}
      <Modal
        isOpen={!!statusToUpdate}
        onClose={() => setStatusToUpdate(null)}
        title={`Update Stitching Stage: ${statusToUpdate?.orderNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Set New Stage</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="sewing">Sewing In Progress</option>
              <option value="fitting">Ready for Fitting</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusToUpdate(null)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Update Stage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TailorDashboard;
