import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
    FaUser, FaPhone, FaEnvelope, FaBoxOpen,
    FaFlask, FaTag, FaMoneyBillWave, FaTrash,
    FaPlus, FaSave, FaList, FaTimes, FaEye,
    FaFileInvoice, FaSearch, FaBan, FaCalendarAlt,
    FaCreditCard, FaPlusCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Invoice.scss";
import "react-toastify/dist/ReactToastify.css";
import Select from 'react-select';

// ============================================
// INVOICE DETAILS MODAL (the ONLY popup — per-record details)
// ============================================
const InvoiceDetailsModal = ({
    show, onClose, invoice, isLoading, formatDate, getStatusClass
}) => {
    if (!show) return null;

    return (
        <div className="inv-modal-overlay" onClick={onClose}>
            <div className="inv-modal-content inv-modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="inv-modal-header">
                    <div className="inv-modal-title">
                        <FaFileInvoice /> Invoice Details
                    </div>
                    <button className="inv-modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="inv-modal-body">
                    {isLoading ? (
                        <div className="inv-list-loading">
                            <div className="inv-loading-spinner-dark large"></div>
                            <p>Loading invoice details...</p>
                        </div>
                    ) : !invoice ? (
                        <div className="inv-list-empty">
                            <FaFileInvoice className="inv-list-empty-icon" />
                            <p>Unable to load invoice details</p>
                        </div>
                    ) : (
                        <>
                            <div className="inv-details-header-strip">
                                <div>
                                    <span className="inv-details-label">Invoice Number</span>
                                    <strong className="inv-details-invoice-number">{invoice.invoiceNumber}</strong>
                                </div>
                                <span className={`inv-status-badge ${getStatusClass(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </div>

                            <div className="inv-details-section">
                                <h4><FaUser /> Customer</h4>
                                <div className="inv-details-grid">
                                    <div className="inv-details-item">
                                        <span className="inv-details-label">Name</span>
                                        <strong>{invoice.customer?.customerName}</strong>
                                    </div>
                                    <div className="inv-details-item">
                                        <span className="inv-details-label">Phone</span>
                                        <strong>{invoice.customer?.contactNumber}</strong>
                                    </div>
                                    {invoice.customer?.email && (
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Email</span>
                                            <strong>{invoice.customer.email}</strong>
                                        </div>
                                    )}
                                    <div className="inv-details-item">
                                        <span className="inv-details-label">Invoice Date</span>
                                        <strong>{formatDate(invoice.invoiceDate)}</strong>
                                    </div>
                                </div>
                            </div>

                            {invoice.hasWorkshop && invoice.workshop && (
                                <div className="inv-details-section">
                                    <h4><FaCalendarAlt /> Workshop</h4>
                                    <div className="inv-details-grid">
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Date</span>
                                            <strong>{formatDate(invoice.workshop.date)}</strong>
                                        </div>
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Time</span>
                                            <strong>{invoice.workshop.startTime} - {invoice.workshop.endTime}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {invoice.hasPackage && invoice.packageItem && (
                                <div className="inv-details-section">
                                    <h4><FaBoxOpen /> Package</h4>
                                    <div className="inv-details-grid">
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Package</span>
                                            <strong>{invoice.packageItem.packageName}</strong>
                                        </div>
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Price</span>
                                            <strong>₹{invoice.packageItem.pricing}</strong>
                                        </div>
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Bottle Size</span>
                                            <strong>{invoice.packageItem.bottleML}ml</strong>
                                        </div>
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Oil Count</span>
                                            <strong>{invoice.packageItem.oilCount}</strong>
                                        </div>
                                        {invoice.packageItem.xpOil && (
                                            <div className="inv-details-item">
                                                <span className="inv-details-label">XP Oil Used</span>
                                                <strong>{invoice.packageItem.xpOil.productName}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {invoice.hasDispenser && invoice.dispenserItems?.length > 0 && (
                                <div className="inv-details-section">
                                    <h4><FaFlask /> Dispenser Items</h4>
                                    <div className="inv-details-table-wrap">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>ML</th>
                                                    <th>Qty</th>
                                                    <th>Total ML</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.dispenserItems.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.productName}</td>
                                                        <td>{item.ml}ml</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.totalML}ml</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {invoice.hasPromo && invoice.promoApplied && (
                                <div className="inv-details-section">
                                    <h4><FaTag /> Promo Applied</h4>
                                    <div className="inv-details-grid">
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Code</span>
                                            <strong>{invoice.promoApplied.code}</strong>
                                        </div>
                                        <div className="inv-details-item">
                                            <span className="inv-details-label">Discount</span>
                                            <strong>{invoice.promoApplied.discount}%</strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="inv-details-section">
                                <h4><FaCreditCard /> Payment &amp; Totals</h4>
                                <div className="inv-details-totals">
                                    <div className="inv-details-totals-row">
                                        <span>Subtotal (incl. GST)</span>
                                        <strong>₹{invoice.subtotal?.toFixed(2)}</strong>
                                    </div>
                                    <div className="inv-details-totals-row inv-details-totals-sub">
                                        <span>GST ({invoice.gstRate}%)</span>
                                        <strong>₹{invoice.gstAmount?.toFixed(2)}</strong>
                                    </div>
                                    {invoice.hasPromo && (
                                        <div className="inv-details-totals-row inv-details-totals-sub inv-details-totals-promo">
                                            <span>Promo Discount</span>
                                            <strong>-₹{invoice.promoDiscount?.toFixed(2)}</strong>
                                        </div>
                                    )}
                                    <div className="inv-details-totals-row inv-details-totals-grand">
                                        <span>Grand Total</span>
                                        <strong>₹{invoice.grandTotal?.toFixed(2)}</strong>
                                    </div>
                                    <div className="inv-details-totals-row inv-details-totals-sub">
                                        <span>Payment Method</span>
                                        <strong>{invoice.paymentStatus}</strong>
                                    </div>
                                </div>
                            </div>

                            {invoice.notes && (
                                <div className="inv-details-section">
                                    <h4>Notes</h4>
                                    <p className="inv-details-notes">{invoice.notes}</p>
                                </div>
                            )}

                            <div className="inv-details-footer-meta">
                                Created by <strong>{invoice.createdBy?.userName || 'Unknown'}</strong>
                            </div>
                        </>
                    )}
                </div>
                <div className="inv-modal-footer">
                    <button className="inv-modal-btn-close" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const Invoice = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // ========== PAGE VIEW TOGGLE (replaces navigation — inline flow) ==========
    const [activeView, setActiveView] = useState("create"); // "create" | "list"

    // ========== DATA STATES ==========
    const [customers, setCustomers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [packages, setPackages] = useState([]);
    const [xpOils, setXpOils] = useState([]);
    const [dispenserOils, setDispenserOils] = useState([]);
    const [promoCodes, setPromoCodes] = useState([]);

    // ========== INVOICE FORM STATE ==========
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedXPOil, setSelectedXPOil] = useState(null);
    const [dispenserItems, setDispenserItems] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState("Cash");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");

    // ========== DISPENSER ADD FORM ==========
    const [dispenserSelect, setDispenserSelect] = useState(null);
    const [dispenserML, setDispenserML] = useState("");
    const [dispenserQty, setDispenserQty] = useState("");

    // ========== RECENT WORKSHOP ==========
    const [recentWorkshop, setRecentWorkshop] = useState(null);

    // ========== CALCULATIONS ==========
    const [subtotal, setSubtotal] = useState(0);
    const [gstAmount, setGstAmount] = useState(0);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    // ========== INVOICE LIST STATE (inline table, not a modal) ==========
    const [allInvoices, setAllInvoices] = useState([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
    const [hasLoadedInvoicesOnce, setHasLoadedInvoicesOnce] = useState(false);

    // ========== INVOICE DETAILS MODAL STATE (the only popup) ==========
    const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null);
    const [isLoadingInvoiceDetails, setIsLoadingInvoiceDetails] = useState(false);

    // ========== GST RATE ==========
    const GST_RATE = 18;

    // ============================================
    // FETCH DATA
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

    const fetchXPOils = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/xp/get-all`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch XP oils');
            const data = await response.json();
            setXpOils(data.products || []);
        } catch (error) {
            console.error("Error fetching XP oils:", error);
            toast.error("Failed to fetch XP oils");
        }
    };

    const fetchDispenserOils = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/dispenser/get-all`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch dispenser oils');
            const data = await response.json();
            setDispenserOils(data.products || []);
        } catch (error) {
            console.error("Error fetching dispenser oils:", error);
            toast.error("Failed to fetch dispenser oils");
        }
    };

    const fetchPromoCodes = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/promo/get-active-promos`,
                { credentials: 'include' }
            );
            if (!response.ok) throw new Error('Failed to fetch promo codes');
            const data = await response.json();
            setPromoCodes(data);
        } catch (error) {
            console.error("Error fetching promo codes:", error);
            toast.error("Failed to fetch promo codes");
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchPackages();
        fetchXPOils();
        fetchDispenserOils();
        fetchPromoCodes();
    }, []);

    useEffect(() => {
        const fetchWorkshopsForCustomer = async () => {
            if (!selectedCustomer) {
                setWorkshops([]);
                setSelectedWorkshop(null);
                setRecentWorkshop(null);
                return;
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/workshops/get-active?filter=all&limit=100&sortBy=date&sortOrder=desc`,
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch workshops');
                }

                const data = await response.json();

                const workshopsArray = Array.isArray(data) ? data : data.workshops || data.data || [];

                const customerWorkshops = workshopsArray.filter(w => {
                    const hasCustomer = w.customers && Array.isArray(w.customers) &&
                        w.customers.some(c => c.customerId === selectedCustomer.value);
                    return hasCustomer;
                });

                setWorkshops(customerWorkshops);

                if (customerWorkshops.length > 0) {
                    const latest = customerWorkshops.reduce((latestSoFar, current) => {
                        const currentDateTime = new Date(`${current.date}T${current.startTime}`);
                        const latestDateTime = new Date(`${latestSoFar.date}T${latestSoFar.startTime}`);
                        return currentDateTime > latestDateTime ? current : latestSoFar;
                    }, customerWorkshops[0]);

                    // ✅ CHECK IF CUSTOMER ALREADY HAS INVOICE FOR THIS WORKSHOP
                    const customerInWorkshop = latest.customers.find(
                        c => c.customerId === selectedCustomer.value
                    );

                    // ✅ If invoice already created for this workshop
                    if (customerInWorkshop && customerInWorkshop.invoiceCreated === true) {
                        toast.warning(`Latest workshop invoice already created for ${selectedCustomer.label}`);
                        setSelectedWorkshop(null);
                        setRecentWorkshop(null);
                    } else {
                        // ✅ No invoice yet, auto-select normally
                        setSelectedWorkshop({
                            value: latest.workshopId,
                            label: `${new Date(latest.date).toLocaleDateString()} - ${latest.startTime}`,
                            data: latest
                        });
                        setRecentWorkshop(latest);
                    }
                } else {
                    setSelectedWorkshop(null);
                    setRecentWorkshop(null);
                }
            } catch (error) {
                console.error("Error fetching workshops:", error);
                toast.error("Failed to fetch workshops");
            }
        };

        fetchWorkshopsForCustomer();
    }, [selectedCustomer]);

    // ============================================
    // AUTO SELECT PACKAGE FROM WORKSHOP
    // ============================================
    useEffect(() => {
        if (recentWorkshop && selectedCustomer) {
            const customerInWorkshop = recentWorkshop.customers.find(
                c => c.customerId === selectedCustomer.value
            );

            if (customerInWorkshop && customerInWorkshop.packageId) {
                const foundPackage = packages.find(p => p.packageId === customerInWorkshop.packageId);
                if (foundPackage) {
                    setSelectedPackage({
                        value: foundPackage.packageId,
                        label: foundPackage.packageName,
                        data: foundPackage
                    });
                }
            }
        }
    }, [recentWorkshop, selectedCustomer, packages]);

    // ============================================
    // CALCULATE TOTALS
    // ============================================
    useEffect(() => {
        let total = 0;

        if (selectedPackage) {
            total += selectedPackage.data.pricing;
        }

        dispenserItems.forEach(item => {
            const price = item.ml === 3 ? item.sellingPrice3ml : item.sellingPrice6ml;
            total += price * item.totalML;
        });

        setSubtotal(total);

        const subtotalWithoutGST = total / (1 + GST_RATE / 100);
        let discount = 0;

        if (selectedPromo) {
            discount = subtotalWithoutGST * (selectedPromo.discount / 100);
        }

        const afterPromo = subtotalWithoutGST - discount;
        const gst = afterPromo * (GST_RATE / 100);
        const grand = afterPromo + gst;

        setGstAmount(gst);
        setPromoDiscount(discount);
        setGrandTotal(grand);

    }, [selectedPackage, dispenserItems, selectedPromo]);

    // ============================================
    // HANDLE ADD DISPENSER ITEM
    // ============================================
    const handleAddDispenser = () => {
        if (!dispenserSelect) {
            toast.error("Please select a dispenser oil");
            return;
        }

        if (!dispenserML) {
            toast.error("Please select ML");
            return;
        }

        if (!dispenserQty || parseInt(dispenserQty) <= 0) {
            toast.error("Please enter valid quantity");
            return;
        }

        const ml = parseInt(dispenserML);
        const qty = parseInt(dispenserQty);
        const totalML = ml * qty;

        const exists = dispenserItems.some(
            item => item.dispenserId === dispenserSelect.value && item.ml === ml
        );

        if (exists) {
            toast.error("This dispenser oil with same ML is already added");
            return;
        }

        setDispenserItems([
            ...dispenserItems,
            {
                dispenserId: dispenserSelect.value,
                productName: dispenserSelect.label,
                ml: ml,
                quantity: qty,
                totalML: totalML,
                sellingPrice3ml: dispenserSelect.data?.sellingPrice3ml || 0,
                sellingPrice6ml: dispenserSelect.data?.sellingPrice6ml || 0,
                discount: dispenserSelect.data?.discount || 0
            }
        ]);

        setDispenserSelect(null);
        setDispenserML("");
        setDispenserQty("");

        toast.success("Dispenser item added");
    };

    // ============================================
    // HANDLE REMOVE DISPENSER ITEM
    // ============================================
    const handleRemoveDispenser = (index) => {
        const newItems = dispenserItems.filter((_, i) => i !== index);
        setDispenserItems(newItems);
    };

    // ============================================
    // HANDLE CREATE INVOICE
    // ============================================
    const handleCreateInvoice = async () => {
        try {
            if (!selectedCustomer) {
                toast.error("Please select a customer");
                return;
            }

            if (!selectedPackage && dispenserItems.length === 0) {
                toast.error("Please add a package or dispenser items");
                return;
            }

            if (selectedPackage && !selectedXPOil) {
                toast.error("Please select an XP oil for the package");
                return;
            }

            setIsSubmitting(true);

            const payload = {
                customerId: selectedCustomer.value,
                workshopId: selectedWorkshop?.value || null,
                packageId: selectedPackage?.value || null,
                xpOilId: selectedXPOil?.value || null,
                dispenserItems: dispenserItems.map(item => ({
                    dispenserId: item.dispenserId,
                    ml: item.ml,
                    quantity: item.quantity
                })),
                promoCode: selectedPromo?.code || null,
                paymentStatus: paymentStatus,
                invoiceDate: invoiceDate,
                notes: notes
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice/create`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create invoice");
            }

            const result = await response.json();
            toast.success(`Invoice ${result.invoice.invoiceNumber} created successfully!`);

            setSelectedCustomer(null);
            setSelectedWorkshop(null);
            setSelectedPackage(null);
            setSelectedXPOil(null);
            setDispenserItems([]);
            setSelectedPromo(null);
            setPaymentStatus("Cash");
            setNotes("");
            setInvoiceDate(new Date().toISOString().split('T')[0]);

            fetchCustomers();
            fetchPackages();
            fetchXPOils();
            fetchDispenserOils();

            // If the invoice list was already loaded once, refresh it silently in background
            if (hasLoadedInvoicesOnce) {
                fetchAllInvoices();
            }

        } catch (error) {
            console.error("Error creating invoice:", error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // FETCH ALL INVOICES (inline table data)
    // ============================================
    const fetchAllInvoices = async () => {
        try {
            setIsLoadingInvoices(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice/get-all?limit=200`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch invoices');

            const data = await response.json();
            setAllInvoices(data.invoices || []);
            setHasLoadedInvoicesOnce(true);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to fetch invoices");
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    // ============================================
    // SWITCH TO "VIEW INVOICES" TAB (inline, no modal/navigation)
    // ============================================
    const handleSwitchToListView = () => {
        setActiveView("list");
        setInvoiceSearchTerm("");
        fetchAllInvoices();
    };

    // ============================================
    // SWITCH BACK TO "CREATE INVOICE" TAB
    // ============================================
    const handleSwitchToCreateView = () => {
        setActiveView("create");
    };

    // ============================================
    // FETCH SINGLE INVOICE & OPEN DETAILS MODAL
    // (the only popup in this whole flow — per-record details)
    // ============================================
    const handleViewInvoice = async (invoiceId) => {
        try {
            setViewingInvoice(null);
            setShowInvoiceDetailsModal(true);
            setIsLoadingInvoiceDetails(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice/${invoiceId}`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch invoice details');

            const data = await response.json();
            setViewingInvoice(data);
        } catch (error) {
            console.error("Error fetching invoice details:", error);
            toast.error("Failed to fetch invoice details");
        } finally {
            setIsLoadingInvoiceDetails(false);
        }
    };

    // ============================================
    // HELPERS
    // ============================================
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        if (status === 'Active') return 'inv-status-active';
        if (status === 'Cancelled') return 'inv-status-cancelled';
        return 'inv-status-default';
    };

    // ============================================
    // FILTERED INVOICES (for inline list view search)
    // ============================================
    const filteredInvoices = !invoiceSearchTerm.trim()
        ? allInvoices
        : allInvoices.filter(inv =>
            inv.invoiceNumber?.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
            inv.customer?.customerName?.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
            inv.customer?.contactNumber?.includes(invoiceSearchTerm)
        );

    // ============================================
    // CUSTOM SELECT STYLES
    // ============================================
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            border: '1.5px solid #e3e8f0',
            borderRadius: '8px',
            padding: '2px 4px',
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

    // ============================================
    // OPTION FORMATTERS
    // ============================================
    const customerOptions = customers.map(c => ({
        value: c.customerId,
        label: `${c.customerName} - ${c.contactNumber}`,
        data: c
    }));

    const packageOptions = packages.map(p => ({
        value: p.packageId,
        label: `${p.packageName} - ₹${p.pricing}`,
        data: p
    }));

    const xpOilOptions = xpOils.map(o => ({
        value: o.xpId,
        label: `${o.productName} (${o.quantity} KG)`,
        data: o
    }));

    const dispenserOptions = dispenserOils.map(o => ({
        value: o.dispenserId,
        label: `${o.productName}`,
        data: o
    }));

    const promoOptions = promoCodes.map(p => ({
        value: p.promoId,
        label: `${p.code} - ${p.discount}%`,
        data: p,
        code: p.code,
        discount: p.discount
    }));

    const workshopOptions = workshops.map(w => ({
        value: w.workshopId,
        label: `${new Date(w.date).toLocaleDateString()} - ${w.startTime}`,
        data: w
    }));

    // ============================================
    // RENDER
    // ============================================
    return (
        <Navbar>
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="inv-main">

                {/* Page Header with inline nav toggle (no navigation, no modal) */}
                <div className="inv-page-header">
                    <h2>{activeView === "create" ? "Create Invoice" : "All Invoices"}</h2>
                    <div className="inv-right-section">
                        <div className="inv-view-toggle">
                            <button
                                className={`inv-toggle-btn ${activeView === "create" ? "inv-toggle-active" : ""}`}
                                onClick={handleSwitchToCreateView}
                            >
                                <FaPlusCircle /> Create Invoice
                            </button>
                            <button
                                className={`inv-toggle-btn ${activeView === "list" ? "inv-toggle-active" : ""}`}
                                onClick={handleSwitchToListView}
                            >
                                <FaList /> View Invoices
                            </button>
                        </div>
                    </div>
                </div>

                {/* ============================================ */}
                {/* CREATE INVOICE VIEW (inline, default view)     */}
                {/* ============================================ */}
                {activeView === "create" && (
                    <div className="inv-form-container">

                        {/* STEP 1: SELECT CUSTOMER */}
                        <div className="inv-section">
                            <h3 className="inv-section-title">
                                <FaUser /> Step 1: Select Customer
                            </h3>
                            <div className="inv-form-row">
                                <div className="inv-form-field">
                                    <label>Search &amp; Select Customer *</label>
                                    <Select
                                        options={customerOptions}
                                        value={selectedCustomer}
                                        onChange={setSelectedCustomer}
                                        placeholder="🔍 Type to search customers..."
                                        isClearable
                                        styles={customSelectStyles}
                                        noOptionsMessage={() => "No customers found"}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: WORKSHOP & PACKAGE */}
                        <div className="inv-section">
                            <h3 className="inv-section-title">
                                <FaBoxOpen /> Step 2: Workshop &amp; Package
                            </h3>

                            {selectedCustomer && (
                                <div className="inv-form-row">
                                    <div className="inv-form-field">
                                        <label>Select Workshop (Optional)</label>
                                        <Select
                                            options={workshopOptions}
                                            value={selectedWorkshop}
                                            onChange={setSelectedWorkshop}
                                            placeholder="Select workshop or leave empty"
                                            isClearable
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => "No workshops found for this customer"}
                                        />
                                        {recentWorkshop && !selectedWorkshop && (
                                            <small className="inv-hint">
                                                Latest workshop auto-selected: {new Date(recentWorkshop.date).toLocaleDateString()} - {recentWorkshop.startTime}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="inv-form-row">
                                <div className="inv-form-field">
                                    <label>Select Package (Optional)</label>
                                    <Select
                                        options={packageOptions}
                                        value={selectedPackage}
                                        onChange={setSelectedPackage}
                                        placeholder="Select a package"
                                        isClearable
                                        styles={customSelectStyles}
                                        noOptionsMessage={() => "No active packages found"}
                                    />
                                    {selectedPackage && (
                                        <small className="inv-hint">
                                            ML: {selectedPackage.data?.bottleML}ml | Oils: {selectedPackage.data?.oilCount} | Fragrance: {selectedPackage.data?.fragranceQty}g | Alcohol: {selectedPackage.data?.alcoholQty}ml
                                        </small>
                                    )}
                                </div>
                            </div>

                            {selectedPackage && (
                                <div className="inv-form-row">
                                    <div className="inv-form-field">
                                        <label>Select XP Oil *</label>
                                        <Select
                                            options={xpOilOptions}
                                            value={selectedXPOil}
                                            onChange={setSelectedXPOil}
                                            placeholder="Select XP oil for fragrance"
                                            isClearable
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => "No XP oils available"}
                                        />
                                        {selectedXPOil && (
                                            <small className="inv-hint">
                                                Stock: {selectedXPOil.data?.quantity} KG | Density: {selectedXPOil.data?.density || 1000}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STEP 3: DISPENSER ITEMS */}
                        <div className="inv-section">
                            <h3 className="inv-section-title">
                                <FaFlask /> Step 3: Dispenser Items (Optional)
                            </h3>

                            <div className="inv-form-row inv-form-row-dispenser">
                                <div className="inv-form-field">
                                    <label>Select Dispenser Oil</label>
                                    <Select
                                        options={dispenserOptions}
                                        value={dispenserSelect}
                                        onChange={setDispenserSelect}
                                        placeholder="Select dispenser oil..."
                                        isClearable
                                        styles={customSelectStyles}
                                        noOptionsMessage={() => "No dispenser oils available"}
                                    />
                                </div>
                                <div className="inv-form-field inv-form-field-narrow">
                                    <label>ML *</label>
                                    <select
                                        value={dispenserML}
                                        onChange={(e) => setDispenserML(e.target.value)}
                                        className="inv-form-select"
                                    >
                                        <option value="">Select ML</option>
                                        <option value="3">3 ml</option>
                                        <option value="6">6 ml</option>
                                    </select>
                                </div>
                                <div className="inv-form-field inv-form-field-narrow">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={dispenserQty}
                                        onChange={(e) => setDispenserQty(e.target.value)}
                                        placeholder="Enter quantity"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="inv-add-btn-wrap">
                                    <button
                                        className="inv-add-dispenser-btn"
                                        onClick={handleAddDispenser}
                                        type="button"
                                    >
                                        <FaPlus /> Add
                                    </button>
                                </div>
                            </div>

                            {/* Dispenser Items List */}
                            {dispenserItems.length > 0 && (
                                <div className="inv-dispenser-list">
                                    <h4>Added Dispenser Items</h4>
                                    <div className="inv-dispenser-table-wrap">
                                        <table className="inv-dispenser-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>ML</th>
                                                    <th>Qty</th>
                                                    <th>Total ML</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dispenserItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.productName}</td>
                                                        <td>{item.ml}ml</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.totalML}ml</td>
                                                        <td>
                                                            <button
                                                                className="inv-remove-btn"
                                                                onClick={() => handleRemoveDispenser(index)}
                                                                type="button"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STEP 4: PROMO CODE & PAYMENT */}
                        <div className="inv-section">
                            <h3 className="inv-section-title">
                                <FaTag /> Step 4: Promo Code &amp; Payment
                            </h3>

                            <div className="inv-form-row">
                                <div className="inv-form-field">
                                    <label>Promo Code (Optional)</label>
                                    <Select
                                        options={promoOptions}
                                        value={selectedPromo}
                                        onChange={setSelectedPromo}
                                        placeholder="Select or enter promo code"
                                        isClearable
                                        styles={customSelectStyles}
                                        noOptionsMessage={() => "No active promo codes available"}
                                    />
                                    {selectedPromo && (
                                        <small className="inv-hint inv-promo-hint">
                                            {selectedPromo.code} - {selectedPromo.discount}% discount applied
                                        </small>
                                    )}
                                </div>
                                <div className="inv-form-field">
                                    <label>Payment Method *</label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="inv-form-select"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Card</option>
                                    </select>
                                </div>
                            </div>

                            <div className="inv-form-row">
                                <div className="inv-form-field">
                                    <label>Invoice Date</label>
                                    <input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                    />
                                </div>
                                <div className="inv-form-field">
                                    <label>Notes (Optional)</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes..."
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* STEP 5: SUMMARY & CALCULATION */}
                        <div className="inv-section inv-summary-section">
                            <h3 className="inv-section-title">
                                <FaMoneyBillWave /> Summary &amp; Calculation
                            </h3>

                            <div className="inv-summary-grid">
                                <div className="inv-summary-item">
                                    <span>Package Price</span>
                                    <span className="inv-summary-value">
                                        {selectedPackage ? `₹${selectedPackage.data.pricing}` : '₹0'}
                                    </span>
                                </div>
                                <div className="inv-summary-item">
                                    <span>Dispenser Items</span>
                                    <span className="inv-summary-value">
                                        ₹{dispenserItems.reduce((sum, item) => {
                                            const price = item.ml === 3 ? item.sellingPrice3ml : item.sellingPrice6ml;
                                            return sum + (price * item.totalML);
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="inv-summary-item inv-summary-total">
                                    <span>Subtotal (incl. GST)</span>
                                    <span className="inv-summary-value">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="inv-summary-item inv-summary-detail">
                                    <span>GST ({GST_RATE}%)</span>
                                    <span className="inv-summary-value">₹{gstAmount.toFixed(2)}</span>
                                </div>
                                {selectedPromo && (
                                    <div className="inv-summary-item inv-summary-detail inv-summary-promo">
                                        <span>Promo Discount ({selectedPromo.discount}%)</span>
                                        <span className="inv-summary-value">-₹{promoDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="inv-summary-item inv-summary-grand-total">
                                    <span>Grand Total</span>
                                    <span className="inv-summary-value">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="inv-form-actions">
                            <button
                                className="inv-cancel-btn"
                                onClick={() => navigate('/')}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="inv-submit-btn"
                                onClick={handleCreateInvoice}
                                disabled={isSubmitting || !selectedCustomer}
                                type="button"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="inv-loading-spinner small"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaSave /> Create Invoice
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                )}

                {/* ============================================ */}
                {/* VIEW INVOICES — INLINE TABLE (NOT A MODAL)     */}
                {/* ============================================ */}
                {activeView === "list" && (
                    <div className="inv-list-container">
                        <div className="inv-list-header-bar">
                            <div className="inv-list-search">
                                <FaSearch className="inv-list-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by invoice number, customer name or phone..."
                                    value={invoiceSearchTerm}
                                    onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            {!isLoadingInvoices && (
                                <span className="inv-list-result-count">{filteredInvoices.length} invoices</span>
                            )}
                        </div>

                        {isLoadingInvoices ? (
                            <div className="inv-list-loading">
                                <div className="inv-loading-spinner-dark large"></div>
                                <p>Loading invoices...</p>
                            </div>
                        ) : filteredInvoices.length === 0 ? (
                            <div className="inv-list-empty">
                                <FaFileInvoice className="inv-list-empty-icon" />
                                <p>No invoices found</p>
                            </div>
                        ) : (
                            <div className="inv-list-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInvoices.map((inv) => (
                                            <tr key={inv.invoiceId}>
                                                <td className="inv-list-number-cell">{inv.invoiceNumber}</td>
                                                <td>
                                                    <div className="inv-list-customer-name">{inv.customer?.customerName}</div>
                                                    <div className="inv-list-customer-phone">{inv.customer?.contactNumber}</div>
                                                </td>
                                                <td className="inv-list-date-cell">{formatDate(inv.invoiceDate)}</td>
                                                <td>
                                                    <span className="inv-payment-pill">{inv.paymentStatus}</span>
                                                </td>
                                                <td>
                                                    <span className={`inv-status-badge ${getStatusClass(inv.status)}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="inv-list-total-cell">₹{inv.grandTotal?.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="inv-list-view-btn"
                                                        onClick={() => handleViewInvoice(inv.invoiceId)}
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* The only modal/popup in the whole flow — per-record details */}
                <InvoiceDetailsModal
                    show={showInvoiceDetailsModal}
                    onClose={() => {
                        setShowInvoiceDetailsModal(false);
                        setViewingInvoice(null);
                    }}
                    invoice={viewingInvoice}
                    isLoading={isLoadingInvoiceDetails}
                    formatDate={formatDate}
                    getStatusClass={getStatusClass}
                />

            </div>
        </Navbar>
    );
};

export default Invoice;