import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../ui/Card';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { 
  Search, 
  Plus, 
  UserPlus, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Calendar, 
  DollarSign, 
  X,
  FileText,
  AlertCircle,
  Ruler
} from 'lucide-react';

const OfficerDashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  // Creating client state
  const [clientForm, setClientForm] = useState({
    name: '', email: '', phone: '', address: '',
    chest: 0, waist: 0, hips: 0, shoulder: 0, sleeves: 0, inseam: 0, neck: 0, length: 0
  });
  
  // Creating order state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ itemType: '', quantity: 1, price: 0, notes: '' }]);
  const [dueDate, setDueDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [initialPayment, setInitialPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Derived: customer object for selected customer
  const selectedCustomer = customers.find(c => c._id === selectedCustomerId) || null;

  // Process payment state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethodProcess, setPaymentMethodProcess] = useState('cash');
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  // Status state
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');

  // Selected customer details state (Lookup preview)
  const [previewCustomer, setPreviewCustomer] = useState(null);

  // Selected garment type for dynamically filtering measurements fields
  const [selectedGarmentType, setSelectedGarmentType] = useState('All');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, pricingRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/pricing')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setPricings(pricingRes.data);
    } catch (err) {
      console.error('Error fetching officer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        address: clientForm.address,
        measurements: {
          chest: Number(clientForm.chest),
          waist: Number(clientForm.waist),
          hips: Number(clientForm.hips),
          shoulder: Number(clientForm.shoulder),
          sleeves: Number(clientForm.sleeves),
          inseam: Number(clientForm.inseam),
          neck: Number(clientForm.neck),
          length: Number(clientForm.length)
        }
      };

      const res = await api.post('/customers', data);
      setCustomers([res.data, ...customers]);
      setIsClientModalOpen(false);
      setClientForm({
        name: '', email: '', phone: '', address: '',
        chest: 0, waist: 0, hips: 0, shoulder: 0, sleeves: 0, inseam: 0, neck: 0, length: 0
      });
      alert('Client profile created successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create client');
    }
  };

  const handlePricingSelect = (index, itemType) => {
    const selectedPricing = pricings.find(p => p.itemType === itemType);
    const updated = [...orderItems];
    updated[index].itemType = itemType;
    updated[index].price = selectedPricing ? selectedPricing.basePrice : 0;
    
    // Set auto-due date based on estimated days
    if (selectedPricing && !dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + selectedPricing.estimatedDays);
      setDueDate(d.toISOString().split('T')[0]);
    }
    
    setOrderItems(updated);
  };

  const handleItemFieldChange = (index, field, val) => {
    const updated = [...orderItems];
    updated[index][field] = val;
    setOrderItems(updated);
  };

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { itemType: '', quantity: 1, price: 0, notes: '' }]);
  };

  const handleRemoveOrderItem = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || orderItems.some(i => !i.itemType)) {
      alert('Please select customer and item types');
      return;
    }

    try {
      const data = {
        customerId: selectedCustomerId,
        items: orderItems.map(item => ({
          itemType: item.itemType,
          quantity: Number(item.quantity),
          price: Number(item.price),
          notes: item.notes
        })),
        dueDate,
        notes: orderNotes,
        initialPaymentAmount: Number(initialPayment),
        paymentMethod
      };

      const res = await api.post('/orders', data);
      setOrders([res.data, ...orders]);
      setIsOrderModalOpen(false);
      // Reset fields
      setSelectedCustomerId('');
      setOrderItems([{ itemType: '', quantity: 1, price: 0, notes: '' }]);
      setDueDate('');
      setOrderNotes('');
      setInitialPayment(0);
      setPaymentMethod('cash');
      
      alert('Order created successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentAmount(order.totalAmount - order.amountPaid);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !paymentAmount || Number(paymentAmount) <= 0) return;

    try {
      const res = await api.post(`/orders/${selectedOrder._id}/payments`, {
        amount: Number(paymentAmount),
        method: paymentMethodProcess
      });

      // Update in orders list
      setOrders(orders.map(o => o._id === res.data._id ? res.data : o));
      
      // Get the payment receipt (last payment added)
      const receipt = res.data.payments[res.data.payments.length - 1];
      setGeneratedReceipt({
        orderNumber: res.data.orderNumber,
        customerName: res.data.customer?.name,
        customerPhone: res.data.customer?.phone,
        totalAmount: res.data.totalAmount,
        amountPaid: res.data.amountPaid,
        remainingBalance: res.data.totalAmount - res.data.amountPaid,
        paymentStatus: res.data.paymentStatus,
        receiptAmount: receipt.amount,
        receiptMethod: receipt.method,
        receiptNumber: receipt.receiptNumber,
        receiptDate: receipt.date
      });

      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to process payment');
    }
  };

  const handleOpenStatusModal = (order) => {
    setStatusToUpdate(order);
    setOrderStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusToUpdate) return;

    try {
      const res = await api.put(`/orders/${statusToUpdate._id}/status`, {
        status: orderStatus
      });

      setOrders(orders.map(o => o._id === res.data._id ? res.data : o));
      setIsStatusModalOpen(false);
      setStatusToUpdate(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Filter orders based on customer lookup search query
  const filteredOrders = orders.filter(order => {
    const custName = order.customer?.name || '';
    const phone = order.customer?.phone || '';
    const orderNum = order.orderNumber || '';
    const term = searchTerm.toLowerCase();
    
    return custName.toLowerCase().includes(term) || phone.includes(term) || orderNum.toLowerCase().includes(term);
  });

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'fully_paid':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Fully Paid</span>;
      case 'partially_paid':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Partially Paid</span>;
      default:
        return <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Unpaid</span>;
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">Pending</span>;
      case 'cutting':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">Cutting</span>;
      case 'sewing':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Sewing</span>;
      case 'fitting':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">Fitting</span>;
      case 'completed':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">Completed</span>;
      case 'delivered':
        return <span className="text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Delivered</span>;
      default:
        return <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-primaryClr w-12 h-12" />
        <p className="text-secondaryClr/60 font-semibold animate-pulse">Loading active order details & customer registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Welcome Header */}
      <div className="bg-primaryClr/5 p-6 rounded-3xl border border-primaryClr/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primaryClr">Officer Desk: Welcome, {user?.name}!</h1>
            <p className="text-sm text-primaryClr/60">Registering new clients, orders, status updates, and payments receipt.</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 self-start md:self-auto">
          <button 
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-primaryClr/20 text-primaryClr hover:bg-primaryClr/5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <UserPlus size={14} />
            Create Client
          </button>
          <button 
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primaryClr text-white hover:opacity-90 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-primaryClr/15"
          >
            <Plus size={14} />
            New Order
          </button>
        </div>
      </div>

      {/* Customer Lookup Search Panel */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-primaryClr/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-primaryClr">Active Order Tracker & Customer Lookup</h3>
            <p className="text-xs text-secondaryClr/50">Look up orders or customer measurements using names, phone numbers, or order numbers.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryClr/30" size={16} />
            <input
              type="text"
              placeholder="Search customer, phone, or order #"
              className="input-field pl-10 py-3 w-full text-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Active Order Tracker Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Price / Paid</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Production Stage</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondaryClr/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-secondaryClr/40 italic text-sm">
                    No orders matching search queries.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const rem = order.totalAmount - order.amountPaid;
                  return (
                    <tr key={order._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-primaryClr">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setPreviewCustomer(order.customer)}
                          className="font-bold text-sm text-secondaryClr hover:underline text-left"
                        >
                          {order.customer?.name || 'Unknown'}
                        </button>
                        <p className="text-xs text-secondaryClr/50 mt-0.5">{order.customer?.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span>{order.totalAmount} Birr</span>
                        <div className="text-xs text-secondaryClr/50 mt-0.5">Paid: {order.amountPaid} Birr</div>
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="hover:scale-105 transition-transform"
                        >
                          {getOrderStatusBadge(order.status)}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-secondaryClr/70">
                        {new Date(order.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenStatusModal(order)}
                            className="px-2.5 py-1.5 border border-secondaryClr/10 hover:bg-secondaryClr/5 text-secondaryClr text-xs font-bold rounded-lg transition-all"
                          >
                            Update Stage
                          </button>
                          {rem > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(order)}
                              className="px-2.5 py-1.5 bg-primaryClr text-white hover:opacity-90 text-xs font-bold rounded-lg transition-all"
                            >
                              Collect {rem} Birr
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Measurement Drawer (Preview Popover) */}
      {previewCustomer && (
        <div className="fixed inset-0 bg-secondaryClr/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-fadeInUp">
            <div className="flex justify-between items-center pb-4 border-b border-secondaryClr/10">
              <div>
                <h3 className="font-bold text-lg text-primaryClr">{previewCustomer.name}</h3>
                <p className="text-xs text-secondaryClr/50">{previewCustomer.email || 'No Email'} • {previewCustomer.phone}</p>
              </div>
              <button 
                onClick={() => setPreviewCustomer(null)}
                className="p-1 rounded-full hover:bg-secondaryClr/5 text-secondaryClr/60"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60 mb-4">Tailoring Measurements (inches)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(previewCustomer.measurements || {}).map(([key, val]) => (
                  <div key={key} className="bg-backgroundClr/30 p-3 rounded-2xl border border-secondaryClr/5 text-center">
                    <span className="text-[10px] uppercase font-black tracking-wider text-secondaryClr/40">{key}</span>
                    <p className="text-lg font-black text-primaryClr mt-0.5">{val}"</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-secondaryClr/50 mt-6 italic">Address: {previewCustomer.address || 'Not registered'}</p>
            </div>

            <div className="pt-4 border-t border-secondaryClr/10 text-right">
              <Button onClick={() => setPreviewCustomer(null)} className="w-auto px-6">
                Close Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Add New Client & Measurements"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Pam Beesly"
              required
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="0915151515"
              required
              value={clientForm.phone}
              onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="pam@dundermifflin.com"
              value={clientForm.email}
              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
            />
            <Input
              label="Home / Office Address"
              placeholder="1725 Slough Avenue"
              value={clientForm.address}
              onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
            />
          </div>

          <div className="border-t border-secondaryClr/10 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/50">Custom Measurements (inches)</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-secondaryClr/40 uppercase tracking-widest">Garment Type:</span>
                <select
                  value={selectedGarmentType}
                  onChange={(e) => setSelectedGarmentType(e.target.value)}
                  className="bg-primaryClr/5 border border-primaryClr/10 rounded-xl px-2 py-1 text-xs font-bold text-primaryClr focus:outline-none"
                >
                  <option value="All">All Fields</option>
                  <option value="Suit">Suit</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Dress">Dress</option>
                  <option value="Coat">Coat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length']
                .filter(key => {
                  if (selectedGarmentType === 'All') return true;
                  const mapping = {
                    Suit: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'neck', 'length'],
                    Shirt: ['chest', 'shoulder', 'sleeves', 'neck', 'length'],
                    Trousers: ['waist', 'hips', 'inseam', 'length'],
                    Dress: ['chest', 'waist', 'hips', 'shoulder', 'length'],
                    Coat: ['chest', 'waist', 'shoulder', 'sleeves', 'length']
                  };
                  return mapping[selectedGarmentType]?.includes(key);
                })
                .map(key => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-secondaryClr/40 uppercase tracking-widest mb-1">{key}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      className="w-full bg-primaryClr/5 border-0 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
                      value={clientForm[key]}
                      onChange={(e) => setClientForm({ ...clientForm, [key]: e.target.value })}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClientModalOpen(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Create Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Create New Garments Order"
      >
        <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Select Client</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
              required
            >
              <option value="">-- Choose Client --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Garments Items */}
          <div className="border-t border-secondaryClr/10 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/50">Garments items</h4>
              <button 
                type="button"
                onClick={handleAddOrderItem}
                className="text-xs font-bold text-primaryClr hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Garment
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-backgroundClr/25 p-3 rounded-xl border border-secondaryClr/5">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Item Select */}
                    <select
                      value={item.itemType}
                      onChange={(e) => handlePricingSelect(idx, e.target.value)}
                      className="bg-white border border-secondaryClr/10 rounded-lg px-2 py-1.5 text-xs font-bold"
                      required
                    >
                      <option value="">-- Type --</option>
                      {pricings.map(p => (
                        <option key={p._id} value={p.itemType}>{p.itemType} ({p.basePrice} Birr)</option>
                      ))}
                    </select>

                    {/* Qty */}
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="bg-white border border-secondaryClr/10 rounded-lg px-2 py-1.5 text-xs font-bold"
                      value={item.quantity}
                      onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                      required
                    />

                    {/* Custom Price */}
                    <input
                      type="number"
                      placeholder="Price"
                      className="bg-white border border-secondaryClr/10 rounded-lg px-2 py-1.5 text-xs font-bold"
                      value={item.price}
                      onChange={(e) => handleItemFieldChange(idx, 'price', e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleRemoveOrderItem(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    disabled={orderItems.length === 1}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Measurement Preview — based on selected item types */}
          {selectedCustomer && orderItems.some(i => i.itemType) && (() => {
            // Collect required measurements across all selected item types (union, deduplicated)
            const requiredKeys = [...new Set(
              orderItems
                .filter(i => i.itemType)
                .flatMap(i => {
                  const pricing = pricings.find(p => p.itemType === i.itemType);
                  return pricing?.requiredMeasurements || [];
                })
            )];

            if (requiredKeys.length === 0) return null;

            const measurements = selectedCustomer.measurements || {};
            const missingCount = requiredKeys.filter(k => !measurements[k] || measurements[k] === 0).length;

            return (
              <div className="border border-primaryClr/10 bg-primaryClr/4 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Ruler size={14} className="text-primaryClr/60" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60">
                      {selectedCustomer.name}'s Measurements for Selected Items
                    </h4>
                  </div>
                  {missingCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {missingCount} missing
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {requiredKeys.map(key => {
                    const val = measurements[key];
                    const filled = val && Number(val) > 0;
                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          filled
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <span className={`text-[9px] uppercase font-black tracking-wider block mb-0.5 ${
                          filled ? 'text-green-600' : 'text-red-500'
                        }`}>{key}</span>
                        <p className={`text-sm font-black ${
                          filled ? 'text-green-700' : 'text-red-400'
                        }`}>
                          {filled ? `${val}"` : '—'}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {missingCount > 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-3 italic">
                    ⚠ Some measurements are missing — update this client's profile before cutting.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Due date & payments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-secondaryClr/10 pt-4">
            <Input
              label="Completion Due Date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="Initial Payment (Birr)"
              type="number"
              min="0"
              value={initialPayment}
              onChange={(e) => setInitialPayment(e.target.value)}
            />
          </div>

          {Number(initialPayment) > 0 && (
            <div>
              <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Order Notes</label>
            <textarea
              rows="2"
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primaryClr/20"
              placeholder="Special instructions, fabrics choices, complex cuffs..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOrderModalOpen(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Submit Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Process Payment: ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-primaryClr/5 p-4 rounded-2xl flex items-center justify-between text-sm">
            <span className="font-semibold text-primaryClr">Total Due:</span>
            <span className="font-black text-primaryClr">
              {selectedOrder ? selectedOrder.totalAmount - selectedOrder.amountPaid : 0} Birr
            </span>
          </div>

          <Input
            label="Payment Amount (Birr)"
            type="number"
            min="1"
            max={selectedOrder ? selectedOrder.totalAmount - selectedOrder.amountPaid : undefined}
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Payment Method</label>
            <select
              value={paymentMethodProcess}
              onChange={(e) => setPaymentMethodProcess(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit Card</option>
              <option value="transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Process & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Receipt / Receipt Form Overlay */}
      {isReceiptModalOpen && generatedReceipt && (
        <div className="fixed inset-0 bg-secondaryClr/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-secondaryClr/5 animate-fadeInUp">
            <div className="text-center pb-6 border-b border-dashed border-secondaryClr/10">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-bold text-lg text-primaryClr">Payment Processed!</h3>
              <p className="text-xs text-secondaryClr/50">Receipt Code: {generatedReceipt.receiptNumber}</p>
            </div>

            {/* Receipt Details */}
            <div className="py-6 space-y-4">
              <div className="bg-backgroundClr/30 p-4 rounded-2xl space-y-2.5 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-secondaryClr/50">Client Name:</span>
                  <span className="text-secondaryClr">{generatedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondaryClr/50">Phone Number:</span>
                  <span className="text-secondaryClr">{generatedReceipt.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondaryClr/50">Order Number:</span>
                  <span className="text-primaryClr font-bold">{generatedReceipt.orderNumber}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-secondaryClr/10 pt-2.5 mt-2.5">
                  <span className="text-secondaryClr/50">Amount Paid:</span>
                  <span className="text-green-600 font-bold">+{generatedReceipt.receiptAmount} Birr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondaryClr/50">Method:</span>
                  <span className="text-secondaryClr capitalize">{generatedReceipt.receiptMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondaryClr/50">Remaining Due:</span>
                  <span className="text-primaryClr font-bold">{generatedReceipt.remainingBalance} Birr</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-secondaryClr/40 font-bold uppercase tracking-wider justify-center">
                <Calendar size={12} />
                <span>Date: {new Date(generatedReceipt.receiptDate).toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="pt-4 border-t border-secondaryClr/10 flex gap-3">
              <button
                onClick={() => window.print()}
                className="w-1/2 py-3 border border-secondaryClr/10 hover:bg-secondaryClr/5 text-secondaryClr rounded-xl font-bold text-sm transition-all"
              >
                Print Receipt
              </button>
              <Button
                onClick={() => { setIsReceiptModalOpen(false); setGeneratedReceipt(null); }}
                className="w-1/2"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Production Stage / Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => { setIsStatusModalOpen(false); setStatusToUpdate(null); }}
        title={`Update Order Stage: ${statusToUpdate?.orderNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Select Production Stage</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="pending">Pending</option>
              <option value="cutting">Cutting (Garment Patterning)</option>
              <option value="sewing">Sewing (Tailoring)</option>
              <option value="fitting">Fitting (Customer Check)</option>
              <option value="completed">Completed (Awaiting Pick-up)</option>
              <option value="delivered">Delivered (Handed Over)</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsStatusModalOpen(false); setStatusToUpdate(null); }}
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

export default OfficerDashboard;
