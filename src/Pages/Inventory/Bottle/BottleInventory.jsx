import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaBox, FaPlus, FaSearch, FaFileExcel,
    FaUpload, FaDownload, FaTimes, FaBell,
    FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight,
    FaChevronRight as FaExpandChevron, FaHistory, FaArrowUp, FaArrowDown,
    FaUser, FaCalendarAlt, FaClock, FaTag, FaInfoCircle, FaTrashAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import "./BottleInventory.scss";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from 'xlsx';

// ============================================
// ADD STOCK MODAL
// ============================================
const AddStockModal = ({
    show, onClose, mlSizes, itemTypes,
    addStockData, setAddStockData, isSubmitting, onSubmit
}) => {
    if (!show) return null;

    return (
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaPlus /> Add Stock
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    <div className="bi-form-row">
                        <div className="bi-form-field">
                            <label>ML Size *</label>
                            <select
                                value={addStockData.mlSize}
                                onChange={(e) => setAddStockData({ ...addStockData, mlSize: e.target.value })}
                            >
                                <option value="">Select ML Size</option>
                                {mlSizes.map(ml => (
                                    <option key={ml} value={ml}>{ml}</option>
                                ))}
                            </select>
                        </div>
                        <div className="bi-form-field">
                            <label>Item Type *</label>
                            <select
                                value={addStockData.itemType}
                                onChange={(e) => setAddStockData({ ...addStockData, itemType: e.target.value })}
                            >
                                <option value="">Select Item Type</option>
                                {itemTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="bi-form-row">
                        <div className="bi-form-field">
                            <label>Quantity *</label>
                            <input
                                type="number"
                                min="1"
                                value={addStockData.quantity}
                                onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
                                placeholder="Enter quantity"
                                autoComplete="off"
                            />
                        </div>
                        <div className="bi-form-field">
                            <label>Reason</label>
                            <select
                                value={addStockData.reason}
                                onChange={(e) => setAddStockData({ ...addStockData, reason: e.target.value })}
                            >
                                <option value="Purchase">Purchase</option>
                                <option value="Return">Return</option>
                                <option value="Adjustment">Adjustment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bi-btn-primary" onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// ADD ML MODAL
// ============================================
const AddMLModal = ({ show, onClose, newML, setNewML, isSubmitting, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaPlus /> Add ML Size
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    <div className="bi-form-row">
                        <div className="bi-form-field">
                            <label>ML Size *</label>
                            <input
                                type="text"
                                value={newML}
                                onChange={(e) => setNewML(e.target.value)}
                                placeholder="Enter ML size (e.g., 200)"
                                autoComplete="off"
                            />
                            <small className="bi-field-hint">
                                This will create entries for all existing item types with 0 stock
                            </small>
                        </div>
                    </div>
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bi-btn-primary" onClick={onSubmit} disabled={isSubmitting || !newML.trim()}>
                        {isSubmitting ? "Adding..." : "Add ML Size"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// ADD ITEM TYPE MODAL
// ============================================
const AddItemModal = ({ show, onClose, newItemType, setNewItemType, isSubmitting, onSubmit }) => {
    if (!show) return null;

    return (
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaPlus /> Add Item Type
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    <div className="bi-form-row">
                        <div className="bi-form-field">
                            <label>Item Type *</label>
                            <input
                                type="text"
                                value={newItemType}
                                onChange={(e) => setNewItemType(e.target.value)}
                                placeholder="Enter item type (e.g., Label)"
                                autoComplete="off"
                            />
                            <small className="bi-field-hint">
                                This will create entries for all existing ML sizes with 0 stock
                            </small>
                        </div>
                    </div>
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bi-btn-primary" onClick={onSubmit} disabled={isSubmitting || !newItemType.trim()}>
                        {isSubmitting ? "Adding..." : "Add Item Type"}
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
    onDownloadTemplate, isSubmitting, onSubmit
}) => {
    if (!show) return null;

    return (
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaUpload /> Bulk Upload
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    <div className="bi-upload-area">
                        <p>Upload Excel file with inventory data</p>
                        <p className="bi-upload-hint">
                            File should have columns: ML Size, Item Type, Quantity
                        </p>
                        <div className="bi-file-drop">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={onFileChange}
                            />
                            {selectedFile && (
                                <div className="bi-file-info">
                                    <FaFileExcel /> {selectedFile.name}
                                </div>
                            )}
                        </div>
                        <button className="bi-btn-download" onClick={onDownloadTemplate}>
                            <FaDownload /> Download Template
                        </button>
                    </div>
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bi-btn-primary" onClick={onSubmit} disabled={isSubmitting || !selectedFile}>
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
    show,
    onClose,
    bulkSuccessCount,
    bulkErrorCount,
    bulkSuccessDetails,
    bulkErrors,
    onDownloadErrorExcel
}) => {
    if (!show) return null;

    const hasErrors = bulkErrors && bulkErrors.length > 0;
    const hasSuccess = bulkSuccessCount > 0;

    return (
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content bi-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaFileExcel /> Bulk Upload Results
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    <div className="bi-upload-summary">
                        <div className="bi-summary-success">
                            <FaCheckCircle />
                            <strong>Success:</strong> {bulkSuccessCount} items added
                        </div>
                        <div className={`bi-summary-error ${hasErrors ? 'has-errors' : 'no-errors'}`}>
                            <FaTimesCircle />
                            <strong>Failed:</strong> {bulkErrorCount} items
                        </div>
                    </div>

                    {hasSuccess && bulkSuccessDetails && bulkSuccessDetails.length > 0 && (
                        <div className="bi-result-section">
                            <h4 className="bi-result-heading bi-result-success">
                                <FaCheckCircle /> Successfully Added ({bulkSuccessDetails.length})
                            </h4>
                            <div className="bi-result-table-wrap">
                                <table className="bi-result-table bi-success-table">
                                    <thead>
                                        <tr>
                                            <th>Row</th>
                                            <th>ML Size</th>
                                            <th>Item Type</th>
                                            <th>Quantity</th>
                                            <th>New Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkSuccessDetails.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.row}</td>
                                                <td>{item.mlSize}</td>
                                                <td>{item.itemType}</td>
                                                <td>{item.quantity}</td>
                                                <td className="bi-success-cell">{item.newStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {hasErrors && (
                        <div className="bi-result-section">
                            <h4 className="bi-result-heading bi-result-error">
                                <FaTimesCircle /> Failed ({bulkErrors.length})
                            </h4>
                            <div className="bi-result-table-wrap">
                                <table className="bi-result-table bi-error-table">
                                    <thead>
                                        <tr>
                                            <th>Row</th>
                                            <th>ML Size</th>
                                            <th>Item Type</th>
                                            <th>Quantity</th>
                                            <th>Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkErrors.map((err, index) => (
                                            <tr key={index}>
                                                <td>{err.row}</td>
                                                <td>{err.mlSize || '-'}</td>
                                                <td>{err.itemType || '-'}</td>
                                                <td>{err.quantity || '-'}</td>
                                                <td className="bi-error-cell">{err.error}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {hasErrors && (
                        <button className="bi-btn-download-error" onClick={onDownloadErrorExcel}>
                            <FaDownload /> Download Error Report
                        </button>
                    )}
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-primary" onClick={onClose}>
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
        <div className="bi-modal-overlay" onClick={onClose}>
            <div className="bi-modal-content bi-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="bi-modal-header">
                    <div className="bi-modal-title">
                        <FaBell /> Stock Alerts
                    </div>
                    <button className="bi-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-modal-body">
                    {alerts.length === 0 ? (
                        <div className="bi-alert-empty-state">
                            <FaBell />
                            <p>All stock levels are healthy!</p>
                        </div>
                    ) : (
                        <>
                            {emptyItems.length > 0 && (
                                <div className="bi-alert-section">
                                    <h4 className="bi-alert-heading-empty">Empty Stock (0)</h4>
                                    <div className="bi-alert-list">
                                        {emptyItems.map((item, index) => (
                                            <div key={index} className="bi-alert-item bi-alert-empty">
                                                <span>{item.mlSize} - {item.itemType}</span>
                                                <span>Quantity: {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {lowStockItems.length > 0 && (
                                <div className="bi-alert-section">
                                    <h4 className="bi-alert-heading-low">Low Stock (Below {alerts[0]?.minStock || 5})</h4>
                                    <div className="bi-alert-list">
                                        {lowStockItems.map((item, index) => (
                                            <div key={index} className="bi-alert-item bi-alert-low">
                                                <span>{item.mlSize} - {item.itemType}</span>
                                                <span>Quantity: {item.quantity} / Min: {item.minStock}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="bi-modal-footer">
                    <button className="bi-btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// DISPOSAL HISTORY PANEL - SINGLE ROW
// ============================================
const DisposalHistoryPanel = ({ disposals, isLoading, onClose }) => {
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (isLoading) {
        return (
            <div className="bi-disposal-panel">
                <div className="bi-disposal-loading">
                    <div className="bi-loading-spinner tiny"></div>
                    Loading disposal history...
                </div>
            </div>
        );
    }

    if (!disposals || disposals.length === 0) {
        return (
            <div className="bi-disposal-panel">
                <div className="bi-disposal-header">
                    <h5><FaTrashAlt /> Disposal History</h5>
                    <button className="bi-disposal-close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="bi-disposal-empty">No disposal records found for this item.</div>
            </div>
        );
    }

    return (
        <div className="bi-disposal-panel">
            <div className="bi-disposal-header">
                <h5><FaTrashAlt /> Disposal History ({disposals.length})</h5>
                <button className="bi-disposal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>
            <div className="bi-disposal-list">
                {disposals.map((d, idx) => {
                    const { date, time } = formatDateTime(d.disposedAt);
                    return (
                        <div key={d.disposalEntryId || idx} className="bi-disposal-item">
                            {/* SINGLE ROW - ALL FIELDS */}
                            <div className="bi-disposal-row">
                                <span className="bi-disposal-label"><FaUser /> Disposed By:</span>
                                <span className="bi-disposal-value">{d.performedBy?.userName || 'Unknown'}</span>

                                <span className="bi-disposal-separator">|</span>

                                <span className="bi-disposal-label"><FaTag /> Reason:</span>
                                <span className="bi-disposal-value bi-disposal-reason">{d.reason || 'N/A'}</span>

                                <span className="bi-disposal-separator">|</span>

                                <span className="bi-disposal-label"><FaCalendarAlt /> Date:</span>
                                <span className="bi-disposal-value">{date}</span>

                                <span className="bi-disposal-separator">|</span>

                                <span className="bi-disposal-label"><FaClock /> Time:</span>
                                <span className="bi-disposal-value">{time}</span>

                                <span className="bi-disposal-separator">|</span>

                                <span className="bi-disposal-label"><FaTrashAlt /> Quantity:</span>
                                <span className="bi-disposal-value bi-disposal-qty">-{d.disposedQuantity}</span>

                                {d.notes && (
                                    <>
                                        <span className="bi-disposal-separator">|</span>
                                        <span className="bi-disposal-label"><FaInfoCircle /> Notes:</span>
                                        <span className="bi-disposal-value">{d.notes}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================
// TRANSACTION PANEL - SINGLE ROW UPDATED
// ============================================
const TransactionPanel = ({ transactions, isLoading, onViewDisposal, hasDisposal }) => {
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // ✅ FILTER: Only show IN transactions
    const inTransactions = transactions?.filter(t => t.transactionType === 'IN') || [];

    if (isLoading) {
        return (
            <div className="bi-transaction-panel">
                <div className="bi-transaction-loading">
                    <div className="bi-loading-spinner tiny"></div>
                    Loading transaction history...
                </div>
            </div>
        );
    }

    if (inTransactions.length === 0) {
        return (
            <div className="bi-transaction-panel">
                <div className="bi-transaction-panel-header">
                    <h5><FaHistory /> Transaction History</h5>
                    {hasDisposal && (
                        <button className="bi-view-disposal-btn" onClick={onViewDisposal}>
                            <FaTrashAlt /> View Disposals
                        </button>
                    )}
                </div>
                <div className="bi-transaction-empty">No stock IN transactions recorded yet for this item.</div>
            </div>
        );
    }

    return (
        <div className="bi-transaction-panel">
            <div className="bi-transaction-panel-header">
                <h5><FaHistory /> Transaction History ({inTransactions.length})</h5>
                {hasDisposal && (
                    <button className="bi-view-disposal-btn" onClick={onViewDisposal}>
                        <FaTrashAlt /> View Disposals
                    </button>
                )}
            </div>
            <div className="bi-transaction-list">
                {inTransactions.map((t, idx) => {
                    const { date, time } = formatDateTime(t.createdAt);
                    return (
                        <div key={t.transactionId || idx} className="bi-transaction-item">
                            {/* SINGLE ROW - ALL FIELDS */}
                            <div className="bi-transaction-row">
                                <span className="bi-txn-label"><FaUser /> Name:</span>
                                <span className="bi-txn-value">{t.performedBy?.userName || 'Unknown'}</span>

                                <span className="bi-txn-separator">|</span>

                                <span className="bi-txn-label"><FaTag /> Reason:</span>
                                <span className="bi-txn-value">{t.reason || 'Purchase'}</span>

                                <span className="bi-txn-separator">|</span>

                                <span className="bi-txn-label"><FaCalendarAlt /> Date:</span>
                                <span className="bi-txn-value">{date}</span>

                                <span className="bi-txn-separator">|</span>

                                <span className="bi-txn-label"><FaClock /> Time:</span>
                                <span className="bi-txn-value">{time}</span>

                                <span className="bi-txn-separator">|</span>

                                <span className="bi-txn-label"><FaArrowUp /> Quantity:</span>
                                <span className="bi-txn-value bi-txn-qty">+{t.quantity}</span>

                                <span className="bi-txn-separator">|</span>

                                <span className="bi-txn-label"><FaBox /> Stock:</span>
                                <span className="bi-txn-value bi-txn-stock">
                                    {t.previousStock} → <strong>{t.newStock}</strong>
                                </span>

                                {t.notes && (
                                    <>
                                        <span className="bi-txn-separator">|</span>
                                        <span className="bi-txn-label"><FaInfoCircle /> Notes:</span>
                                        <span className="bi-txn-value">{t.notes}</span>
                                    </>
                                )}
                            </div>
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
const BottleInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [mlSizes, setMlSizes] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedML, setSelectedML] = useState("");
    const [selectedItemType, setSelectedItemType] = useState("");
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showAddMLModal, setShowAddMLModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Form states
    const [addStockData, setAddStockData] = useState({
        mlSize: "",
        itemType: "",
        quantity: "",
        reason: "Purchase"
    });
    const [newML, setNewML] = useState("");
    const [newItemType, setNewItemType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [bulkErrors, setBulkErrors] = useState([]);
    const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
    const [bulkErrorCount, setBulkErrorCount] = useState(0);
    const [bulkSuccessDetails, setBulkSuccessDetails] = useState([]);
    const [bulkUploadId, setBulkUploadId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Row expansion / transaction history states
    const [expandedRowKey, setExpandedRowKey] = useState(null);
    const [transactionsByRowKey, setTransactionsByRowKey] = useState({});
    const [loadingTransactionsKey, setLoadingTransactionsKey] = useState(null);

    // Disposal states
    const [showDisposalPanel, setShowDisposalPanel] = useState(false);
    const [disposalData, setDisposalData] = useState(null);
    const [loadingDisposal, setLoadingDisposal] = useState(false);
    const [currentDisposalRowKey, setCurrentDisposalRowKey] = useState(null);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // ============================================
    // ROW KEY HELPER
    // ============================================
    const getRowKey = (item) => `${item.mlSize}__${item.itemType}`;

    // ============================================
    // FETCH DATA WITH PAGINATION
    // ============================================
    const fetchInventory = async (page = 1, search = '', mlSize = '', itemType = '') => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                page: page,
                limit: 20,
                search: search,
                mlSize: mlSize,
                itemType: itemType
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/get-all?${queryParams}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                if (response.status === 401) navigate('/login');
                throw new Error('Failed to fetch inventory');
            }

            const data = await response.json();

            setInventory(data.inventory || []);
            setFilteredInventory(data.inventory || []);
            setPagination(data.pagination || {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            });
            setCurrentPage(data.pagination?.page || 1);

        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error("Failed to fetch inventory");
            setInventory([]);
            setFilteredInventory([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMLSizes = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/get-ml-sizes`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch ML sizes');
            const data = await response.json();
            setMlSizes(data);
        } catch (error) {
            console.error("Error fetching ML sizes:", error);
        }
    };

    const fetchItemTypes = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/get-item-types`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch item types');
            const data = await response.json();
            setItemTypes(data);
        } catch (error) {
            console.error("Error fetching item types:", error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/get-alerts?page=1&limit=100`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const data = await response.json();
            setAlerts(data.alerts || []);
        } catch (error) {
            console.error("Error fetching alerts:", error);
        }
    };

    useEffect(() => {
        fetchInventory(1, '', '', '');
        fetchMLSizes();
        fetchItemTypes();
        fetchAlerts();
    }, []);

    // ============================================
    // HANDLE SEARCH
    // ============================================
    const handleSearch = (term) => {
        setSearchTerm(term);
        fetchInventory(1, term, selectedML, selectedItemType);
    };

    // ============================================
    // HANDLE FILTER CHANGE
    // ============================================
    const handleFilterChange = (mlSize, itemType) => {
        setSelectedML(mlSize);
        setSelectedItemType(itemType);
        fetchInventory(1, searchTerm, mlSize, itemType);
    };

    // ============================================
    // HANDLE PAGE CHANGE
    // ============================================
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setCurrentPage(newPage);
        fetchInventory(newPage, searchTerm, selectedML, selectedItemType);
    };

    // ============================================
    // FETCH TRANSACTIONS FOR ROW
    // ============================================
    const fetchTransactionsForRow = async (item) => {
        const rowKey = getRowKey(item);
        try {
            setLoadingTransactionsKey(rowKey);
            const queryParams = new URLSearchParams({
                mlSize: item.mlSize,
                itemType: item.itemType,
                limit: 100,
                page: 1
            });

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/get-transactions?${queryParams}`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch transaction history');
            const data = await response.json();

            const sorted = [...(data.transactions || [])].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setTransactionsByRowKey(prev => ({ ...prev, [rowKey]: sorted }));
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to load transaction history");
            setTransactionsByRowKey(prev => ({ ...prev, [rowKey]: [] }));
        } finally {
            setLoadingTransactionsKey(null);
        }
    };

    // ============================================
    // FETCH DISPOSAL HISTORY
    // ============================================
    const fetchDisposalHistory = async (item) => {
        const rowKey = getRowKey(item);
        try {
            setLoadingDisposal(true);
            setCurrentDisposalRowKey(rowKey);

            // For bottles, we need to fetch disposal by inventoryItemId
            // Since bottles don't have a single ID, we need to use the bottleItemId
            const bottleItemId = item.bottleItemId;

            if (!bottleItemId) {
                toast.error("Cannot fetch disposal history: No item ID found");
                setDisposalData(null);
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/disposal/get-by-product/${bottleItemId}`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch disposal history');

            const data = await response.json();
            setDisposalData(data.data);
            setShowDisposalPanel(true);
        } catch (error) {
            console.error("Error fetching disposal history:", error);
            toast.error("Failed to load disposal history");
            setDisposalData(null);
        } finally {
            setLoadingDisposal(false);
        }
    };

    // ============================================
    // CHECK IF ITEM HAS DISPOSAL HISTORY
    // ============================================
    const checkHasDisposal = async (item) => {
        try {
            const bottleItemId = item.bottleItemId;
            if (!bottleItemId) return false;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/disposal/get-by-product/${bottleItemId}`,
                { credentials: 'include' }
            );
            if (!response.ok) return false;
            const data = await response.json();
            return data.data && data.data.disposals && data.data.disposals.length > 0;
        } catch (error) {
            return false;
        }
    };

    const handleRowClick = async (item) => {
        const rowKey = getRowKey(item);

        if (expandedRowKey === rowKey) {
            setExpandedRowKey(null);
            setShowDisposalPanel(false);
            setDisposalData(null);
            return;
        }

        setExpandedRowKey(rowKey);

        if (!transactionsByRowKey[rowKey]) {
            await fetchTransactionsForRow(item);
        }
    };

    // ============================================
    // ADD STOCK
    // ============================================
    const handleAddStock = async () => {
        try {
            if (!addStockData.mlSize) {
                toast.error("Please select ML size");
                return;
            }
            if (!addStockData.itemType) {
                toast.error("Please select item type");
                return;
            }
            if (!addStockData.quantity || parseInt(addStockData.quantity) <= 0) {
                toast.error("Please enter valid quantity");
                return;
            }

            setIsSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/add-stock`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mlSize: addStockData.mlSize,
                        itemType: addStockData.itemType,
                        quantity: parseInt(addStockData.quantity),
                        reason: addStockData.reason
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add stock");
            }

            const result = await response.json();
            toast.success(result.message);

            const updatedRowKey = `${addStockData.mlSize}__${addStockData.itemType}`;

            setAddStockData({ mlSize: "", itemType: "", quantity: "", reason: "Purchase" });
            setShowAddStockModal(false);
            await fetchInventory(currentPage, searchTerm, selectedML, selectedItemType);
            await fetchAlerts();

            if (expandedRowKey === updatedRowKey) {
                const updatedItem = inventory.find(
                    inv => inv.mlSize === addStockData.mlSize && inv.itemType === addStockData.itemType
                ) || { mlSize: addStockData.mlSize, itemType: addStockData.itemType };
                fetchTransactionsForRow(updatedItem);
            } else {
                setTransactionsByRowKey(prev => {
                    const next = { ...prev };
                    delete next[updatedRowKey];
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
    // ADD ML SIZE
    // ============================================
    const handleAddML = async () => {
        try {
            if (!newML.trim()) {
                toast.error("Please enter ML size");
                return;
            }

            setIsSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/add-ml`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ mlSize: newML.trim() })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add ML size");
            }

            const result = await response.json();
            toast.success(result.message);

            setNewML("");
            setShowAddMLModal(false);
            await fetchInventory(currentPage, searchTerm, selectedML, selectedItemType);
            await fetchMLSizes();

        } catch (error) {
            console.error("Error adding ML:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // ADD ITEM TYPE
    // ============================================
    const handleAddItemType = async () => {
        try {
            if (!newItemType.trim()) {
                toast.error("Please enter item type");
                return;
            }

            setIsSubmitting(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/add-item-type`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ itemType: newItemType.trim() })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add item type");
            }

            const result = await response.json();
            toast.success(result.message);

            setNewItemType("");
            setShowAddItemModal(false);
            await fetchInventory(currentPage, searchTerm, selectedML, selectedItemType);
            await fetchItemTypes();

        } catch (error) {
            console.error("Error adding item type:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
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

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bottles/bulk-upload`,
                {
                    method: "POST",
                    credentials: 'include',
                    body: formData
                }
            );

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
            await fetchInventory(currentPage, searchTerm, selectedML, selectedItemType);
            await fetchAlerts();

            setTransactionsByRowKey({});
            if (expandedRowKey) {
                const [mlSize, itemType] = expandedRowKey.split('__');
                fetchTransactionsForRow({ mlSize, itemType });
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
                'ML Size': err.mlSize || '',
                'Item Type': err.itemType || '',
                'Quantity': err.quantity || '',
                'Error Reason': err.error || 'Unknown error'
            }));

            const worksheetData = [
                ['ML Size', 'Item Type', 'Quantity', 'Error Reason'],
                ...errorData.map(item => [item['ML Size'], item['Item Type'], item['Quantity'], item['Error Reason']])
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(worksheetData);

            ws['!cols'] = [
                { wch: 15 },
                { wch: 15 },
                { wch: 12 },
                { wch: 40 }
            ];

            XLSX.utils.book_append_sheet(wb, ws, 'Errors');

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bulk_upload_errors.xlsx';
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
                `${import.meta.env.VITE_API_URL}/bottles/download-template`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to download template');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bottles_inventory_template.xlsx';
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
    // FORMAT HELPERS
    // ============================================
    const getStockStatus = (quantity, minStock) => {
        if (quantity <= 0) return { status: 'empty', label: 'Empty' };
        if (quantity <= minStock) return { status: 'low', label: 'Low Stock' };
        return { status: 'healthy', label: 'In Stock' };
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <Navbar>
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="bi-main">

                {/* Page Header */}
                <div className="bi-page-header">
                    <h2>Bottle Inventory Management</h2>
                    <div className="bi-right-section">
                        <div className="bi-search-container">
                            <FaSearch className="bi-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by ML or Item Type..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="bi-action-buttons-group">
                            <button
                                className="bi-alert-btn"
                                onClick={() => setShowAlertModal(true)}
                                title="View Stock Alerts"
                            >
                                <FaBell />
                                {alerts.length > 0 && <span className="bi-alert-badge">{alerts.length}</span>}
                            </button>
                            <button className="bi-add-ml-btn" onClick={() => setShowAddMLModal(true)}>
                                <FaPlus /> Add ML
                            </button>
                            <button className="bi-add-item-btn" onClick={() => setShowAddItemModal(true)}>
                                <FaPlus /> Add Item
                            </button>
                            <button className="bi-upload-btn" onClick={() => setShowBulkUploadModal(true)}>
                                <FaUpload /> Bulk Upload
                            </button>
                            <button className="bi-add-stock-btn" onClick={() => setShowAddStockModal(true)}>
                                <FaPlus /> Add Stock
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bi-filters">
                    <div className="bi-filter-group">
                        <label>Filter by ML:</label>
                        <select
                            value={selectedML}
                            onChange={(e) => handleFilterChange(e.target.value, selectedItemType)}
                        >
                            <option value="">All ML Sizes</option>
                            {mlSizes.map(ml => (
                                <option key={ml} value={ml}>{ml}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bi-filter-group">
                        <label>Filter by Item:</label>
                        <select
                            value={selectedItemType}
                            onChange={(e) => handleFilterChange(selectedML, e.target.value)}
                        >
                            <option value="">All Item Types</option>
                            {itemTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bi-data-table">
                    {isLoading ? (
                        <div className="bi-loading-container">
                            <div className="bi-loading-spinner large"></div>
                            <p>Loading inventory...</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ML Size</th>
                                    <th>Item Type</th>
                                    <th>Quantity</th>
                                    <th>Min Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="bi-empty-state">
                                                <FaBox className="bi-empty-icon" />
                                                <p>No inventory found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory.map((item) => {
                                        const status = getStockStatus(item.quantity, item.minStock);
                                        const rowKey = getRowKey(item);
                                        const isExpanded = expandedRowKey === rowKey;

                                        return (
                                            <React.Fragment key={item._id || rowKey}>
                                                <tr
                                                    className={`bi-product-row ${isExpanded ? 'bi-row-expanded' : ''}`}
                                                    onClick={() => handleRowClick(item)}
                                                >
                                                    <td className="bi-ml-cell">
                                                        <span className="bi-ml-cell-content">
                                                            <FaExpandChevron className={`bi-expand-chevron ${isExpanded ? 'bi-chevron-open' : ''}`} />
                                                            {item.mlSize}
                                                        </span>
                                                    </td>
                                                    <td className="bi-item-cell">
                                                        <span className="bi-item-icon"><FaBox /></span>
                                                        {item.itemType}
                                                    </td>
                                                    <td className="bi-qty-cell">{item.quantity}</td>
                                                    <td className="bi-min-cell">{item.minStock}</td>
                                                    <td>
                                                        <span className={`bi-status-badge bi-status-${status.status}`}>
                                                            <span className="bi-status-dot"></span>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <>
                                                        {/* Transaction Panel */}
                                                        <tr className="bi-transaction-row">
                                                            <td colSpan="5">
                                                                <TransactionPanel
                                                                    transactions={transactionsByRowKey[rowKey]}
                                                                    isLoading={loadingTransactionsKey === rowKey}
                                                                    onViewDisposal={() => fetchDisposalHistory(item)}
                                                                    hasDisposal={true}
                                                                />
                                                            </td>
                                                        </tr>

                                                        {/* Disposal Panel */}
                                                        {showDisposalPanel && currentDisposalRowKey === rowKey && (
                                                            <tr className="bi-transaction-row">
                                                                <td colSpan="5">
                                                                    <DisposalHistoryPanel
                                                                        disposals={disposalData?.disposals || []}
                                                                        isLoading={loadingDisposal}
                                                                        onClose={() => {
                                                                            setShowDisposalPanel(false);
                                                                            setDisposalData(null);
                                                                            setCurrentDisposalRowKey(null);
                                                                        }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 0 && (
                    <div className="bi-pagination">
                        <div className="bi-pagination-info">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
                        </div>
                        <div className="bi-pagination-controls">
                            <button
                                className="bi-pagination-btn"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrevPage}
                            >
                                <FaChevronLeft />
                            </button>

                            <div className="bi-pagination-pages">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            className={`bi-pagination-page ${pagination.page === pageNum ? 'bi-pagination-active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                className="bi-pagination-btn"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasNextPage}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* Modals */}
                <AddStockModal
                    show={showAddStockModal}
                    onClose={() => setShowAddStockModal(false)}
                    mlSizes={mlSizes}
                    itemTypes={itemTypes}
                    addStockData={addStockData}
                    setAddStockData={setAddStockData}
                    isSubmitting={isSubmitting}
                    onSubmit={handleAddStock}
                />

                <AddMLModal
                    show={showAddMLModal}
                    onClose={() => setShowAddMLModal(false)}
                    newML={newML}
                    setNewML={setNewML}
                    isSubmitting={isSubmitting}
                    onSubmit={handleAddML}
                />

                <AddItemModal
                    show={showAddItemModal}
                    onClose={() => setShowAddItemModal(false)}
                    newItemType={newItemType}
                    setNewItemType={setNewItemType}
                    isSubmitting={isSubmitting}
                    onSubmit={handleAddItemType}
                />

                <BulkUploadModal
                    show={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    fileInputRef={fileInputRef}
                    selectedFile={selectedFile}
                    onFileChange={handleFileChange}
                    onDownloadTemplate={handleDownloadTemplate}
                    isSubmitting={isSubmitting}
                    onSubmit={handleBulkUpload}
                />

                <ErrorModal
                    show={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
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

export default BottleInventory;