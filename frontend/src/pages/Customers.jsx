import React, { useState } from 'react';
import { Plus, Trash2, X, Users, Search, Edit2, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { customersAPI } from '../api';

export default function Customers({ customers, onCreate, onUpdate, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleViewCustomer = async (id) => {
    try {
      const cust = await customersAPI.getOne(id);
      setSelectedCustomer(cust);
    } catch (err) {
      alert("Failed to fetch customer details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      if (editingCustomer) {
        await onUpdate(editingCustomer.id, { name, email, phone: phone.trim() || null });
      } else {
        await onCreate({ name, email, phone: phone.trim() || null });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save customer. Verify email is not already taken.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? This will also remove all their order histories.')) {
      try {
        await onDelete(id);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete customer.');
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Customers Directory</h1>
          <p className="text-gray-400 mt-1">Register, browse, and manage client profiles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-gradient px-5 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Customer Name or Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:outline-none"
          />
        </div>
      </div>

      {/* Grid or Empty view */}
      {filteredCustomers.length === 0 ? (
        <div className="glass-panel py-16 text-center rounded-2xl flex flex-col items-center justify-center">
          <Users className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-300 text-lg font-medium">No Customers Found</p>
          <p className="text-gray-500 text-sm mt-1">Register new customers to start processing orders.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Full Name</th>
                  <th className="py-4 px-6 font-semibold">Email Address</th>
                  <th className="py-4 px-6 font-semibold">Phone Number</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-white font-semibold block">{cust.name}</span>
                    </td>
                    <td className="py-4 px-6 text-blue-300">
                      {cust.email}
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {cust.phone || <span className="text-gray-500 italic">None</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewCustomer(cust.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id)}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCustomer ? 'Update Customer Profile' : 'Register New Customer'}
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full px-4 py-3 rounded-xl glass-input focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white btn-gradient rounded-xl font-semibold hover:opacity-90 transition"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8 pt-2">
              <div className="p-4 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-2xl">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">{selectedCustomer.name}</h2>
                <p className="text-gray-400 text-sm">Customer ID: #CUST-{selectedCustomer.id}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white/2 border border-white/5 rounded-xl">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
                  <p className="text-gray-200 font-medium">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/2 border border-white/5 rounded-xl">
                <Phone className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
                  <p className="text-gray-200 font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
