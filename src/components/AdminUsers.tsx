import React, { useState, useEffect } from 'react';
import { User, UserService, UserRole, BookingService, Booking } from '../utils/supabaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'admin'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, allBookings] = await Promise.all([
        UserService.getAllUsers(),
        BookingService.getAllBookings()
      ]);
      setUsers(allUsers);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleText = (role: UserRole) => {
    return role === UserRole.ADMIN ? 'Admin' : 'Client';
  };

  const getRoleClass = (role: UserRole) => {
    return role === UserRole.ADMIN ? 'admin' : 'client';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || user.Username || '';
    const email = user.email || user.Email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.role === UserRole.ADMIN) ||
                       (roleFilter === 'client' && user.role === UserRole.CLIENT);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // Calculate user analytics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === UserRole.ADMIN).length;
  const clientUsers = users.filter(user => user.role === UserRole.CLIENT).length;
  
  // Calculate user growth (new users this month vs last month)
  const getMonthlyUsers = () => {
    const monthlyUsers = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    
    users.forEach(user => {
      const userDate = new Date(user.createdAt?.toDate ? user.createdAt.toDate() : new Date());
      if (userDate.getFullYear() === currentYear) {
        const month = userDate.getMonth();
        monthlyUsers[month] += 1;
      }
    });
    
    return monthlyUsers;
  };

  const monthlyUsers = getMonthlyUsers();
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentMonthUsers = monthlyUsers[currentMonth];
  const lastMonthUsers = monthlyUsers[lastMonth];
  
  // Calculate user growth percentage
  const userGrowth = lastMonthUsers > 0 
    ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
    : 0;

  // Calculate users with bookings
  const usersWithBookings = users.filter(user => 
    bookings.some(booking => booking.userId === user.id)
  ).length;
  
  // Calculate average bookings per user
  const averageBookingsPerUser = totalUsers > 0 ? bookings.length / totalUsers : 0;
  
  // Calculate conversion rate (bookings / users)
  const conversionRate = totalUsers > 0 ? (bookings.length / totalUsers) * 100 : 0;

  // Export functions
  const handleExportUsers = () => {
    PDFExporter.exportUsers(users);
  };

  const handleExportAnalytics = () => {
    const analyticsData = {
      totalUsers,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
      conversionRate,
      averageBookingValue: averageBookingsPerUser,
      userGrowth,
      bookingGrowth: 0 // You can calculate this if needed
    };
    PDFExporter.exportAnalytics(analyticsData);
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users</h1>
        <div className="header-actions">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'client' | 'admin')}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div className="export-actions">
            <button className="action-btn" onClick={handleExportUsers}>
              <span>📄</span>
              Export User Reports
            </button>
            <button className="action-btn" onClick={handleExportAnalytics}>
              <span>📊</span>
              Export Analytics Reports
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? 'Loading...' : totalUsers.toLocaleString()}
            </div>
            <div className="stat-label">Total Users</div>
            <div className={`stat-trend ${userGrowth >= 0 ? 'positive' : 'negative'}`}>
              {userGrowth >= 0 ? '↗' : '↘'} {Math.abs(userGrowth).toFixed(1)}% vs last month
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? 'Loading...' : adminUsers.toLocaleString()}
            </div>
            <div className="stat-label">Admin Users</div>
            <div className="stat-trend positive">
              {adminUsers} administrators
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? 'Loading...' : clientUsers.toLocaleString()}
            </div>
            <div className="stat-label">Client Users</div>
            <div className="stat-trend positive">
              {clientUsers} customers
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">
              {loading ? 'Loading...' : `${usersWithBookings.toLocaleString()}`}
            </div>
            <div className="stat-label">Active Users</div>
            <div className="stat-trend positive">
              {averageBookingsPerUser.toFixed(1)} avg bookings
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="users-cards-container">
        {loading ? (
          <div className="loading-users">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="users-grid">
            {filteredUsers.map((user) => {
              const userBookings = bookings.filter(booking => booking.userId === user.id);
              const totalSpent = userBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
              
              return (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div className="user-avatar-section">
                    <div className="user-avatar">👤</div>
                      <div className="user-role-section">
                        <span className={`role-badge ${getRoleClass(user.role || UserRole.CLIENT)}`}>
                          {getRoleText(user.role || UserRole.CLIENT)}
                        </span>
                      </div>
                    </div>
                    <div className="user-id-section">
                      <span className="user-id-label">User ID</span>
                      <span className="user-id">{user.id?.substring(0, 8)}...</span>
                    </div>
                  </div>
                  
                  <div className="user-card-body">
                    <div className="user-detail-section">
                      <div className="user-detail-item">
                        <span className="user-detail-label">Name</span>
                        <span className="user-name">{user.name || user.Username || 'N/A'}</span>
                      </div>
                      <div className="user-detail-item">
                        <span className="user-detail-label">Email</span>
                        <span className="user-email">{user.email || user.Email || 'N/A'}</span>
                      </div>
                      <div className="user-detail-item">
                        <span className="user-detail-label">Join Date</span>
                        <span className="join-date">October 1, 2025</span>
                      </div>
                      <div className="user-detail-item">
                        <span className="user-detail-label">Bookings</span>
                        <span className="user-bookings">{userBookings.length} bookings</span>
                      </div>
                      <div className="user-detail-item">
                        <span className="user-detail-label">Total Spent</span>
                        <span className="user-spent">₱{totalSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
        ) : (
          <div className="no-users">
            <div className="no-data-icon">👥</div>
            <h3>No Users Found</h3>
            <p>No users match your current search criteria.</p>
            <small>Try adjusting your search terms or filters</small>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
