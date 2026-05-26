import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
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
  const { user } = useAuth();
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState('All');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Form state
  const initialMeasurements = {
    chest: 0, waist: 0, hips: 0, shoulder: 0, sleeves: 0, inseam: 0, neck: 0, length: 0,
    fullLengthBack: 0, fullLengthFront: 0, acrossChest: 0, acrossShoulder: 0, shoulderLength: 0, centerLength: 0, shoulderSlope: 0, acrossBack: 0, backNeck: 0,
    pantLength: 0, crotchDepth: 0, hipDepth: 0, waistArcFront: 0, waistArcBack: 0, hipArcFront: 0, hipArcBack: 0,
    bicep: 0, capHeight: 0
  };

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', ...initialMeasurements
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
          chest: Number(form.chest), waist: Number(form.waist), hips: Number(form.hips), shoulder: Number(form.shoulder),
          sleeves: Number(form.sleeves), inseam: Number(form.inseam), neck: Number(form.neck), length: Number(form.length),
          fullLengthBack: Number(form.fullLengthBack), fullLengthFront: Number(form.fullLengthFront), acrossChest: Number(form.acrossChest),
          acrossShoulder: Number(form.acrossShoulder), shoulderLength: Number(form.shoulderLength), centerLength: Number(form.centerLength),
          shoulderSlope: Number(form.shoulderSlope), acrossBack: Number(form.acrossBack), backNeck: Number(form.backNeck),
          pantLength: Number(form.pantLength), crotchDepth: Number(form.crotchDepth), hipDepth: Number(form.hipDepth),
          waistArcFront: Number(form.waistArcFront), waistArcBack: Number(form.waistArcBack), hipArcFront: Number(form.hipArcFront), hipArcBack: Number(form.hipArcBack),
          bicep: Number(form.bicep), capHeight: Number(form.capHeight)
        }
      };

      const res = await api.post('/customers', data);
      setCustomers([res.data, ...customers]);
      setIsModalOpen(false);
      setForm({
        name: '', email: '', phone: '', address: '', ...initialMeasurements
      });
      toast.success('Customer created successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const confirmDeleteCustomer = (id) => {
    setCustomerToDelete(id);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`/customers/${customerToDelete}`);
      setCustomers(customers.filter(c => c._id !== customerToDelete));
      setCustomerToDelete(null);
      toast.success('Customer profile deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete customer');
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
          <h1 className="text-2xl font-display font-bold text-primaryClr">{t('customers.title')}</h1>
          <p className="text-secondaryClr/60 text-sm">Create and browse tailoring clients and manage measurements records.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95 animate-fadeIn"
          >
            <UserPlus size={18} />
            {t('customers.addClient')}
          </button>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryClr/40" size={18} />
            <input
              type="text"
              placeholder={t('customers.searchPlaceholder')}
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
                className="flex-1 py-2.5 bg-primaryClr/5 hover:bg-primaryClr hover:text-white text-primaryClr rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Maximize2 size={12} />
                {t('customers.viewMeasurements')}
              </button>
              {user?.role === 'manager' && (
                <button
                  onClick={() => confirmDeleteCustomer(customer._id)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                  title={t('common.delete')}
                >
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-16 text-center text-secondaryClr/40 italic text-sm bg-white rounded-[2rem] border border-secondaryClr/5">
            {t('customers.noCustomers')}
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

            <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/60 pt-2">Specs (cm)</h4>
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
              {[
                { title: "General", keys: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length'] },
                { title: "Shirt Foundation", keys: ['fullLengthBack', 'fullLengthFront', 'acrossChest', 'acrossShoulder', 'shoulderLength', 'centerLength', 'shoulderSlope', 'acrossBack', 'backNeck'] },
                { title: "Trouser Foundation", keys: ['pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack'] },
                { title: "Coat & Sleeve Specific", keys: ['bicep', 'capHeight'] }
              ].map(group => {
                const groupMeasurements = group.keys.reduce((acc, k) => {
                  if (selectedCustomer.measurements?.[k] !== undefined) acc[k] = selectedCustomer.measurements[k];
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
                          <p className="text-lg font-black text-primaryClr mt-0.5">{val} cm</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 text-right">
              <Button onClick={() => setSelectedCustomer(null)}>{t('common.close')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('customers.createClient')}
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('customers.name')}
              placeholder="Abebe Balcha"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label={t('customers.phone')}
              placeholder="0911223344"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label={t('customers.email')}
              type="email"
              placeholder="abebe@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label={t('customers.address')}
              placeholder="Bole, Addis Ababa"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="border-t border-secondaryClr/10 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/50">{t('customers.measurements')}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-secondaryClr/40 uppercase tracking-widest">{t('customers.garmentType')}:</span>
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

            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 pb-4">
              {[
                { title: "General", keys: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length'] },
                { title: "Shirt Foundation", keys: ['fullLengthBack', 'fullLengthFront', 'acrossChest', 'acrossShoulder', 'shoulderLength', 'centerLength', 'shoulderSlope', 'acrossBack', 'backNeck'] },
                { title: "Trouser Foundation", keys: ['pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack'] },
                { title: "Coat & Sleeve Specific", keys: ['bicep', 'capHeight'] }
              ].map(group => {
                const visibleKeys = group.keys.filter(key => {
                  if (selectedGarmentType === 'All') return true;
                  const mapping = {
                    Suit: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'neck', 'length', 'pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack', 'bicep', 'capHeight'],
                    Shirt: ['chest', 'shoulder', 'sleeves', 'neck', 'length', 'fullLengthBack', 'fullLengthFront', 'acrossChest', 'acrossShoulder', 'shoulderLength', 'centerLength', 'shoulderSlope', 'acrossBack', 'backNeck'],
                    Trousers: ['waist', 'hips', 'inseam', 'length', 'pantLength', 'crotchDepth', 'hipDepth', 'waistArcFront', 'waistArcBack', 'hipArcFront', 'hipArcBack'],
                    Dress: ['chest', 'waist', 'hips', 'shoulder', 'length'],
                    Coat: ['chest', 'waist', 'shoulder', 'sleeves', 'length', 'bicep', 'capHeight']
                  };
                  return mapping[selectedGarmentType]?.includes(key);
                });

                if (visibleKeys.length === 0) return null;

                return (
                  <div key={group.title} className="bg-backgroundClr/30 p-4 rounded-2xl border border-secondaryClr/5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-primaryClr/70 mb-3">{group.title}</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {visibleKeys.map(key => (
                        <div key={key}>
                          <label className="block text-[9px] font-black text-secondaryClr/40 uppercase tracking-wider mb-1 truncate" title={key.replace(/([A-Z])/g, ' $1').trim()}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            className="w-full bg-white border border-secondaryClr/10 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20 transition-all"
                            value={form[key] || ''}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-1/2"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="w-1/2"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title={t('common.warning')}
      >
        <div className="space-y-4">
          <p className="text-sm text-secondaryClr/70 font-semibold">
            Are you sure you want to delete this customer profile? This action cannot be undone and will permanently remove all associated measurement data.
          </p>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCustomerToDelete(null)}
              className="w-1/2"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleDeleteCustomer}
              className="w-1/2 bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-lg shadow-red-600/20"
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
