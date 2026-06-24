import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaBox, FaSearch, FaTimes,
    FaTrash, FaHistory, FaExclamationTriangle,
    FaChevronLeft, FaChevronRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./ProductDisposal.scss";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// REASON OPTIONS (shared constant)
// ============================================
const REASON_OPTIONS = ["Damage", "Expired", "Broken", "Return", "Other"];

// ============================================
// DISPOSAL MODAL (top-level — stable identity, no focus loss)
// ============================================
const DisposalModal = ({
    show, onClose, product, inventoryType,
    disposalData, setDisposalData,
    isSubmitting, onSubmit
}) => {
    if (!show || !product) return null;

    const isBottles = inventoryType === 'bottles';

    const kg = parseFloat(disposalData.kg) || 0;
    const grams = parseFloat(disposalData.grams) || 0;
    const totalDisposalKg = kg + grams / 1000;
    const totalDisposalUnits = isBottles ? (parseInt(disposalData.kg) || 0) : totalDisposalKg;

    const exceedsStock = totalDisposalUnits > product.quantity;
    const hasEnteredQuantity = isBottles ? disposalData.kg !== "" : (disposalData.kg !== "" || disposalData.grams !== "");
    const remainingStock = Math.max(0, product.quantity - totalDisposalUnits);

    const formatTotalLabel = () => {
        if (isBottles) return `${disposalData.kg || 0} Pieces`;
        if (kg > 0 && grams > 0) return `${kg} KG ${grams} g  (${totalDisposalKg.toFixed(3)} KG)`;
        if (kg > 0) return `${kg} KG`;
        if (grams > 0) return `${grams} g  (${totalDisposalKg.toFixed(3)} KG)`;
        return `0 ${isBottles ? 'Pieces' : 'KG'}`;
    };

    return (
        <div className="pd-modal-overlay" onClick={onClose}>
            <div className="pd-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="pd-modal-header">
                    <div className="pd-modal-title">
                        <FaTrash /> Dispose Product
                    </div>
                    <button className="pd-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="pd-modal-body">
                    <div className="pd-product-info">
                        <div className="pd-product-detail">
                            <strong>Product:</strong> {product.name}
                        </div>
                        <div className="pd-product-detail">
                            <strong>Available Stock:</strong> {product.quantity} {product.unit}
                        </div>
                        {product.ml && (
                            <div className="pd-product-detail">
                                <strong>ML:</strong> {product.ml}
                            </div>
                        )}
                        {product.itemType && (
                            <div className="pd-product-detail">
                                <strong>Item Type:</strong> {product.itemType}
                            </div>
                        )}
                    </div>

                    <div className="pd-form-section">
                        <h4>Disposal Details</h4>

                        {isBottles ? (
                            <div className="pd-form-row">
                                <div className="pd-form-field">
                                    <label>Quantity (Pieces) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={disposalData.kg}
                                        onChange={(e) => setDisposalData({ ...disposalData, kg: e.target.value })}
                                        placeholder="Enter pieces to dispose"
                                        autoComplete="off"
                                        className={exceedsStock ? 'pd-input-error' : ''}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="pd-form-row">
                                <div className="pd-form-field">
                                    <label>KG</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={disposalData.kg}
                                        onChange={(e) => setDisposalData({ ...disposalData, kg: e.target.value })}
                                        placeholder="Enter KG"
                                        autoComplete="off"
                                        className={exceedsStock ? 'pd-input-error' : ''}
                                    />
                                </div>
                                <div className="pd-form-field">
                                    <label>Grams</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        value={disposalData.grams}
                                        onChange={(e) => setDisposalData({ ...disposalData, grams: e.target.value })}
                                        placeholder="Enter grams"
                                        autoComplete="off"
                                        className={exceedsStock ? 'pd-input-error' : ''}
                                    />
                                </div>
                            </div>
                        )}

                        {exceedsStock && hasEnteredQuantity && (
                            <div className="pd-error-text">
                                <FaExclamationTriangle />
                                Cannot dispose more than available stock ({product.quantity} {product.unit})
                            </div>
                        )}

                        <div className="pd-form-row">
                            <div className="pd-form-field">
                                <label>Reason *</label>
                                <select
                                    value={disposalData.reason}
                                    onChange={(e) => setDisposalData({ ...disposalData, reason: e.target.value })}
                                >
                                    <option value="">Select Reason</option>
                                    {REASON_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pd-form-field">
                                <label>Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={disposalData.notes}
                                    onChange={(e) => setDisposalData({ ...disposalData, notes: e.target.value })}
                                    placeholder="Add notes..."
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {hasEnteredQuantity && totalDisposalUnits > 0 && (
                            <>
                                <div className="pd-total-disposal">
                                    <strong>Total to Dispose:</strong> {formatTotalLabel()}
                                </div>

                                <div className="pd-stock-preview">
                                    <span className="pd-stock-preview-label">Stock remaining after disposal</span>
                                    <span className={`pd-stock-preview-value ${exceedsStock ? 'pd-stock-preview-warning' : 'pd-stock-preview-ok'}`}>
                                        {exceedsStock ? '—' : `${remainingStock} ${product.unit}`}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="pd-modal-footer">
                    <button className="pd-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="pd-btn-danger"
                        onClick={onSubmit}
                        disabled={isSubmitting || exceedsStock || !hasEnteredQuantity || totalDisposalUnits <= 0 || !disposalData.reason}
                    >
                        {isSubmitting ? "Processing..." : "Dispose"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// HISTORY MODAL (top-level — stable identity)
// ============================================
const HistoryModal = ({ show, onClose, history, isLoading, inventoryType, formatDate }) => {
    if (!show) return null;

    // ✅ Handle both formats: data directly OR data.data
    const historyData = history?.data || history;
    const disposals = historyData?.disposals || [];
    const unitLabel = inventoryType === 'bottles' ? 'Pieces' : 'KG';

    return (
        <div className="pd-modal-overlay" onClick={onClose}>
            <div className="pd-modal-content pd-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="pd-modal-header pd-modal-header-info">
                    <div className="pd-modal-title">
                        <FaHistory /> Disposal History
                    </div>
                    <button className="pd-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="pd-modal-body">
                    {isLoading ? (
                        <div className="pd-loading-container">
                            <div className="pd-loading-spinner large"></div>
                            <p>Loading disposal history...</p>
                        </div>
                    ) : !historyData ? (
                        <div className="pd-history-empty">
                            <FaHistory />
                            <p>Could not load disposal history.</p>
                        </div>
                    ) : (
                        <>
                            <div className="pd-history-summary">
                                <div>
                                    <strong>Product:</strong> {historyData.productName}
                                </div>
                                <div>
                                    <strong>Total Disposed:</strong> {historyData.totalDisposed || 0} {unitLabel}
                                </div>
                                <div>
                                    <strong>Total Disposals:</strong> {disposals.length}
                                </div>
                            </div>

                            {disposals.length === 0 ? (
                                <div className="pd-history-empty">
                                    <FaHistory />
                                    <p>No disposal history yet for this product.</p>
                                </div>
                            ) : (
                                <div className="pd-history-list">
                                    {disposals.map((entry, index) => (
                                        <div key={entry.disposalEntryId || index} className="pd-history-item">
                                            <div className="pd-history-header">
                                                <span className="pd-history-date">{formatDate(entry.disposedAt)}</span>
                                                <span className="pd-history-quantity">
                                                    −{entry.disposedQuantity} {unitLabel}
                                                </span>
                                            </div>
                                            <div className="pd-history-details">
                                                <span className="pd-history-reason">{entry.reason}</span>
                                                <span className="pd-history-by">By: {entry.performedBy?.userName || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="pd-modal-footer">
                    <button className="pd-btn-primary" onClick={onClose}>
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
const ProductDisposal = () => {
    const [inventoryType, setInventoryType] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDisposalModal, setShowDisposalModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // ✅ PAGINATION STATES
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Disposal form states
    const [disposalData, setDisposalData] = useState({
        kg: "",
        grams: "",
        reason: "",
        notes: ""
    });

    const navigate = useNavigate();

    // ============================================
    // FETCH PRODUCTS WITH PAGINATION
    // ============================================
    const fetchProducts = async (type, page = 1, search = '') => {
        if (!type) {
            setProducts([]);
            setFilteredProducts([]);
            setPagination({
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            });
            return;
        }

        try {
            setIsLoading(true);

            // Build query params with pagination
            const queryParams = new URLSearchParams({
                page: page,
                limit: 20,
                search: search
            });

            const endpointMap = {
                xp: `/xp/get-all?${queryParams}`,
                dispenser: `/dispenser/get-all?${queryParams}`,
                bottles: `/bottles/get-all?${queryParams}`
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}${endpointMap[type]}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                if (response.status === 401) navigate('/login');
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            // ✅ Extract products array and pagination
            let productsArray;
            let paginationData;

            if (Array.isArray(data)) {
                productsArray = data;
                paginationData = {
                    total: data.length,
                    page: 1,
                    limit: data.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            } else if (data.inventory && Array.isArray(data.inventory)) {
                productsArray = data.inventory;
                paginationData = data.pagination || {
                    total: data.inventory.length,
                    page: 1,
                    limit: data.inventory.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            } else if (data.products && Array.isArray(data.products)) {
                productsArray = data.products;
                paginationData = data.pagination || {
                    total: data.products.length,
                    page: 1,
                    limit: data.products.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            } else if (data.data && Array.isArray(data.data)) {
                productsArray = data.data;
                paginationData = data.pagination || {
                    total: data.data.length,
                    page: 1,
                    limit: data.data.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            } else {
                productsArray = [];
                paginationData = {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            }

            // ✅ Format products based on inventory type
            let formattedProducts = productsArray.map(p => ({
                id: p.xpId || p.dispenserId || p.bottleItemId || p._id,
                name: p.productName || `${p.mlSize || ''} ${p.itemType || ''}`.trim(),
                ml: p.ml || p.mlSize || '',
                itemType: p.itemType || '',
                quantity: p.quantity || 0,
                unit: type === 'bottles' ? 'Pieces' : 'KG'
            }));

            setProducts(formattedProducts);
            setFilteredProducts(formattedProducts);
            setPagination(paginationData);
            setCurrentPage(paginationData.page || 1);

        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to fetch products");
            setProducts([]);
            setFilteredProducts([]);
            setPagination({
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // FETCH DISPOSAL HISTORY FOR PRODUCT
    // ============================================
    const fetchDisposalHistory = async (productId) => {
        try {
            setIsLoadingHistory(true);
            setShowHistoryModal(true);
            setSelectedHistory(null);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/disposal/get-by-product/${productId}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch disposal history');
            }

            const data = await response.json();
            setSelectedHistory(data);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to fetch disposal history");
            setShowHistoryModal(false);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // ============================================
    // HANDLE INVENTORY TYPE CHANGE
    // ============================================
    const handleTypeChange = (e) => {
        const type = e.target.value;
        setInventoryType(type);
        setSelectedProduct(null);
        setSearchTerm("");
        setCurrentPage(1);
        setDisposalData({ kg: "", grams: "", reason: "", notes: "" });
        fetchProducts(type, 1, "");
    };

    // ============================================
    // HANDLE SEARCH
    // ============================================
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        fetchProducts(inventoryType, 1, term);
    };

    // ============================================
    // HANDLE PAGE CHANGE
    // ============================================
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setCurrentPage(newPage);
        fetchProducts(inventoryType, newPage, searchTerm);
    };

    // ============================================
    // HANDLE PRODUCT SELECTION
    // ============================================
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setDisposalData({ kg: "", grams: "", reason: "", notes: "" });
        setShowDisposalModal(true);
    };

    // ============================================
    // HANDLE DISPOSAL SUBMIT
    // ============================================
    const handleDisposalSubmit = async () => {
        try {
            const kg = parseFloat(disposalData.kg) || 0;
            const grams = parseFloat(disposalData.grams) || 0;
            const totalQuantity = kg + grams / 1000;

            if (inventoryType === 'bottles') {
                if (!disposalData.kg || parseInt(disposalData.kg) <= 0) {
                    toast.error("Please enter valid quantity");
                    return;
                }
                if (parseInt(disposalData.kg) > selectedProduct.quantity) {
                    toast.error(`Cannot dispose more than available stock (${selectedProduct.quantity})`);
                    return;
                }
            } else {
                if (totalQuantity <= 0) {
                    toast.error("Please enter valid quantity");
                    return;
                }
                if (totalQuantity > selectedProduct.quantity) {
                    toast.error(`Cannot dispose more than available stock (${selectedProduct.quantity} KG)`);
                    return;
                }
            }

            if (!disposalData.reason) {
                toast.error("Please select a reason");
                return;
            }

            setIsSubmitting(true);

            const payload = {
                inventoryType,
                inventoryItemId: selectedProduct.id,
                disposedQuantity: inventoryType === 'bottles' ? parseInt(disposalData.kg) : totalQuantity,
                reason: disposalData.reason,
                notes: disposalData.notes || ''
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/disposal/dispose`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to dispose product");
            }

            const result = await response.json();
            toast.success(result.message);

            // ✅ Refresh current page after disposal
            await fetchProducts(inventoryType, currentPage, searchTerm);

            setDisposalData({ kg: "", grams: "", reason: "", notes: "" });
            setShowDisposalModal(false);
            setSelectedProduct(null);

        } catch (error) {
            console.error("Error disposing product:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // FORMAT DATE
    // ============================================
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================
    // ROW STOCK STATE (visual cue helper)
    // ============================================
    const getRowStockClass = (quantity) => {
        if (quantity <= 0) return 'pd-row-zero-stock';
        if (quantity <= 5) return 'pd-row-low-stock';
        return '';
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <Navbar>
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="pd-main">

                {/* Page Header */}
                <div className="pd-page-header">
                    <h2>Product Disposal</h2>
                    <div className="pd-right-section">
                        <div className="pd-inventory-select">
                            <label>Select Inventory:</label>
                            <select value={inventoryType} onChange={handleTypeChange}>
                                <option value="">Select Inventory</option>
                                <option value="xp">XP Inventory</option>
                                <option value="dispenser">Dispenser Inventory</option>
                                <option value="bottles">Bottles Inventory</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* No inventory selected yet — friendly prompt instead of blank page */}
                {!inventoryType && (
                    <div className="pd-select-prompt">
                        <FaBox className="pd-select-prompt-icon" />
                        <h3>Choose an inventory to get started</h3>
                        <p>Select XP, Dispenser, or Bottles inventory above to view products and manage disposals.</p>
                    </div>
                )}

                {/* Product List */}
                {inventoryType && (
                    <div className="pd-product-list">
                        <div className="pd-search-container">
                            <FaSearch className="pd-search-icon" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoComplete="off"
                            />
                        </div>

                        {isLoading ? (
                            <div className="pd-loading-container">
                                <div className="pd-loading-spinner large"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="pd-empty-state">
                                <FaBox className="pd-empty-icon" />
                                <p>
                                    {searchTerm.trim()
                                        ? "No products match your search"
                                        : "No products found in this inventory"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="pd-table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>ML</th>
                                                <th>Item Type</th>
                                                <th>Available Stock</th>
                                                <th>Unit</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map((product) => (
                                                <tr key={product.id} className={getRowStockClass(product.quantity)}>
                                                    <td className="pd-name-cell">{product.name}</td>
                                                    <td className="pd-ml-cell">{product.ml || '-'}</td>
                                                    <td className="pd-item-cell">{product.itemType || '-'}</td>
                                                    <td className="pd-stock-cell">{product.quantity}</td>
                                                    <td className="pd-unit-cell">{product.unit}</td>
                                                    <td>
                                                        <div className="pd-actions-cell">
                                                            <button
                                                                className="pd-dispose-btn"
                                                                onClick={() => handleProductSelect(product)}
                                                                disabled={product.quantity <= 0}
                                                                title={product.quantity <= 0 ? "No stock to dispose" : "Dispose product"}
                                                            >
                                                                <FaTrash /> Dispose
                                                            </button>
                                                            <button
                                                                className="pd-history-btn"
                                                                onClick={() => fetchDisposalHistory(product.id)}
                                                                title="View disposal history"
                                                            >
                                                                <FaHistory />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ✅ PAGINATION */}
                                {pagination.totalPages > 0 && (
                                    <div className="pd-pagination">
                                        <div className="pd-pagination-info">
                                            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                                        </div>
                                        <div className="pd-pagination-controls">
                                            <button
                                                className="pd-pagination-btn"
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={!pagination.hasPrevPage}
                                            >
                                                <FaChevronLeft />
                                            </button>

                                            <div className="pd-pagination-pages">
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
                                                            className={`pd-pagination-page ${pagination.page === pageNum ? 'pd-pagination-active' : ''}`}
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                className="pd-pagination-btn"
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={!pagination.hasNextPage}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Modals */}
                <DisposalModal
                    show={showDisposalModal}
                    onClose={() => setShowDisposalModal(false)}
                    product={selectedProduct}
                    inventoryType={inventoryType}
                    disposalData={disposalData}
                    setDisposalData={setDisposalData}
                    isSubmitting={isSubmitting}
                    onSubmit={handleDisposalSubmit}
                />

                <HistoryModal
                    show={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    history={selectedHistory}
                    isLoading={isLoadingHistory}
                    inventoryType={inventoryType}
                    formatDate={formatDate}
                />

            </div>
        </Navbar>
    );
};

export default ProductDisposal;