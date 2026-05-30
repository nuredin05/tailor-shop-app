import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  User as UserIcon, 
  Loader2, 
  ShoppingBag,
  History,
  Ruler,
  CheckCircle2,
  Clock,
  Shirt
} from 'lucide-react';

const ClientDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // Backend automatically filters by customer email via req.user
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data);
      
      if (ordersRes.data.length > 0 && ordersRes.data[0].customer) {
        setMeasurements(ordersRes.data[0].customer.measurements);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-primaryClr w-12 h-12" />
        <p className="text-secondaryClr/60 font-semibold animate-pulse">Loading your tailor profile...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered');

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">In Queue</span>;
      case 'cutting': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Cutting Fabrics</span>;
      case 'sewing': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Sewing</span>;
      case 'fitting': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Ready for Fitting</span>;
      case 'completed': return <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Ready to Collect</span>;
      case 'delivered': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Delivered</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header */}
      <div className="bg-primaryClr text-white p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-inner">
            <UserIcon size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-white/70 font-medium">Your personal tailor profile and bespoke order tracker.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Orders & History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Orders */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
            <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
              <div className="p-2 bg-primaryClr/10 rounded-lg text-primaryClr">
                <Clock size={20} />
              </div>
              Active Bespoke Orders
            </h3>

            {activeOrders.length === 0 ? (
              <div className="py-8 text-center bg-backgroundClr/30 rounded-2xl border border-dashed border-secondaryClr/10">
                <Shirt className="mx-auto w-10 h-10 text-secondaryClr/20 mb-2" />
                <p className="text-secondaryClr/60 text-sm font-semibold">You have no active orders in production.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <div key={order._id} className="p-5 border border-secondaryClr/10 rounded-2xl hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 group-hover:bg-primaryClr transition-colors" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-primaryClr text-lg">{order.orderNumber}</h4>
                          {getOrderStatusBadge(order.status)}
                        </div>
                        <p className="text-xs font-semibold text-secondaryClr/60">
                          Estimated Completion: <span className="text-secondaryClr">{new Date(order.dueDate).toLocaleDateString()}</span>
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-secondaryClr/40">Total Amount</p>
                        <p className="font-bold text-primaryClr">${order.totalAmount}</p>
                        <p className="text-xs font-semibold text-amber-600">Balance: ${order.totalAmount - order.amountPaid}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-secondaryClr/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-secondaryClr mb-2">Garments Included:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="bg-backgroundClr/50 px-2.5 py-1 rounded-lg text-xs font-semibold text-secondaryClr/80 border border-secondaryClr/5">
                                {item.quantity}x {item.itemType}
                              </span>
                            ))}
                          </div>
                        </div>
                        {order.sampleImage && (
                          <a 
                            href={order.sampleImage} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-primaryClr/5 hover:bg-primaryClr/10 text-primaryClr text-xs font-bold px-3 py-1.5 rounded-lg border border-primaryClr/10 transition-colors whitespace-nowrap"
                          >
                            View Reference
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders History */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
            <h3 className="text-lg font-bold text-primaryClr mb-6 flex items-center gap-3">
              <div className="p-2 bg-secondaryClr/5 rounded-lg text-secondaryClr">
                <History size={20} />
              </div>
              Order History
            </h3>

            {pastOrders.length === 0 ? (
              <p className="text-secondaryClr/40 italic text-sm text-center py-6">No past orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-secondaryClr/10 text-secondaryClr/50 text-[10px] uppercase tracking-widest font-black">
                      <th className="pb-3">Order #</th>
                      <th className="pb-3">Date Completed</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondaryClr/5">
                    {pastOrders.map(order => (
                      <tr key={order._id}>
                        <td className="py-4 font-bold text-primaryClr text-sm">{order.orderNumber}</td>
                        <td className="py-4 text-xs font-semibold text-secondaryClr/70">{new Date(order.dueDate).toLocaleDateString()}</td>
                        <td className="py-4 text-xs font-medium text-secondaryClr">{order.items.length} items</td>
                        <td className="py-4 text-sm font-bold text-right">${order.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Measurements */}
        <div className="bg-secondaryClr text-white rounded-[2rem] p-8 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-white/10 rounded-lg">
              <Ruler size={20} />
            </div>
            Your Bespoke Specs
          </h3>

          {!measurements ? (
            <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
              <Ruler className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-sm font-medium">No measurements on file yet.</p>
              <p className="text-white/40 text-xs mt-2">Visit the shop to get measured by our Master Tailor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-white/50 mb-6 border-b border-white/10 pb-4">
                These are your most recent tailoring measurements stored in inches.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(measurements).map(([key, val]) => {
                  if (key === 'sampleImage') return null;
                  if (!val && val !== 0) return null;
                  
                  return (
                    <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                      <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-2xl font-black text-white block">
                        {val} cm
                      </span>
                    </div>
                  );
                })}
              </div>

              {measurements.sampleImage && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block mb-2">
                    Sample Image Reference
                  </span>
                  <a href={measurements.sampleImage} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all">
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
