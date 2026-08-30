import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface PDFExportOptions {
  title: string;
  filename: string;
  data: any[];
  columns: Array<{
    header: string;
    dataKey: string;
    width?: number;
    render?: (value: any, row: any) => string;
  }>;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'letter';
}

export class PDFExporter {
  static exportToPDF(options: PDFExportOptions): void {
    const {
      title,
      filename,
      data,
      columns,
      orientation = 'portrait',
      pageSize = 'A4'
    } = options;

    // Create new PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 22);

    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare table data
    const tableData = data.map(row => {
      return columns.map(col => {
        if (col.render) {
          return col.render(row[col.dataKey], row);
        }
        return row[col.dataKey] || '';
      });
    });

    // Prepare column headers
    const tableColumns = columns.map(col => ({
      title: col.header,
      dataKey: col.dataKey,
      width: col.width
    }));

    // Add table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width };
        }
        return acc;
      }, {} as any)
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`${filename}.pdf`);
  }

  // Export Users
  static exportUsers(users: any[]): void {
    PDFExporter.exportToPDF({
      title: 'Users Report',
      filename: `users-report-${new Date().toISOString().split('T')[0]}`,
      data: users,
      columns: [
        { header: 'User ID', dataKey: 'id', width: 30, render: (value) => value?.substring(0, 8) + '...' },
        { header: 'Name', dataKey: 'name', width: 40 },
        { header: 'Email', dataKey: 'email', width: 50 },
        { header: 'Role', dataKey: 'role', width: 20, render: (value) => value === 'admin' ? 'Admin' : 'Client' },
        { header: 'Join Date', dataKey: 'createdAt', width: 30, render: (value) => {
          if (!value) return 'N/A';
          const date = value.toDate ? value.toDate() : new Date(value);
          return date.toLocaleDateString();
        }}
      ]
    });
  }

  // Export Bookings
  static exportBookings(bookings: any[]): void {
    PDFExporter.exportToPDF({
      title: 'Bookings Report',
      filename: `bookings-report-${new Date().toISOString().split('T')[0]}`,
      data: bookings,
      columns: [
        { header: 'Booking ID', dataKey: 'bookingId', width: 30 },
        { header: 'Customer', dataKey: 'customerName', width: 40 },
        { header: 'Email', dataKey: 'customerEmail', width: 50 },
        { header: 'Package', dataKey: 'tourTitle', width: 40 },
        { header: 'Travel Date', dataKey: 'travelDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Participants', dataKey: 'participants', width: 20 },
        { header: 'Total Price', dataKey: 'totalPrice', width: 25, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Status', dataKey: 'status', width: 20, render: (value) => value.charAt(0).toUpperCase() + value.slice(1) }
      ]
    });
  }

  // Export Packages
  static exportPackages(packages: any[]): void {
    PDFExporter.exportToPDF({
      title: 'Packages Report',
      filename: `packages-report-${new Date().toISOString().split('T')[0]}`,
      data: packages,
      columns: [
        { header: 'Title', dataKey: 'title', width: 50 },
        { header: 'Destination', dataKey: 'destination', width: 30 },
        { header: 'Duration', dataKey: 'duration', width: 20, render: (value) => `${value} days` },
        { header: 'Price', dataKey: 'price', width: 25, render: (value) => `₱${value.toLocaleString()}` },
        { header: 'Start Date', dataKey: 'startDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'End Date', dataKey: 'endDate', width: 25, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Available Until', dataKey: 'availabilityUntil', width: 30, render: (value) => new Date(value).toLocaleDateString() },
        { header: 'Status', dataKey: 'isActive', width: 20, render: (value) => value ? 'Active' : 'Inactive' }
      ]
    });
  }

  // Export Analytics Summary
  static exportAnalytics(analyticsData: any): void {
    console.log('PDFExporter received analytics data:', analyticsData); // Debug log
    
    const data = [
      { metric: 'Total Users', value: analyticsData.totalUsers },
      { metric: 'Total Bookings', value: analyticsData.totalBookings },
      { metric: 'Total Revenue', value: `₱${analyticsData.totalRevenue.toLocaleString()}` },
      { metric: 'Conversion Rate', value: `${analyticsData.conversionRate.toFixed(1)}%` },
      { metric: 'Average Booking Value', value: `₱${analyticsData.averageBookingValue.toFixed(0)}` },
      { metric: 'User Growth', value: `${analyticsData.userGrowth.toFixed(1)}%` },
      { metric: 'Booking Growth', value: `${analyticsData.bookingGrowth.toFixed(1)}%` }
    ];

    // Add package booking statistics if available
    console.log('Package bookings available:', analyticsData.packageBookings); // Debug log
    if (analyticsData.packageBookings && analyticsData.packageBookings.length > 0) {
      data.push({ metric: '', value: '' }); // Empty row for spacing
      data.push({ metric: 'PACKAGE BOOKING STATISTICS', value: '' });
      data.push({ metric: '', value: '' }); // Empty row for spacing
      
      analyticsData.packageBookings.forEach((pkg: any, index: number) => {
        data.push({ 
          metric: `${index + 1}. ${pkg.packageName}`, 
          value: `${pkg.bookingCount} bookings` 
        });
        data.push({ 
          metric: `   Revenue:`, 
          value: `₱${pkg.totalRevenue.toLocaleString()}` 
        });
        data.push({ 
          metric: `   Avg per booking:`, 
          value: `₱${pkg.averageRevenue.toFixed(0)}` 
        });
        data.push({ metric: '', value: '' }); // Empty row for spacing
      });
    }

    PDFExporter.exportToPDF({
      title: 'Analytics Summary Report',
      filename: `analytics-report-${new Date().toISOString().split('T')[0]}`,
      data: data,
      columns: [
        { header: 'Metric', dataKey: 'metric', width: 80 },
        { header: 'Value', dataKey: 'value', width: 50 }
      ]
    });
  }

  // Export Sales Summary
  static exportSales(salesData: any): void {
    const data = [
      { metric: 'Total Revenue', value: `₱${salesData.totalRevenue.toLocaleString()}` },
      { metric: 'Total Bookings', value: salesData.totalBookings },
      { metric: 'Total Users', value: salesData.totalUsers },
      { metric: 'Conversion Rate', value: `${salesData.conversionRate.toFixed(1)}%` },
      { metric: 'Revenue Growth', value: `${salesData.revenueChange.toFixed(1)}%` }
    ];

    PDFExporter.exportToPDF({
      title: 'Sales Summary Report',
      filename: `sales-report-${new Date().toISOString().split('T')[0]}`,
      data: data,
      columns: [
        { header: 'Metric', dataKey: 'metric', width: 80 },
        { header: 'Value', dataKey: 'value', width: 50 }
      ]
    });
  }
}
