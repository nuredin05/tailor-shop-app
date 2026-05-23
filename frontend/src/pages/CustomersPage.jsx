import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  Users, 
  Search, 
  UserPlus, 
  Loader2, 
  Info,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Maximize2
} from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    chest: 0, waist: 0, hips: 0, shoulder: 0, sleeves: 0, inseam: 0, neck: 0, length: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        measurements: {
          chest: Number(form.chest),
          waist: Number(form.waist),
          hips: Number(form.hips),
          shoulder: Number(form.shoulder),
          sleeves: Number(form.sleeves),
          inseam: Number(form.inseam),
          neck: Number(form.neck),
          length: Number(form.length)
        }
      };

      const res = await api.post('/customers', data);
      setCustomers([res.data, ...customers]);
      setIsModalOpen(false);
      setForm({
        name: '', email: '', phone: '', address: '',
        chest: 0, waist: 0, hips: 0, shoulder: 0, sleeves: 0, inseam: 0, neck: 0, length: 0
      });
      alert('Customer created successfully');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primaryClr w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primaryClr">Customer Profiles</h1>
          <p className="text-secondaryClr/60 text-sm">Create and browse tailoring clients and manage measurements records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95 animate-fadeIn"
          >
            <UserPlus size={18} />
            Add Customer
          </button>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryClr/40" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone..."
              className="input-field pl-10 py-2.5 w-full md:w-80 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div 
            key={customer._id} 
            className="bg-white rounded-3xl p-6 border border-secondaryClr/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primaryClr/5 text-primaryClr rounded-2xl flex items-center justify-center font-bold text-lg">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-secondaryClr">{customer.name}</h3>
                  <p className="text-[10px] text-secondaryClr/40 font-semibold uppercase tracking-wider">Customer Profile</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-secondaryClr/70 mb-6">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-primaryClr/50" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-primaryClr/50" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primaryClr/50" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCustomer(customer)}
                className="w-full py-2.5 bg-primaryClr/5 hover:bg-primaryClr hover:text-white text-primaryClr rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Maximize2 size={12} />
                Measurements Detail
              </button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-16 text-center text-secondaryClr/40 italic text-sm bg-white rounded-[2rem] border border-secondaryClr/5">
            No customers match the query.
          </div>
        )}
      </div>

      {/* Customer Measurements Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`${selectedCustomer.name} - Tailoring Specs`}
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 bg-backgroundClr/20 p-4 rounded-2xl text-xs font-semibold">
              <div>Phone: <span className="font-bold text-secondaryClr">{selectedCustomer.phone}</span></div>
              <div>Email: <span className="font-bold text-secondaryClr">{selectedCustomer.email || 'None'}</span></div>
              <div className="col-span-2">Address: <span className="font-bold text-secondaryClr">{selectedCustomer.address || 'None'}</span></div>
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60 pt-2">Specs (inches)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(selectedCustomer.measurements || {}).map(([key, val]) => (
                <div key={key} className="bg-primaryClr/5 border border-primaryClr/10 p-3 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-secondaryClr/40">{key}</span>
                  <p className="text-lg font-black text-primaryClr mt-0.5">{val}"</p>
                </div>
              ))}
            </div>

            <div className="pt-4 text-right">
              <Button onClick={() => setSelectedCustomer(null)}>Close Spec</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Customer Profile"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Abebe Balcha"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="0911223344"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="abebe@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Address"
              placeholder="Bole, Addis Ababa"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="border-t border-secondaryClr/10 pt-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/50 mb-3">Custom Measurements Specs (inches)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length'].map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-secondaryClr/40 uppercase tracking-widest mb-1">{key}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    className="w-full bg-primaryClr/5 border-0 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
