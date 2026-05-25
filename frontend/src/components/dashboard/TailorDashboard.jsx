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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-secondaryClr/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primaryClr/10 to-blue-500/10 rounded-full mb-3 border border-primaryClr/10">
            <div className="p-1.5 bg-white rounded-full text-primaryClr shadow-sm">
              <Shirt className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-primaryClr/80">Tailor Desk</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-secondaryClr to-primaryClr">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-sm text-secondaryClr/50 font-medium">Your priority queue of cut garments waiting to be stitched.</p>
        </div>
        <div className="bg-white border border-secondaryClr/5 px-6 py-4 rounded-3xl shadow-xl shadow-primaryClr/5 flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 block mb-1">Ready to Sew</span>
            <p className="text-3xl font-black text-primaryClr">{orders.filter(o => o.status === 'cutting').length}</p>
          </div>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-secondaryClr/10 to-transparent" />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 block mb-1">In Progress</span>
            <p className="text-3xl font-black text-amber-500">{orders.filter(o => o.status === 'sewing').length}</p>
          </div>
        </div>
      </div>

      {/* Stitching Queue Table */}
      <div className="bg-white border border-secondaryClr/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primaryClr/5">
        <div className="px-8 py-6 border-b border-secondaryClr/5 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-black text-secondaryClr">Stitching Queue</h2>
          <span className="text-xs font-bold text-primaryClr bg-primaryClr/10 px-4 py-2 rounded-full shadow-inner">
            Sorted by Priority · {orders.length} Job{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
              <Shirt className="w-10 h-10 drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-black text-secondaryClr">All clear!</h3>
            <p className="text-sm text-secondaryClr/50 max-w-sm mx-auto font-medium">No garments are currently waiting for stitching.</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-secondaryClr/40 uppercase tracking-widest text-[10px] font-black">
                  <th className="px-6 py-3 pl-8">Order #</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Garments</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Stage</th>
                  <th className="px-6 py-3 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="group bg-white hover:bg-slate-50/50 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl">
                    <td className="px-6 py-5 pl-8 font-black text-primaryClr/80 rounded-l-2xl border-y border-l border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      {getUrgencyBadge(order.dueDate)}
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100/80 text-secondaryClr/80 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border border-secondaryClr/5 shadow-sm">
                            {item.quantity}x {item.itemType}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryClr/20 to-primaryClr/5 flex items-center justify-center text-primaryClr font-bold text-xs shadow-inner">
                          {(order.customer?.name || 'W').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-secondaryClr">{order.customer?.name}</p>
                          <button onClick={() => setSelectedOrder(order)} className="text-[10px] text-primaryClr hover:text-primaryClr/70 flex items-center gap-1 mt-0.5 font-bold transition-colors">
                            <Maximize2 size={10} /> View Notes
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-y border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border ${order.status === 'cutting' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200' : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border-amber-200'}`}>
                        {order.status === 'cutting' ? 'Ready to Sew' : 'Sewing'}
                      </span>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right rounded-r-2xl border-y border-r border-secondaryClr/5 group-hover:border-primaryClr/20 transition-colors">
                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="px-4 py-2 bg-gradient-to-r from-primaryClr to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primaryClr/20 hover:shadow-lg hover:-translate-y-0.5"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

            <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60 pt-2">Measurements (cm)</h4>
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
              {[
                { title: "General", keys: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length'] },
                { title: "Shirt Foundation", keys: ['fullLengthBack', 'fullLengthFront', 'acrossChest', 'acrossShoulder', 'shoulderLength', 'centerLength', 'shoulderSlope', 'acrossBack', 'backNeck'] },
                { title: "Trouser Foundation", keys: ['pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack'] },
                { title: "Coat & Sleeve Specific", keys: ['bicep', 'capHeight'] }
              ].map(group => {
                const groupMeasurements = group.keys.reduce((acc, k) => {
                  if (selectedOrder.customer?.measurements?.[k]) acc[k] = selectedOrder.customer.measurements[k];
                  return acc;
                }, {});

                if (Object.keys(groupMeasurements).length === 0) return null;

                return (
                  <div key={group.title}>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondaryClr/40 mb-2">{group.title}</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.entries(groupMeasurements).map(([key, val]) => (
                        <div key={key} className="bg-primaryClr/5 border border-primaryClr/10 p-3 rounded-2xl text-center">
                          <span className="text-[9px] uppercase font-black tracking-wider text-secondaryClr/40 truncate block w-full" title={key.replace(/([A-Z])/g, ' $1').trim()}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <p className="text-sm font-black text-primaryClr mt-0.5">{val} cm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
