import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiUserGroup,
  HiBuildingOffice,
  HiCalendar,
  HiArrowLeftOnRectangle,
  HiXMark,
  HiChevronDoubleRight,
  HiChevronDoubleLeft,
  HiUserCircle,
  HiCog,
  HiChevronDown,
} from "react-icons/hi2";

const Sidebar = ({ isOpen, onToggle, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: HiHome },
    { name: "Guests", path: "/guests", icon: HiUserGroup },
    { name: "Rooms", path: "/rooms", icon: HiBuildingOffice },
    { name: "Bookings", path: "/bookings", icon: HiCalendar },
  ];

  const isActivePath = (path) => location.pathname === path;
  const isThin = !isExpanded && !isOpen;

  const handleProfileClick = () => {
    navigate('/profile');
    if (window.innerWidth < 1024) onToggle?.();
    setShowProfileMenu(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    if (window.innerWidth < 1024) onToggle?.();
    setShowProfileMenu(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600';
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-red-500/20 text-red-300 border-red-400/30' 
      : 'bg-blue-500/20 text-blue-300 border-blue-400/30';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white
          fixed lg:relative h-full z-40 flex flex-col
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-all duration-300 ease-in-out
          shadow-2xl lg:shadow-xl border-r border-gray-700/50
          ${isOpen ? "w-72" : isExpanded ? "lg:w-72" : "lg:w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/30">
          {isThin && (
            <button
              onClick={() => setIsExpanded(true)}
              className="hidden lg:flex p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 group"
            >
              <HiChevronDoubleRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          )}

          {(isOpen || isExpanded) && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="relative">
                
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur-sm opacity-30 -z-10"></div>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="StayTrack Logo"
                  className="w-10 h-10 object-contain"
                />
                <h2 className="text-1xl font-bold text-white tracking-wide">
                  StayTrack
                </h2>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-1">
            {!isThin && (
              <button
                onClick={() => setIsExpanded(false)}
                className="hidden lg:flex p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 group"
              >
                <HiChevronDoubleLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            )}

            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
            >
              <HiXMark className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 mt-2 space-y-1">
          {menuItems.map(({ name, path, icon: Icon }) => {
            const isActive = isActivePath(path);
            return (
              <Link
                key={name}
                to={path}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle?.();
                }}
                className={`
                  flex items-center ${
                    isExpanded || isOpen ? "justify-start" : "justify-center"
                  }
                  ${isThin ? "px-3 py-4" : "px-4 py-4"}
                  rounded-xl transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg scale-[0.98] border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-[0.98] hover:shadow-lg border border-transparent"
                  }
                  before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-blue-500 before:to-purple-600 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-5
                `}
              >
                <div className="relative">
                  <Icon
                    className={`
                      ${isThin ? "w-5 h-5" : "w-5 h-5"}
                      transition-colors duration-200
                      ${
                        isActive
                          ? "text-white drop-shadow-sm"
                          : "text-gray-400 group-hover:text-white"
                      }
                    `}
                  />
                  {isActive && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {(isExpanded || isOpen) && (
                  <span className="ml-4 font-medium text-sm tracking-wide transition-all duration-200">
                    {name}
                  </span>
                )}
                
                {isThin && (
                  <span className="absolute left-full ml-3 w-max px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-gray-600 z-50">
                    {name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-transparent"></div>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-700/50 mt-auto space-y-2 bg-gradient-to-t from-gray-800/50 to-transparent">
          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`
                flex items-center ${
                  isExpanded || isOpen ? "justify-start" : "justify-center"
                }
                w-full ${isThin ? "px-3 py-4" : "px-4 py-4"}
                rounded-xl transition-all duration-200 group
                bg-gradient-to-r from-gray-800/30 to-gray-700/30
                hover:from-gray-700/50 hover:to-gray-600/50
                border border-gray-600/30 hover:border-gray-500/50
                hover:scale-[0.98] hover:shadow-lg
              `}
            >
              {/* User Avatar */}
              <div className="relative">
                {user ? (
                  <div className={`w-8 h-8 rounded-xl ${getRoleColor(user.role)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                ) : (
                  <HiUserCircle className={`${isThin ? "w-8 h-8" : "w-8 h-8"} text-gray-400`} />
                )}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getRoleColor(user?.role)}`}></div>
              </div>

              {(isExpanded || isOpen) && (
                <div className="ml-3 text-left flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </div>
                  <div className="text-xs text-gray-400 capitalize truncate flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                    {user?.role || 'Loading...'}
                  </div>
                </div>
              )}

              {(isExpanded || isOpen) && (
                <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              )}

              {isThin && (
                <span className="absolute left-full ml-3 w-max px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-gray-600 z-50">
                  Profile
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-transparent"></div>
                </span>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {(isExpanded || isOpen) && showProfileMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-600/50 rounded-xl shadow-2xl z-50 backdrop-blur-sm animate-fadeIn">
                <div className="p-4 border-b border-gray-600/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {user?.email || ''}
                      </div>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-lg border ${getRoleBadgeColor(user?.role)}`}>
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                  >
                    <HiUserCircle className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    My Profile
                  </button>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-3 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                  >
                    <HiCog className="w-4 h-4 mr-3 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`
              flex items-center ${
                isExpanded || isOpen ? "justify-start" : "justify-center"
              }
              w-full ${isThin ? "px-3 py-4" : "px-4 py-4"}
              rounded-xl transition-all duration-200 group
              bg-gradient-to-r from-red-500/10 to-red-600/10
              hover:from-red-500/20 hover:to-red-600/20
              border border-red-500/20 hover:border-red-400/30
              text-red-400 hover:text-red-300
              hover:scale-[0.98] hover:shadow-lg
            `}
          >
            <div className="relative">
              <HiArrowLeftOnRectangle
                className={`${
                  isThin ? "w-5 h-5" : "w-5 h-5"
                } transition-transform duration-200 group-hover:scale-110`}
              />
            </div>
            
            {(isExpanded || isOpen) && (
              <span className="ml-4 font-medium text-sm tracking-wide">Logout</span>
            )}
            
            {isThin && (
              <span className="absolute left-full ml-3 w-max px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-gray-600 z-50">
                Logout
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-transparent"></div>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-30 lg:z-30"
          onClick={() => setShowProfileMenu(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;