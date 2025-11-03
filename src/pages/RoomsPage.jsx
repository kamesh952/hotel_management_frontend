import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { FiPlus, FiX, FiHome, FiDollarSign, FiUsers, FiLayers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaBroom, FaDoorOpen, FaWrench } from 'react-icons/fa';

// Configuration - Remove /api from the base URL since your server.js doesn't have it
const API_BASE_URL = 'https://hotel-management-backend-4hff.onrender.com';




const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    type: 'standard',
    price: '',
    status: 'available',
    capacity: '',
    floor: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'capacity' || name === 'floor' ? 
        (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Prepare data with proper types
      const submitData = {
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        floor: Number(formData.floor)
      };
      
      if (editingId) {
        // Update existing room
        const response = await axios.put(
          `${API_BASE_URL}/rooms/${editingId}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRooms(rooms.map(r => r._id === editingId ? response.data : r));
      } else {
        // Create new room
        const response = await axios.post(
          `${API_BASE_URL}/rooms`, 
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRooms([...rooms, response.data]);
      }
      
      resetForm();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || (editingId ? 'Failed to update room' : 'Failed to add room'));
    }
  };

  const handleEdit = (room) => {
    setFormData({
      room_number: room.room_number,
      type: room.type,
      price: room.price.toString(),
      status: room.status,
      capacity: room.capacity.toString(),
      floor: room.floor.toString()
    });
    setEditingId(room._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(rooms.filter(r => r._id !== id));
      setDeleteConfirm(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete room');
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: '',
      type: 'standard',
      price: '',
      status: 'available',
      capacity: '',
      floor: ''
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaDoorOpen className="text-green-500" />;
      case 'occupied':
        return <FaBroom className="text-red-500" />;
      case 'maintenance':
        return <FaWrench className="text-yellow-500" />;
      default:
        return <FaDoorOpen className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Rooms Management</h1>
              <p className="text-gray-600 mt-1">Manage your hotel rooms and their availability</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
                  <FiPlus className="mr-2" /> Add Room
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && !showForm && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="text-red-700 hover:text-red-900 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Add/Edit Room Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <FiPlus className="mr-2 text-blue-600" />
                {editingId ? 'Edit Room' : 'Add New Room'}
              </h2>
              
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Room Number */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Room Number</label>
                    <div className="relative">
                      <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        name="room_number"
                        placeholder="e.g., 101"
                        value={formData.room_number}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Room Type</label>
                    <div className="relative">
                      <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                        required
                      >
                        <option value="standard">Standard</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="suite">Suite</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Price per Night ($)</label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="150.00"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        {getStatusIcon(formData.status)}
                      </div>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                      >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Capacity (Guests)</label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        name="capacity"
                        type="number"
                        min="1"
                        placeholder="2"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Floor */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Floor</label>
                    <div className="relative">
                      <FiLayers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <input
                        name="floor"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.floor}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
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
                    {editingId ? 'Update Room' : 'Save Room'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rooms Table/Cards */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.length > 0 ? (
                      rooms.map(room => (
                        <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FiHome className="text-blue-600 text-lg" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">
                                  Room #{room.room_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900 capitalize bg-gray-100 px-3 py-1 rounded-full">
                              {room.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center font-semibold">
                              <FiDollarSign className="text-green-500 mr-1" />
                              {room.price}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(room.status)}
                              <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(room.status)}`}>
                                {room.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiUsers className="text-gray-500 mr-2" />
                              <span className="font-medium">{room.capacity} guests</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <FiLayers className="text-gray-500 mr-2" />
                              <span className="font-medium">Floor {room.floor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(room)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(room._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex flex-col items-center">
                            <FiHome className="text-4xl text-gray-400 mb-2" />
                            <p>No rooms found</p>
                            <p className="text-xs">Add your first room to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              {rooms.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {rooms.map(room => (
                    <div key={room._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiHome className="text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-lg font-bold text-gray-900">
                              Room #{room.room_number}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {room.type}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEdit(room)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(room._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <FiDollarSign className="text-green-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">${room.price}/night</span>
                        </div>
                        
                        <div className="flex items-center">
                          {getStatusIcon(room.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                            {room.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <FiUsers className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-900">{room.capacity} guests</span>
                        </div>
                        
                        <div className="flex items-center">
                          <FiLayers className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-900">Floor {room.floor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiHome className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-lg mb-2">No rooms found</p>
                  <p className="text-sm">Add your first room to get started</p>
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
              Are you sure you want to delete this room? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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

export default RoomsPage;
