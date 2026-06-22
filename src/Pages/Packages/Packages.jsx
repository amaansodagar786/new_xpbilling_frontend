import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaBox, FaDollarSign, FaHashtag, FaPlus,
    FaSearch, FaSave, FaEdit, FaTrash,
    FaToggleOn, FaToggleOff, FaTimes, FaPercentage
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Packages.scss";
import "react-toastify/dist/ReactToastify.css";

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [packageName, setPackageName] = useState("");
    const [pricing, setPricing] = useState("");
    const [oilCount, setOilCount] = useState("");
    const [discount, setDiscount] = useState("0");

    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);

    // Refs
    const nameInputRef = useRef(null);

    // ============================================
    // FETCH PACKAGES
    // ============================================
    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/packages/get-all`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch packages');
            }

            const data = await response.json();
            setPackages(data);
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to fetch packages");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // ============================================
    // RESET FORM
    // ============================================
    const resetForm = () => {
        setPackageName("");
        setPricing("");
        setOilCount("");
        setDiscount("0");
        setEditingPackage(null);
    };

    // ============================================
    // HANDLE EDIT
    // ============================================
    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setPackageName(pkg.packageName);
        setPricing(pkg.pricing.toString());
        setOilCount(pkg.oilCount.toString());
        setDiscount(pkg.discount?.toString() || "0");
        setShowForm(true);

        setTimeout(() => {
            nameInputRef.current?.focus();
        }, 100);
    };

    // ============================================
    // HANDLE SAVE (CREATE/UPDATE)
    // ============================================
    const handleSave = async () => {
        try {
            if (!packageName.trim()) {
                toast.error("Please enter package name");
                return;
            }

            if (!pricing || parseFloat(pricing) < 1) {
                toast.error("Please enter valid pricing (minimum 1)");
                return;
            }

            if (!oilCount || parseInt(oilCount) < 1 || parseInt(oilCount) > 25) {
                toast.error("Oil count must be between 1 and 25");
                return;
            }

            if (parseFloat(discount) < 0 || parseFloat(discount) > 100) {
                toast.error("Discount must be between 0 and 100");
                return;
            }

            setIsSaving(true);

            const url = editingPackage
                ? `${import.meta.env.VITE_API_URL}/packages/update/${editingPackage.packageId}`
                : `${import.meta.env.VITE_API_URL}/packages/create`;

            const method = editingPackage ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageName: packageName.trim(),
                    pricing: parseFloat(pricing),
                    oilCount: parseInt(oilCount),
                    discount: parseFloat(discount) || 0
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save package");
            }

            const result = await response.json();
            toast.success(result.message);

            await fetchPackages();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving package:", error);
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================
    // HANDLE DELETE
    // ============================================
    const handleDelete = async () => {
        if (!packageToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/packages/delete/${packageToDelete}`,
                { method: "DELETE", credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to delete package');

            const result = await response.json();
            toast.success(result.message);
            await fetchPackages();
        } catch (error) {
            console.error("Error deleting package:", error);
            toast.error("Failed to delete package");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setPackageToDelete(null);
        }
    };

    // ============================================
    // TOGGLE STATUS
    // ============================================
    const toggleStatus = async (pkg) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/packages/toggle-status/${pkg.packageId}`,
                {
                    method: "PATCH",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (!response.ok) throw new Error('Failed to toggle package status');

            const result = await response.json();
            toast.success(result.message);
            await fetchPackages();
        } catch (error) {
            console.error("Error toggling package status:", error);
            toast.error("Failed to toggle package status");
        }
    };

    // ============================================
    // FILTER PACKAGES
    // ============================================
    const filteredPackages = packages.filter((pkg) => {
        const search = searchTerm.toLowerCase();
        return (
            pkg.packageName?.toLowerCase().includes(search) ||
            pkg.pricing?.toString().includes(search) ||
            pkg.oilCount?.toString().includes(search)
        );
    });

    // ============================================
    // DELETE CONFIRMATION MODAL
    // ============================================
    const DeleteConfirmationModal = () => {
        if (!showDeleteConfirm) return null;

        const pkg = packages.find(p => p.packageId === packageToDelete);

        return (
            <div className="pk-modal-overlay">
                <div className="pk-modal-content">
                    <div className="pk-modal-header">
                        <div className="pk-modal-title">
                            <FaTrash /> Delete Package
                        </div>
                        <button className="pk-modal-close" onClick={() => setShowDeleteConfirm(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="pk-modal-body">
                        <div className="pk-delete-icon">
                            <FaTrash />
                        </div>
                        <h3>Confirm Deletion</h3>
                        <p>
                            Are you sure you want to delete the package{" "}
                            <strong style={{ color: "#3f3f91" }}>{pkg?.packageName}</strong>
                            ? This action cannot be undone.
                        </p>

                        <div className="pk-detail-card">
                            <div className="pk-detail-card-header">
                                <FaBox />
                                <strong>Package Details:</strong>
                            </div>
                            <div className="pk-detail-card-info">
                                <div>Name: <strong>{pkg?.packageName}</strong></div>
                                <div>Pricing: <strong>₹{pkg?.pricing}</strong></div>
                                <div>Oil Count: <strong>{pkg?.oilCount}</strong></div>
                                <div>Discount: <strong>{pkg?.discount || 0}%</strong></div>
                            </div>
                        </div>

                        <div className="pk-modal-actions">
                            <button className="pk-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                                <FaTimes /> Cancel
                            </button>
                            <button className="pk-btn-delete" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : <><FaTrash /> Delete</>}
                            </button>
                        </div>
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
            <div className="pk-main">

                {/* Page Header */}
                <div className="pk-page-header">
                    <h2>Packages Management</h2>
                    <div className="pk-right-section">
                        <div className="pk-search-container">
                            <FaSearch className="pk-search-icon" />
                            <input
                                type="text"
                                placeholder="Search Packages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="pk-action-buttons-group">
                            <button
                                className="pk-add-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(!showForm);
                                }}
                            >
                                <FaPlus /> {showForm ? "Close" : "Add Package"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="pk-form-container">
                        <h2>{editingPackage ? "Edit Package" : "Add New Package"}</h2>

                        <div className="pk-form-row">
                            <div className="pk-form-field">
                                <label><FaBox /> Package Name *</label>
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    value={packageName}
                                    onChange={(e) => setPackageName(e.target.value)}
                                    placeholder="Enter package name"
                                    maxLength={50}
                                />
                            </div>
                            <div className="pk-form-field">
                                <label><FaDollarSign /> Pricing (₹) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={pricing}
                                    onChange={(e) => setPricing(e.target.value)}
                                    placeholder="Enter pricing"
                                />
                            </div>
                        </div>

                        <div className="pk-form-row">
                            <div className="pk-form-field">
                                <label><FaHashtag /> Oil Count *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="25"
                                    value={oilCount}
                                    onChange={(e) => setOilCount(e.target.value)}
                                    placeholder="Enter oil count (1-25)"
                                />
                                <small className="pk-field-hint">Minimum 1, Maximum 25</small>
                            </div>
                            <div className="pk-form-field">
                                <label><FaPercentage /> Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder="Enter discount (0-100)"
                                />
                                <small className="pk-field-hint">Default: 0%, Maximum 100%</small>
                            </div>
                        </div>

                        <div className="pk-form-actions">
                            <button
                                type="button"
                                className="pk-cancel-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="pk-save-btn"
                                onClick={handleSave}
                                disabled={isSaving || !packageName.trim() || !pricing || !oilCount}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="pk-loading-spinner small"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        {editingPackage ? "Update Package" : "Save Package"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <div className="pk-data-table">
                    {isLoading ? (
                        <div className="pk-loading-container">
                            <div className="pk-loading-spinner large"></div>
                            <p>Loading packages...</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Package Name</th>
                                    <th>Pricing (₹)</th>
                                    <th>Oil Count</th>
                                    <th>Discount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="pk-empty-state">
                                                <FaBox className="pk-empty-icon" />
                                                <p>No packages found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackages.map((pkg) => (
                                        <tr key={pkg.packageId}>
                                            <td className="pk-name-cell">{pkg.packageName}</td>
                                            <td className="pk-price-cell">₹{pkg.pricing}</td>
                                            <td className="pk-oil-count-cell">
                                                <span className="pk-oil-count-pill">{pkg.oilCount} Oils</span>
                                            </td>
                                            <td className="pk-discount-cell">{pkg.discount || 0}%</td>
                                            <td>
                                                <span className={`pk-status-badge ${pkg.isActive ? 'pk-active' : 'pk-inactive'}`}>
                                                    {pkg.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="pk-row-actions">
                                                    <button
                                                        className="pk-edit-btn"
                                                        onClick={() => handleEdit(pkg)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        className={`pk-toggle-btn ${pkg.isActive ? 'pk-deactivate' : 'pk-activate'}`}
                                                        onClick={() => toggleStatus(pkg)}
                                                        title={pkg.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {pkg.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                        {pkg.isActive ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        className="pk-delete-btn"
                                                        onClick={() => {
                                                            setPackageToDelete(pkg.packageId);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal />

            </div>
        </Navbar>
    );
};

export default Packages;