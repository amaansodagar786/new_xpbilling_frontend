import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaCalendarAlt, FaClock, FaPlus, FaSearch,
    FaSave, FaEdit, FaTrash, FaTimes,
    FaUser, FaPhone, FaEnvelope, FaBox,
    FaEye, FaUsers, FaUserPlus, FaCheckCircle, FaUserMinus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Workshops.scss";
import "react-toastify/dist/ReactToastify.css";

// ============================================
// DELETE CONFIRMATION MODAL (top-level — stable identity across re-renders)
// ============================================
const DeleteConfirmationModal = ({
    show, workshop, isDeleting, onCancel, onConfirm, formatDate
}) => {
    if (!show) return null;

    return (
        <div className="ws-modal-overlay">
            <div className="ws-modal-content">
                <div className="ws-modal-header ws-danger">
                    <div className="ws-modal-title">
                        <FaTrash /> Delete Workshop
                    </div>
                    <button className="ws-modal-close" onClick={onCancel}>
                        <FaTimes />
                    </button>
                </div>

                <div className="ws-delete-body">
                    <div className="ws-delete-icon">
                        <FaTrash />
                    </div>
                    <h3>Confirm Deletion</h3>
                    <p>
                        Are you sure you want to delete the workshop on{" "}
                        <strong style={{ color: "#3f3f91" }}>{workshop ? formatDate(workshop.date) : ""}</strong>{" "}
                        at{" "}
                        <strong style={{ color: "#3f3f91" }}>{workshop?.startTime}</strong>
                        ? This action cannot be undone.
                    </p>

                    <div className="ws-detail-card">
                        <div className="ws-detail-card-header">
                            <FaUsers />
                            <strong>Workshop Details:</strong>
                        </div>
                        <div className="ws-detail-card-info">
                            <div>Date: <strong>{workshop ? formatDate(workshop.date) : ""}</strong></div>
                            <div>Time: <strong>{workshop?.startTime}</strong></div>
                            <div>Customers: <strong>{workshop?.customers?.length || 0}</strong></div>
                        </div>
                    </div>

                    <div className="ws-modal-actions ws-modal-actions-center">
                        <button className="ws-btn-cancel" onClick={onCancel}>
                            <FaTimes /> Cancel
                        </button>
                        <button className="ws-btn-delete" onClick={onConfirm} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : <><FaTrash /> Delete</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// REMOVE CUSTOMER CONFIRMATION MODAL (replaces window.confirm)
// ============================================
const RemoveCustomerConfirmationModal = ({
    show, customer, isRemoving, onCancel, onConfirm
}) => {
    if (!show) return null;

    return (
        <div className="ws-modal-overlay ws-modal-overlay-nested">
            <div className="ws-modal-content">
                <div className="ws-modal-header ws-danger">
                    <div className="ws-modal-title">
                        <FaUserMinus /> Remove Customer
                    </div>
                    <button className="ws-modal-close" onClick={onCancel}>
                        <FaTimes />
                    </button>
                </div>

                <div className="ws-delete-body">
                    <div className="ws-delete-icon">
                        <FaUserMinus />
                    </div>
                    <h3>Confirm Removal</h3>
                    <p>
                        Are you sure you want to remove{" "}
                        <strong style={{ color: "#3f3f91" }}>{customer?.customerName}</strong>{" "}
                        from this workshop?
                    </p>

                    <div className="ws-detail-card ws-detail-card-danger">
                        <div className="ws-detail-card-header">
                            <FaUser />
                            <strong>Customer:</strong>
                        </div>
                        <div className="ws-detail-card-info">
                            <div>Name: <strong>{customer?.customerName}</strong></div>
                            <div>Contact: <strong>{customer?.contactNumber}</strong></div>
                        </div>
                    </div>

                    <div className="ws-modal-actions ws-modal-actions-center">
                        <button className="ws-btn-cancel" onClick={onCancel}>
                            <FaTimes /> Cancel
                        </button>
                        <button className="ws-btn-delete" onClick={onConfirm} disabled={isRemoving}>
                            {isRemoving ? "Removing..." : <><FaUserMinus /> Remove</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// CUSTOMER MODAL (top-level — stable identity across re-renders)
// ============================================
const CustomerModal = ({
    show, selectedWorkshop, customerSearch, setCustomerSearch,
    filteredCustomers, selectedCustomer, setSelectedCustomer,
    showNewCustomerForm, setShowNewCustomerForm,
    newCustomer, setNewCustomer, isCreatingCustomer, onCreateCustomer,
    packages, selectedPackage, setSelectedPackage,
    isAddingCustomer, onAddCustomer, onClose, formatDate
}) => {
    if (!show) return null;

    return (
        <div className="ws-modal-overlay">
            <div className="ws-modal-content ws-modal-md">
                <div className="ws-modal-header">
                    <div className="ws-modal-title">
                        <FaUserPlus /> Add Customer to Workshop
                    </div>
                    <button className="ws-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="ws-modal-body">
                    <div className="ws-summary-strip">
                        <div className="ws-summary-items">
                            <div><strong>Date:</strong> {selectedWorkshop ? formatDate(selectedWorkshop.date) : ""}</div>
                            <div><strong>Time:</strong> {selectedWorkshop?.startTime}</div>
                            <div><strong>Current Customers:</strong> {selectedWorkshop?.customers?.length || 0}</div>
                        </div>
                    </div>

                    {!showNewCustomerForm ? (
                        <>
                            <div className="ws-form-row">
                                <div className="ws-form-field">
                                    <label><FaSearch /> Search Customer</label>
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        placeholder="Search by name, phone or email..."
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="ws-customer-list">
                                {!customerSearch.trim() ? (
                                    <div className="ws-customer-list-empty">
                                        Start typing to search for a customer
                                    </div>
                                ) : filteredCustomers.length === 0 ? (
                                    <div className="ws-customer-list-empty">No customers found</div>
                                ) : (
                                    filteredCustomers.map(c => (
                                        <div
                                            key={c.customerId}
                                            onClick={() => {
                                                if (selectedCustomer === c.customerId) {
                                                    toast.info("Customer already selected");
                                                    return;
                                                }
                                                setSelectedCustomer(c.customerId);
                                            }}
                                            className={`ws-customer-list-item ${selectedCustomer === c.customerId ? 'ws-customer-selected' : ''}`}
                                        >
                                            <div>
                                                <div className="ws-customer-list-name">{c.customerName}</div>
                                                <div className="ws-customer-list-meta">
                                                    {c.contactNumber} {c.email ? `| ${c.email}` : ""}
                                                </div>
                                            </div>
                                            {selectedCustomer === c.customerId && (
                                                <FaCheckCircle className="ws-customer-check-icon" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                className="ws-create-customer-trigger"
                                onClick={() => setShowNewCustomerForm(true)}
                            >
                                <FaPlus /> Create New Customer
                            </button>
                        </>
                    ) : (
                        <div className="ws-new-customer-panel">
                            <h4>New Customer Details</h4>

                            <div className="ws-form-row">
                                <div className="ws-form-field">
                                    <label><FaUser /> Customer Name *</label>
                                    <input
                                        type="text"
                                        value={newCustomer.customerName}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                                        placeholder="Enter customer name"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="ws-form-field">
                                    <label><FaPhone /> Contact Number *</label>
                                    <input
                                        type="text"
                                        value={newCustomer.contactNumber}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, contactNumber: e.target.value })}
                                        placeholder="Enter contact number"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="ws-form-row">
                                <div className="ws-form-field">
                                    <label><FaEnvelope /> Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        placeholder="Enter email address"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="ws-new-customer-actions">
                                <button
                                    className="ws-new-customer-cancel"
                                    onClick={() => setShowNewCustomerForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="ws-new-customer-save"
                                    onClick={onCreateCustomer}
                                    disabled={isCreatingCustomer || !newCustomer.customerName.trim() || !newCustomer.contactNumber.trim()}
                                >
                                    {isCreatingCustomer ? "Creating..." : "Create & Select"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="ws-form-row">
                        <div className="ws-form-field">
                            <label><FaBox /> Select Package *</label>
                            <select
                                value={selectedPackage}
                                onChange={(e) => setSelectedPackage(e.target.value)}
                            >
                                <option value="">Select a package...</option>
                                {packages.map(p => (
                                    <option key={p.packageId} value={p.packageId}>
                                        {p.packageName} - ₹{p.pricing} ({p.oilCount} Oils)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="ws-modal-actions">
                        <button className="ws-btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="ws-btn-primary"
                            onClick={onAddCustomer}
                            disabled={isAddingCustomer || !selectedCustomer || !selectedPackage}
                        >
                            {isAddingCustomer ? (
                                <>
                                    <div className="ws-loading-spinner small"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus /> Add Customer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// WORKSHOP DETAILS MODAL (top-level — stable identity across re-renders)
// ============================================
const WorkshopDetailsModal = ({
    show, viewingWorkshop, onClose,
    editingCustomerId, setEditingCustomerId,
    selectedEditPackage, setSelectedEditPackage,
    packages, isUpdatingPackage, onUpdateCustomerPackage,
    onToggleAttendance, onRequestRemoveCustomer, formatDate
}) => {
    if (!show || !viewingWorkshop) return null;

    return (
        <div className="ws-modal-overlay">
            <div className="ws-modal-content ws-modal-lg">
                <div className="ws-modal-header">
                    <div className="ws-modal-title">
                        <FaEye /> Workshop Details
                    </div>
                    <button className="ws-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="ws-modal-body">
                    <div className="ws-summary-strip">
                        <div className="ws-summary-items">
                            <div><strong>Date:</strong> {formatDate(viewingWorkshop.date)}</div>
                            <div><strong>Time:</strong> {viewingWorkshop.startTime}</div>
                            <div>
                                <strong>Status:</strong>{" "}
                                <span className={`ws-status-badge ${viewingWorkshop.status === 'active' ? 'ws-active' : 'ws-inactive'}`}>
                                    {viewingWorkshop.status}
                                </span>
                            </div>
                            <div><strong>Total Customers:</strong> {viewingWorkshop.customers?.length || 0}</div>
                        </div>
                    </div>

                    <h4 className="ws-details-section-title">Customers List</h4>

                    {viewingWorkshop.customers?.length === 0 ? (
                        <div className="ws-empty-state">
                            <FaUsers className="ws-empty-icon" />
                            <p>No customers in this workshop</p>
                        </div>
                    ) : (
                        <div className="ws-details-table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Contact</th>
                                        <th>Package</th>
                                        <th style={{ textAlign: 'center' }}>Attendance</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingWorkshop.customers.map((c, index) => (
                                        <tr key={index}>
                                            <td className="ws-details-name-cell">{c.customerName}</td>
                                            <td>{c.contactNumber}</td>
                                            <td className="ws-details-package-cell">
                                                {editingCustomerId === c.customerId ? (
                                                    <div className="ws-edit-package-container">
                                                        <select
                                                            value={selectedEditPackage}
                                                            onChange={(e) => setSelectedEditPackage(e.target.value)}
                                                            className="ws-edit-package-select"
                                                        >
                                                            <option value="">Select Package</option>
                                                            {packages.map(p => (
                                                                <option key={p.packageId} value={p.packageId}>
                                                                    {p.packageName} - ₹{p.pricing}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => onUpdateCustomerPackage(viewingWorkshop.workshopId, c.customerId)}
                                                            disabled={isUpdatingPackage}
                                                            className="ws-edit-package-save"
                                                        >
                                                            {isUpdatingPackage ? "Saving..." : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingCustomerId(null);
                                                                setSelectedEditPackage("");
                                                            }}
                                                            className="ws-edit-package-cancel"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="ws-package-display">
                                                        <strong>{c.packageName}</strong> (₹{c.packagePricing})
                                                        <button
                                                            onClick={() => {
                                                                setEditingCustomerId(c.customerId);
                                                                setSelectedEditPackage(c.packageId);
                                                            }}
                                                            className="ws-edit-package-btn"
                                                        >
                                                            <FaEdit /> Change
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="ws-details-attendance-cell">
                                                <button
                                                    onClick={() => onToggleAttendance(
                                                        viewingWorkshop.workshopId,
                                                        c.customerId,
                                                        c.attended
                                                    )}
                                                    className="ws-attendance-toggle-btn"
                                                    title={c.attended ? "Mark Absent" : "Mark Present"}
                                                >
                                                    <span className={`ws-status-badge ${c.attended ? 'ws-present' : 'ws-absent'}`}>
                                                        {c.attended ? "Present" : "Absent"}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="ws-details-action-cell">
                                                <button
                                                    onClick={() => onRequestRemoveCustomer(
                                                        viewingWorkshop.workshopId,
                                                        c.customerId,
                                                        c.customerName,
                                                        c.contactNumber
                                                    )}
                                                    className="ws-remove-customer-btn"
                                                >
                                                    <FaTrash /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Workshops = () => {
    const [workshops, setWorkshops] = useState([]);
    const [filteredWorkshops, setFilteredWorkshops] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState("active");
    const navigate = useNavigate();

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedEndTime, setSelectedEndTime] = useState("");

    // Customer management states
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedPackage, setSelectedPackage] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        customerName: "",
        email: "",
        contactNumber: ""
    });
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // Delete confirmation (workshop)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [workshopToDelete, setWorkshopToDelete] = useState(null);

    // Remove customer confirmation (replaces window.confirm)
    const [showRemoveCustomerConfirm, setShowRemoveCustomerConfirm] = useState(false);
    const [customerToRemove, setCustomerToRemove] = useState(null); // { workshopId, customerId, customerName, contactNumber }
    const [isRemovingCustomer, setIsRemovingCustomer] = useState(false);

    // View workshop details
    const [showWorkshopDetails, setShowWorkshopDetails] = useState(false);
    const [viewingWorkshop, setViewingWorkshop] = useState(null);

    // Edit customer package in details modal
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [selectedEditPackage, setSelectedEditPackage] = useState("");
    const [isUpdatingPackage, setIsUpdatingPackage] = useState(false);

    // Refs
    const dateInputRef = useRef(null);
    const timeInputRef = useRef(null);

    // ============================================
    // FETCH WORKSHOPS
    // ============================================
    const fetchWorkshops = async () => {
        try {
            setIsLoading(true);
            const endpoint = viewMode === "active"
                ? `${import.meta.env.VITE_API_URL}/workshops/get-active`
                : `${import.meta.env.VITE_API_URL}/workshops/get-all`;

            const response = await fetch(endpoint, { credentials: 'include' });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch workshops');
            }

            const data = await response.json();
            setWorkshops(data);
            setFilteredWorkshops(data);
        } catch (error) {
            console.error("Error fetching workshops:", error);
            toast.error("Failed to fetch workshops");
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // FETCH CUSTOMERS
    // ============================================
    const fetchCustomers = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/customer/get-customers`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch customers');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Failed to fetch customers");
        }
    };

    // ============================================
    // FETCH PACKAGES
    // ============================================
    const fetchPackages = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/packages/get-active`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch packages');
            const data = await response.json();
            setPackages(data);
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to fetch packages");
        }
    };

    // ============================================
    // FETCH AVAILABLE SLOTS
    // ============================================
    const fetchAvailableSlots = async (date) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/available-slots/${date}`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch available slots');
            const data = await response.json();
            setAvailableSlots(data.availableSlots || []);
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setAvailableSlots([]);
        }
    };

    useEffect(() => {
        fetchWorkshops();
        fetchCustomers();
        fetchPackages();
    }, [viewMode]);

    // ============================================
    // SEARCH
    // ============================================
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredWorkshops(workshops);
            return;
        }

        const search = searchTerm.toLowerCase();
        const filtered = workshops.filter((w) => {
            const dateStr = new Date(w.date).toLocaleDateString();
            return (
                dateStr.includes(search) ||
                w.startTime.includes(search) ||
                w.customers.some(c =>
                    c.customerName?.toLowerCase().includes(search) ||
                    c.contactNumber?.includes(search)
                )
            );
        });
        setFilteredWorkshops(filtered);
    }, [searchTerm, workshops]);

    // ============================================
    // RESET FORM
    // ============================================
    const resetForm = () => {
        setSelectedDate("");
        setSelectedTime("");
        setEditingWorkshop(null);
        setAvailableSlots([]);
        setSelectedEndTime("");
    };

    // ============================================
    // HANDLE DATE CHANGE
    // ============================================
    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            fetchAvailableSlots(date);
        } else {
            setAvailableSlots([]);
        }
        setSelectedTime("");
    };

    // ============================================
    // HANDLE EDIT
    // ============================================
    const handleEdit = (workshop) => {
        setEditingWorkshop(workshop);
        const dateStr = new Date(workshop.date).toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setSelectedTime(workshop.startTime);
        setSelectedEndTime(workshop.endTime || "");
        setShowForm(true);
        fetchAvailableSlots(dateStr);

        setTimeout(() => {
            dateInputRef.current?.focus();
        }, 100);
    };

    // ============================================
    // HANDLE SAVE (CREATE/UPDATE)
    // ============================================
    const handleSave = async () => {
        try {
            if (!selectedDate) {
                toast.error("Please select a date");
                return;
            }

            if (!selectedTime) {
                toast.error("Please select a start time");
                return;
            }

            if (!selectedEndTime) {
                toast.error("Please select an end time");
                return;
            }

            if (selectedTime >= selectedEndTime) {
                toast.error("Start time must be before end time");
                return;
            }

            setIsSaving(true);

            const url = editingWorkshop
                ? `${import.meta.env.VITE_API_URL}/workshops/update/${editingWorkshop.workshopId}`
                : `${import.meta.env.VITE_API_URL}/workshops/create`;

            const method = editingWorkshop ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: selectedDate,
                    startTime: selectedTime,
                    endTime: selectedEndTime
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save workshop");
            }

            const result = await response.json();
            toast.success(result.message);

            await fetchWorkshops();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving workshop:", error);
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================
    // HANDLE DELETE WORKSHOP
    // ============================================
    const handleDelete = async () => {
        if (!workshopToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/delete/${workshopToDelete}`,
                { method: "DELETE", credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to delete workshop');

            const result = await response.json();
            toast.success(result.message);
            await fetchWorkshops();
        } catch (error) {
            console.error("Error deleting workshop:", error);
            toast.error("Failed to delete workshop");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setWorkshopToDelete(null);
        }
    };

    // ============================================
    // HANDLE ADD CUSTOMER TO WORKSHOP
    // ============================================
    const handleAddCustomer = async () => {
        try {
            if (!selectedCustomer) {
                toast.error("Please select a customer");
                return;
            }

            if (!selectedPackage) {
                toast.error("Please select a package");
                return;
            }

            setIsAddingCustomer(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/${selectedWorkshop.workshopId}/add-customer`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ customerId: selectedCustomer, packageId: selectedPackage }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add customer");
            }

            const result = await response.json();
            toast.success(result.message);

            setSelectedWorkshop(result.workshop);
            await fetchWorkshops();

            setSelectedCustomer("");
            setSelectedPackage("");
            setCustomerSearch("");
        } catch (error) {
            console.error("Error adding customer:", error);
            toast.error(error.message);
        } finally {
            setIsAddingCustomer(false);
        }
    };

    // ============================================
    // FETCH WORKSHOP BY ID
    // ============================================
    const fetchWorkshopById = async (workshopId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/${workshopId}`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch workshop');
            return await response.json();
        } catch (error) {
            console.error("Error fetching workshop:", error);
            return null;
        }
    };

    // ============================================
    // OPEN REMOVE CUSTOMER CONFIRMATION (replaces window.confirm)
    // ============================================
    const requestRemoveCustomer = (workshopId, customerId, customerName, contactNumber) => {
        setCustomerToRemove({ workshopId, customerId, customerName, contactNumber });
        setShowRemoveCustomerConfirm(true);
    };

    // ============================================
    // HANDLE REMOVE CUSTOMER (actual API call, runs after confirm)
    // ============================================
    const handleRemoveCustomer = async () => {
        if (!customerToRemove) return;
        const { workshopId, customerId } = customerToRemove;

        try {
            setIsRemovingCustomer(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/${workshopId}/remove-customer/${customerId}`,
                { method: "DELETE", credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to remove customer');

            const result = await response.json();
            toast.success(result.message);

            setSelectedWorkshop(result.workshop);
            await fetchWorkshops();

            if (showWorkshopDetails && viewingWorkshop) {
                const updatedWorkshop = await fetchWorkshopById(viewingWorkshop.workshopId);
                if (updatedWorkshop) {
                    setViewingWorkshop(updatedWorkshop);
                }
            }
        } catch (error) {
            console.error("Error removing customer:", error);
            toast.error("Failed to remove customer");
        } finally {
            setIsRemovingCustomer(false);
            setShowRemoveCustomerConfirm(false);
            setCustomerToRemove(null);
        }
    };

    // ============================================
    // HANDLE CREATE NEW CUSTOMER
    // ============================================
    const handleCreateCustomer = async () => {
        try {
            if (!newCustomer.customerName.trim()) {
                toast.error("Customer name is required");
                return;
            }

            if (!newCustomer.contactNumber.trim()) {
                toast.error("Contact number is required");
                return;
            }

            setIsCreatingCustomer(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/customer/create-customer`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newCustomer),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create customer");
            }

            const result = await response.json();
            toast.success("Customer created successfully");

            await fetchCustomers();
            setSelectedCustomer(result.data.customerId);

            setNewCustomer({ customerName: "", email: "", contactNumber: "" });
            setShowNewCustomerForm(false);
        } catch (error) {
            console.error("Error creating customer:", error);
            toast.error(error.message);
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    // ============================================
    // HANDLE UPDATE CUSTOMER PACKAGE
    // ============================================
    const handleUpdateCustomerPackage = async (workshopId, customerId) => {
        try {
            if (!selectedEditPackage) {
                toast.error("Please select a package");
                return;
            }

            setIsUpdatingPackage(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/${workshopId}/customer/${customerId}/package`,
                {
                    method: "PATCH",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ packageId: selectedEditPackage }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update package");
            }

            const result = await response.json();
            toast.success(result.message);

            const updatedWorkshop = await fetchWorkshopById(workshopId);
            if (updatedWorkshop) {
                setViewingWorkshop(updatedWorkshop);
            }
            await fetchWorkshops();

            setEditingCustomerId(null);
            setSelectedEditPackage("");
        } catch (error) {
            console.error("Error updating customer package:", error);
            toast.error(error.message);
        } finally {
            setIsUpdatingPackage(false);
        }
    };

    // ============================================
    // HANDLE TOGGLE ATTENDANCE
    // ============================================
    const handleToggleAttendance = async (workshopId, customerId, currentAttended) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/workshops/${workshopId}/customer/${customerId}/attendance`,
                {
                    method: "PATCH",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ attended: !currentAttended }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update attendance');
            }

            const result = await response.json();
            toast.success(result.message);

            const updatedWorkshop = await fetchWorkshopById(workshopId);
            if (updatedWorkshop) {
                setViewingWorkshop(updatedWorkshop);
            }
            await fetchWorkshops();
        } catch (error) {
            console.error("Error updating attendance:", error);
            toast.error("Failed to update attendance");
        }
    };

    // ============================================
    // OPEN CUSTOMER MODAL
    // ============================================
    const openCustomerModal = (workshop) => {
        setSelectedWorkshop(workshop);
        setSelectedCustomer("");
        setSelectedPackage("");
        setCustomerSearch("");
        setShowNewCustomerForm(false);
        setNewCustomer({ customerName: "", email: "", contactNumber: "" });
        setShowCustomerModal(true);
    };

    // ============================================
    // VIEW WORKSHOP DETAILS
    // ============================================
    const viewWorkshopDetails = async (workshop) => {
        const freshWorkshop = await fetchWorkshopById(workshop.workshopId);
        if (freshWorkshop) {
            setViewingWorkshop(freshWorkshop);
        } else {
            setViewingWorkshop(workshop);
        }
        setEditingCustomerId(null);
        setSelectedEditPackage("");
        setShowWorkshopDetails(true);
    };

    // ============================================
    // FILTER CUSTOMERS BY SEARCH — empty search shows NOTHING (fixed)
    // ============================================
    const filteredCustomers = !customerSearch.trim()
        ? []
        : customers.filter(c =>
            c.customerName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.contactNumber?.includes(customerSearch) ||
            c.email?.toLowerCase().includes(customerSearch.toLowerCase())
        );

    // ============================================
    // FORMAT DATE
    // ============================================
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <Navbar>
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="ws-main">

                <div className="ws-page-header">
                    <h2>Workshop Management</h2>
                    <div className="ws-right-section">
                        <div className="ws-search-container">
                            <FaSearch className="ws-search-icon" />
                            <input
                                type="text"
                                placeholder="Search workshops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="ws-action-buttons-group">
                            <button
                                className={`ws-toggle-view-btn ${viewMode === 'active' ? 'ws-view-active' : ''}`}
                                onClick={() => setViewMode(viewMode === 'active' ? 'all' : 'active')}
                            >
                                {viewMode === 'active' ? 'Show All' : 'Show Active'}
                            </button>
                            <button
                                className="ws-add-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(!showForm);
                                }}
                            >
                                <FaPlus /> {showForm ? "Close" : "Add Workshop"}
                            </button>
                        </div>
                    </div>
                </div>

                {showForm && (
                    <div className="ws-form-container">
                        <h2>{editingWorkshop ? "Edit Workshop" : "Add New Workshop"}</h2>

                        <div className="ws-form-row">
                            <div className="ws-form-field">
                                <label><FaCalendarAlt /> Select Date *</label>
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="ws-form-row">
                            <div className="ws-form-field">
                                <label><FaClock /> Start Time *</label>
                                <input
                                    ref={timeInputRef}
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    step="900"
                                />
                            </div>
                            <div className="ws-form-field">
                                <label><FaClock /> End Time *</label>
                                <input
                                    type="time"
                                    value={selectedEndTime}
                                    onChange={(e) => setSelectedEndTime(e.target.value)}
                                    step="900"
                                />
                            </div>
                        </div>

                        <div className="ws-form-actions">
                            <button
                                type="button"
                                className="ws-cancel-btn"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="ws-save-btn"
                                onClick={handleSave}
                                disabled={isSaving || !selectedDate || !selectedTime || !selectedEndTime}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="ws-loading-spinner small"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        {editingWorkshop ? "Update Workshop" : "Create Workshop"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="ws-data-table">
                    {isLoading ? (
                        <div className="ws-loading-container">
                            <div className="ws-loading-spinner large"></div>
                            <p>Loading workshops...</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Customers</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWorkshops.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="ws-empty-state">
                                                <FaCalendarAlt className="ws-empty-icon" />
                                                <p>No workshops found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWorkshops.map((workshop) => (
                                        <tr key={workshop.workshopId}>
                                            <td className="ws-date-cell">{formatDate(workshop.date)}</td>
                                            <td className="ws-time-cell"><strong>{workshop.startTime}</strong></td>
                                            <td className="ws-customer-count-cell">
                                                <span className="ws-customer-count-pill">
                                                    {workshop.customers?.length || 0} Customers
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`ws-status-badge ${workshop.status === 'active' ? 'ws-active' : 'ws-inactive'}`}>
                                                    {workshop.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ws-row-actions">
                                                    <button
                                                        className="ws-view-btn"
                                                        onClick={() => viewWorkshopDetails(workshop)}
                                                        title="View Details"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button
                                                        className="ws-add-customer-btn"
                                                        onClick={() => openCustomerModal(workshop)}
                                                        title="Add Customer"
                                                        disabled={workshop.status !== 'active'}
                                                    >
                                                        <FaUserPlus /> Add
                                                    </button>
                                                    <button
                                                        className="ws-edit-btn"
                                                        onClick={() => handleEdit(workshop)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        className="ws-delete-btn"
                                                        onClick={() => {
                                                            setWorkshopToDelete(workshop.workshopId);
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

                <DeleteConfirmationModal
                    show={showDeleteConfirm}
                    workshop={workshops.find(w => w.workshopId === workshopToDelete)}
                    isDeleting={isDeleting}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    formatDate={formatDate}
                />

                <RemoveCustomerConfirmationModal
                    show={showRemoveCustomerConfirm}
                    customer={customerToRemove}
                    isRemoving={isRemovingCustomer}
                    onCancel={() => {
                        setShowRemoveCustomerConfirm(false);
                        setCustomerToRemove(null);
                    }}
                    onConfirm={handleRemoveCustomer}
                />

                <CustomerModal
                    show={showCustomerModal}
                    selectedWorkshop={selectedWorkshop}
                    customerSearch={customerSearch}
                    setCustomerSearch={setCustomerSearch}
                    filteredCustomers={filteredCustomers}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    showNewCustomerForm={showNewCustomerForm}
                    setShowNewCustomerForm={setShowNewCustomerForm}
                    newCustomer={newCustomer}
                    setNewCustomer={setNewCustomer}
                    isCreatingCustomer={isCreatingCustomer}
                    onCreateCustomer={handleCreateCustomer}
                    packages={packages}
                    selectedPackage={selectedPackage}
                    setSelectedPackage={setSelectedPackage}
                    isAddingCustomer={isAddingCustomer}
                    onAddCustomer={handleAddCustomer}
                    onClose={() => setShowCustomerModal(false)}
                    formatDate={formatDate}
                />

                <WorkshopDetailsModal
                    show={showWorkshopDetails}
                    viewingWorkshop={viewingWorkshop}
                    onClose={() => setShowWorkshopDetails(false)}
                    editingCustomerId={editingCustomerId}
                    setEditingCustomerId={setEditingCustomerId}
                    selectedEditPackage={selectedEditPackage}
                    setSelectedEditPackage={setSelectedEditPackage}
                    packages={packages}
                    isUpdatingPackage={isUpdatingPackage}
                    onUpdateCustomerPackage={handleUpdateCustomerPackage}
                    onToggleAttendance={handleToggleAttendance}
                    onRequestRemoveCustomer={requestRemoveCustomer}
                    formatDate={formatDate}
                />

            </div>
        </Navbar>
    );
};

export default Workshops;