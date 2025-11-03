import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  FiActivity, 
  FiUsers, 
  FiHome, 
  FiDollarSign, 
  FiCalendar, 
  FiTrendingUp, 
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiRefreshCw,
  FiUser,
  FiEye,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

// Configuration
const API_BASE_URL = 'https://hotel-management-backend-4hff.onrender.com';

// Register ChartJS components
ChartJS.register(...registerables);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [roomDistribution, setRoomDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
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
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
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
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ];

    return {
      labels: roomDistribution.map(room => room.type),
      datasets: [
        {
          data: roomDistribution.map(room => room.count),
          backgroundColor: colors.slice(0, roomDistribution.length),
          borderColor: colors.slice(0, roomDistribution.length).map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  };

  // Prepare booking trends data (mock data for now)
  const prepareBookingTrendsData = () => {
    // This would normally come from your API
    // For now, we'll create mock data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockData = days.map(() => Math.floor(Math.random() * 10) + 1);
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Bookings',
          data: mockData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
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
        trend: '+12%'
      },
      totalRooms: { 
        icon: <FiHome size={24} />, 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50',
        trend: '0%'
      },
      occupiedRooms: { 
        icon: <FiEye size={24} />, 
        color: 'bg-yellow-500', 
        bgColor: 'bg-yellow-50',
        trend: '+5%'
      },
      availableRooms: { 
        icon: <FiCheckCircle size={24} />, 
        color: 'bg-purple-500', 
        bgColor: 'bg-purple-50',
        trend: '-5%'
      },
      occupancyRate: { 
        icon: <FiTrendingUp size={24} />, 
        color: 'bg-red-500', 
        bgColor: 'bg-red-50',
        trend: '+3%'
      },
      currentBookings: { 
        icon: <FiCalendar size={24} />, 
        color: 'bg-indigo-500', 
        bgColor: 'bg-indigo-50',
        trend: '+8%'
      },
      todayCheckIns: { 
        icon: <FiUser size={24} />, 
        color: 'bg-pink-500', 
        bgColor: 'bg-pink-50',
        trend: '+15%'
      },
      todayCheckOuts: { 
        icon: <FiXCircle size={24} />, 
        color: 'bg-orange-500', 
        bgColor: 'bg-orange-50',
        trend: '+10%'
      },
    };
    return configs[key] || { 
      icon: <FiActivity size={24} />, 
      color: 'bg-gray-500', 
      bgColor: 'bg-gray-50',
      trend: '0%'
    };
  };

  const formatStatValue = (key, value) => {
    if (key.includes('Rate')) return `${value}%`;
    if (key.includes('Revenue')) return `$${value?.toLocaleString() || '0'}`;
    if (key.includes('Duration')) return `${value} days`;
    return value?.toLocaleString() || '0';
  };

  // Get status badge color
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
        <h3 className="font-semibold mb-2">Dashboard Error</h3>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
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
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
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
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200"
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
                      <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                      <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        {formatStatValue(key, value)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
            
            {/* Booking Trends Chart */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <FiBarChart2 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Booking Trends</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Weekly booking activity</p>
                  </div>
                </div>
              </div>
              
              <div className="h-48 sm:h-64 lg:h-80">
                <Bar 
                  data={prepareBookingTrendsData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          borderDash: [2, 2]
                        },
                        ticks: {
                          precision: 0,
                          font: {
                            size: window.innerWidth < 640 ? 10 : 12
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Room Type Distribution Chart */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
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
                <div className="h-48 sm:h-64 lg:h-80">
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
                        }
                      }
                    }} 
                  />
                </div>
              ) : (
                <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FiPieChart className="mx-auto mb-2" size={48} />
                    <p className="text-sm">No room distribution data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
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
                                  {booking.guest?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Room #{booking.room?.room_number}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {booking.room?.type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                              <div className="text-gray-500">{new Date(booking.checkOut).toLocaleDateString()}</div>
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
                              {booking.guest?.email}
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
                          <div className="text-gray-500 capitalize text-xs">{booking.room?.type}</div>
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
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
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
  );
};

export default DashboardPage;
