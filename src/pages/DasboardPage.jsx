import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  FiActivity, 
  FiUsers, 
  FiHome, 
  FiCalendar, 
  FiTrendingUp, 
  FiPieChart,
  FiClock,
  FiRefreshCw,
  FiUser,
  FiEye,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

// Configuration
const API_BASE_URL = 'http://localhost:5000';

// Register ChartJS components
ChartJS.register(...registerables);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomDistribution, setRoomDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      // Fetch basic stats
      const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data);

      // Fetch recent bookings
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings?limit=5&page=1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentBookings(bookingsResponse.data.bookings || []);

      // Fetch room distribution
      const roomsResponse = await axios.get(`${API_BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      calculateRoomDistribution(roomsResponse.data);

    } catch (err) {
      console.error('Dashboard error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
        } else if (err.response.status === 403) {
          setError('Access denied. You do not have permission to view dashboard data.');
        } else {
          setError(err.response?.data?.error || `Error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const calculateRoomDistribution = (rooms) => {
    const distribution = {};
    rooms.forEach(room => {
      if (!distribution[room.type]) {
        distribution[room.type] = 0;
      }
      distribution[room.type]++;
    });

    const roomDistributionData = Object.keys(distribution).map(type => ({
      type,
      count: distribution[type]
    }));
    setRoomDistribution(roomDistributionData);
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  // Prepare chart data for room distribution
  const prepareRoomTypeData = () => {
    if (!roomDistribution.length) return null;

    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(249, 115, 22, 0.8)',   // Orange
    ];

    return {
      labels: roomDistribution.map(room => room.type),
      datasets: [
        {
          data: roomDistribution.map(room => room.count),
          backgroundColor: colors.slice(0, roomDistribution.length),
          borderColor: colors.slice(0, roomDistribution.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  };

  // Get icon and color for each stat
  const getStatConfig = (key) => {
    const configs = {
      totalGuests: { 
        icon: <FiUsers size={24} />, 
        color: 'bg-blue-500', 
        bgColor: 'bg-blue-50',
        trend: '+12%',
        label: 'Total Guests'
      },
      totalRooms: { 
        icon: <FiHome size={24} />, 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50',
        trend: '0%',
        label: 'Total Rooms'
      },
      occupiedRooms: { 
        icon: <FiEye size={24} />, 
        color: 'bg-yellow-500', 
        bgColor: 'bg-yellow-50',
        trend: '+5%',
        label: 'Occupied Rooms'
      },
      availableRooms: { 
        icon: <FiCheckCircle size={24} />, 
        color: 'bg-purple-500', 
        bgColor: 'bg-purple-50',
        trend: '-5%',
        label: 'Available Rooms'
      },
      occupancyRate: { 
        icon: <FiTrendingUp size={24} />, 
        color: 'bg-red-500', 
        bgColor: 'bg-red-50',
        trend: '+3%',
        label: 'Occupancy Rate'
      },
      currentBookings: { 
        icon: <FiCalendar size={24} />, 
        color: 'bg-indigo-500', 
        bgColor: 'bg-indigo-50',
        trend: '+8%',
        label: 'Current Bookings'
      },
      todayCheckIns: { 
        icon: <FiUser size={24} />, 
        color: 'bg-pink-500', 
        bgColor: 'bg-pink-50',
        trend: '+15%',
        label: 'Today Check-ins'
      },
      todayCheckOuts: { 
        icon: <FiXCircle size={24} />, 
        color: 'bg-orange-500', 
        bgColor: 'bg-orange-50',
        trend: '+10%',
        label: 'Today Check-outs'
      },
    };
    return configs[key] || { 
      icon: <FiActivity size={24} />, 
      color: 'bg-gray-500', 
      bgColor: 'bg-gray-50',
      trend: '0%',
      label: key
    };
  };

  const formatStatValue = (key, value) => {
    if (key.includes('Rate')) return `${value}%`;
    if (key.includes('Revenue')) return `$${value?.toLocaleString() || '0'}`;
    if (key.includes('Duration')) return `${value} days`;
    return value?.toLocaleString() || '0';
  };

  // Get status badge color based on server status values
  const getStatusBadge = (status) => {
    const statusConfig = {
      'booked': 'bg-yellow-100 text-yellow-800',
      'checked-in': 'bg-green-100 text-green-800',
      'checked-out': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-4xl mx-auto mt-8">
          <h3 className="font-semibold mb-2">Dashboard Error</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={refreshData} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
            {error.includes('login') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="flex-1 min-w-0 transition-all duration-300">
        {/* Main Content Container */}
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <FiClock className="mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors hover:shadow-md"
              >
                <FiRefreshCw className="mr-2" size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats && Object.entries(stats)
              .filter(([key]) => key !== 'bookingTrends' && key !== 'roomTypeDistribution' && key !== 'recentBookings')
              .map(([key, value]) => {
                const config = getStatConfig(key);
                return (
                  <div
                    key={key}
                    className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-100"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${config.bgColor}`}>
                        <div className={`text-white ${config.color} p-1.5 sm:p-2 rounded-lg`}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {config.trend}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                        {config.label}
                      </p>
                      <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        {formatStatValue(key, value)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Charts and Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            
            {/* Room Distribution Chart */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg mr-3">
                    <FiPieChart className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Room Distribution</h2>
                    <p className="text-xs sm:text-sm text-gray-500">By room type</p>
                  </div>
                </div>
              </div>
              
              {roomDistribution.length > 0 ? (
                <div className="relative">
                  <div className="h-48 sm:h-64 md:h-72">
                    <Pie 
                      data={prepareRoomTypeData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: 'circle',
                              font: {
                                size: window.innerWidth < 640 ? 10 : 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                  
                  {/* Summary below chart */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Rooms</p>
                        <p className="text-xl font-bold text-gray-800">
                          {roomDistribution.reduce((sum, room) => sum + room.count, 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Types</p>
                        <p className="text-xl font-bold text-gray-800">{roomDistribution.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 sm:h-64 md:h-72 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiPieChart className="mx-auto mb-2" size={48} />
                    <p className="text-sm">No room distribution data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-lg mr-3">
                      <FiActivity className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Bookings</h2>
                      <p className="text-xs sm:text-sm text-gray-500">Latest booking activity</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/bookings'}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View All →
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in/out</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.length > 0 ? (
                        recentBookings.map(booking => (
                          <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FiUser className="text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.guest?.firstName} {booking.guest?.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {booking.guest?.email || booking.guest?.phone || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                Room #{booking.room?.room_number}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {booking.room?.type || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div>{formatDate(booking.checkIn)}</div>
                                <div className="text-gray-500">{formatDate(booking.checkOut)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${booking.totalPrice?.toLocaleString() || '0'}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                            <div className="flex flex-col items-center">
                              <FiCalendar className="text-4xl text-gray-400 mb-2" />
                              <p>No recent bookings found</p>
                              <p className="text-xs">Bookings will appear here once created</p>
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
                {recentBookings.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {recentBookings.map(booking => (
                      <div key={booking._id} className="p-4 hover:bg-gray-50 transition-colors">
                        
                        {/* Guest Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiUser className="text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.guest?.firstName} {booking.guest?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.guest?.email || booking.guest?.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        {/* Booking Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Room</div>
                            <div className="font-medium">#{booking.room?.room_number}</div>
                            <div className="text-gray-500 capitalize text-xs">{booking.room?.type || 'N/A'}</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-500">Total Price</div>
                            <div className="font-semibold text-green-600">
                              ${booking.totalPrice?.toLocaleString() || '0'}
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="text-gray-500">Dates</div>
                            <div className="font-medium">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FiCalendar className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-lg mb-2">No recent bookings found</p>
                    <p className="text-sm">Bookings will appear here once created</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;