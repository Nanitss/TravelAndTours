import React, { useState, useEffect } from 'react';
import { Tour, TourService, ActivityService } from '../utils/supabaseService';
import { PDFExporter } from '../utils/pdfExport';
import './AdminPackages.css';

interface PackageFormData {
  title: string;
  description: string;
  destination: string;
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  availabilityUntil: string;
  imageUrl: string;
  isActive: boolean;
}

const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Tour | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState<PackageFormData>({
    title: '',
    description: '',
    destination: '',
    duration: 1,
    price: 0,
    startDate: '',
    endDate: '',
    availabilityUntil: '',
    imageUrl: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const allPackages = await TourService.getAllTours();
      setPackages(allPackages);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        return;
      }
      
      setImageFile(file);
      
      try {
        // Compress the image to reduce size
        const compressedImage = await compressImage(file, 800, 0.7);
        setImagePreview(compressedImage);
        
        // Check if compressed image is still too large
        if (compressedImage.length > 1000000) { // 1MB limit
          alert('Image is still too large after compression. Please use a smaller image or try a different format.');
          return;
        }
        
        setFormData({...formData, imageUrl: compressedImage});
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
      }
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({...formData, imageUrl: url});
    setImagePreview(url);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Form is already being submitted, please wait...');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Form submitted with data:', formData);
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a package title');
      setIsSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a package description');
      setIsSubmitting(false);
      return;
    }
    if (!formData.destination.trim()) {
      alert('Please enter a destination');
      setIsSubmitting(false);
      return;
    }
    if (!formData.startDate) {
      alert('Please select a start date');
      setIsSubmitting(false);
      return;
    }
    if (!formData.endDate) {
      alert('Please select an end date');
      setIsSubmitting(false);
      return;
    }
    if (!formData.availabilityUntil) {
      alert('Please select availability until date');
      setIsSubmitting(false);
      return;
    }
    if (formData.price <= 0 || isNaN(formData.price)) {
      alert('Please enter a valid price');
      setIsSubmitting(false);
      return;
    }
    if (formData.duration <= 0 || isNaN(formData.duration)) {
      alert('Please enter a valid duration');
      setIsSubmitting(false);
      return;
    }
    
    // Validate dates
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      setIsSubmitting(false);
      return;
    }
    
    if (new Date(formData.availabilityUntil) < new Date()) {
      alert('Availability until date must be in the future');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (editingPackage) {
        console.log('Updating package:', editingPackage.id);
        await TourService.updateTour(editingPackage.id!, formData);
        await ActivityService.createActivity({
          type: 'package_updated',
          title: 'Package Updated',
          description: `Package "${formData.title}" has been updated`,
          timestamp: new Date(),
          relatedId: editingPackage.id
        });
        console.log('Package updated successfully');
        alert('Package updated successfully!');
      } else {
        console.log('Creating new package...');
        const packageId = await TourService.createTour(formData);
        console.log('Package created with ID:', packageId);
        await ActivityService.createActivity({
          type: 'package_created',
          title: 'New Package Created',
          description: `Package "${formData.title}" has been created`,
          timestamp: new Date(),
          relatedId: packageId
        });
        console.log('Activity logged successfully');
        alert('Package created successfully!');
      }
      await loadPackages();
      resetForm();
      console.log('Form reset and packages reloaded');
    } catch (error) {
      console.error('Error saving package:', error);
      alert(`Error saving package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pkg: Tour) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price,
      startDate: pkg.startDate,
      endDate: pkg.endDate,
      availabilityUntil: pkg.availabilityUntil,
      imageUrl: pkg.imageUrl || '',
      isActive: pkg.isActive
    });
    setImagePreview(pkg.imageUrl || '');
    setImageFile(null);
    setImageInputMode('url');
    setShowForm(true);
  };

  const handleDelete = async (packageId: string, packageTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${packageTitle}"?`)) {
      try {
        await TourService.deleteTour(packageId);
        await loadPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error deleting package. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      duration: 1,
      price: 0,
      startDate: '',
      endDate: '',
      availabilityUntil: '',
      imageUrl: '',
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setImageInputMode('url');
    setEditingPackage(null);
    setShowForm(false);
  };

  // Export functions
  const handleExportPackages = () => {
    PDFExporter.exportPackages(packages);
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pkg.isActive) ||
                         (statusFilter === 'inactive' && !pkg.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="packages-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="packages-page">
      <div className="page-header">
        <h1>Packages</h1>
        <div className="header-actions">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="export-actions">
            <button className="action-btn" onClick={handleExportPackages}>
              <span>📄</span>
              Export Packages
          </button>
            <button 
              className="action-btn primary add-package-btn"
              onClick={() => setShowForm(true)}
            >
            <span>➕</span>
            Add new Package
          </button>
        </div>
      </div>
      </div>

      {/* Package Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <div className="modal-body">
              <form id="package-form" onSubmit={handleSubmit} className="package-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Package Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({...formData, duration: isNaN(value) ? 1 : value});
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({...formData, price: isNaN(value) ? 0 : value});
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Available Until</label>
                  <input
                    type="date"
                    value={formData.availabilityUntil}
                    onChange={(e) => setFormData({...formData, availabilityUntil: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <div className="image-input-container">
                    <div className="image-input-tabs">
                      <button 
                        type="button" 
                        className={`tab-btn ${imageInputMode === 'url' ? 'active' : ''}`}
                        onClick={() => {
                          setImageInputMode('url');
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({...formData, imageUrl: ''});
                        }}
                      >
                        URL
                      </button>
                      <button 
                        type="button" 
                        className={`tab-btn ${imageInputMode === 'upload' ? 'active' : ''}`}
                        onClick={() => {
                          setImageInputMode('upload');
                          setFormData({...formData, imageUrl: ''});
                          setImagePreview('');
                        }}
                      >
                        Upload
                      </button>
                    </div>
                    {imageInputMode === 'url' ? (
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="Enter image path (e.g., /assets/image.jpg)"
                        className="image-url-input"
                      />
                    ) : (
                      <div className="file-upload-area">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="image-file-input"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="file-upload-label">
                          <div className="upload-icon">📁</div>
                          <div className="upload-text">
                            <strong>Click to select image</strong>
                            <span>or drag and drop</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({...formData, imageUrl: ''});
                          setImageFile(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active Package
                </label>
              </div>

              </form>
            </div>
            <div className="modal-footer">
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" form="package-form" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      {editingPackage ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingPackage ? 'Update Package' : 'Create Package'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="packages-table-container">
        <div className="packages-grid">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div className="package-card-header">
                <div className="package-title-section">
                  <div className="package-title-label">Package Name</div>
                  <div className="package-title">{pkg.title}</div>
                  </div>
                <div className="package-status-section">
                  <span className={`package-status-badge ${pkg.isActive ? 'active' : 'inactive'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="package-card-body">
                <div className="package-detail-section">
                  <div className="package-detail-item">
                    <div className="package-detail-label">Destination</div>
                    <div className="package-destination">{pkg.destination}</div>
                  </div>
                  
                  <div className="package-detail-item">
                    <div className="package-detail-label">Duration</div>
                    <div className="package-duration">{pkg.duration} days</div>
                  </div>
                  
                  <div className="package-detail-item">
                    <div className="package-detail-label">Price</div>
                    <div className="package-price">₱{pkg.price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <div className="package-card-footer">
                <div className="package-actions">
                  <div className="package-status-info">
                    <div className="package-status-label">Status</div>
                    <span className={`package-status-badge ${pkg.isActive ? 'active' : 'inactive'}`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(pkg)}
                      title="Edit Package"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(pkg.id!, pkg.title)}
                      title="Delete Package"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))}
      </div>

        {filteredPackages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No Packages Found</h3>
            <p>
              {packages.length === 0 
                ? "You haven't created any packages yet. Start by adding your first tour package!"
                : "No packages match your current search criteria. Try adjusting your filters."
              }
            </p>
            {packages.length === 0 && (
              <button 
                className="action-btn primary"
                onClick={() => setShowForm(true)}
              >
                <span className="btn-icon">+</span>
                Create Your First Package
        </button>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminPackages;
