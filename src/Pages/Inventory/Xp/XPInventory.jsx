import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  FaBox, FaPlus, FaSearch, FaFileExcel,
  FaUpload, FaDownload, FaEdit, FaTrash,
  FaTimes, FaBell, FaCheckCircle, FaTimesCircle,
  FaChevronRight, FaHistory, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import "./XPInventory.scss";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';
import Select from 'react-select';


// ============================================
// ADD PRODUCT MODAL
// ============================================
const AddProductModal = ({
  show, onClose, newProduct, setNewProduct,
  isSubmitting, onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaPlus /> Add Product
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-form-row">
            <div className="xp-form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={newProduct.productName}
                onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                placeholder="Enter product name"
                autoComplete="off"
              />
            </div>
            <div className="xp-form-field">
              <label>ML *</label>
              <select
                value={newProduct.ml}
                onChange={(e) => setNewProduct({ ...newProduct, ml: e.target.value })}
              >
                <option value="">Select ML</option>
                <option value="30">30 ml</option>
                <option value="60">60 ml</option>
                <option value="125">125 ml</option>
              </select>
            </div>
          </div>
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="xp-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !newProduct.productName.trim() || !newProduct.ml}
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADD STOCK MODAL (UPDATED with Searchable Dropdown)
// ============================================

const AddStockModal = ({
  show, onClose, products, addStockData, setAddStockData,
  isSubmitting, onSubmit
}) => {
  if (!show) return null;

  const selectedProduct = products.find(p => p.xpId === addStockData.xpId);

  // Convert products to react-select format
  const productOptions = products.map(p => ({
    value: p.xpId,
    label: `${p.productName} - ${p.ml}ml`,
    product: p // Store full product for later use
  }));

  // Handle selection change
  const handleProductSelect = (selectedOption) => {
    if (selectedOption) {
      const product = selectedOption.product;
      setAddStockData({
        ...addStockData,
        xpId: product.xpId,
        productName: product.productName,
        ml: product.ml
      });
    } else {
      // Clear selection
      setAddStockData({
        ...addStockData,
        xpId: "",
        productName: "",
        ml: ""
      });
    }
  };

  // Find current selected option
  const currentSelectedOption = productOptions.find(
    opt => opt.value === addStockData.xpId
  );

  // Custom styles to match your design system
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1.5px solid #e3e8f0',
      borderRadius: '8px',
      padding: '2px 2px',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '14px',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(106, 106, 197, 0.12)' : 'none',
      borderColor: state.isFocused ? '#6a6ac5' : '#e3e8f0',
      '&:hover': {
        borderColor: '#6a6ac5'
      },
      backgroundColor: '#fafbfc',
      cursor: 'text'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#bfc5ce',
      fontSize: '14px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3f3f91' : state.isFocused ? '#f0f0fb' : 'white',
      color: state.isSelected ? 'white' : '#333',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '13.5px',
      padding: '10px 14px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3f3f91' : '#f0f0fb'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      zIndex: 100,
      marginTop: '4px'
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
      padding: '4px 0'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#aab0bc',
      '&:hover': {
        color: '#3f3f91'
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#aab0bc',
      '&:hover': {
        color: '#dc3545'
      }
    }),
    input: (provided) => ({
      ...provided,
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '14px',
      color: '#333',
      margin: '0'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#333',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '14px'
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      fontFamily: "'Open Sans', sans-serif",
      fontSize: '13px',
      color: '#aab0bc',
      padding: '12px 14px'
    })
  };

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaPlus /> Add Stock
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-form-row">
            <div className="xp-form-field">
              <label>Search & Select Product *</label>
              <Select
                options={productOptions}
                value={currentSelectedOption}
                onChange={handleProductSelect}
                placeholder="🔍 Type to search products..."
                isClearable
                styles={customSelectStyles}
                noOptionsMessage={() => "No products found"}
                isDisabled={isSubmitting}
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="xp-current-stock-info">
              <span>Current Stock: <strong>{selectedProduct.quantity} KG</strong></span>
              <span>Avg Price: <strong>₹{selectedProduct.avgPurchasePrice?.toFixed(2) || '0.00'}/KG</strong></span>
            </div>
          )}

          <div className="xp-form-row">
            <div className="xp-form-field">
              <label>Quantity (KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={addStockData.quantity}
                onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
                placeholder="Enter quantity in KG"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
            <div className="xp-form-field">
              <label>Purchase Price (₹/KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={addStockData.purchasePrice}
                onChange={(e) => setAddStockData({ ...addStockData, purchasePrice: e.target.value })}
                placeholder="Enter price per KG"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="xp-form-row">
            <div className="xp-form-field">
              <label>Notes (Optional)</label>
              <input
                type="text"
                value={addStockData.notes}
                onChange={(e) => setAddStockData({ ...addStockData, notes: e.target.value })}
                placeholder="Add notes..."
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="xp-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !addStockData.xpId || !addStockData.quantity || !addStockData.purchasePrice}
          >
            {isSubmitting ? "Adding..." : "Add Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EDIT PRODUCT MODAL
// ============================================
const EditProductModal = ({
  show, onClose, editData, setEditData,
  isSubmitting, onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaEdit /> Edit Product
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-form-row">
            <div className="xp-form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={editData.productName}
                onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
                placeholder="Enter product name"
                autoComplete="off"
              />
            </div>
            <div className="xp-form-field">
              <label>ML *</label>
              <select
                value={editData.ml}
                onChange={(e) => setEditData({ ...editData, ml: e.target.value })}
              >
                <option value="">Select ML</option>
                <option value="30">30 ml</option>
                <option value="60">60 ml</option>
                <option value="125">125 ml</option>
              </select>
            </div>
          </div>
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="xp-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !editData.productName.trim() || !editData.ml}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// BULK UPLOAD MODAL (tabs instead of buried select)
// ============================================
const BulkUploadModal = ({
  show, onClose, fileInputRef, selectedFile, onFileChange,
  onDownloadTemplate, isSubmitting, onSubmit, uploadType,
  setUploadType
}) => {
  if (!show) return null;

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaUpload /> Bulk Upload
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-upload-area">
            <div className="xp-upload-type-tabs">
              <button
                className={uploadType === 'products' ? 'xp-upload-type-active' : ''}
                onClick={() => setUploadType('products')}
                type="button"
              >
                <FaBox /> Products Only
              </button>
              <button
                className={uploadType === 'inventory' ? 'xp-upload-type-active' : ''}
                onClick={() => setUploadType('inventory')}
                type="button"
              >
                <FaUpload /> Inventory (Stock)
              </button>
            </div>

            <p className="xp-upload-hint">
              {uploadType === 'products'
                ? 'File should have columns: Product Name, ML'
                : 'File should have columns: Product Name, ML, Quantity, Purchase Price'}
            </p>

            <div className="xp-file-drop">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
              />
              {selectedFile && (
                <div className="xp-file-info">
                  <FaFileExcel /> {selectedFile.name}
                </div>
              )}
            </div>

            <button className="xp-btn-download" onClick={onDownloadTemplate} type="button">
              <FaDownload /> Download Template
            </button>
          </div>
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="xp-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ERROR MODAL
// ============================================
const ErrorModal = ({
  show, onClose, bulkSuccessCount, bulkErrorCount,
  bulkSuccessDetails, bulkErrors, onDownloadErrorExcel
}) => {
  if (!show) return null;

  const hasErrors = bulkErrors && bulkErrors.length > 0;
  const hasSuccess = bulkSuccessCount > 0;

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content xp-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaFileExcel /> Bulk Upload Results
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-upload-summary">
            <div className="xp-summary-success">
              <FaCheckCircle />
              <strong>Success:</strong> {bulkSuccessCount} items added
            </div>
            <div className={`xp-summary-error ${hasErrors ? 'has-errors' : 'no-errors'}`}>
              <FaTimesCircle />
              <strong>Failed:</strong> {bulkErrorCount} items
            </div>
          </div>

          {hasSuccess && bulkSuccessDetails && bulkSuccessDetails.length > 0 && (
            <div className="xp-result-section">
              <h4 className="xp-result-heading xp-result-success">
                <FaCheckCircle /> Successfully Added ({bulkSuccessDetails.length})
              </h4>
              <div className="xp-result-table-wrap">
                <table className="xp-result-table xp-success-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Product Name</th>
                      <th>ML</th>
                      {bulkSuccessDetails[0]?.quantity !== undefined && (
                        <>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>New Stock</th>
                          <th>Avg Price</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {bulkSuccessDetails.map((item, index) => (
                      <tr key={index}>
                        <td>{item.row}</td>
                        <td>{item.productName}</td>
                        <td>{item.ml}ml</td>
                        {item.quantity !== undefined && (
                          <>
                            <td>{item.quantity} KG</td>
                            <td>₹{item.purchasePrice}/KG</td>
                            <td className="xp-success-cell">{item.newStock} KG</td>
                            <td className="xp-success-cell">₹{item.newAvgPrice?.toFixed(2)}/KG</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="xp-result-section">
              <h4 className="xp-result-heading xp-result-error">
                <FaTimesCircle /> Failed ({bulkErrors.length})
              </h4>
              <div className="xp-result-table-wrap">
                <table className="xp-result-table xp-error-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Product Name</th>
                      <th>ML</th>
                      {bulkErrors[0]?.quantity !== undefined && (
                        <>
                          <th>Quantity</th>
                          <th>Price</th>
                        </>
                      )}
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkErrors.map((err, index) => (
                      <tr key={index}>
                        <td>{err.row}</td>
                        <td>{err.productName || '-'}</td>
                        <td>{err.ml || '-'}</td>
                        {err.quantity !== undefined && (
                          <>
                            <td>{err.quantity || '-'}</td>
                            <td>{err.purchasePrice || '-'}</td>
                          </>
                        )}
                        <td className="xp-error-cell">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasErrors && (
            <button className="xp-btn-download-error" onClick={onDownloadErrorExcel}>
              <FaDownload /> Download Error Report
            </button>
          )}
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ALERT MODAL
// ============================================
const AlertModal = ({ show, onClose, alerts }) => {
  if (!show) return null;

  const lowStockItems = alerts.filter(item => item.quantity > 0 && item.quantity <= item.minStock);
  const emptyItems = alerts.filter(item => item.quantity === 0);

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content xp-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header">
          <div className="xp-modal-title">
            <FaBell /> Stock Alerts
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          {alerts.length === 0 ? (
            <div className="xp-alert-empty-state">
              <FaBell />
              <p>All stock levels are healthy!</p>
            </div>
          ) : (
            <>
              {emptyItems.length > 0 && (
                <div className="xp-alert-section">
                  <h4 className="xp-alert-heading-empty">Empty Stock (0)</h4>
                  <div className="xp-alert-list">
                    {emptyItems.map((item, index) => (
                      <div key={index} className="xp-alert-item xp-alert-empty">
                        <span>{item.productName} - {item.ml}ml</span>
                        <span>Quantity: {item.quantity} KG</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lowStockItems.length > 0 && (
                <div className="xp-alert-section">
                  <h4 className="xp-alert-heading-low">Low Stock (Below {alerts[0]?.minStock || 5} KG)</h4>
                  <div className="xp-alert-list">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="xp-alert-item xp-alert-low">
                        <span>{item.productName} - {item.ml}ml</span>
                        <span>Quantity: {item.quantity} KG / Min: {item.minStock} KG</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================
const DeleteConfirmModal = ({ show, onClose, product, onConfirm, isDeleting }) => {
  if (!show || !product) return null;

  return (
    <div className="xp-modal-overlay" onClick={onClose}>
      <div className="xp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="xp-modal-header xp-modal-header-danger">
          <div className="xp-modal-title">
            <FaTrash /> Confirm Delete
          </div>
          <button className="xp-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="xp-modal-body">
          <div className="xp-delete-body">
            <div className="xp-delete-icon">
              <FaTrash />
            </div>
            <h3>Are you sure?</h3>
            <p>
              You are about to delete <strong>"{product.productName} - {product.ml}ml"</strong>.
              This will also delete all stock and transaction history for this product.
              <br /><br />
              <strong style={{ color: '#dc3545' }}>This action cannot be undone!</strong>
            </p>
          </div>
        </div>
        <div className="xp-modal-footer">
          <button className="xp-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="xp-btn-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TRANSACTION HISTORY PANEL (the new feature)
// Renders inline below an expanded row
// ============================================
const TransactionPanel = ({ transactions, isLoading }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="xp-transaction-panel">
        <div className="xp-transaction-loading">
          <div className="xp-loading-spinner tiny"></div>
          Loading transaction history...
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="xp-transaction-panel">
        <div className="xp-transaction-panel-header">
          <h5><FaHistory /> Transaction History</h5>
        </div>
        <div className="xp-transaction-empty">No stock transactions recorded yet for this product.</div>
      </div>
    );
  }

  return (
    <div className="xp-transaction-panel">
      <div className="xp-transaction-panel-header">
        <h5><FaHistory /> Transaction History ({transactions.length})</h5>
      </div>
      <div className="xp-transaction-list">
        {transactions.map((t, idx) => {
          const { date, time } = formatDateTime(t.createdAt);
          return (
            <div key={t.transactionId || idx} className="xp-transaction-item">
              <span className={`xp-txn-type-badge ${t.transactionType === 'IN' ? 'xp-txn-in' : 'xp-txn-out'}`}>
                {t.transactionType === 'IN' ? <FaArrowUp /> : <FaArrowDown />}
                {t.transactionType}
              </span>
              <span className="xp-txn-qty">{t.quantity} KG</span>
              <span className="xp-txn-price">
                {t.purchasePrice ? `₹${t.purchasePrice}/KG` : '—'}
              </span>
              <span className="xp-txn-by">
                <span className="xp-txn-by-name">{t.performedBy?.userName || 'Unknown'}</span>
                <span className="xp-txn-by-reason">{t.reason}{t.notes ? ` · ${t.notes}` : ''}</span>
              </span>
              <span className="xp-txn-date">
                {date}
                <span className="xp-txn-time">{time}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const XPInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [newProduct, setNewProduct] = useState({ productName: "", ml: "" });
  const [editData, setEditData] = useState({ productName: "", ml: "" });
  const [addStockData, setAddStockData] = useState({
    xpId: "",
    productName: "",
    ml: "",
    quantity: "",
    purchasePrice: "",
    notes: ""
  });

  // Bulk upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("inventory");
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
  const [bulkErrorCount, setBulkErrorCount] = useState(0);
  const [bulkSuccessDetails, setBulkSuccessDetails] = useState([]);
  const [bulkUploadId, setBulkUploadId] = useState("");

  // ── Row expansion / transaction history states (NEW) ──
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [transactionsByXpId, setTransactionsByXpId] = useState({});
  const [loadingTransactionsId, setLoadingTransactionsId] = useState(null);

  const fileInputRef = useRef(null);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/get-all`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/get-alerts`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, []);

  // ============================================
  // FILTERS
  // ============================================
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventory(inventory);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = inventory.filter(item =>
      item.productName?.toLowerCase().includes(search)
    );
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  // ============================================
  // ROW EXPANSION — FETCH TRANSACTION HISTORY (NEW)
  // ============================================
  const fetchTransactionsForProduct = async (xpId) => {
    try {
      setLoadingTransactionsId(xpId);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/get-transactions?xpId=${xpId}&limit=100`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch transaction history');
      const data = await response.json();

      // Transactions come newest-last from the array push; show newest first
      const sorted = [...(data.transactions || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTransactionsByXpId(prev => ({ ...prev, [xpId]: sorted }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
      setTransactionsByXpId(prev => ({ ...prev, [xpId]: [] }));
    } finally {
      setLoadingTransactionsId(null);
    }
  };

  const handleRowClick = (xpId) => {
    if (expandedRowId === xpId) {
      // Collapse if clicking the already-open row
      setExpandedRowId(null);
      return;
    }

    setExpandedRowId(xpId);

    // Only fetch if we don't already have it cached
    if (!transactionsByXpId[xpId]) {
      fetchTransactionsForProduct(xpId);
    }
  };

  // ============================================
  // CREATE PRODUCT
  // ============================================
  const handleCreateProduct = async () => {
    try {
      if (!newProduct.productName.trim()) {
        toast.error("Product name is required");
        return;
      }

      if (!newProduct.ml) {
        toast.error("Please select ML");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/create-product`,
        {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: newProduct.productName.trim(),
            ml: parseInt(newProduct.ml)
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      toast.success(result.message);

      setNewProduct({ productName: "", ml: "" });
      setShowAddProductModal(false);
      await fetchInventory();
      await fetchAlerts();

    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // ADD STOCK
  // ============================================
  const handleAddStock = async () => {
    try {
      if (!addStockData.xpId) {
        toast.error("Please select a product");
        return;
      }

      if (!addStockData.quantity || parseFloat(addStockData.quantity) <= 0) {
        toast.error("Please enter valid quantity");
        return;
      }

      if (!addStockData.purchasePrice || parseFloat(addStockData.purchasePrice) <= 0) {
        toast.error("Please enter valid purchase price");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/add-stock`,
        {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: addStockData.productName,
            ml: parseInt(addStockData.ml),
            quantity: parseFloat(addStockData.quantity),
            purchasePrice: parseFloat(addStockData.purchasePrice),
            notes: addStockData.notes || ''
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add stock");
      }

      const result = await response.json();
      toast.success(result.message);

      const updatedXpId = addStockData.xpId;

      setAddStockData({
        xpId: "",
        productName: "",
        ml: "",
        quantity: "",
        purchasePrice: "",
        notes: ""
      });
      setShowAddStockModal(false);
      await fetchInventory();
      await fetchAlerts();

      // If that product's history panel is open, refresh it so the new transaction shows immediately
      if (expandedRowId === updatedXpId) {
        await fetchTransactionsForProduct(updatedXpId);
      } else {
        // Invalidate cache so next expand fetches fresh data
        setTransactionsByXpId(prev => {
          const next = { ...prev };
          delete next[updatedXpId];
          return next;
        });
      }

    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // UPDATE PRODUCT
  // ============================================
  const handleUpdateProduct = async () => {
    try {
      if (!editData.productName.trim()) {
        toast.error("Product name is required");
        return;
      }

      if (!editData.ml) {
        toast.error("Please select ML");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/update/${editData.xpId}`,
        {
          method: "PUT",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: editData.productName.trim(),
            ml: parseInt(editData.ml)
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      toast.success(result.message);

      setEditData({ xpId: "", productName: "", ml: "" });
      setShowEditModal(false);
      setSelectedProduct(null);
      await fetchInventory();

    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // DELETE PRODUCT
  // ============================================
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/delete/${selectedProduct.xpId}`,
        {
          method: "DELETE",
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      const result = await response.json();
      toast.success(result.message);

      // Clean up any cached transaction state for the deleted product
      if (expandedRowId === selectedProduct.xpId) {
        setExpandedRowId(null);
      }
      setTransactionsByXpId(prev => {
        const next = { ...prev };
        delete next[selectedProduct.xpId];
        return next;
      });

      setShowDeleteModal(false);
      setSelectedProduct(null);
      await fetchInventory();
      await fetchAlerts();

    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================
  // BULK UPLOAD
  // ============================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBulkUpload = async () => {
    try {
      if (!selectedFile) {
        toast.error("Please select a file");
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      setIsSubmitting(true);

      const endpoint = uploadType === 'products'
        ? `${import.meta.env.VITE_API_URL}/xp/bulk-upload-products`
        : `${import.meta.env.VITE_API_URL}/xp/bulk-upload-inventory`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Bulk upload failed");
      }

      const result = await response.json();

      if (result.success && result.success.details) {
        setBulkSuccessDetails(result.success.details);
        setBulkSuccessCount(result.success.count || 0);
      }

      if (result.errors && result.errors.details) {
        setBulkErrors(result.errors.details);
        setBulkErrorCount(result.errors.count || 0);
      }

      setBulkUploadId(result.bulkUploadId || "");
      setShowErrorModal(true);

      toast.success(result.message || "Bulk upload completed");

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowBulkUploadModal(false);
      await fetchInventory();
      await fetchAlerts();

      // Bulk inventory upload can touch many products' transaction history —
      // clear the whole cache so any expanded rows refetch fresh data
      if (uploadType === 'inventory') {
        setTransactionsByXpId({});
        if (expandedRowId) {
          fetchTransactionsForProduct(expandedRowId);
        }
      }

    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // DOWNLOAD ERROR EXCEL - DIRECTLY FROM FRONTEND
  // ============================================
  const handleDownloadErrorExcel = () => {
    try {
      if (!bulkErrors || bulkErrors.length === 0) {
        toast.error("No errors to download");
        return;
      }

      // Format errors for Excel
      const errorData = bulkErrors.map(err => ({
        'Row': err.row || '',
        'Product Name': err.productName || '',
        'ML': err.ml || '',
        'Quantity': err.quantity || '',
        'Purchase Price': err.purchasePrice || '',
        'Error Reason': err.error || 'Unknown error'
      }));

      // Create worksheet
      const worksheetData = [
        ['Row', 'Product Name', 'ML', 'Quantity', 'Purchase Price', 'Error Reason'],
        ...errorData.map(item => [
          item['Row'],
          item['Product Name'],
          item['ML'],
          item['Quantity'],
          item['Purchase Price'],
          item['Error Reason']
        ])
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      ws['!cols'] = [
        { wch: 8 },
        { wch: 35 },
        { wch: 10 },
        { wch: 12 },
        { wch: 18 },
        { wch: 50 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Errors');

      // Download
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xp_bulk_upload_errors.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Error report downloaded successfully");

    } catch (error) {
      console.error("Error downloading error file:", error);
      toast.error("Failed to download error file");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/xp/download-template/${uploadType}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = uploadType === 'products'
        ? 'xp_products_template.xlsx'
        : 'xp_inventory_template.xlsx';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { status: 'empty', label: 'Empty' };
    if (quantity <= minStock) return { status: 'low', label: 'Low Stock' };
    return { status: 'healthy', label: 'In Stock' };
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditData({
      xpId: product.xpId,
      productName: product.productName,
      ml: product.ml.toString()
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Navbar>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="xp-main">

        {/* Page Header */}
        <div className="xp-page-header">
          <h2>XP Inventory Management</h2>
          <div className="xp-right-section">
            <div className="xp-search-container">
              <FaSearch className="xp-search-icon" />
              <input
                type="text"
                placeholder="Search by Product Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="xp-action-buttons-group">
              <button
                className="xp-alert-btn"
                onClick={() => setShowAlertModal(true)}
                title="View Stock Alerts"
              >
                <FaBell />
                {alerts.length > 0 && <span className="xp-alert-badge">{alerts.length}</span>}
              </button>
              <button
                className="xp-bulk-stock-btn"
                onClick={() => {
                  setUploadType('inventory');
                  setShowBulkUploadModal(true);
                }}
                title="Bulk add stock for multiple products at once"
              >
                <FaUpload /> Bulk Add Stock
              </button>
              <button
                className="xp-upload-btn"
                onClick={() => {
                  setUploadType('products');
                  setShowBulkUploadModal(true);
                }}
                title="Bulk create new products"
              >
                <FaBox /> Bulk Add Products
              </button>
              <button className="xp-add-stock-btn" onClick={() => setShowAddStockModal(true)}>
                <FaPlus /> Add Stock
              </button>
              <button className="xp-add-product-btn" onClick={() => setShowAddProductModal(true)}>
                <FaPlus /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="xp-data-table">
          {isLoading ? (
            <div className="xp-loading-container">
              <div className="xp-loading-spinner large"></div>
              <p>Loading inventory...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>ML</th>
                  <th>Quantity (KG)</th>
                  <th>Avg Price (₹/KG)</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="xp-empty-state">
                        <FaBox className="xp-empty-icon" />
                        <p>No products found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.minStock);
                    const isExpanded = expandedRowId === item.xpId;

                    return (
                      <React.Fragment key={item.xpId}>
                        <tr
                          className={`xp-product-row ${isExpanded ? 'xp-row-expanded' : ''}`}
                          onClick={() => handleRowClick(item.xpId)}
                        >
                          <td className="xp-name-cell">
                            <span className="xp-name-cell-content">
                              <FaChevronRight className={`xp-expand-chevron ${isExpanded ? 'xp-chevron-open' : ''}`} />
                              {item.productName}
                            </span>
                          </td>
                          <td className="xp-ml-cell">{item.ml}ml</td>
                          <td className="xp-qty-cell">{item.quantity}</td>
                          <td className="xp-price-cell">
                            ₹{item.avgPurchasePrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="xp-min-cell">{item.minStock}</td>
                          <td>
                            <span className={`xp-status-badge xp-status-${status.status}`}>
                              <span className="xp-status-dot"></span>
                              {status.label}
                            </span>
                          </td>
                          <td>
                            <div className="xp-row-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="xp-edit-btn"
                                onClick={() => openEditModal(item)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="xp-delete-btn"
                                onClick={() => openDeleteModal(item)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="xp-transaction-row">
                            <td colSpan="7">
                              <TransactionPanel
                                transactions={transactionsByXpId[item.xpId]}
                                isLoading={loadingTransactionsId === item.xpId}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modals */}
        <AddProductModal
          show={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateProduct}
        />

        <AddStockModal
          show={showAddStockModal}
          onClose={() => setShowAddStockModal(false)}
          products={inventory}
          addStockData={addStockData}
          setAddStockData={setAddStockData}
          isSubmitting={isSubmitting}
          onSubmit={handleAddStock}
        />

        <EditProductModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          editData={editData}
          setEditData={setEditData}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdateProduct}
        />

        <DeleteConfirmModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onConfirm={handleDeleteProduct}
          isDeleting={isDeleting}
        />

        <BulkUploadModal
          show={showBulkUploadModal}
          onClose={() => {
            setShowBulkUploadModal(false);
            setSelectedFile(null);
          }}
          fileInputRef={fileInputRef}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onDownloadTemplate={handleDownloadTemplate}
          isSubmitting={isSubmitting}
          onSubmit={handleBulkUpload}
          uploadType={uploadType}
          setUploadType={setUploadType}
        />

        <ErrorModal
          show={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
            setBulkErrors([]);
            setBulkSuccessDetails([]);
          }}
          bulkSuccessCount={bulkSuccessCount}
          bulkErrorCount={bulkErrorCount}
          bulkSuccessDetails={bulkSuccessDetails}
          bulkErrors={bulkErrors}
          onDownloadErrorExcel={handleDownloadErrorExcel}
        />

        <AlertModal
          show={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          alerts={alerts}
        />

      </div>
    </Navbar>
  );
};

export default XPInventory;