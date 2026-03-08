import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { API_URL } from "../config";

import InvoiceDetails from "./InvoiceDetails";
import SellerDetails from "./SellerDetails";
import BuyerDetails from "./BuyerDetails";
import ConsigneeDetails from "./ConsigneeDetails";
import SupplyDetails from "./SupplyDetails";
import ItemsTable from "./ItemsTable";
import TaxDetails from "./TaxDetails";
import AmountSummary from "./AmountSummary";
import EwbDetails from "./EwbDetails";
import PremiumLoadingOverlay from "./PremiumLoadingOverlay";
import TaxInvoice from "./TaxInvoice";
import GCNDocument from "./GCNDocument";
import LorryHireSlipReview from "./LorryHireSlipReview";
import FuelSlipReview from "./FuelSlipReview";

export default function InvoiceForm({ onBack }) {
  const { logout } = useAuth();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState("upload");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showGCN, setShowGCN] = useState(false);
  const [showLorrySlip, setShowLorrySlip] = useState(false);
  const [showFuelSlip, setShowFuelSlip] = useState(false);

  // Refs for unified print/download
  const taxInvoiceRef = useRef(null);
  const gcnRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    let element = null;
    let filename = "document.pdf";

    if (showGCN) {
      element = gcnRef.current;
      filename = `gcn_${formData.invoice_details?.invoice_number || 'draft'}.pdf`;
    } else if (showInvoice) {
      element = taxInvoiceRef.current;
      filename = `invoice_${formData.invoice_details?.invoice_number || 'draft'}.pdf`;
    }

    if (element) {
      try {
        setStatus({ type: "info", message: "Preparing high-quality PDF. Please wait..." });
        const opt = {
          margin: 0,
          filename: filename,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 3, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
        setStatus({ type: "success", message: "✅ Download started successfully!" });
      } catch (err) {
        console.error("Download error:", err);
        setStatus({ type: "error", message: "❌ Download failed: " + err.message });
      }
    } else {
      setStatus({
        type: "error",
        message: "Document reference not found. This usually happens if the preview is still loading. Please wait a moment and try again."
      });
    }
  };

  const getEmptySchema = () => ({
    invoice_details: {},
    seller_details: {},
    buyer_details: {},
    consignee_details: {},
    supply_details: {},
    items: [],
    tax_details: {},
    amount_summary: {},
    ewb_details: {},
  });

  useEffect(() => {
    setFormData(getEmptySchema());
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setStatus({
        type: "error",
        message: "Please upload a PDF, PNG, or JPG document.",
      });
      setTimeout(() => setStatus(null), 4000);
      return;
    }

    setProcessingMode("upload");
    setIsProcessing(true);
    setStatus(null);

    const data = new FormData();
    data.append("invoice", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/invoice/upload`, data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      const invoiceId = response.data.invoice_id;
      setFormData({
        _id: invoiceId,
        ...getEmptySchema(),
        ...response.data.ai_data.invoice_data,
      });
      setErrors({});
      setStatus({
        type: "success",
        message: "Document processed! AI Extraction complete, please review the fields below.",
      });
      // Removed immediate setShowInvoice(true) to allow user review
    } catch (error) {
      console.error("Error connecting to upload pipeline:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.response?.data?.error || "Failed to process document through the AI Worker pipeline.",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = null;
    }
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => {
      if (section === "items") {
        return { ...prev, items: value };
      }
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
    if (errors[section]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: null },
      }));
    }
  };

  const handleReset = () => {
    setFormData(getEmptySchema());
    setErrors({});
    setStatus(null);
    setShowInvoice(false);
    setShowGCN(false);
    setShowLorrySlip(false);
    setShowFuelSlip(false);
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;
    const checkRegex = (val, regex) => val && regex.test(val);
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const pinRegex = /^[1-9][0-9]{5}$/;

    if (formData.seller_details) {
      newErrors.seller_details = {};
      if (formData.seller_details.seller_gstin && !checkRegex(formData.seller_details.seller_gstin, gstinRegex)) {
        newErrors.seller_details.seller_gstin = "Invalid GSTIN";
        isValid = false;
      }
      if (formData.seller_details.seller_pan && !checkRegex(formData.seller_details.seller_pan, panRegex)) {
        newErrors.seller_details.seller_pan = "Invalid PAN";
        isValid = false;
      }
      if (formData.seller_details.seller_pincode && !checkRegex(formData.seller_details.seller_pincode, pinRegex)) {
        newErrors.seller_details.seller_pincode = "Invalid Pincode";
        isValid = false;
      }
    }

    if (formData.buyer_details) {
      newErrors.buyer_details = {};
      if (formData.buyer_details.buyer_gstin && !checkRegex(formData.buyer_details.buyer_gstin, gstinRegex)) {
        newErrors.buyer_details.buyer_gstin = "Invalid GSTIN";
        isValid = false;
      }
      if (formData.buyer_details.buyer_pan && !checkRegex(formData.buyer_details.buyer_pan, panRegex)) {
        newErrors.buyer_details.buyer_pan = "Invalid PAN";
        isValid = false;
      }
      if (formData.buyer_details.buyer_pincode && !checkRegex(formData.buyer_details.buyer_pincode, pinRegex)) {
        newErrors.buyer_details.buyer_pincode = "Invalid Pincode";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (validate()) {
      setProcessingMode("save");
      setIsProcessing(true);
      try {
        const token = localStorage.getItem("token");
        await axios.post(`${API_URL}/invoice/approve`, {
          invoice_id: formData?._id,
          corrected_data: formData,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus({
          type: "success",
          message: "Final invoice data saved to database successfully!",
        });
        setTimeout(() => setShowInvoice(true), 1500);
      } catch (error) {
        console.error("Error saving final data:", error);
        setStatus({ type: "error", message: "Failed to update Database." });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setStatus({
        type: "error",
        message: "Please fix the validation errors before saving.",
      });
    }
    setTimeout(() => setStatus(null), 4000);
  };

  if (!formData) return null;

  // ── Lorry Hire Slip step (after GCN) ──────────────────────────────────
  if (showLorrySlip) {
    return (
      <LorryHireSlipReview
        invoiceId={formData._id}
        onBack={() => setShowLorrySlip(false)}
        formData={formData}
        onOpenFuelSlip={() => {
          setShowLorrySlip(false);
          setShowFuelSlip(true);
        }}
      />
    );
  }

  // ── Fuel Slip step ──────────────────────────────────────────────────
  if (showFuelSlip) {
    return (
      <FuelSlipReview
        invoiceId={formData._id}
        onBack={() => setShowFuelSlip(false)}
      />
    );
  }

  if (showGCN) {
    return (
      <Box position="relative">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            backgroundColor: '#fff',
            borderBottom: '1px solid #ddd',
            px: 3,
            py: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          className="no-print"
        >
          <Box display="flex" gap={2}>
            <Button variant="outlined" size="small" onClick={() => setShowGCN(false)}>
              ← Back to Invoice
            </Button>
            <Button variant="outlined" size="small" color="error" onClick={onBack}>
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowLorrySlip(true)}
              sx={{
                borderRadius: '8px', fontWeight: 700,
                background: 'linear-gradient(45deg, #f57c00, #ff9800)',
                boxShadow: '0 4px 12px rgba(245,124,0,0.35)',
                '&:hover': { background: 'linear-gradient(45deg, #e65100, #f57c00)' },
              }}
            >
              🚚 Generate Lorry Hire Slip
            </Button>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setShowGCN(false)}
              sx={{ borderRadius: 2, px: 2, borderColor: 'primary.main', color: 'primary.main' }}
            >
              Edit Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 2 }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderRadius: 2 }}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
        <Box sx={{ width: '100%', overflowX: 'auto', backgroundColor: '#f0f0f0', p: { xs: 2, sm: 4, md: 10 }, pt: { xs: 12, sm: 14 } }}>
          <GCNDocument ref={gcnRef} data={formData} />
        </Box>
      </Box>
    );
  }

  if (showInvoice) {
    return (
      <Box position="relative">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            backgroundColor: '#fff',
            borderBottom: '1px solid #ddd',
            px: 3,
            py: 1.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          className="no-print"
        >
          <Box display="flex" gap={2}>
            <Button variant="outlined" size="small" onClick={onBack}>
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() => setShowGCN(true)}
              sx={{ borderRadius: '8px', fontWeight: 700 }}
            >
              📋 Generate GCN Copy
            </Button>
          </Box>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setShowInvoice(false)}
              sx={{ borderRadius: 2, px: 2, borderColor: 'primary.main', color: 'primary.main' }}
            >
              Edit Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 2 }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ borderRadius: 2 }}
            >
              Download PDF
            </Button>
          </Box>
        </Box>
        <Box sx={{ width: '100%', overflowX: 'auto', backgroundColor: '#f0f0f0', p: { xs: 2, sm: 4, md: 10 }, pt: { xs: 12, sm: 14 } }}>
          <TaxInvoice ref={taxInvoiceRef} data={formData} />
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        <PremiumLoadingOverlay isProcessing={isProcessing} mode={processingMode} />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={4}
          sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={isProcessing}
              sx={{ minWidth: "auto", px: 2, borderRadius: '8px' }}
            >
              Back
            </Button>
            <Box>
              <Typography
                variant="h3"
                fontWeight="900"
                color="primary"
                sx={{
                  letterSpacing: '-1px',
                  fontSize: { xs: '1.75rem', md: '3rem' }
                }}
              >
                DIPALI ASSOCIATES & CO
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="400" sx={{ fontSize: { xs: '0.85rem', md: '1.25rem' } }}>
                Upload PDF or Image. AI will extract data for your review.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2} sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
              sx={{ borderRadius: '8px', px: 3 }}
              disabled={isProcessing}
            >
              Logout
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ borderRadius: '8px', px: 3 }}
              disabled={isProcessing}
            >
              Upload Document
              <input
                type="file"
                hidden
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={3} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            sx={{ borderRadius: '8px', flex: { xs: 1, sm: 'none' } }}
            disabled={isProcessing}
          >
            Clear Form
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ borderRadius: '8px', flex: { xs: 1, sm: 'none' } }}
            disabled={isProcessing}
          >
            Final Save
          </Button>
        </Box>

        {status && (
          <Alert severity={status.type} sx={{ mb: 3 }}>
            {status.message}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />

        <InvoiceDetails data={formData.invoice_details} errors={errors.invoice_details} onChange={handleChange} />

        <Box display="flex" flexDirection="column" gap={0}>
          <SellerDetails data={formData.seller_details} errors={errors.seller_details} onChange={handleChange} />
          <BuyerDetails data={formData.buyer_details} errors={errors.buyer_details} onChange={handleChange} />
        </Box>

        <ConsigneeDetails data={formData.consignee_details} errors={errors.consignee_details} onChange={handleChange} />
        <SupplyDetails data={formData.supply_details} errors={errors.supply_details} onChange={handleChange} />
        <ItemsTable items={formData.items} errors={errors.items} onChange={handleChange} />

        <Box display="flex" flexDirection="column" gap={0}>
          <TaxDetails data={formData.tax_details} errors={errors.tax_details} onChange={handleChange} />
          <AmountSummary data={formData.amount_summary} errors={errors.amount_summary} onChange={handleChange} />
        </Box>

        <EwbDetails data={formData.ewb_details} errors={errors.ewb_details} onChange={handleChange} />
      </Paper>
    </Container>
  );
}
