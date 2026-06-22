import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  FaBox, FaPlus, FaSearch, FaFileExcel,
  FaUpload, FaDownload, FaEdit, FaTrash,
  FaTimes, FaBell,
  FaCheckCircle, FaTimesCircle, FaMoneyBillWave,
  FaChevronDown, FaChevronUp, FaHistory, FaUser, FaCalendarAlt, FaArrowUp
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import "./DispenserInventory.scss";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';

// ============================================
// ADD PRODUCT MODAL
// ============================================
const AddProductModal = ({
  show, onClose, newProduct, setNewProduct,
  isSubmitting, onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaPlus /> Add Product
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-form-row">
            <div className="di-form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={newProduct.productName}
                onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                placeholder="Enter product name"
                autoComplete="off"
              />
            </div>
            <div className="di-form-field">
              <label>ML *</label>
              <select
                value={newProduct.ml}
                onChange={(e) => setNewProduct({ ...newProduct, ml: e.target.value })}
              >
                <option value="">Select ML</option>
                <option value="3">3 ml</option>
                <option value="6">6 ml</option>
              </select>
            </div>
          </div>
          <div className="di-form-row">
            <div className="di-form-field">
              <label>Selling Price (₹/KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={newProduct.sellingPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                placeholder="Enter selling price per KG"
                autoComplete="off"
              />
            </div>
            <div className="di-form-field">
              <label>Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={newProduct.discount}
                onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                placeholder="Enter discount (0-100)"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="di-modal-footer">
          <button className="di-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="di-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !newProduct.productName.trim() || !newProduct.ml || !newProduct.sellingPrice}
          >
            {isSubmitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADD STOCK MODAL
// ============================================
const AddStockModal = ({
  show, onClose, products, addStockData, setAddStockData,
  isSubmitting, onSubmit
}) => {
  if (!show) return null;

  const selectedProduct = products.find(p => p.dispenserId === addStockData.dispenserId);

  return (
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaPlus /> Add Stock
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-form-row">
            <div className="di-form-field">
              <label>Select Product *</label>
              <select
                value={addStockData.dispenserId}
                onChange={(e) => {
                  const product = products.find(p => p.dispenserId === e.target.value);
                  setAddStockData({
                    ...addStockData,
                    dispenserId: e.target.value,
                    productName: product?.productName || '',
                    ml: product?.ml || '',
                    sellingPrice: product?.sellingPrice || '',
                    discount: product?.discount || ''
                  });
                }}
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.dispenserId} value={p.dispenserId}>
                    {p.productName} - {p.ml}ml
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div className="di-current-stock-info">
              <span>Current Stock: <strong>{selectedProduct.quantity} KG</strong></span>
              <span>Avg Price: <strong>₹{selectedProduct.avgPurchasePrice?.toFixed(2) || '0.00'}/KG</strong></span>
              <span>Selling Price: <strong>₹{selectedProduct.sellingPrice}/KG</strong></span>
              <span>Discount: <strong>{selectedProduct.discount || 0}%</strong></span>
            </div>
          )}

          <div className="di-form-row">
            <div className="di-form-field">
              <label>Quantity (KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={addStockData.quantity}
                onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
                placeholder="Enter quantity in KG"
                autoComplete="off"
              />
            </div>
            <div className="di-form-field">
              <label>Purchase Price (₹/KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={addStockData.purchasePrice}
                onChange={(e) => setAddStockData({ ...addStockData, purchasePrice: e.target.value })}
                placeholder="Enter price per KG"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="di-form-row">
            <div className="di-form-field">
              <label>Notes (Optional)</label>
              <input
                type="text"
                value={addStockData.notes}
                onChange={(e) => setAddStockData({ ...addStockData, notes: e.target.value })}
                placeholder="Add notes..."
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="di-modal-footer">
          <button className="di-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="di-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !addStockData.dispenserId || !addStockData.quantity || !addStockData.purchasePrice}
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
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaEdit /> Edit Product
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-form-row">
            <div className="di-form-field">
              <label>Product Name *</label>
              <input
                type="text"
                value={editData.productName}
                onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
                placeholder="Enter product name"
                autoComplete="off"
              />
            </div>
            <div className="di-form-field">
              <label>ML *</label>
              <select
                value={editData.ml}
                onChange={(e) => setEditData({ ...editData, ml: e.target.value })}
              >
                <option value="">Select ML</option>
                <option value="3">3 ml</option>
                <option value="6">6 ml</option>
              </select>
            </div>
          </div>
          <div className="di-form-row">
            <div className="di-form-field">
              <label>Selling Price (₹/KG) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={editData.sellingPrice}
                onChange={(e) => setEditData({ ...editData, sellingPrice: e.target.value })}
                placeholder="Enter selling price per KG"
                autoComplete="off"
              />
            </div>
            <div className="di-form-field">
              <label>Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editData.discount}
                onChange={(e) => setEditData({ ...editData, discount: e.target.value })}
                placeholder="Enter discount (0-100)"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="di-modal-footer">
          <button className="di-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="di-btn-primary"
            onClick={onSubmit}
            disabled={isSubmitting || !editData.productName.trim() || !editData.ml || !editData.sellingPrice}
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// BULK UPLOAD MODAL
// ============================================
const BulkUploadModal = ({
  show, onClose, fileInputRef, selectedFile, onFileChange,
  onDownloadTemplate, isSubmitting, onSubmit, uploadType,
  setUploadType
}) => {
  if (!show) return null;

  return (
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaUpload /> Bulk Upload
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-upload-area">
            <div className="di-form-row">
              <div className="di-form-field">
                <label>Upload Type *</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="products">Products (Name + ML + Selling Price + Discount)</option>
                  <option value="inventory">Inventory (Name + ML + Qty + Purchase Price)</option>
                </select>
              </div>
            </div>

            <p className="di-upload-hint">
              {uploadType === 'products'
                ? 'File should have columns: Product Name, ML, Selling Price, Discount (optional)'
                : 'File should have columns: Product Name, ML, Quantity, Purchase Price'}
            </p>

            <div className="di-file-drop">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
              />
              {selectedFile && (
                <div className="di-file-info">
                  <FaFileExcel /> {selectedFile.name}
                </div>
              )}
            </div>

            <button className="di-btn-download" onClick={onDownloadTemplate}>
              <FaDownload /> Download Template
            </button>
          </div>
        </div>
        <div className="di-modal-footer">
          <button className="di-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="di-btn-primary"
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
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content di-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaFileExcel /> Bulk Upload Results
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-upload-summary">
            <div className="di-summary-success">
              <FaCheckCircle />
              <strong>Success:</strong> {bulkSuccessCount} items added
            </div>
            <div className={`di-summary-error ${hasErrors ? 'has-errors' : 'no-errors'}`}>
              <FaTimesCircle />
              <strong>Failed:</strong> {bulkErrorCount} items
            </div>
          </div>

          {hasSuccess && bulkSuccessDetails && bulkSuccessDetails.length > 0 && (
            <div className="di-result-section">
              <h4 className="di-result-heading di-result-success">
                <FaCheckCircle /> Successfully Added ({bulkSuccessDetails.length})
              </h4>
              <div className="di-result-table-wrap">
                <table className="di-result-table di-success-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Product Name</th>
                      <th>ML</th>
                      {bulkSuccessDetails[0]?.quantity !== undefined ? (
                        <>
                          <th>Quantity</th>
                          <th>Purchase Price</th>
                          <th>New Stock</th>
                        </>
                      ) : (
                        <>
                          <th>Selling Price</th>
                          <th>Discount</th>
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
                        {item.quantity !== undefined ? (
                          <>
                            <td>{item.quantity} KG</td>
                            <td>₹{item.purchasePrice}/KG</td>
                            <td className="di-success-cell">{item.newStock} KG</td>
                          </>
                        ) : (
                          <>
                            <td className="di-success-cell">₹{item.sellingPrice}/KG</td>
                            <td className="di-success-cell">{item.discount || 0}%</td>
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
            <div className="di-result-section">
              <h4 className="di-result-heading di-result-error">
                <FaTimesCircle /> Failed ({bulkErrors.length})
              </h4>
              <div className="di-result-table-wrap">
                <table className="di-result-table di-error-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Product Name</th>
                      <th>ML</th>
                      {bulkErrors[0]?.quantity !== undefined ? (
                        <>
                          <th>Quantity</th>
                          <th>Purchase Price</th>
                        </>
                      ) : (
                        <>
                          <th>Selling Price</th>
                          <th>Discount</th>
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
                        {err.quantity !== undefined ? (
                          <>
                            <td>{err.quantity || '-'}</td>
                            <td>{err.purchasePrice || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td>{err.sellingPrice || '-'}</td>
                            <td>{err.discount !== undefined ? err.discount : '-'}</td>
                          </>
                        )}
                        <td className="di-error-cell">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasErrors && (
            <button className="di-btn-download-error" onClick={onDownloadErrorExcel}>
              <FaDownload /> Download Error Report
            </button>
          )}
        </div>
        <div className="di-modal-footer">
          <button className="di-btn-primary" onClick={onClose}>
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
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content di-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header">
          <div className="di-modal-title">
            <FaBell /> Stock Alerts
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          {alerts.length === 0 ? (
            <div className="di-alert-empty-state">
              <FaBell />
              <p>All stock levels are healthy!</p>
            </div>
          ) : (
            <>
              {emptyItems.length > 0 && (
                <div className="di-alert-section">
                  <h4 className="di-alert-heading-empty">Empty Stock (0)</h4>
                  <div className="di-alert-list">
                    {emptyItems.map((item, index) => (
                      <div key={index} className="di-alert-item di-alert-empty">
                        <span>{item.productName} - {item.ml}ml</span>
                        <span>Quantity: {item.quantity} KG</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {lowStockItems.length > 0 && (
                <div className="di-alert-section">
                  <h4 className="di-alert-heading-low">Low Stock (Below {alerts[0]?.minStock || 5} KG)</h4>
                  <div className="di-alert-list">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="di-alert-item di-alert-low">
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
        <div className="di-modal-footer">
          <button className="di-btn-primary" onClick={onClose}>
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
    <div className="di-modal-overlay" onClick={onClose}>
      <div className="di-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="di-modal-header di-modal-header-danger">
          <div className="di-modal-title">
            <FaTrash /> Confirm Delete
          </div>
          <button className="di-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="di-modal-body">
          <div className="di-delete-body">
            <div className="di-delete-icon">
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
        <div className="di-modal-footer">
          <button className="di-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="di-btn-delete"
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
// TRANSACTION HISTORY ROW (expanded inline below the product row)
// Shows every "IN" transaction — qty added, purchase price, who added,
// when added, and notes — for the clicked product.
// ============================================
const TransactionHistoryRow = ({ colSpan, isLoading, transactions }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <tr className="di-expand-row">
      <td colSpan={colSpan}>
        <div className="di-expand-content">
          <h4 className="di-expand-title">
            <FaHistory /> Stock Added History (IN Transactions)
          </h4>

          {isLoading ? (
            <div className="di-expand-loading">
              <div className="di-loading-spinner small"></div>
              <span>Loading transaction history...</span>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="di-expand-empty">
              <FaHistory className="di-expand-empty-icon" />
              <p>No stock has been added for this product yet</p>
            </div>
          ) : (
            <div className="di-transaction-table-wrap">
              <table className="di-transaction-table">
                <thead>
                  <tr>
                    <th><FaCalendarAlt /> Date &amp; Time</th>
                    <th><FaArrowUp /> Quantity Added</th>
                    <th><FaMoneyBillWave /> Purchase Price</th>
                    <th>Stock Before → After</th>
                    <th><FaUser /> Added By</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.transactionType === 'IN')
                    .map((t, idx) => (
                      <tr key={t.transactionId || idx}>
                        <td className="di-txn-date-cell">{formatDateTime(t.createdAt)}</td>
                        <td className="di-txn-qty-cell">
                          <span className="di-txn-qty-pill">
                            <FaArrowUp /> +{t.quantity} KG
                          </span>
                        </td>
                        <td className="di-txn-price-cell">₹{t.purchasePrice?.toFixed(2) || '0.00'}/KG</td>
                        <td className="di-txn-stock-cell">
                          {t.previousStock} KG <span className="di-txn-arrow">→</span> <strong>{t.newStock} KG</strong>
                        </td>
                        <td className="di-txn-user-cell">
                          {t.performedBy?.userName || '-'}
                          {t.performedBy?.userEmail && (
                            <div className="di-txn-user-email">{t.performedBy.userEmail}</div>
                          )}
                        </td>
                        <td className="di-txn-notes-cell">{t.notes || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const DispenserInventory = () => {
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
  const [newProduct, setNewProduct] = useState({ productName: "", ml: "", sellingPrice: "", discount: "0" });
  const [editData, setEditData] = useState({ dispenserId: "", productName: "", ml: "", sellingPrice: "", discount: "0" });
  const [addStockData, setAddStockData] = useState({
    dispenserId: "",
    productName: "",
    ml: "",
    sellingPrice: "",
    discount: "",
    quantity: "",
    purchasePrice: "",
    notes: ""
  });

  // Bulk upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("products");
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
  const [bulkErrorCount, setBulkErrorCount] = useState(0);
  const [bulkSuccessDetails, setBulkSuccessDetails] = useState([]);
  const [bulkUploadId, setBulkUploadId] = useState("");

  // Expandable row states (transaction history)
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [transactionCache, setTransactionCache] = useState({}); // { [dispenserId]: transactions[] }
  const [loadingTransactionsFor, setLoadingTransactionsFor] = useState(null);

  const fileInputRef = useRef(null);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dispenser/get-all`,
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
        `${import.meta.env.VITE_API_URL}/dispenser/get-alerts`,
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
  // FETCH TRANSACTIONS FOR A PRODUCT (on row expand)
  // ============================================
  const fetchTransactionsForProduct = async (dispenserId) => {
    try {
      setLoadingTransactionsFor(dispenserId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dispenser/get-transactions?dispenserId=${dispenserId}&limit=200&page=1`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch transaction history');

      const data = await response.json();

      setTransactionCache(prev => ({
        ...prev,
        [dispenserId]: data.transactions || []
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
      setTransactionCache(prev => ({
        ...prev,
        [dispenserId]: []
      }));
    } finally {
      setLoadingTransactionsFor(null);
    }
  };

  // ============================================
  // TOGGLE ROW EXPAND
  // ============================================
  const handleToggleRow = (dispenserId) => {
    if (expandedRowId === dispenserId) {
      setExpandedRowId(null);
      return;
    }

    setExpandedRowId(dispenserId);

    // Always refetch fresh data on open (keeps history accurate after add-stock)
    fetchTransactionsForProduct(dispenserId);
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

      if (!newProduct.sellingPrice || parseFloat(newProduct.sellingPrice) <= 0) {
        toast.error("Please enter valid selling price");
        return;
      }

      const discountValue = parseFloat(newProduct.discount) || 0;
      if (discountValue < 0 || discountValue > 100) {
        toast.error("Discount must be between 0 and 100");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dispenser/create-product`,
        {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: newProduct.productName.trim(),
            ml: parseInt(newProduct.ml),
            sellingPrice: parseFloat(newProduct.sellingPrice),
            discount: discountValue
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const result = await response.json();
      toast.success(result.message);

      setNewProduct({ productName: "", ml: "", sellingPrice: "", discount: "0" });
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
      if (!addStockData.dispenserId) {
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
        `${import.meta.env.VITE_API_URL}/dispenser/add-stock`,
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

      const updatedDispenserId = addStockData.dispenserId;

      setAddStockData({
        dispenserId: "",
        productName: "",
        ml: "",
        sellingPrice: "",
        discount: "",
        quantity: "",
        purchasePrice: "",
        notes: ""
      });
      setShowAddStockModal(false);
      await fetchInventory();
      await fetchAlerts();

      // If this product's row is currently expanded, refresh its transaction history
      if (expandedRowId === updatedDispenserId) {
        fetchTransactionsForProduct(updatedDispenserId);
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

      if (!editData.sellingPrice || parseFloat(editData.sellingPrice) <= 0) {
        toast.error("Please enter valid selling price");
        return;
      }

      const discountValue = parseFloat(editData.discount) || 0;
      if (discountValue < 0 || discountValue > 100) {
        toast.error("Discount must be between 0 and 100");
        return;
      }

      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dispenser/update/${editData.dispenserId}`,
        {
          method: "PUT",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: editData.productName.trim(),
            ml: parseInt(editData.ml),
            sellingPrice: parseFloat(editData.sellingPrice),
            discount: discountValue
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const result = await response.json();
      toast.success(result.message);

      setEditData({ dispenserId: "", productName: "", ml: "", sellingPrice: "", discount: "0" });
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
        `${import.meta.env.VITE_API_URL}/dispenser/delete/${selectedProduct.dispenserId}`,
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

      // If the deleted product's row was expanded, collapse it
      if (expandedRowId === selectedProduct.dispenserId) {
        setExpandedRowId(null);
      }

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
        ? `${import.meta.env.VITE_API_URL}/dispenser/bulk-upload-products`
        : `${import.meta.env.VITE_API_URL}/dispenser/bulk-upload-inventory`;

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

      // If the bulk upload touched the currently expanded product, refresh it
      if (expandedRowId) {
        fetchTransactionsForProduct(expandedRowId);
      }

    } catch (error) {
      console.error("Error in bulk upload:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadErrorExcel = () => {
    try {
      if (!bulkErrors || bulkErrors.length === 0) {
        toast.error("No errors to download");
        return;
      }

      const errorData = bulkErrors.map(err => ({
        'Row': err.row || '',
        'Product Name': err.productName || '',
        'ML': err.ml || '',
        'Selling Price': err.sellingPrice || '',
        'Discount (%)': err.discount || '',
        'Error Reason': err.error || 'Unknown error'
      }));

      const worksheetData = [
        ['Row', 'Product Name', 'ML', 'Selling Price', 'Discount (%)', 'Error Reason'],
        ...errorData.map(item => [
          item['Row'],
          item['Product Name'],
          item['ML'],
          item['Selling Price'],
          item['Discount (%)'],
          item['Error Reason']
        ])
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      ws['!cols'] = [
        { wch: 8 },
        { wch: 35 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 50 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Errors');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dispenser_bulk_upload_errors.xlsx';
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
        `${import.meta.env.VITE_API_URL}/dispenser/download-template/${uploadType}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = uploadType === 'products'
        ? 'dispenser_products_template.xlsx'
        : 'dispenser_inventory_template.xlsx';
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
      dispenserId: product.dispenserId,
      productName: product.productName,
      ml: product.ml.toString(),
      sellingPrice: product.sellingPrice?.toString() || '',
      discount: product.discount?.toString() || '0'
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
      <div className="di-main">

        {/* Page Header */}
        <div className="di-page-header">
          <h2>Dispenser Inventory Management</h2>
          <div className="di-right-section">
            <div className="di-search-container">
              <FaSearch className="di-search-icon" />
              <input
                type="text"
                placeholder="Search by Product Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="di-action-buttons-group">
              <button
                className="di-alert-btn"
                onClick={() => setShowAlertModal(true)}
                title="View Stock Alerts"
              >
                <FaBell />
                {alerts.length > 0 && <span className="di-alert-badge">{alerts.length}</span>}
              </button>
              <button className="di-upload-btn" onClick={() => setShowBulkUploadModal(true)}>
                <FaUpload /> Bulk Upload
              </button>
              <button className="di-add-stock-btn" onClick={() => setShowAddStockModal(true)}>
                <FaPlus /> Add Stock
              </button>
              <button className="di-add-product-btn" onClick={() => setShowAddProductModal(true)}>
                <FaPlus /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="di-data-table">
          {isLoading ? (
            <div className="di-loading-container">
              <div className="di-loading-spinner large"></div>
              <p>Loading inventory...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '34px' }}></th>
                  <th>Product Name</th>
                  <th>ML</th>
                  <th>Quantity (KG)</th>
                  <th>Avg Price (₹/KG)</th>
                  <th>Selling Price (₹/KG)</th>
                  <th>Discount (%)</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="di-empty-state">
                        <FaBox className="di-empty-icon" />
                        <p>No products found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.minStock);
                    const isExpanded = expandedRowId === item.dispenserId;
                    return (
                      <React.Fragment key={item.dispenserId}>
                        <tr
                          className={`di-clickable-row ${isExpanded ? 'di-row-expanded' : ''}`}
                          onClick={() => handleToggleRow(item.dispenserId)}
                        >
                          <td className="di-expand-toggle-cell">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </td>
                          <td className="di-name-cell">{item.productName}</td>
                          <td className="di-ml-cell">{item.ml}ml</td>
                          <td className="di-qty-cell">{item.quantity}</td>
                          <td className="di-price-cell">
                            ₹{item.avgPurchasePrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="di-selling-price-cell">
                            ₹{item.sellingPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="di-discount-cell">
                            {item.discount || 0}%
                          </td>
                          <td className="di-min-cell">{item.minStock}</td>
                          <td>
                            <span className={`di-status-badge di-status-${status.status}`}>
                              <span className="di-status-dot"></span>
                              {status.label}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="di-row-actions">
                              <button
                                className="di-edit-btn"
                                onClick={() => openEditModal(item)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="di-delete-btn"
                                onClick={() => openDeleteModal(item)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <TransactionHistoryRow
                            colSpan={10}
                            isLoading={loadingTransactionsFor === item.dispenserId}
                            transactions={transactionCache[item.dispenserId]}
                          />
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

export default DispenserInventory;