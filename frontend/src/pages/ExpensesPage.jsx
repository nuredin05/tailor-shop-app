import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { 
  TrendingDown, 
  Loader2, 
  Receipt, 
  Plus, 
  DollarSign, 
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const ExpensesPage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('materials');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchExpensesData();
  }, []);

  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      const [expensesRes, usersRes, ordersRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/auth/users'),
        api.get('/orders')
      ]);
      setExpenses(expensesRes.data);
      setOrders(ordersRes.data);
      // Filter for cutters / employee types
      setEmployees(usersRes.data.filter(u => u.role === 'cutter' || u.role === 'admin' || u.role === 'tailor'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        description,
        amount: Number(amount),
        category,
        date,
        employeeId: category === 'payroll' ? employeeId : undefined
      };

      const res = await api.post('/expenses', data);
      setExpenses([res.data, ...expenses]);
      setIsModalOpen(false);
      
      // Reset form
      setDescription('');
      setAmount('');
      setCategory('materials');
      setEmployeeId('');
      setDate(new Date().toISOString().split('T')[0]);

      alert('Expense recorded successfully');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to record expense');
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'payroll': return 'bg-purple-100 text-purple-700';
      case 'rent': return 'bg-amber-100 text-amber-700';
      case 'materials': return 'bg-blue-100 text-blue-700';
      case 'utilities': return 'bg-orange-100 text-orange-700';
      case 'marketing': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalExpenseSum = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Calculate Current Month Net Profit
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const monthlyExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);
  const monthlyOutflow = monthlyExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Revenue from orders (using the actual amountPaid on recent orders)
  const monthlyRevenue = orders.reduce((acc, order) => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= thirtyDaysAgo) {
      return acc + (order.amountPaid || 0);
    }
    return acc;
  }, 0);

  const netProfit = monthlyRevenue - monthlyOutflow;

  const materialsExpenses = expenses.filter(e => e.category === 'materials').reduce((a, b) => a + b.amount, 0);
  const payrollExpenses = expenses.filter(e => e.category === 'payroll').reduce((a, b) => a + b.amount, 0);

  if (loading && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primaryClr w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          title={t('expenses.netProfit')} 
          value={`${netProfit.toLocaleString()} ${t('common.birr')}`} 
          trend={netProfit >= 0 ? TrendingDown : AlertTriangle} 
          trendColor={netProfit >= 0 ? "text-green-500" : "text-red-500"}
          className={netProfit >= 0 ? "border-green-100 bg-green-50/30" : "border-red-100 bg-red-50/30"}
        />
        <Card 
          title={t('expenses.totalCosts')} 
          value={`${totalExpenseSum.toLocaleString()} ${t('common.birr')}`} 
          trend={TrendingDown} 
          trendColor="text-red-500"
        />
        <Card 
          title={t('expenses.materials')} 
          value={`${materialsExpenses.toLocaleString()} ${t('common.birr')}`} 
        />
        <Card 
          title={t('expenses.payroll')} 
          value={`${payrollExpenses.toLocaleString()} ${t('common.birr')}`} 
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primaryClr">{t('expenses.title')}</h1>
          <p className="text-secondaryClr/60 text-sm">{t('expenses.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          {t('expenses.recordExpense')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-secondaryClr/5 shadow-sm overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                <th className="px-6 py-4">{t('expenses.details')}</th>
                <th className="px-6 py-4">{t('expenses.category')}</th>
                <th className="px-6 py-4">{t('expenses.amount')}</th>
                <th className="px-6 py-4">{t('expenses.date')}</th>
                <th className="px-6 py-4">{t('expenses.employee')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondaryClr/5">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-secondaryClr/40 italic">
                    {t('expenses.noExpenses')}
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp._id} className="hover:bg-secondaryClr/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-secondaryClr">{exp.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getCategoryColor(exp.category)}`}>
                        {t(`expenses.categories.${exp.category}`) || exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-red-500">
                      -{exp.amount} {t('common.birr')}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondaryClr/60">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondaryClr/80">
                      {exp.employee ? exp.employee.name : <span className="text-secondaryClr/40 italic">{t('common.none')}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('expenses.recordExpense')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('expenses.description')}
            placeholder={t('expenses.descriptionPlaceholder')}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('expenses.amount')}
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label={t('expenses.date')}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">{t('expenses.category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="materials">{t('expenses.categories.materials')}</option>
              <option value="rent">{t('expenses.categories.rent')}</option>
              <option value="utilities">{t('expenses.categories.utilities')}</option>
              <option value="payroll">{t('expenses.categories.payroll')}</option>
              <option value="marketing">{t('expenses.categories.marketing')}</option>
              <option value="other">{t('expenses.categories.other')}</option>
            </select>
          </div>

          {category === 'payroll' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">{t('expenses.employee')}</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
                required={category === 'payroll'}
              >
                <option value="">-- {t('expenses.selectEmployee')} --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>
          )}

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

export default ExpensesPage;
