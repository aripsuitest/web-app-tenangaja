'use client';
import { useState, useEffect } from 'react';

import Swal from 'sweetalert2';

export default function UserNavMenu({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for unread notifications periodically
  useEffect(() => {
    if (!user) return;

    const checkUnreadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count', {
          credentials: 'include'
        });
        if (response.ok) {
          const { unreadCount } = await response.json();
          setUnreadCount(unreadCount);
        }
      } catch (err) {
        console.error('Error checking unread notifications:', err);
      }
    };

    // Initial check
    checkUnreadNotifications();

    // Check every 1 minute
    const interval = setInterval(checkUnreadNotifications, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Fetch full notifications when dropdown is opened
  useEffect(() => {
    if (showNotifications && user) {
      fetchNotifications();
    }
  }, [showNotifications, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      // Update unread count after fetching
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      setError(err.message);
      console.error('Notification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to mark as read');
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };

  // Format time difference (e.g., "2 hours ago")
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = ()=>{
    Swal.fire({
      title: "Processing...",
      text: "Please wait while we complete your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    location.href = '/api/auth/logout';
  }

  return (
    <>
      {user ? (
        <div className="order-1 ml-auto flex items-center space-x-5 relative">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="text-xl relative"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-0 mt-6 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto z-50">
                <div className="p-3 border-b flex justify-between items-center">
                  <h5 className="font-semibold text-gray-700">Notifications</h5>
                  {unreadCount > 0 && (
                    <button 
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => {
                        notifications.forEach(n => !n.read && markAsRead(n.id));
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {notification.worker?.user?.profile_pic ? (
                            <img 
                              src={notification.worker.user.profile_pic} 
                              alt={notification.worker.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-user text-gray-400"></i>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <button 
            className="text-xl"
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <i className="fas fa-bars"></i>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-0 mt-6 bg-white shadow-lg rounded-lg w-64 z-50">
              <div className="p-2">
                {user.role === 'admin' ? (
                  <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100" href="/admin">
                    Dashboard Admin
                  </a>
                ) : (
                <>
                  <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100" href="/user">
                    Dashboard User
                  </a>
                  <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100" href="/worker">
                    Dashboard Worker
                  </a>
                </>
                )}
                <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100" href="/profile">
                  User Profile
                </a>
                <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100" href="#" onClick={handleLogout}>
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="order-1 ml-auto flex items-center space-x-5">
          <a className="btn btn-sm bg-blue-600 text-white rounded-full" href="/auth/login">
            Login
          </a>
          <a className="text-gray-700 hover:text-blue-600" href="/auth/register">
            Sign Up
          </a>
        </div>
      )}
    </>
  );
}