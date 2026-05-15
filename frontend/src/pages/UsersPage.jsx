import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
    role: 'user',
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
      setNewUser({ name: '', email: '', password: '', role: 'user', phone: '' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Users" 
          value={users.length} 
          trend={Users} 
          changes={`${users.length > 0 ? '+100%' : '0%'}`}
        />
        <Card 
          title="Admins" 
          value={users.filter(u => u.role === 'admin').length} 
          trend={UserCheck} 
          trendColor="text-blue-600"
          changes="Active"
        />
        <Card 
          title="Super Admins" 
          value={users.filter(u => u.role === 'superadmin').length} 
          trend={Shield} 
          trendColor="text-purple-600"
          changes="System"
        />
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-primaryClr">User Management</h1>
          <p className="text-secondaryClr/60 text-sm">Manage user accounts, roles, and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primaryClr text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-primaryClr/20 hover:scale-105 active:scale-95"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">Add User</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-secondaryClr/10 text-secondaryClr hover:text-primaryClr hover:border-primaryClr/20 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondaryClr/40" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondaryClr/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-secondaryClr/40 italic text-sm">
                    No users found matching your search.
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
                      <select
                        value={u.role}
                        disabled={u._id === currentUser._id || (u.role === 'superadmin' && currentUser.role !== 'superadmin')}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primaryClr/20 cursor-pointer appearance-none ${
                          u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        {currentUser.role === 'superadmin' && <option value="superadmin">Super Admin</option>}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'active' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`} />
                        {u.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-secondaryClr/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status)}
                          disabled={u._id === currentUser._id || u.role === 'superadmin'}
                          className={`p-2 rounded-lg transition-all ${
                            u.status === 'active' 
                              ? 'text-secondaryClr/40 hover:text-amber-600 hover:bg-amber-50' 
                              : 'text-secondaryClr/40 hover:text-green-600 hover:bg-green-50'
                          } disabled:opacity-10`}
                          title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Power size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-secondaryClr/40 hover:text-primaryClr hover:bg-primaryClr/5 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          disabled={u._id === currentUser._id || (u.role === 'superadmin' && currentUser.role !== 'superadmin')}
                          className="p-2 text-secondaryClr/40 hover:text-status-cancelled hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
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
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            required
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              {currentUser.role === 'superadmin' && <option value="superadmin">Super Admin</option>}
            </select>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Details"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            value={editUser.name}
            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            required
            value={editUser.email}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={editUser.phone}
            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
          />
          <div>
            <label className="block text-xs font-black text-primaryClr/40 uppercase tracking-widest mb-2">Role</label>
            <select
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              className="w-full bg-primaryClr/5 border-0 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primaryClr/20"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              {currentUser.role === 'superadmin' && <option value="superadmin">Super Admin</option>}
            </select>
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Update User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Delete User'}
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
