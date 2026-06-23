import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaBox, FaPlus, FaSearch, FaFileExcel,
    FaUpload, FaDownload, FaEdit, FaTrash,
    FaTimes, FaEye, FaFilter, FaBell,
    FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight
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
// ERROR MODAL (UPDATED - Shows Both Success & Error)
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
                    {/* Summary */}
                    <div className="bi-upload-summary">
                        <div className="bi-summary-success">
                            <FaCheckCircle style={{ color: '#28a745' }} />
                            <strong>Success:</strong> {bulkSuccessCount} items added
                        </div>
                        <div className={`bi-summary-error ${hasErrors ? 'has-errors' : 'no-errors'}`}>
                            <FaTimesCircle style={{ color: hasErrors ? '#dc3545' : '#95a5a6' }} />
                            <strong>Failed:</strong> {bulkErrorCount} items
                        </div>
                    </div>

                    {/* Success Details Table */}
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

                    {/* Error Details Table */}
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

                    {/* Download Button */}
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

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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

            setAddStockData({ mlSize: "", itemType: "", quantity: "", reason: "Purchase" });
            setShowAddStockModal(false);
            await fetchInventory(currentPage, searchTerm, selectedML, selectedItemType);
            await fetchAlerts();

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

    const getItemIcon = (itemType) => {
        const type = itemType?.toLowerCase() || '';
        if (type.includes('bottle')) return <FaBox />;
        if (type.includes('cap')) return <FaBox />;
        if (type.includes('pump')) return <FaBox />;
        if (type.includes('box')) return <FaBox />;
        return <FaBox />;
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
                                        return (
                                            <tr key={item._id}>
                                                <td className="bi-ml-cell">{item.mlSize}</td>
                                                <td className="bi-item-cell">
                                                    <span className="bi-item-icon">{getItemIcon(item.itemType)}</span>
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