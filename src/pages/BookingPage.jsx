import React, { useState, useEffect } from "react";
import { 
  Plus, 
  X, 
  Calendar, 
  User, 
  Home, 
  DollarSign, 
  Eye, 
  Edit2, 
  Trash2, 
  Check, 
  Clock,
  Users,
  Baby,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [formData, setFormData] = useState({
    room: "",
    guest: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    specialRequests: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [newSpecialRequest, setNewSpecialRequest] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      params.append('page', currentPage);
      params.append('limit', '10');

      const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/guests?limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!bookingsRes.ok) throw new Error(`Failed to fetch bookings: ${bookingsRes.status}`);
      if (!roomsRes.ok) throw new Error(`Failed to fetch rooms: ${roomsRes.status}`);
      if (!guestsRes.ok) throw new Error(`Failed to fetch guests: ${guestsRes.status}`);

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();
      const guestsData = await guestsRes.json();

      setBookings(bookingsData.bookings || []);
      setTotalPages(bookingsData.totalPages || 1);
      setRooms(roomsData);
      setGuests(guestsData.guests || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load data");
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async (checkIn, checkOut, excludeRoomId = null) => {
    try {
      if (!checkIn || !checkOut) return;
      if (new Date(checkOut) <= new Date(checkIn)) return;

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch available rooms');
      
      const data = await response.json();
      let filteredRooms = data;
      
      if (excludeRoomId) {
        const currentRoom = rooms.find(r => r._id === excludeRoomId);
        if (currentRoom) {
          filteredRooms = [currentRoom, ...data.filter(room => room._id !== excludeRoomId)];
        }
      }
      
      setAvailableRooms(filteredRooms);
    } catch (err) {
      setError(err.message || "Failed to check availability");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.guest) errors.guest = "Guest is required";
    if (!formData.room) errors.room = "Room is required";
    if (!formData.checkIn) errors.checkIn = "Check-in date is required";
    if (!formData.checkOut) errors.checkOut = "Check-out date is required";
    if (formData.checkIn && formData.checkOut && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      errors.checkOut = "Check-out must be after check-in";
    }
    if (!formData.adults || formData.adults < 1) errors.adults = "At least 1 adult is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const url = isEditing 
        ? `${API_BASE_URL}/bookings/${selectedBooking._id}`
        : `${API_BASE_URL}/bookings`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          adults: parseInt(formData.adults),
          children: parseInt(formData.children),
          specialRequests: formData.specialRequests
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save booking');
      }

      await fetchData();
      resetForm();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSpecialRequest = () => {
    if (newSpecialRequest.trim()) {
      setFormData(prev => ({
        ...prev,
        specialRequests: [...prev.specialRequests, newSpecialRequest.trim()]
      }));
      setNewSpecialRequest("");
    }
  };

  const handleRemoveSpecialRequest = (index) => {
    const updatedRequests = [...formData.specialRequests];
    updatedRequests.splice(index, 1);
    setFormData(prev => ({ ...prev, specialRequests: updatedRequests }));
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsEditing(true);
    setShowForm(true);
    setFormData({
      room: booking.room._id,
      guest: booking.guest._id,
      checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
      checkOut: new Date(booking.checkOut).toISOString().split('T')[0],
      adults: booking.adults,
      children: booking.children || 0,
      specialRequests: booking.specialRequests || []
    });
    
    fetchAvailableRooms(booking.checkIn, booking.checkOut, booking.room._id);
  };

  const confirmDeleteBooking = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      await fetchData();
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }

      await fetchData();
      setShowBookingDetails(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check out');
      }

      await fetchData();
      setShowBookingDetails(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      await fetchData();
      setShowBookingDetails(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedBooking(null);
    setFormData({
      room: "",
      guest: "",
      checkIn: "",
      checkOut: "",
      adults: 1,
      children: 0,
      specialRequests: []
    });
    setAvailableRooms([]);
    setValidationErrors({});
    setNewSpecialRequest("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusActions = (booking) => {
    const actions = [];
    
    switch (booking.status) {
      case 'booked':
        actions.push(
          <button
            key="checkin"
            onClick={() => handleCheckIn(booking._id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            <Check className="mr-1" size={14} />
            Check In
          </button>
        );
        break;
      case 'checked-in':
        actions.push(
          <button
            key="checkout"
            onClick={() => handleCheckOut(booking._id)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <CheckCircle className="mr-1" size={14} />
            Check Out
          </button>
        );
        break;
    }
    
    return actions;
  };

  const BookingCard = ({ booking }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {booking.guest?.firstName} {booking.guest?.lastName}
          </p>
          <p className="text-sm text-gray-500 font-mono">
            #{booking._id?.slice(-6) || 'N/A'}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status?.replace('-', ' ') || 'Unknown'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Home className="mr-2 flex-shrink-0" size={16} />
          <span>Room #{booking.room?.room_number} - {booking.room?.type}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="mr-2 flex-shrink-0" size={16} />
          <span>
            {new Date(booking.checkIn).toLocaleDateString()} - {" "}
            {new Date(booking.checkOut).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="mr-2 flex-shrink-0" size={16} />
          <span className="font-medium">${booking.totalPrice || '0'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-2 flex-shrink-0" size={16} />
          <span>{booking.adults} adults</span>
          {booking.children > 0 && (
            <span className="ml-2 flex items-center">
              <Baby className="mr-1" size={14} />
              {booking.children}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {getStatusActions(booking)}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowBookingDetails(true);
            }}
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Eye className="mr-2" size={16} />
            View
          </button>
          <button
            onClick={() => handleEditBooking(booking)}
            className="px-3 py-2 border border-blue-300 text-blue-700 text-sm rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <Edit2 className="mr-2" size={16} />
            Edit
          </button>
        </div>
        {booking.status !== 'checked-in' && booking.status !== 'checked-out' && (
          <button
            onClick={() => confirmDeleteBooking(booking)}
            className="w-full px-3 py-2 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <Trash2 className="mr-2" size={16} />
            Delete
          </button>
        )}
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this booking? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setBookingToDelete(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBooking}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const BookingDetailsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Booking Details</h3>
          <button
            onClick={() => setShowBookingDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        {selectedBooking && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Booking ID</label>
              <p className="font-mono text-sm">#{selectedBooking._id?.slice(-6) || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Guest</label>
              <p>{selectedBooking.guest?.firstName} {selectedBooking.guest?.lastName}</p>
              <p className="text-sm text-gray-500">{selectedBooking.guest?.email}</p>
              <p className="text-sm text-gray-500">{selectedBooking.guest?.phone}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Room</label>
              <p>Room #{selectedBooking.room?.room_number} - {selectedBooking.room?.type}</p>
              <p className="text-sm text-gray-500">${selectedBooking.room?.price}/night</p>
              <p className="text-sm text-gray-500">Capacity: {selectedBooking.room?.capacity} people</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Check-in</label>
                <p className="text-sm">
                  {new Date(selectedBooking.checkIn).toLocaleDateString()}
                </p>
                {selectedBooking.actualCheckIn && (
                  <p className="text-xs text-green-600">
                    Actual: {new Date(selectedBooking.actualCheckIn).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Check-out</label>
                <p className="text-sm">
                  {new Date(selectedBooking.checkOut).toLocaleDateString()}
                </p>
                {selectedBooking.actualCheckOut && (
                  <p className="text-xs text-green-600">
                    Actual: {new Date(selectedBooking.actualCheckOut).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Adults</label>
                <p>{selectedBooking.adults}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Children</label>
                <p>{selectedBooking.children || 0}</p>
              </div>
            </div>
            
            {selectedBooking.specialRequests?.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Special Requests</label>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedBooking.specialRequests.map((request, index) => (
                    <li key={index}>{request}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status?.replace('-', ' ') || 'Unknown'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Payment</label>
              <p className="text-lg font-semibold">${selectedBooking.totalPrice || '0'}</p>
              <p className="text-sm text-gray-500">
                Status: <span className="capitalize">{selectedBooking.paymentStatus || 'pending'}</span>
              </p>
              {selectedBooking.paidAmount > 0 && (
                <p className="text-sm text-gray-500">
                  Paid: ${selectedBooking.paidAmount}
                </p>
              )}
            </div>

            <div className="pt-4 space-y-2">
              {selectedBooking.status === "booked" && (
                <>
                  <button
                    onClick={() => handleCheckIn(selectedBooking._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Check className="mr-2" size={16} />
                    Check In
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking._id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="mr-2" size={16} />
                    Cancel Booking
                  </button>
                </>
              )}
              {selectedBooking.status === "checked-in" && (
                <button
                  onClick={() => handleCheckOut(selectedBooking._id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="mr-2" size={16} />
                  Check Out
                </button>
              )}
              <button
                onClick={() => {
                  setShowBookingDetails(false);
                  handleEditBooking(selectedBooking);
                }}
                className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Edit2 className="mr-2" size={16} />
                Edit Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Bookings Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Create, view, update, and manage hotel bookings
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setValidationErrors({});
                if (showForm) {
                  resetForm();
                }
              }}
              className={`flex items-center justify-center px-4 py-2 sm:py-2.5 rounded text-white transition-colors font-medium text-sm sm:text-base ${
                showForm
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {showForm ? (
                <>
                  <X className="mr-2" size={16} /> Cancel
                </>
              ) : (
                <>
                  <Plus className="mr-2" size={16} /> New Booking
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                {error}
              </div>
            </div>
          )}

          {/* Filters */}
          {!showForm && (
            <div className="bg-white rounded shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="booked">Booked</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          {showForm && (
            <div className="bg-white rounded shadow-md p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 text-center">
                {isEditing ? "Edit Booking" : "Create New Booking"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Guest Selection */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                      <select
                        name="guest"
                        value={formData.guest}
                        onChange={handleInputChange}
                        className={`pl-10 w-full p-2.5 border ${
                          validationErrors.guest
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-sm`}
                        required
                      >
                        <option value="">Select Guest</option>
                        {guests.map((guest) => (
                          <option key={guest._id} value={guest._id}>
                            {guest.firstName} {guest.lastName} ({guest.email})
                          </option>
                        ))}
                      </select>
                      {validationErrors.guest && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.guest}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                      <input
                        name="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (formData.checkOut)
                            fetchAvailableRooms(
                              e.target.value,
                              formData.checkOut,
                              isEditing ? formData.room : null
                            );
                        }}
                        className={`pl-10 w-full p-2.5 border ${
                          validationErrors.checkIn
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:ring-blue-500 focus:border-blue-500 text-sm`}
                        required
                      />
                      {validationErrors.checkIn && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.checkIn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                      <input
                        name="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (formData.checkIn)
                            fetchAvailableRooms(
                              formData.checkIn,
                              e.target.value,
                              isEditing ? formData.room : null
                            );
                        }}
                        className={`pl-10 w-full p-2.5 border ${
                          validationErrors.checkOut
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:ring-blue-500 focus:border-blue-500 text-sm`}
                        required
                      />
                      {validationErrors.checkOut && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.checkOut}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Room Selection */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    {availableRooms.length > 0 || (isEditing && formData.room) ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Rooms *
                        </label>
                        <div className="relative">
                          <Home className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                          <select
                            name="room"
                            value={formData.room}
                            onChange={handleInputChange}
                            className={`pl-10 w-full p-2.5 border ${
                              validationErrors.room
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded focus:ring-blue-500 focus:border-blue-500 bg-white text-sm`}
                            required
                          >
                            <option value="">Select Room</option>
                            {availableRooms.map((room) => (
                              <option key={room._id} value={room._id}>
                                Room #{room.room_number} - {room.type} ($
                                {room.price}/night) - Capacity: {room.capacity}
                              </option>
                            ))}
                          </select>
                          {validationErrors.room && (
                            <p className="mt-1 text-sm text-red-600">
                              {validationErrors.room}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              {formData.checkIn && formData.checkOut
                                ? "No available rooms for selected dates"
                                : "Select check-in and check-out dates to see available rooms"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Adults and Children */}
                  <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                        <input
                          name="adults"
                          type="number"
                          min="1"
                          max="10"
                          value={formData.adults}
                          onChange={handleInputChange}
                          className={`pl-10 w-full p-2.5 border ${
                            validationErrors.adults
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded focus:ring-blue-500 focus:border-blue-500 text-sm`}
                          required
                        />
                        {validationErrors.adults && (
                          <p className="mt-1 text-sm text-red-600">
                            {validationErrors.adults}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children
                      </label>
                      <div className="relative">
                        <Baby className="absolute left-3 top-3 text-gray-400 z-10" size={16} />
                        <input
                          name="children"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.children}
                          onChange={handleInputChange}
                          className="pl-10 w-full p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecialRequest}
                        onChange={(e) => setNewSpecialRequest(e.target.value)}
                        placeholder="Add special request"
                        className="flex-1 p-2.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSpecialRequest();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialRequest}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                    {formData.specialRequests.length > 0 && (
                      <div className="border border-gray-200 rounded p-3">
                        <div className="space-y-2">
                          {formData.specialRequests.map((request, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                              <span className="text-sm">{request}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSpecialRequest(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-w-[200px] px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    disabled={!formData.room}
                  >
                    {isEditing ? "Update Booking" : "Create Booking"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bookings Display */}
          <div className="bg-white rounded shadow-md overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {bookings.length > 0 ? (
                <div className="p-4 space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings found</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-mono">
                            #{booking._id?.slice(-6) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">
                            {booking.guest?.firstName} {booking.guest?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.guest?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">
                            Room #{booking.room?.room_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.room?.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span>
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-400">to</span>
                            <span>
                              {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center">
                              <Users className="mr-1" size={12} />
                              {booking.adults}
                            </span>
                            {booking.children > 0 && (
                              <span className="flex items-center">
                                <Baby className="mr-1" size={12} />
                                {booking.children}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status?.replace('-', ' ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${booking.totalPrice || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingDetails(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditBooking(booking)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit Booking"
                            >
                              <Edit2 size={16} />
                            </button>
                            {booking.status !== 'checked-in' && booking.status !== 'checked-out' && (
                              <button
                                onClick={() => confirmDeleteBooking(booking)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete Booking"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            {booking.status === "booked" && (
                              <button
                                onClick={() => handleCheckIn(booking._id)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Check In"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {booking.status === "checked-in" && (
                              <button
                                onClick={() => handleCheckOut(booking._id)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Check Out"
                              >
                                <Clock size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingDetails && <BookingDetailsModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default BookingsPage;  