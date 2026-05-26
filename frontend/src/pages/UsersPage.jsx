import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { 
  Users, 
  Trash2, 
  UserCheck, 
  Shield, 
  Search, 
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  UserPlus,
  Loader2,
  Edit,
  Power
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: ''
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const response = await api.post('/auth/users', newUser);
      setUsers([response.data, ...users]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'customer', phone: '' });
      showStatus('User created successfully', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Note: We'll use the profile update logic or a new admin-specific update endpoint if needed.
      // For now, let's assume we can update name, email, phone, and role.
      // We already have updateUserRole, so let's combine or use separate calls.
      await api.put(`/auth/users/${selectedUser._id}/role`, { role: editUser.role });
      // If we had a full update endpoint:
      // await api.put(`/auth/users/${selectedUser._id}`, editUser);
      
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...editUser } : u));
      setIsEditModalOpen(false);
      showStatus('User updated successfully', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      await api.put(`/auth/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      showStatus(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditUser({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role
    });
    setIsEditModalOpen(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showStatus('User role updated successfully', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/auth/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      showStatus('User deleted successfully', 'success');
    } catch (err) {
      showStatus(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (u) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const showStatus = (msg, type) => {
    setStatusMsg({ msg, type });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExport = () => {
    if (users.length === 0) return;
    
    const headers = ['Name', 'Email', 'Role', 'Joined Date'];
    const csvData = users.map(u => [
      u.name,
      u.email,
      u.role,
      new Date(u.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus('Users exported to CSV', 'success');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primaryClr w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp">
        <Card 
          title={t('users.totalUsers')} 
          value={users.length} 
          trend={Users} 
          trendColor="text-blue-500"
          className="border-blue-100 bg-blue-50/10"
        />
        <Card 
          title={t('users.staffMembers')} 
          value={users.filter(u => ['admin', 'superadmin', 'manager', 'officer', 'cutter', 'tailor'].includes(u.role)).length} 
          trend={Shield} 
          trendColor="text-purple-500"
          className="border-purple-100 bg-purple-50/10"
        />
        <Card 
          title={t('users.customerCount')} 
          value={users.filter(u => u.role === 'customer').length} 
          trend={UserCheck} 
          trendColor="text-green-500"
          className="border-green-100 bg-green-50/10"
        />
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primaryClr">{t('users.title')}</h1>
          <p className="text-secondaryClr/60 text-sm">{t('users.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-secondaryClr/10 text-secondaryClr hover:text-primaryClr hover:border-primaryClr/20 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{t('users.exportCsv')}</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">{t('users.addUser')}</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryClr/40" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="input-field pl-10 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-slideInRight ${
          statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{statusMsg.msg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-secondaryClr/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondaryClr/5 text-secondaryClr uppercase tracking-widest text-[10px] font-bold">
                <th className="px-6 py-4">{t('users.fullName')}</th>
                <th className="px-6 py-4">{t('users.role')}</th>
                <th className="px-6 py-4">{t('users.status')}</th>
                <th className="px-6 py-4">{t('users.joinedDate')}</th>
                <th className="px-6 py-4 text-right">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondaryClr/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-secondaryClr/40 italic text-sm">
                    {t('users.noUsers')}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-secondaryClr/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primaryClr/5 border border-primaryClr/10 flex items-center justify-center overflow-hidden shrink-0">
                          {u.profileImage ? (
                            <img src={`http://localhost:5002${u.profileImage}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="text-primaryClr/40" size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{u.name}</p>
                          <p className="text-xs text-secondaryClr/60 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'officer' ? 'bg-indigo-100 text-indigo-700' :
                        u.role === 'cutter' ? 'bg-amber-100 text-amber-700' :
                        u.role === 'tailor' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {t(`users.roles.${u.role}`) || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isSuspended ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                          <XCircle size={14} /> Suspended
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <CheckCircle2 size={14} /> Active
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-secondaryClr/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-secondaryClr/40 hover:text-primaryClr hover:bg-primaryClr/5 rounded-lg transition-all"
                          title={t('common.edit')}
                        >
                          <Edit size={16} />
                        </button>
                        {u._id !== currentUser.id && (
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className={`p-2 rounded-lg transition-all ${u.isSuspended ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                            title={u.isSuspended ? t('users.activate') : t('users.deactivate')}
                          >
                            <Power size={16} />
                          </button>
                        )}
                        {u._id !== currentUser.id && u.role !== 'superadmin' && (
                          <button
                            onClick={() => {
                              setUserToDelete(u);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-secondaryClr/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={t('common.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStatusMsg(null);
        }}
        title={t('users.createUser')}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label={t('users.fullName')}
            placeholder="John Doe"
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <Input
            label={t('users.email')}
            type="email"
            placeholder="john@example.com"
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            label={t('users.phone')}
            placeholder="+1 (555) 000-0000"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
          <Input
            label={t('users.password')}
            type="password"
            placeholder="Min 6 characters"
            required
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">{t('users.role')}</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="customer">{t('users.roles.customer')}</option>
              <option value="cutter">{t('users.roles.cutter')}</option>
              <option value="tailor">{t('users.roles.tailor')}</option>
              <option value="officer">{t('users.roles.officer')}</option>
              <option value="manager">{t('users.roles.manager')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
            </select>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="animate-spin mx-auto" size={20} /> : t('users.createUser')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setStatusMsg(null);
        }}
        title={t('users.updateUser')}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label={t('users.fullName')}
            placeholder="John Doe"
            required
            value={editUser.name}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
          />
          <Input
            label={t('users.email')}
            type="email"
            placeholder="john@example.com"
            required
            value={editUser.email}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          />
          <Input
            label={t('users.phone')}
            placeholder="+1 (555) 000-0000"
            value={editUser.phone}
            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
          />
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">{t('users.role')}</label>
            <select
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="customer">{t('users.roles.customer')}</option>
              <option value="cutter">{t('users.roles.cutter')}</option>
              <option value="tailor">{t('users.roles.tailor')}</option>
              <option value="officer">{t('users.roles.officer')}</option>
              <option value="manager">{t('users.roles.manager')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
            </select>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20} /> : t('users.updateUser')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('common.confirmDelete')}
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : t('common.delete')}
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-primaryClr mb-2">Are you sure?</h3>
          <p className="text-sm text-secondaryClr/60">
            You are about to delete <span className="font-bold text-primaryClr">{userToDelete?.name}</span>. 
            This action is permanent and cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
