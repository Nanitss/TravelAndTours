import React, { useState, useEffect } from 'react';
import { BookingService, TourService, UserService, ActivityService, Booking, Tour, User, RecentActivity } from '../utils/firebaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminDashboard.css';

const AdminDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Starting to load dashboard data...');
      
      const [bookingsData, toursData, usersData, activitiesData] = await Promise.all([
        BookingService.getAllBookings(),
        TourService.getAllTours(),
        UserService.getAllUsers(),
        ActivityService.getRecentActivities(10)
      ]);
      
      console.log('Loaded bookings:', bookingsData);
      console.log('Loaded tours:', toursData);
      console.log('Loaded users:', usersData);
      console.log('Loaded activities:', activitiesData);
      
      // Check if bookings data is valid
      if (Array.isArray(bookingsData)) {
        console.log('Bookings is array with length:', bookingsData.length);
        setBookings(bookingsData);
      } else {
        console.error('Bookings data is not an array:', bookingsData);
        setBookings([]);
      }
      
      setTours(toursData);
      setUsers(usersData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setBookings([]);
      setTours([]);
      setUsers([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };


  // Calculate dashboard metrics
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const totalBookings = bookings.length;
  const totalTours = tours.length;
  const totalUsers = users.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const activeTours = tours.filter(t => t.isActive).length;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋';
      case 'package_created': return '📦';
      case 'package_updated': return '✏️';
      case 'user_registered': return '👤';
      default: return '📄';
    }
  };

  // Calculate monthly revenue from bookings
  const getMonthlyRevenue = () => {
    const monthlyRevenue = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.bookingDate);
      if (bookingDate.getFullYear() === currentYear) {
        const month = bookingDate.getMonth();
        monthlyRevenue[month] += booking.totalPrice;
      }
    });
    
    return monthlyRevenue;
  };

  const monthlyRevenue = getMonthlyRevenue();
  const maxRevenue = Math.max(...monthlyRevenue, 1); // Avoid division by zero

  // Export functions
  const handleExportDashboard = () => {
    const dashboardData = {
      totalRevenue,
      totalBookings,
      totalTours,
      totalUsers,
      pendingBookings,
      confirmedBookings,
      activeTours
    };
    PDFExporter.exportAnalytics(dashboardData);
  };

  const handleExportAllData = () => {
    // Export comprehensive dashboard report
    const allData = [
      { metric: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}` },
      { metric: 'Total Bookings', value: totalBookings },
      { metric: 'Total Tours', value: totalTours },
      { metric: 'Total Users', value: totalUsers },
      { metric: 'Pending Bookings', value: pendingBookings },
      { metric: 'Confirmed Bookings', value: confirmedBookings },
      { metric: 'Active Tours', value: activeTours },
      { metric: 'Conversion Rate', value: `${totalUsers > 0 ? ((totalBookings / totalUsers) * 100).toFixed(1) : 0}%` }
    ];

    PDFExporter.exportToPDF({
      title: 'Dashboard Summary Report',
      filename: `dashboard-report-${new Date().toISOString().split('T')[0]}`,
      data: allData,
      columns: [
        { header: 'Metric', dataKey: 'metric', width: 80 },
        { header: 'Value', dataKey: 'value', width: 50 }
      ]
    });
  };

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="header-controls">
            <button className="control-btn">
              <span className="btn-icon">📅</span>
              <span className="btn-text">This Month</span>
              <span className="btn-arrow">▼</span>
            </button>
            <button className="control-btn" onClick={handleExportDashboard}>
              <span className="btn-icon">📊</span>
              <span className="btn-text">Export Analytics</span>
            </button>
            <button className="control-btn" onClick={handleExportAllData}>
              <span className="btn-icon">📄</span>
              <span className="btn-text">Export Report</span>
            </button>
            <button className="control-btn" onClick={() => {
              // Trigger a custom event to change page
              window.dispatchEvent(new CustomEvent('adminPageChange', { detail: 'firebase' }));
            }}>
              <span className="btn-icon">🔥</span>
              <span className="btn-text">Firebase Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card primary">
          <div className="kpi-header">
            <div className="kpi-icon">💰</div>
            <div className="kpi-title">Total Revenue</div>
          </div>
          <div className="kpi-value">₱{totalRevenue.toLocaleString()}</div>
          <div className="kpi-subtitle">From {totalBookings} bookings</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon">📋</div>
            <div className="kpi-title">Total Bookings</div>
          </div>
          <div className="kpi-value">{totalBookings}</div>
          <div className="kpi-subtitle">{pendingBookings} pending, {confirmedBookings} confirmed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon">📦</div>
            <div className="kpi-title">Active Packages</div>
          </div>
          <div className="kpi-value">{activeTours}</div>
          <div className="kpi-subtitle">Out of {totalTours} total packages</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon">👥</div>
            <div className="kpi-title">Total Users</div>
          </div>
          <div className="kpi-value">{totalUsers}</div>
          <div className="kpi-subtitle">Registered users</div>
        </div>
      </div>

      {/* Charts and Tables Section */}
      <div className="dashboard-content">
        <div className="content-grid">
          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Revenue</h3>
              <div className="chart-controls">
                <button className="chart-btn active">12M</button>
                <button className="chart-btn">6M</button>
                <button className="chart-btn">3M</button>
                <button className="chart-btn">1M</button>
              </div>
            </div>
            <div className="chart-content">
              {loading ? (
                <div className="loading-chart">
                  <div className="loading-spinner"></div>
                  <p>Loading revenue data...</p>
                </div>
              ) : totalRevenue > 0 ? (
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {monthlyRevenue.map((revenue, index) => {
                      const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                      return (
                        <div 
                          key={index}
                          className="chart-bar" 
                          style={{height: `${height}%`}}
                          title={`₱${revenue.toLocaleString()}`}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="chart-labels">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                  </div>
                </div>
              ) : (
                <div className="no-revenue-data">
                  <div className="no-data-icon">📊</div>
                  <p>No revenue data available</p>
                  <small>Revenue will appear when bookings are made</small>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Combined Bookings and Activities */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Recent Activity</h3>
              <button className="table-btn">View All</button>
            </div>
            <div className="table-content">
              {loading ? (
                <div className="loading-bookings">
                  <div className="loading-spinner"></div>
                  <p>Loading recent activity...</p>
                </div>
              ) : (
                <div className="recent-activity-content">
                  {/* Recent Bookings Section */}
                  <div className="bookings-section">
                    <h4 className="section-title">Recent Bookings</h4>
                    {(() => {
                      console.log('Bookings length:', bookings.length);
                      console.log('Bookings data:', bookings);
                      return bookings.length > 0;
                    })() ? (
                      bookings.slice(0, 3).map((booking) => {
                        console.log('Rendering booking:', booking);
                        return (
                        <div key={booking.id} className="table-row">
                          <div className="table-cell">
                            <div className="customer-info">
                              <div className="customer-avatar">👤</div>
                              <div className="customer-details">
                                <div className="customer-name">{booking.customerName}</div>
                                <div className="customer-email">{booking.customerEmail}</div>
                              </div>
                            </div>
                          </div>
                          <div className="table-cell">{booking.tourTitle}</div>
                          <div className="table-cell">{formatDate(booking.travelDate)}</div>
                          <div className="table-cell">
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="table-cell">₱{booking.totalPrice.toLocaleString()}</div>
                        </div>
                        );
                      })
                    ) : (
                      <div className="no-bookings">
                        <div className="no-bookings-content">
                          <div className="no-bookings-icon">📋</div>
                          <h4>No Recent Bookings</h4>
                          <p>Bookings will appear here once customers make reservations.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Activities Section */}
                  <div className="activities-section">
                    <h4 className="section-title">Recent Activities</h4>
                    <div className="activities-list">
                      {loading ? (
                        <div className="loading-activities">
                          <div className="loading-spinner"></div>
                          <p>Loading activities...</p>
                        </div>
                      ) : recentActivities.length > 0 ? (
                        recentActivities.slice(0, 5).map((activity, index) => (
                          <div key={activity.id || index} className="activity-item">
                            <div className="activity-icon">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="activity-content">
                              <div className="activity-title">{activity.title}</div>
                              <div className="activity-description">{activity.description}</div>
                              <div className="activity-time">{formatDate(activity.timestamp)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activities">
                          <p>No recent activities</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;