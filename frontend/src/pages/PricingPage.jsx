import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  Tag, 
  Loader2, 
  Edit3, 
  Clock, 
  DollarSign, 
  Plus,
  Ruler
} from 'lucide-react';

const ALL_MEASUREMENTS = ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length'];

const PricingPage = () => {
  const { t } = useTranslation();
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState(null);
  
  // Form states
  const [itemType, setItemType] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [requiredMeasurements, setRequiredMeasurements] = useState([...ALL_MEASUREMENTS]);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pricing');
      setPricings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (p) => {
    setSelectedPricing(p);
    setItemType(p.itemType);
    setBasePrice(p.basePrice);
    setEstimatedDays(p.estimatedDays);
    setRequiredMeasurements(p.requiredMeasurements || [...ALL_MEASUREMENTS]);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedPricing(null);
    setItemType('');
    setBasePrice('');
    setEstimatedDays(3);
    setRequiredMeasurements([...ALL_MEASUREMENTS]);
    setIsModalOpen(true);
  };

  const toggleMeasurement = (key) => {
    setRequiredMeasurements(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredMeasurements.length === 0) {
      alert('Please select at least one required measurement.');
      return;
    }
    try {
      const data = {
        itemType,
        basePrice: Number(basePrice),
        estimatedDays: Number(estimatedDays),
        requiredMeasurements
      };

      if (selectedPricing) {
        const res = await api.put(`/pricing/${selectedPricing._id}`, data);
        setPricings(pricings.map(p => p._id === selectedPricing._id ? res.data : p));
        alert('Pricing structure updated successfully');
      } else {
        const res = await api.post('/pricing', data);
        setPricings([...pricings.filter(p => p.itemType !== itemType), res.data]);
        alert('Pricing structure created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save pricing structure');
    }
  };

  if (loading && pricings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primaryClr w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primaryClr">{t('pricing.title')}</h1>
          <p className="text-secondaryClr/60 text-sm">Review base catalog costs, timeline estimates, and required measurements per garment.</p>
        </div>
        <button
          onClick={handleNewClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          {t('pricing.addItem')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricings.map(p => (
          <div key={p._id} className="bg-white rounded-3xl p-6 border border-secondaryClr/5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primaryClr/5 text-primaryClr rounded-xl">
                    <Tag size={18} />
                  </div>
                  <h3 className="font-bold text-base text-secondaryClr">{p.itemType}</h3>
                </div>
                <button
                  onClick={() => handleEditClick(p)}
                  className="p-2 bg-secondaryClr/5 text-secondaryClr/60 hover:text-primaryClr rounded-xl transition-all"
                  title="Edit Pricing"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 bg-backgroundClr/25 rounded-2xl border border-secondaryClr/5 mb-4 text-center">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-secondaryClr/40">{t('pricing.basePrice').split(' ')[0]} {t('pricing.basePrice').split(' ')[1]}</span>
                  <p className="text-base font-black text-primaryClr mt-0.5">{p.basePrice} {t('common.birr')}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-secondaryClr/40">{t('pricing.estimatedDays')}</span>
                  <p className="text-base font-black text-secondaryClr mt-0.5">{p.estimatedDays} {t('common.days')}</p>
                </div>
              </div>

              {/* Required Measurements Tags */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Ruler size={12} className="text-primaryClr/50" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-secondaryClr/40">{t('pricing.requiredMeasurements')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(p.requiredMeasurements || ALL_MEASUREMENTS).map(m => (
                    <span key={m} className="text-[10px] font-bold uppercase tracking-wide bg-primaryClr/8 text-primaryClr px-2 py-0.5 rounded-full border border-primaryClr/15">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(p)}
                className="w-full py-2 border border-primaryClr/15 hover:bg-primaryClr/5 text-primaryClr rounded-xl text-xs font-bold transition-all"
              >
                {t('common.edit')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPricing ? t('common.edit') + ' - ' + selectedPricing.itemType : t('pricing.addItem')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('pricing.itemType')}
            placeholder="e.g. Suit, Blazer, Shirt"
            required
            disabled={!!selectedPricing}
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
          />
          <Input
            label={t('pricing.basePrice')}
            type="number"
            min="0"
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
          <Input
            label={t('pricing.estimatedDays')}
            type="number"
            min="1"
            required
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
          />

          {/* Required Measurements Checkboxes */}
          <div className="border-t border-secondaryClr/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Ruler size={14} className="text-primaryClr/60" />
              <h4 className="text-xs font-black uppercase tracking-widest text-primaryClr/50">Required Measurements for this Garment</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_MEASUREMENTS.map(key => (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-bold uppercase tracking-wide select-none
                    ${requiredMeasurements.includes(key)
                      ? 'bg-primaryClr/10 border-primaryClr/30 text-primaryClr'
                      : 'bg-secondaryClr/5 border-secondaryClr/10 text-secondaryClr/40'
                    }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={requiredMeasurements.includes(key)}
                    onChange={() => toggleMeasurement(key)}
                  />
                  <span className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0
                    ${requiredMeasurements.includes(key) ? 'bg-primaryClr border-primaryClr' : 'border-secondaryClr/20'}`}
                  >
                    {requiredMeasurements.includes(key) && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {key}
                </label>
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
    </div>
  );
};

export default PricingPage;
