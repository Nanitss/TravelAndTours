import React, { useState, useEffect } from 'react';
import { BookingService, TourService, UserService, Booking, Tour, User } from '../utils/supabaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminSales.css';

const AdminSales: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
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
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate sales metrics
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const totalBookings = bookings.length;
  const totalUsers = users.length;
  
  // Calculate conversion rate (bookings / users)
  const conversionRate = totalUsers > 0 ? (totalBookings / totalUsers) * 100 : 0;

  // Calculate monthly revenue for comparison
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
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentMonthRevenue = monthlyRevenue[currentMonth];
  const lastMonthRevenue = monthlyRevenue[lastMonth];
  
  // Calculate percentage change
  const revenueChange = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  // Get top selling packages
  const getTopSellingPackages = () => {
    const packageSales = new Map<string, { count: number; revenue: number; title: string }>();
    
    bookings.forEach(booking => {
      const existing = packageSales.get(booking.tourId) || { count: 0, revenue: 0, title: booking.tourTitle };
      existing.count += 1;
      existing.revenue += booking.totalPrice;
      packageSales.set(booking.tourId, existing);
    });
    
    return Array.from(packageSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  };

  const topSellingPackages = getTopSellingPackages();

  // Export functions
  const handleExportSales = () => {
    const salesData = {
      totalRevenue,
      totalBookings,
      totalUsers,
      conversionRate,
      revenueChange
    };
    PDFExporter.exportSales(salesData);
  };

  const handleExportDetailedSales = () => {
    const detailedSalesData = bookings.map(booking => ({
      bookingId: booking.bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      tourTitle: booking.tourTitle,
      bookingDate: booking.bookingDate,
      travelDate: booking.travelDate,
      participants: booking.participants,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentType: booking.paymentType,
      amountPaid: booking.amountPaid || 0,
      amountRemaining: booking.amountRemaining || 0
    }));

    PDFExporter.exportToPDF({
      title: 'Detailed Sales Report',
      filename: `detailed-sales-report-${new Date().toISOString().split('T')[0]}`,
      data: detailedSalesData,
      columns: [
        { header: 'Booking ID', dataKey: 'bookingId', width: 25 },
        { header: 'Customer', dataKey: 'customerName', width: 30 },
        { header: 'Email', dataKey: 'customerEmail', width: 40 },
        { header: 'Package', dataKey: 'tourTitle', width: 35 },
        { header: 'Booking Date', dataKey: 'bookingDate', width: 20, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Travel Date', dataKey: 'travelDate', width: 20, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Participants', dataKey: 'participants', width: 15 },
        { header: 'Total Price', dataKey: 'totalPrice', width: 20, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Amount Paid', dataKey: 'amountPaid', width: 20, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Remaining', dataKey: 'amountRemaining', width: 20, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Status', dataKey: 'status', width: 15, render: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
        { header: 'Payment Status', dataKey: 'paymentStatus', width: 20, render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' }
      ],
      orientation: 'landscape'
    });
  };

  const handleExportTopPackages = () => {
    const topPackagesData = topSellingPackages.map((pkg, index) => ({
      rank: index + 1,
      packageName: pkg.title,
      salesCount: pkg.count,
      totalRevenue: pkg.revenue,
      averageRevenue: pkg.revenue / pkg.count
    }));

    PDFExporter.exportToPDF({
      title: 'Top Selling Packages Report',
      filename: `top-packages-report-${new Date().toISOString().split('T')[0]}`,
      data: topPackagesData,
      columns: [
        { header: 'Rank', dataKey: 'rank', width: 15 },
        { header: 'Package Name', dataKey: 'packageName', width: 60 },
        { header: 'Sales Count', dataKey: 'salesCount', width: 20 },
        { header: 'Total Revenue', dataKey: 'totalRevenue', width: 25, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Average Revenue', dataKey: 'averageRevenue', width: 25, render: (value) => `₱${value.toLocaleString()}` }
      ]
    });
  };

  const handleExportMonthlySales = () => {
    const monthlyData = monthlyRevenue.map((revenue, index) => ({
      month: new Date(2024, index).toLocaleDateString('en-US', { month: 'long' }),
      revenue: revenue,
      percentage: Math.max(...monthlyRevenue) > 0 ? ((revenue / Math.max(...monthlyRevenue)) * 100).toFixed(1) : 0
    }));

    PDFExporter.exportToPDF({
      title: 'Monthly Sales Report',
      filename: `monthly-sales-report-${new Date().toISOString().split('T')[0]}`,
      data: monthlyData,
      columns: [
        { header: 'Month', dataKey: 'month', width: 40 },
        { header: 'Revenue', dataKey: 'revenue', width: 30, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Percentage', dataKey: 'percentage', width: 20, render: (value) => `${value}%` }
      ]
    });
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Sales</h1>
        <div className="header-actions">
          <button className="action-btn">
            <span>📅</span>
            This Month
            <span>▼</span>
          </button>
          <div className="export-actions">
            <button className="action-btn" onClick={handleExportSales}>
              <span>📄</span>
              Export Sales Reports
            </button>
          </div>
        </div>
      </div>

      {/* Sales Overview Cards */}
      <div className="sales-overview">
        <div className="sales-card">
          <div className="sales-icon">💰</div>
          <div className="sales-content">
            <h3>Total Revenue</h3>
            <div className="sales-amount">
              {loading ? 'Loading...' : `₱${totalRevenue.toLocaleString()}`}
            </div>
            <div className={`sales-trend ${revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {revenueChange >= 0 ? '↗' : '↘'} {Math.abs(revenueChange).toFixed(1)}% from last month
            </div>
          </div>
        </div>

        <div className="sales-card">
          <div className="sales-icon">📦</div>
          <div className="sales-content">
            <h3>Packages Sold</h3>
            <div className="sales-amount">
              {loading ? 'Loading...' : totalBookings.toLocaleString()}
            </div>
            <div className="sales-trend positive">
              {totalBookings} total bookings
            </div>
          </div>
        </div>

        <div className="sales-card">
          <div className="sales-icon">👥</div>
          <div className="sales-content">
            <h3>Total Customers</h3>
            <div className="sales-amount">
              {loading ? 'Loading...' : totalUsers.toLocaleString()}
            </div>
            <div className="sales-trend positive">
              {totalUsers} registered users
            </div>
          </div>
        </div>

        <div className="sales-card">
          <div className="sales-icon">📈</div>
          <div className="sales-content">
            <h3>Conversion Rate</h3>
            <div className="sales-amount">
              {loading ? 'Loading...' : `${conversionRate.toFixed(1)}%`}
            </div>
            <div className="sales-trend positive">
              {totalBookings} bookings / {totalUsers} users
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="sales-chart-container">
        <div className="chart-header">
          <h3>Sales Performance</h3>
          <div className="chart-controls">
            <button className="chart-btn active">7D</button>
            <button className="chart-btn">30D</button>
            <button className="chart-btn">90D</button>
          </div>
        </div>
        <div className="chart-content">
          {loading ? (
            <div className="loading-chart">
              <div className="loading-spinner"></div>
              <p>Loading sales data...</p>
            </div>
          ) : totalRevenue > 0 ? (
            <div className="mock-chart">
              <div className="chart-bars">
                {monthlyRevenue.map((revenue, index) => {
                  const height = Math.max(...monthlyRevenue) > 0 ? (revenue / Math.max(...monthlyRevenue)) * 100 : 0;
                  return (
                    <div 
                      key={index}
                      className="bar" 
                      style={{height: `${height}%`}}
                      title={`₱${revenue.toLocaleString()}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-data-chart">
              <div className="no-data-icon">📊</div>
              <p>No sales data available</p>
              <small>Sales will appear when bookings are made</small>
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Packages */}
      <div className="top-packages">
        <h3>Top Selling Packages</h3>
        <div className="packages-list">
          {loading ? (
            <div className="loading-packages">
              <div className="loading-spinner"></div>
              <p>Loading top packages...</p>
            </div>
          ) : topSellingPackages.length > 0 ? (
            topSellingPackages.map((pkg, index) => (
              <div key={index} className="package-item">
                <div className="package-rank">{index + 1}</div>
                <div className="package-info">
                  <div className="package-name">{pkg.title}</div>
                  <div className="package-sales">{pkg.count} sales</div>
                </div>
                <div className="package-revenue">₱{pkg.revenue.toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="no-packages">
              <div className="no-data-icon">📦</div>
              <p>No package sales data available</p>
              <small>Top packages will appear when bookings are made</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
