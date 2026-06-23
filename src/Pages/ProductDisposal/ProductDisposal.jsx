import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaBox, FaPlus, FaSearch, FaTimes,
    FaBell, FaCheckCircle, FaTimesCircle,
    FaTrash, FaFilter, FaHistory,
    FaFlask, FaWineBottle, FaTint, FaExclamationTriangle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./ProductDisposal.scss";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// INVENTORY TYPE OPTIONS (for pill selector)
// ============================================
const INVENTORY_TYPES = [
    { value: "xp", label: "XP Inventory", icon: <FaFlask /> },
    { value: "dispenser", label: "Dispenser Inventory", icon: <FaTint /> },
    { value: "bottles", label: "Bottles Inventory", icon: <FaWineBottle /> }
];

const ProductDisposal = () => {
    const [inventoryType, setInventoryType] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [disposals, setDisposals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDisposalModal, setShowDisposalModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Disposal form states
    const [disposalData, setDisposalData] = useState({
        kg: "",
        grams: "",
        reason: "",
        notes: ""
    });

    const navigate = useNavigate();

    // ============================================
    // FETCH PRODUCTS BY INVENTORY TYPE
    // ============================================
    const fetchProducts = async (type) => {
        if (!type) {
            setProducts([]);
            setFilteredProducts([]);
            return;
        }

        try {
            setIsLoading(true);
            const endpointMap = {
                xp: "/xp/get-all",
                dispenser: "/dispenser/get-all",
                bottles: "/bottles/get-all"
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

            // Format products based on inventory type
            let formattedProducts = data.map(p => ({
                id: p.xpId || p.dispenserId || p.bottleItemId || p._id,
                name: p.productName || `${p.mlSize} ${p.itemType}`,
                ml: p.ml || p.mlSize || '',
                itemType: p.itemType || '',
                quantity: p.quantity || 0,
                unit: type === 'bottles' ? 'Pieces' : 'KG'
            }));

            setProducts(formattedProducts);
            setFilteredProducts(formattedProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // FETCH DISPOSAL HISTORY FOR PRODUCT
    // ============================================
    const fetchDisposalHistory = async (productId) => {
        try {
            setIsHistoryLoading(true);
            setShowHistoryModal(true);
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
            setIsHistoryLoading(false);
        }
    };

    // ============================================
    // HANDLE INVENTORY TYPE CHANGE
    // ============================================
    const handleTypeChange = (type) => {
        if (type === inventoryType) return;
        setInventoryType(type);
        setSelectedProduct(null);
        setSearchTerm("");
        setDisposalData({ kg: "", grams: "", reason: "", notes: "" });
        fetchProducts(type);
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
    // CALCULATE TOTAL DISPOSAL QUANTITY
    // ============================================
    const calculateTotalQuantity = () => {
        const kg = parseFloat(disposalData.kg) || 0;
        const grams = parseFloat(disposalData.grams) || 0;
        return kg + (grams / 1000);
    };

    // ============================================
    // HANDLE DISPOSAL SUBMIT
    // ============================================
    const handleDisposalSubmit = async () => {
        try {
            const kg = parseFloat(disposalData.kg) || 0;
            const grams = parseFloat(disposalData.grams) || 0;
            const totalQuantity = kg + (grams / 1000);

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

            // Refresh product list
            await fetchProducts(inventoryType);

            // Reset and close modal
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
    // FILTER PRODUCTS BY SEARCH
    // ============================================
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredProducts(products);
            return;
        }

        const search = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.name?.toLowerCase().includes(search) ||
            p.ml?.toString().includes(search) ||
            p.itemType?.toLowerCase().includes(search)
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

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
    // REASON OPTIONS
    // ============================================
    const reasonOptions = ["Damage", "Expired", "Broken", "Return", "Other"];

    const getReasonClass = (reason) => {
        const map = {
            Damage: 'pd-reason-damage',
            Expired: 'pd-reason-expired',
            Broken: 'pd-reason-broken',
            Return: 'pd-reason-return',
            Other: 'pd-reason-other'
        };
        return map[reason] || 'pd-reason-other';
    };

    // ============================================
    // STOCK STATUS HELPER (for color-coded badges)
    // ============================================
    const getStockLevelClass = (quantity) => {
        if (quantity <= 0) return 'pd-stock-empty';
        if (quantity <= 5) return 'pd-stock-low';
        return 'pd-stock-healthy';
    };

    // ============================================
    // HISTORY MODAL
    // ============================================
    const HistoryModal = () => {
        if (!showHistoryModal) return null;

        return (
            <div className="pd-modal-overlay" onClick={() => setShowHistoryModal(false)}>
                <div className="pd-modal-content pd-modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="pd-modal-header">
                        <div className="pd-modal-title">
                            <FaHistory /> Disposal History
                        </div>
                        <button className="pd-modal-close" onClick={() => setShowHistoryModal(false)}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="pd-modal-body">
                        {isHistoryLoading ? (
                            <div className="pd-loading-container">
                                <div className="pd-loading-spinner large"></div>
                                <p>Loading disposal history...</p>
                            </div>
                        ) : !selectedHistory ? (
                            <div className="pd-empty-state">
                                <FaHistory className="pd-empty-icon" />
                                <p>No disposal history found</p>
                            </div>
                        ) : (
                            <>
                                <div className="pd-history-summary">
                                    <div className="pd-history-summary-item">
                                        <span className="pd-history-summary-label">Product</span>
                                        <strong>{selectedHistory.productName}</strong>
                                    </div>
                                    <div className="pd-history-summary-item">
                                        <span className="pd-history-summary-label">Total Disposed</span>
                                        <strong>
                                            {selectedHistory.totalDisposed || 0}{' '}
                                            {inventoryType === 'bottles' ? 'Pieces' : 'KG'}
                                        </strong>
                                    </div>
                                    <div className="pd-history-summary-item">
                                        <span className="pd-history-summary-label">Total Entries</span>
                                        <strong>{selectedHistory.disposals?.length || 0}</strong>
                                    </div>
                                </div>

                                {!selectedHistory.disposals || selectedHistory.disposals.length === 0 ? (
                                    <div className="pd-empty-state pd-empty-state-sm">
                                        <FaHistory className="pd-empty-icon" />
                                        <p>No disposal entries recorded yet for this product</p>
                                    </div>
                                ) : (
                                    <div className="pd-history-list">
                                        {selectedHistory.disposals.map((entry, index) => (
                                            <div key={entry.disposalEntryId || index} className="pd-history-item">
                                                <div className="pd-history-header">
                                                    <span className="pd-history-date">{formatDate(entry.disposedAt)}</span>
                                                    <span className="pd-history-quantity">
                                                        <FaTrash />
                                                        {entry.disposedQuantity} {inventoryType === 'bottles' ? 'Pieces' : 'KG'}
                                                    </span>
                                                </div>
                                                <div className="pd-history-details">
                                                    <span className={`pd-reason-tag ${getReasonClass(entry.reason)}`}>
                                                        {entry.reason}
                                                    </span>
                                                    <span className="pd-history-by">
                                                        By: <strong>{entry.performedBy?.userName || 'Unknown'}</strong>
                                                    </span>
                                                </div>
                                                {entry.notes && (
                                                    <div className="pd-history-notes">{entry.notes}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="pd-modal-footer">
                        <button className="pd-btn-primary" onClick={() => setShowHistoryModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // DISPOSAL MODAL
    // ============================================
    const DisposalModal = () => {
        if (!showDisposalModal || !selectedProduct) return null;

        const isBottles = inventoryType === 'bottles';
        const totalToDispose = isBottles
            ? (parseFloat(disposalData.kg) || 0)
            : calculateTotalQuantity();
        const remainingStock = selectedProduct.quantity - totalToDispose;
        const isOverLimit = totalToDispose > selectedProduct.quantity;

        return (
            <div className="pd-modal-overlay" onClick={() => setShowDisposalModal(false)}>
                <div className="pd-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="pd-modal-header pd-modal-header-danger">
                        <div className="pd-modal-title">
                            <FaTrash /> Dispose Product
                        </div>
                        <button className="pd-modal-close" onClick={() => setShowDisposalModal(false)}>
                            <FaTimes />
                        </button>
                    </div>
                    <div className="pd-modal-body">
                        <div className="pd-product-info">
                            <div className="pd-product-detail">
                                <span className="pd-product-detail-label">Product</span>
                                <strong>{selectedProduct.name}</strong>
                            </div>
                            <div className="pd-product-detail">
                                <span className="pd-product-detail-label">Available Stock</span>
                                <strong>{selectedProduct.quantity} {selectedProduct.unit}</strong>
                            </div>
                            {selectedProduct.ml && (
                                <div className="pd-product-detail">
                                    <span className="pd-product-detail-label">ML</span>
                                    <strong>{selectedProduct.ml}</strong>
                                </div>
                            )}
                            {selectedProduct.itemType && (
                                <div className="pd-product-detail">
                                    <span className="pd-product-detail-label">Item Type</span>
                                    <strong>{selectedProduct.itemType}</strong>
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
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="pd-form-row">
                                    <div className="pd-form-field">
                                        <label>KG *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={disposalData.kg}
                                            onChange={(e) => setDisposalData({ ...disposalData, kg: e.target.value })}
                                            placeholder="Enter KG"
                                            autoComplete="off"
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
                                        />
                                    </div>
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
                                        {reasonOptions.map(opt => (
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

                            {totalToDispose > 0 && (
                                <div className={`pd-total-disposal ${isOverLimit ? 'pd-total-disposal-error' : ''}`}>
                                    <div className="pd-total-disposal-row">
                                        <span><FaTrash /> Disposing:</span>
                                        <strong>
                                            {isBottles
                                                ? `${totalToDispose} Pieces`
                                                : (() => {
                                                    const kg = parseFloat(disposalData.kg) || 0;
                                                    const grams = parseFloat(disposalData.grams) || 0;
                                                    if (kg > 0 && grams > 0) {
                                                        return `${kg} KG ${grams} Grams (${totalToDispose.toFixed(3)} KG)`;
                                                    } else if (kg > 0) {
                                                        return `${kg} KG`;
                                                    } else {
                                                        return `${grams} Grams (${(grams / 1000).toFixed(3)} KG)`;
                                                    }
                                                })()}
                                        </strong>
                                    </div>
                                    <div className="pd-total-disposal-row">
                                        <span>Remaining Stock After:</span>
                                        <strong className={isOverLimit ? 'pd-remaining-negative' : 'pd-remaining-ok'}>
                                            {isOverLimit ? (
                                                <><FaExclamationTriangle /> Exceeds available stock</>
                                            ) : (
                                                `${remainingStock.toFixed(isBottles ? 0 : 3)} ${selectedProduct.unit}`
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="pd-modal-footer">
                        <button className="pd-btn-cancel" onClick={() => setShowDisposalModal(false)}>
                            Cancel
                        </button>
                        <button
                            className="pd-btn-danger"
                            onClick={handleDisposalSubmit}
                            disabled={isSubmitting || isOverLimit || totalToDispose <= 0 || !disposalData.reason}
                        >
                            {isSubmitting ? "Processing..." : <><FaTrash /> Dispose</>}
                        </button>
                    </div>
                </div>
            </div>
        );
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
                    <p className="pd-page-subtitle">Select an inventory type below to dispose damaged, expired, or returned stock</p>
                </div>

                {/* Inventory Type Pills */}
                <div className="pd-type-selector">
                    {INVENTORY_TYPES.map(type => (
                        <button
                            key={type.value}
                            className={`pd-type-pill ${inventoryType === type.value ? 'pd-type-pill-active' : ''}`}
                            onClick={() => handleTypeChange(type.value)}
                        >
                            <span className="pd-type-pill-icon">{type.icon}</span>
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Product List */}
                {inventoryType && (
                    <div className="pd-product-list">
                        <div className="pd-list-header">
                            <div className="pd-search-container">
                                <FaSearch className="pd-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            {!isLoading && (
                                <span className="pd-result-count">{filteredProducts.length} products</span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="pd-loading-container">
                                <div className="pd-loading-spinner large"></div>
                                <p>Loading products...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="pd-empty-state">
                                <FaBox className="pd-empty-icon" />
                                <p>No products found in this inventory</p>
                            </div>
                        ) : (
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
                                            <tr key={product.id}>
                                                <td className="pd-name-cell">{product.name}</td>
                                                <td className="pd-ml-cell">{product.ml || '-'}</td>
                                                <td className="pd-item-cell">{product.itemType || '-'}</td>
                                                <td className="pd-stock-cell">
                                                    <span className={`pd-stock-pill ${getStockLevelClass(product.quantity)}`}>
                                                        {product.quantity}
                                                    </span>
                                                </td>
                                                <td className="pd-unit-cell">{product.unit}</td>
                                                <td className="pd-actions-cell">
                                                    <div className="pd-row-actions">
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
                        )}
                    </div>
                )}

                {!inventoryType && (
                    <div className="pd-no-type-selected">
                        <FaFilter className="pd-no-type-icon" />
                        <p>Choose an inventory type above to view its products</p>
                    </div>
                )}

                {/* Modals */}
                <DisposalModal />
                <HistoryModal />

            </div>
        </Navbar>
    );
};

export default ProductDisposal;