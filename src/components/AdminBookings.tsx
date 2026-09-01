import React, { useState, useEffect } from 'react';
import { Booking, BookingService, UserService } from '../utils/supabaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminBookings.css';

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await BookingService.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAutomaticStatus = (booking: Booking): Booking['status'] => {
    const today = new Date();
    const travelDate = new Date(booking.travelDate);
    const endDate = new Date(travelDate);
    endDate.setDate(endDate.getDate() + 7); // Assuming 7-day trip duration
    
    // If already cancelled, keep it cancelled
    if (booking.status === 'cancelled') {
      return 'cancelled';
    }
    
    // If travel date has passed and trip is over
    if (today > endDate) {
      return 'completed';
    }
    
    // If travel date has arrived
    if (today >= travelDate) {
      return 'ongoing';
    }
    
    // If travel date is in the future
    return 'pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'confirmed';
      case 'pending': return 'pending';
      case 'ongoing': return 'ongoing';
      case 'cancelled': return 'cancelled';
      case 'completed': return 'completed';
      default: return 'pending';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tourTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Export functions
  const handleExportBookings = () => {
    PDFExporter.exportBookings(bookings);
  };

  const handleExportFilteredBookings = () => {
    PDFExporter.exportBookings(filteredBookings);
  };

  const handleExportBookingsByStatus = (status: string) => {
    const statusBookings = bookings.filter(booking => booking.status === status);
    PDFExporter.exportToPDF({
      title: `${status.charAt(0).toUpperCase() + status.slice(1)} Bookings Report`,
      filename: `${status}-bookings-report-${new Date().toISOString().split('T')[0]}`,
      data: statusBookings,
      columns: [
        { header: 'Booking ID', dataKey: 'bookingId', width: 30 },
        { header: 'Customer', dataKey: 'customerName', width: 40 },
        { header: 'Email', dataKey: 'customerEmail', width: 50 },
        { header: 'Package', dataKey: 'tourTitle', width: 40 },
        { header: 'Travel Date', dataKey: 'travelDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Participants', dataKey: 'participants', width: 20 },
        { header: 'Total Price', dataKey: 'totalPrice', width: 25, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Payment Status', dataKey: 'paymentStatus', width: 20, render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' },
        { header: 'Payment Type', dataKey: 'paymentType', width: 20, render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A' }
      ]
    });
  };

  const handleExportBookingsByDateRange = () => {
    const currentDate = new Date();
    const last30Days = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= last30Days;
    });

    PDFExporter.exportToPDF({
      title: 'Recent Bookings Report (Last 30 Days)',
      filename: `recent-bookings-report-${new Date().toISOString().split('T')[0]}`,
      data: recentBookings,
      columns: [
        { header: 'Booking ID', dataKey: 'bookingId', width: 30 },
        { header: 'Customer', dataKey: 'customerName', width: 40 },
        { header: 'Email', dataKey: 'customerEmail', width: 50 },
        { header: 'Package', dataKey: 'tourTitle', width: 40 },
        { header: 'Booking Date', dataKey: 'bookingDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Travel Date', dataKey: 'travelDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Participants', dataKey: 'participants', width: 20 },
        { header: 'Total Price', dataKey: 'totalPrice', width: 25, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Status', dataKey: 'status', width: 20, render: (value) => value.charAt(0).toUpperCase() + value.slice(1) }
      ]
    });
  };

  const handleExportBookingAnalytics = () => {
    const analyticsData = [
      { metric: 'Total Bookings', value: totalBookings },
      { metric: 'Pending Bookings', value: pendingBookings },
      { metric: 'Confirmed Bookings', value: confirmedBookings },
      { metric: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}` },
      { metric: 'Average Booking Value', value: `₱${totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(0) : 0}` },
      { metric: 'Conversion Rate', value: `${totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0}%` }
    ];

    PDFExporter.exportToPDF({
      title: 'Booking Analytics Report',
      filename: `booking-analytics-report-${new Date().toISOString().split('T')[0]}`,
      data: analyticsData,
      columns: [
        { header: 'Metric', dataKey: 'metric', width: 80 },
        { header: 'Value', dataKey: 'value', width: 50 }
      ]
    });
  };

  return (
    <div className="bookings-page">
      <div className="page-header">
        <h1>Bookings</h1>
        <div className="header-actions">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="export-actions">
            <button className="action-btn" onClick={handleExportBookings}>
              <span>📄</span>
              Export Booking Reports
            </button>
            <button className="action-btn" onClick={loadBookings}>
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="booking-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{pendingBookings}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{confirmedBookings}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₱{totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="bookings-cards-container">
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <div className="booking-id-section">
                  <span className="booking-id-label">Booking ID</span>
                  <span className="booking-id">{booking.bookingId}</span>
                  </div>
                <div className="booking-status-section">
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="booking-card-body">
                <div className="booking-detail-section">
                  <div className="detail-item">
                    <span className="detail-label">👤 Customer</span>
                    <div className="customer-details">
                      <div className="customer-name">{booking.customerName}</div>
                      <div className="customer-email">{booking.customerEmail}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">📦 Package</span>
                    <span className="package-name">{booking.tourTitle}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">📅 Travel Date</span>
                    <span className="travel-date">{formatDate(booking.travelDate)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">👥 Participants</span>
                    <span className="participants">{booking.participants} {booking.participants === 1 ? 'person' : 'people'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">💰 Amount</span>
                    <span className="booking-amount">₱{booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
      </div>

              <div className="booking-card-footer">
                <div className="status-info">
                  <span className="status-label">Status:</span>
                  <span className={`status-badge ${getStatusColor(getAutomaticStatus(booking))}`}>
                    {getAutomaticStatus(booking).charAt(0).toUpperCase() + getAutomaticStatus(booking).slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon">📋</div>
            <p>No bookings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
