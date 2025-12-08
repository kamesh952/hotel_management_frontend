import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  FiAlertTriangle,
  FiGlobe,
  FiHome,
  FiHeart,
  FiShield,
  FiPhoneCall,
  FiEye,
  FiClock,
  FiDollarSign,
  FiBriefcase
} from 'react-icons/fi';

// Localhost configuration
const API_BASE_URL = 'http://localhost:5000';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  const [totalGuests, setTotalGuests] = useState(0);
  const [viewGuest, setViewGuest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [searchTerm, currentPage]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setError('Please login to access guests');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/guests`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: 10
        },
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      setGuests(response.data.guests || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalGuests(response.data.total || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching guests:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        // Redirect to login or clear token
        localStorage.removeItem('token');
      } else {
        setError(err.response?.data?.error || 'Failed to load guests. Please check if server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects (address.preferences.loyaltyProgram.emergencyContact)
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

  const handleAddSpecialRequest = () => {
    const request = prompt('Enter special request:');
    if (request && request.trim()) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          specialRequests: [...prev.preferences.specialRequests, request.trim()]
        }
      }));
    }
  };

  const handleRemoveSpecialRequest = (index) => {
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
      const token = getToken();
      if (!token) {
        setError('Please login to perform this action');
        return;
      }

      // Format dateOfBirth
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || undefined
      };

      if (editingId) {
        // Update existing guest
        const response = await axios.put(
          `/guests/${editingId}`,
          formattedData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setSuccess('Guest updated successfully');
        setGuests(guests.map(g => g._id === editingId ? response.data : g));
      } else {
        // Create new guest
        const response = await axios.post(
          `/guests`, 
          formattedData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        setSuccess('Guest added successfully');
        setGuests([...guests, response.data]);
      }
      
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
      fetchGuests(); // Refresh the list
    } catch (err) {
      console.error('Error saving guest:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.error || (editingId ? 'Failed to update guest' : 'Failed to add guest'));
      }
    }
  };

  const handleViewGuest = async (guestId) => {
    try {
      const token = getToken();
      const response = await axios.get(`/guests/${guestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewGuest(response.data);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load guest details');
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
      const token = getToken();
      await axios.delete(`/guests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Guest deleted successfully');
      setGuests(guests.filter(g => g._id !== id));
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
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

  const getLoyaltyColor = (tier) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800'
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading guests from {API_BASE_URL}...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guests Management</h1>
              <p className="text-gray-600 mt-2">Total {totalGuests} guests • Connected to: {API_BASE_URL}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Add Guest Button */}
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(!showForm);
                }}
                className={`flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all ${showForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
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
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                <FiX />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                <FiX />
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              <FiUser className="inline mr-2" />
              {editingId ? 'Edit Guest' : 'Add New Guest'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                    <input
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Identification */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Type *</label>
                    <select
                      name="idType"
                      value={formData.idType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="national_id">National ID</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                    <input
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <input
                      name="preferences.roomType"
                      value={formData.preferences.roomType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Smoking</label>
                    <select
                      name="preferences.smokingPreference"
                      value={formData.preferences.smokingPreference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="non-smoking">Non-Smoking</option>
                      <option value="smoking">Smoking</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bed Preference</label>
                    <select
                      name="preferences.bedPreference"
                      value={formData.preferences.bedPreference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Preference</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="queen">Queen</option>
                      <option value="king">King</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Preference</label>
                    <select
                      name="preferences.floorPreference"
                      value={formData.preferences.floorPreference}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="no-preference">No Preference</option>
                      <option value="low">Low Floor</option>
                      <option value="high">High Floor</option>
                    </select>
                  </div>
                </div>
                
                {/* Special Requests */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.preferences.specialRequests.map((request, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {request}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialRequest(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecialRequest}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FiPlus className="mr-1" /> Add Special Request
                  </button>
                </div>
              </div>

              {/* Loyalty Program */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loyalty Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member ID</label>
                    <input
                      name="loyaltyProgram.memberId"
                      value={formData.loyaltyProgram.memberId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                    <select
                      name="loyaltyProgram.tier"
                      value={formData.loyaltyProgram.tier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <input
                      name="loyaltyProgram.points"
                      type="number"
                      value={formData.loyaltyProgram.points}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Flags</h3>
                <div className="flex space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isVIP"
                      checked={formData.isVIP}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">VIP Guest</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="blacklisted"
                      checked={formData.blacklisted}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Blacklisted</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update Guest' : 'Save Guest'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Guests List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Guests List</h2>
              <p className="text-sm text-gray-600">
                Showing {guests.length} of {totalGuests} guests
              </p>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.length > 0 ? (
                  guests.map(guest => (
                    <tr key={guest._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">
                                {guest.firstName} {guest.lastName}
                              </div>
                              {guest.isVIP && (
                                <FiStar className="ml-2 text-yellow-500" title="VIP" />
                              )}
                              {guest.blacklisted && (
                                <FiAlertTriangle className="ml-2 text-red-500" title="Blacklisted" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {guest.nationality && <><FiFlag className="inline mr-1" /> {guest.nationality}</>}
                              {guest.dateOfBirth && ` • ${formatDate(guest.dateOfBirth)}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <FiMail className="text-gray-400 mr-2" />
                            {guest.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiPhone className="text-gray-400 mr-2" />
                            {guest.phone}
                          </div>
                          {guest.address?.city && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FiMapPin className="text-gray-400 mr-2" />
                              {guest.address.city}, {guest.address.state}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getIdTypeDisplay(guest.idType)}
                          </span>
                          <div className="text-sm text-gray-600">
                            <FiCreditCard className="inline mr-1" />
                            {guest.idNumber}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {guest.loyaltyProgram?.tier && (
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoyaltyColor(guest.loyaltyProgram.tier)}`}>
                              <FiStar className="mr-1" />
                              {getLoyaltyTierDisplay(guest.loyaltyProgram.tier)}
                              {guest.loyaltyProgram.points > 0 && ` (${guest.loyaltyProgram.points})`}
                            </div>
                          )}
                          {guest.preferences?.roomType && (
                            <div className="text-xs text-gray-500">
                              Prefers: {guest.preferences.roomType}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewGuest(guest._id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(guest)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(guest)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-sm font-medium text-gray-900">No guests</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No guests match your search' : 'Get started by adding a new guest'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Guest Modal */}
      {showViewModal && viewGuest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Guest Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Guest Info */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-blue-600 text-2xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold">
                        {viewGuest.firstName} {viewGuest.lastName}
                        {viewGuest.isVIP && <FiStar className="inline ml-2 text-yellow-500" />}
                        {viewGuest.blacklisted && <FiAlertTriangle className="inline ml-2 text-red-500" />}
                      </h3>
                      <p className="text-gray-600">Guest ID: {viewGuest._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Contact & Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiMail className="mr-2" /> Contact Information
                    </h4>
                    <div className="space-y-2">
                      <p><strong>Email:</strong> {viewGuest.email}</p>
                      <p><strong>Phone:</strong> {viewGuest.phone}</p>
                      <p><strong>Date of Birth:</strong> {formatDate(viewGuest.dateOfBirth)}</p>
                      <p><strong>Nationality:</strong> {viewGuest.nationality || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiHome className="mr-2" /> Address
                    </h4>
                    <div className="space-y-1">
                      {viewGuest.address?.street && <p>{viewGuest.address.street}</p>}
                      {viewGuest.address?.city && <p>{viewGuest.address.city}, {viewGuest.address.state} {viewGuest.address.zipCode}</p>}
                      {viewGuest.address?.country && <p>{viewGuest.address.country}</p>}
                      {!viewGuest.address?.street && <p className="text-gray-500">No address provided</p>}
                    </div>
                  </div>
                </div>

                {/* Identification & Loyalty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiCreditCard className="mr-2" /> Identification
                    </h4>
                    <div className="space-y-2">
                      <p><strong>Type:</strong> {getIdTypeDisplay(viewGuest.idType)}</p>
                      <p><strong>Number:</strong> {viewGuest.idNumber}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiStar className="mr-2" /> Loyalty Program
                    </h4>
                    <div className="space-y-2">
                      {viewGuest.loyaltyProgram?.memberId ? (
                        <>
                          <p><strong>Member ID:</strong> {viewGuest.loyaltyProgram.memberId}</p>
                          <p><strong>Tier:</strong> {getLoyaltyTierDisplay(viewGuest.loyaltyProgram.tier)}</p>
                          <p><strong>Points:</strong> {viewGuest.loyaltyProgram.points}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">Not enrolled in loyalty program</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FiHeart className="mr-2" /> Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {viewGuest.preferences?.roomType && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">Room Type</p>
                        <p className="font-medium">{viewGuest.preferences.roomType}</p>
                      </div>
                    )}
                    
                    {viewGuest.preferences?.smokingPreference && (
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800">Smoking</p>
                        <p className="font-medium">{viewGuest.preferences.smokingPreference}</p>
                      </div>
                    )}
                    
                    {viewGuest.preferences?.bedPreference && (
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-sm text-purple-800">Bed Preference</p>
                        <p className="font-medium">{viewGuest.preferences.bedPreference}</p>
                      </div>
                    )}
                    
                    {viewGuest.preferences?.floorPreference && viewGuest.preferences.floorPreference !== 'no-preference' && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm text-yellow-800">Floor Preference</p>
                        <p className="font-medium">{viewGuest.preferences.floorPreference}</p>
                      </div>
                    )}
                  </div>
                  
                  {viewGuest.preferences?.specialRequests?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium mb-2">Special Requests:</p>
                      <div className="flex flex-wrap gap-2">
                        {viewGuest.preferences.specialRequests.map((request, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {request}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {viewGuest.emergencyContact?.name && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FiPhoneCall className="mr-2" /> Emergency Contact
                    </h4>
                    <div className="bg-red-50 p-4 rounded">
                      <p><strong>Name:</strong> {viewGuest.emergencyContact.name}</p>
                      <p><strong>Relationship:</strong> {viewGuest.emergencyContact.relationship}</p>
                      <p><strong>Phone:</strong> {viewGuest.emergencyContact.phone}</p>
                    </div>
                  </div>
                )}

                {/* System Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FiClock className="mr-2" /> System Information
                  </h4>
                  <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><strong>Created:</strong> {formatDateTime(viewGuest.createdAt)}</p>
                    <p><strong>Last Updated:</strong> {formatDateTime(viewGuest.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewGuest);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Delete Guest</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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