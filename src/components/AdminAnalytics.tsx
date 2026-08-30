import React, { useState, useEffect } from 'react';
import { BookingService, TourService, UserService, Booking, Tour, User } from '../utils/firebaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminAnalytics.css';

const AdminAnalytics: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [bookingsData, toursData, usersData] = await Promise.all([
        BookingService.getAllBookings(),
        TourService.getAllTours(),
        UserService.getAllUsers()
      ]);
      
      setBookings(bookingsData);
      setTours(toursData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics metrics
  const totalBookings = bookings.length;
  const totalUsers = users.length;
  const totalTours = tours.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  
  // Debug log to ensure tours data is loaded
  console.log('Tours loaded:', tours.length, 'tours available');
  
  // Calculate conversion rate (bookings / users)
  const conversionRate = totalUsers > 0 ? (totalBookings / totalUsers) * 100 : 0;
  
  // Calculate average booking value
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  // Calculate booking growth (compare current month vs last month)
  const getMonthlyBookings = () => {
    const monthlyBookings = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.bookingDate);
      if (bookingDate.getFullYear() === currentYear) {
        const month = bookingDate.getMonth();
        monthlyBookings[month] += 1;
      }
    });
    
    return monthlyBookings;
  };

  const monthlyBookings = getMonthlyBookings();
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentMonthBookings = monthlyBookings[currentMonth];
  const lastMonthBookings = monthlyBookings[lastMonth];
  
  // Calculate booking growth percentage
  const bookingGrowth = lastMonthBookings > 0 
    ? ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
    : 0;

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
  const currentMonthUsers = monthlyUsers[currentMonth];
  const lastMonthUsers = monthlyUsers[lastMonth];
  
  // Calculate user growth percentage
  const userGrowth = lastMonthUsers > 0 
    ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
    : 0;

  // Get most popular destinations
  const getPopularDestinations = () => {
    const destinationCount = new Map<string, number>();
    
    bookings.forEach(booking => {
      const tour = tours.find(t => t.id === booking.tourId);
      if (tour) {
        const count = destinationCount.get(tour.destination) || 0;
        destinationCount.set(tour.destination, count + 1);
      }
    });
    
    return Array.from(destinationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const popularDestinations = getPopularDestinations();

  // Export functions
  const handleExportAnalytics = () => {
    // Calculate package booking statistics
    const packageBookings = tours.map(tour => {
      const tourBookings = bookings.filter(booking => booking.tourId === tour.id);
      const bookingCount = tourBookings.length;
      const totalRevenue = tourBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      return {
        packageName: tour.title,
        bookingCount,
        totalRevenue,
        averageRevenue: bookingCount > 0 ? totalRevenue / bookingCount : 0
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);

    console.log('Package bookings data:', packageBookings); // Debug log

    const analyticsData = {
      totalUsers,
      totalBookings,
      totalRevenue,
      conversionRate,
      averageBookingValue,
      userGrowth,
      bookingGrowth,
      packageBookings
    };
    
    console.log('Analytics data being exported:', analyticsData); // Debug log
    PDFExporter.exportAnalytics(analyticsData);
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <div className="header-actions">
          <button className="action-btn">
            <span>📅</span>
            Last 30 Days
            <span>▼</span>
          </button>
          <div className="export-actions">
            <button className="action-btn" onClick={handleExportAnalytics}>
              <span>📄</span>
              Export Analytics Reports
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Total Users</h3>
            <div className="card-icon">👥</div>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {loading ? 'Loading...' : totalUsers.toLocaleString()}
            </div>
            <div className="metric-label">Registered Users</div>
            <div className={`metric-trend ${userGrowth >= 0 ? 'positive' : 'negative'}`}>
              {userGrowth >= 0 ? '↗' : '↘'} {Math.abs(userGrowth).toFixed(1)}% vs last month
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Conversion Rate</h3>
            <div className="card-icon">📊</div>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {loading ? 'Loading...' : `${conversionRate.toFixed(1)}%`}
            </div>
            <div className="metric-label">Booking Conversion</div>
            <div className="metric-trend positive">
              {totalBookings} bookings / {totalUsers} users
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Average Booking</h3>
            <div className="card-icon">💰</div>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {loading ? 'Loading...' : `₱${averageBookingValue.toFixed(0)}`}
            </div>
            <div className="metric-label">Average Value</div>
            <div className="metric-trend positive">
              {totalBookings} total bookings
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Booking Growth</h3>
            <div className="card-icon">📈</div>
          </div>
          <div className="card-content">
            <div className="metric-value">
              {loading ? 'Loading...' : `${bookingGrowth.toFixed(1)}%`}
            </div>
            <div className="metric-label">Monthly Growth</div>
            <div className={`metric-trend ${bookingGrowth >= 0 ? 'positive' : 'negative'}`}>
              {bookingGrowth >= 0 ? '↗' : '↘'} {Math.abs(bookingGrowth).toFixed(1)}% vs last month
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Monthly Bookings</h3>
            <div className="chart-controls">
              <button className="chart-btn active">12M</button>
              <button className="chart-btn">6M</button>
              <button className="chart-btn">3M</button>
            </div>
          </div>
          <div className="chart-content">
            {loading ? (
              <div className="loading-chart">
                <div className="loading-spinner"></div>
                <p>Loading booking data...</p>
              </div>
            ) : totalBookings > 0 ? (
              <div className="mock-line-chart">
                <div className="chart-bars">
                  {monthlyBookings.map((bookings, index) => {
                    const height = Math.max(...monthlyBookings) > 0 ? (bookings / Math.max(...monthlyBookings)) * 100 : 0;
                    return (
                      <div 
                        key={index}
                        className="bar" 
                        style={{height: `${height}%`}}
                        title={`${bookings} bookings`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-data-chart">
                <div className="no-data-icon">📊</div>
                <p>No booking data available</p>
                <small>Bookings will appear when customers make reservations</small>
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Popular Destinations</h3>
          </div>
          <div className="chart-content">
            {loading ? (
              <div className="loading-chart">
                <div className="loading-spinner"></div>
                <p>Loading destination data...</p>
              </div>
            ) : popularDestinations.length > 0 ? (
              <div className="demographics-chart">
                {popularDestinations.map((destination, index) => {
                  const percentage = totalBookings > 0 ? (destination[1] / totalBookings) * 100 : 0;
                  return (
                    <div key={index} className="demo-item">
                      <div className="demo-label">{destination[0]}</div>
                      <div className="demo-bar">
                        <div className="demo-fill" style={{width: `${percentage}%`}}></div>
                      </div>
                      <div className="demo-percentage">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data-chart">
                <div className="no-data-icon">🌍</div>
                <p>No destination data available</p>
                <small>Popular destinations will appear when bookings are made</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Packages */}
      <div className="top-pages">
        <h3>Top Performing Packages</h3>
        <div className="pages-list">
          {loading ? (
            <div className="loading-packages">
              <div className="loading-spinner"></div>
              <p>Loading package data...</p>
            </div>
          ) : popularDestinations.length > 0 ? (
            popularDestinations.map((destination, index) => (
              <div key={index} className="page-item">
                <div className="page-rank">{index + 1}</div>
                <div className="page-info">
                  <div className="page-name">{destination[0]}</div>
                  <div className="page-url">{destination[1]} bookings</div>
                </div>
                <div className="page-stats">
                  <div className="page-views">{destination[1]} total bookings</div>
                  <div className="page-conversion">{((destination[1] / totalBookings) * 100).toFixed(1)}% of total</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-packages">
              <div className="no-data-icon">📦</div>
              <p>No package performance data available</p>
              <small>Package performance will appear when bookings are made</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
