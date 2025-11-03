import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCreditCard, 
  FiEdit2, 
  FiTrash2,
  FiMapPin,
  FiCalendar,
  FiFlag,
  FiStar,
  FiAlertTriangle
} from 'react-icons/fi';

// Configuration
const API_BASE_URL = 'http://localhost:5000';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    idType: 'passport',
    idNumber: '',
    dateOfBirth: '',
    nationality: '',
    preferences: {
      roomType: '',
      smokingPreference: 'non-smoking',
      bedPreference: '',
      floorPreference: 'no-preference',
      specialRequests: []
    },
    loyaltyProgram: {
      memberId: '',
      tier: 'bronze',
      points: 0
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    isVIP: false,
    blacklisted: false
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGuests();
  }, [searchTerm, currentPage]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/guests?search=${searchTerm}&page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuests(response.data.guests || []);
      setTotalPages(response.data.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load guests');
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address' || parent === 'preferences' || parent === 'loyaltyProgram' || parent === 'emergencyContact') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSpecialRequest = (request) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        specialRequests: [...prev.preferences.specialRequests, request]
      }
    }));
  };

  const removeSpecialRequest = (index) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        specialRequests: prev.preferences.specialRequests.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        // Update existing guest
        const response = await axios.put(
          `${API_BASE_URL}/guests/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGuests(guests.map(g => g._id === editingId ? response.data : g));
      } else {
        // Create new guest
        const response = await axios.post(
          `${API_BASE_URL}/guests`, 
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGuests([...guests, response.data]);
      }
      
      resetForm();
      fetchGuests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || (editingId ? 'Failed to update guest' : 'Failed to add guest'));
    }
  };

  const handleEdit = (guest) => {
    setFormData({
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      email: guest.email || '',
      phone: guest.phone || '',
      address: {
        street: guest.address?.street || '',
        city: guest.address?.city || '',
        state: guest.address?.state || '',
        zipCode: guest.address?.zipCode || '',
        country: guest.address?.country || ''
      },
      idType: guest.idType || 'passport',
      idNumber: guest.idNumber || '',
      dateOfBirth: guest.dateOfBirth ? guest.dateOfBirth.split('T')[0] : '',
      nationality: guest.nationality || '',
      preferences: {
        roomType: guest.preferences?.roomType || '',
        smokingPreference: guest.preferences?.smokingPreference || 'non-smoking',
        bedPreference: guest.preferences?.bedPreference || '',
        floorPreference: guest.preferences?.floorPreference || 'no-preference',
        specialRequests: guest.preferences?.specialRequests || []
      },
      loyaltyProgram: {
        memberId: guest.loyaltyProgram?.memberId || '',
        tier: guest.loyaltyProgram?.tier || 'bronze',
        points: guest.loyaltyProgram?.points || 0
      },
      emergencyContact: {
        name: guest.emergencyContact?.name || '',
        relationship: guest.emergencyContact?.relationship || '',
        phone: guest.emergencyContact?.phone || ''
      },
      isVIP: guest.isVIP || false,
      blacklisted: guest.blacklisted || false
    });
    setEditingId(guest._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/guests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuests(guests.filter(g => g._id !== id));
      setDeleteConfirm(null);
      fetchGuests(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete guest');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      idType: 'passport',
      idNumber: '',
      dateOfBirth: '',
      nationality: '',
      preferences: {
        roomType: '',
        smokingPreference: 'non-smoking',
        bedPreference: '',
        floorPreference: 'no-preference',
        specialRequests: []
      },
      loyaltyProgram: {
        memberId: '',
        tier: 'bronze',
        points: 0
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      isVIP: false,
      blacklisted: false
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const getIdTypeDisplay = (idType) => {
    const types = {
      passport: 'Passport',
      driving_license: 'Driving License',
      national_id: 'National ID'
    };
    return types[idType] || idType;
  };

  const getLoyaltyTierDisplay = (tier) => {
    const tiers = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum'
    };
    return tiers[tier] || tier;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 min-w-0 transition-all duration-300">
        {/* Main Content Container */}
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Guests Management</h1>
              <p className="text-gray-600 mt-1">Manage your hotel guests and their information</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              {/* Add Guest Button */}
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  showForm 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {showForm ? (
                  <>
                    <FiX className="mr-2" /> Cancel
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" /> Add Guest
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && !showForm && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
              <button 
                onClick={() => setError('')}
                className="mt-1 text-sm text-red-700 underline float-right"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Add/Edit Guest Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <FiUser className="mr-2 text-blue-600" />
                {editingId ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        name="firstName"
                        placeholder="e.g., John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        name="lastName"
                        placeholder="e.g., Smith"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="john.smith@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <input
                        name="nationality"
                        placeholder="e.g., American"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Street</label>
                      <input
                        name="address.street"
                        placeholder="123 Main St"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        name="address.city"
                        placeholder="New York"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        name="address.state"
                        placeholder="NY"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                      <input
                        name="address.zipCode"
                        placeholder="10001"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        name="address.country"
                        placeholder="United States"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiCreditCard className="mr-2" />
                    Identification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ID Type *</label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                        <option value="national_id">National ID</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">ID Number *</label>
                      <input
                        name="idNumber"
                        placeholder="ID Number"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Room Type</label>
                      <input
                        name="preferences.roomType"
                        placeholder="e.g., Deluxe Suite"
                        value={formData.preferences.roomType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Smoking Preference</label>
                      <select
                        name="preferences.smokingPreference"
                        value={formData.preferences.smokingPreference}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="non-smoking">Non-Smoking</option>
                        <option value="smoking">Smoking</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Bed Preference</label>
                      <select
                        name="preferences.bedPreference"
                        value={formData.preferences.bedPreference}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">No Preference</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="queen">Queen</option>
                        <option value="king">King</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Floor Preference</label>
                      <select
                        name="preferences.floorPreference"
                        value={formData.preferences.floorPreference}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="no-preference">No Preference</option>
                        <option value="low">Low Floor</option>
                        <option value="high">High Floor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loyalty Program */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiStar className="mr-2" />
                    Loyalty Program
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Member ID</label>
                      <input
                        name="loyaltyProgram.memberId"
                        placeholder="Member ID"
                        value={formData.loyaltyProgram.memberId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Tier</label>
                      <select
                        name="loyaltyProgram.tier"
                        value={formData.loyaltyProgram.tier}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                      <input
                        name="emergencyContact.name"
                        placeholder="Emergency contact name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Relationship</label>
                      <input
                        name="emergencyContact.relationship"
                        placeholder="e.g., Spouse, Parent"
                        value={formData.emergencyContact.relationship}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        name="emergencyContact.phone"
                        placeholder="Emergency contact phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      name="isVIP"
                      type="checkbox"
                      checked={formData.isVIP}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      VIP Guest
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      name="blacklisted"
                      type="checkbox"
                      checked={formData.blacklisted}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Blacklisted
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                  >
                    {editingId ? 'Update Guest' : 'Save Guest'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Guests Table/Cards */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            
            {/* Results Count */}
            {guests.length > 0 && (
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {guests.length} guest{guests.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </p>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identification</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.length > 0 ? (
                      guests.map(guest => (
                        <tr key={guest._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FiUser className="text-blue-600 text-lg" />
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-bold text-gray-900">
                                    {guest.firstName} {guest.lastName}
                                  </div>
                                  {guest.isVIP && (
                                    <FiStar className="ml-2 text-yellow-500" size={16} />
                                  )}
                                  {guest.blacklisted && (
                                    <FiAlertTriangle className="ml-2 text-red-500" size={16} />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {guest.nationality && <FiFlag className="inline mr-1" />}
                                  {guest.nationality} {guest.dateOfBirth && `• ${formatDate(guest.dateOfBirth)}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-900">
                                <FiMail className="text-gray-400 mr-2" size={14} />
                                {guest.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FiPhone className="text-gray-400 mr-2" size={14} />
                                {guest.phone}
                              </div>
                              {guest.address?.city && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <FiMapPin className="text-gray-400 mr-2" size={14} />
                                  {guest.address.city}, {guest.address.state}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                  {getIdTypeDisplay(guest.idType)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FiCreditCard className="text-gray-400 mr-2" size={14} />
                                {guest.idNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {guest.loyaltyProgram?.tier && (
                                <div className="flex items-center text-sm">
                                  <FiStar className="text-yellow-500 mr-1" size={14} />
                                  <span className="capitalize">{getLoyaltyTierDisplay(guest.loyaltyProgram.tier)}</span>
                                  {guest.loyaltyProgram.points > 0 && (
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({guest.loyaltyProgram.points} pts)
                                    </span>
                                  )}
                                </div>
                              )}
                              {guest.preferences?.roomType && (
                                <div className="text-xs text-gray-600">
                                  Prefers: {guest.preferences.roomType}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(guest)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Edit guest"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(guest._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete guest"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <FiUser className="text-4xl text-gray-400 mb-2" />
                            <p>No guests found</p>
                            <p className="text-xs">
                              {searchTerm ? `No results for "${searchTerm}"` : 'Add your first guest to get started'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {guests.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {guests.map(guest => (
                    <div key={guest._id} className="p-4 hover:bg-gray-50 transition-colors">
                      
                      {/* Guest Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <div className="text-lg font-bold text-gray-900">
                                {guest.firstName} {guest.lastName}
                              </div>
                              {guest.isVIP && (
                                <FiStar className="ml-2 text-yellow-500" size={14} />
                              )}
                              {guest.blacklisted && (
                                <FiAlertTriangle className="ml-2 text-red-500" size={14} />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: #{guest._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEdit(guest)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(guest._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiMail className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="break-all">{guest.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="text-gray-400 mr-2 flex-shrink-0" />
                          <span>{guest.phone}</span>
                        </div>
                        {guest.address?.city && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="text-gray-400 mr-2 flex-shrink-0" />
                            <span>{guest.address.city}, {guest.address.state}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Identification & Status */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Identification</span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {getIdTypeDisplay(guest.idType)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCreditCard className="text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-mono">{guest.idNumber}</span>
                        </div>
                        {guest.loyaltyProgram?.tier && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Loyalty Tier</span>
                            <span className="flex items-center text-sm">
                              <FiStar className="text-yellow-500 mr-1" size={14} />
                              {getLoyaltyTierDisplay(guest.loyaltyProgram.tier)}
                            </span>
                          </div>
                        )}
                        {guest.preferences?.roomType && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Preferences:</strong> {guest.preferences.roomType}
                            {guest.preferences.smokingPreference && ` • ${guest.preferences.smokingPreference}`}
                            {guest.preferences.bedPreference && ` • ${guest.preferences.bedPreference} bed`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiUser className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-lg mb-2">No guests found</p>
                  <p className="text-sm">
                    {searchTerm ? `No results for "${searchTerm}"` : 'Add your first guest to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this guest? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsPage;