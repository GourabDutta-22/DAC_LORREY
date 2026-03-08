import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Container, Typography, TextField, Button, Paper, Grid,
    Divider, CircularProgress, Snackbar, Alert, IconButton, Chip,
    Stepper, Step, StepLabel, Card, CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import LorryHireSlipDocument from './LorryHireSlipDocument';
import { API_URL } from '../config';

const DIESEL_RATE = 90;
const STEPS = ['Review Details', 'Generate Slip'];

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const buildGcnDataFromInvoice = (data) => {
    const inv = data?.human_verified_data || data?.ai_data?.invoice_data || (data?.invoice_details ? data : {});
    const details = inv?.invoice_details || {};
    const seller = inv?.seller_details || {};
    const buyer = inv?.buyer_details || {};
    const consignee = inv?.consignee_details || {};
    const supply = inv?.supply_details || {};
    const ewb = inv?.ewb_details || {};
    const items = inv?.items || [];
    const amount = inv?.amount_summary || {};
    const firstItem = items[0] || {};

    const rawDate = details.invoice_date || '';
    let fyDate = new Date();
    if (rawDate) {
        const parts = rawDate.includes('/') ? rawDate.split('/') : null;
        if (parts?.length === 3) fyDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        else { const p = new Date(rawDate); if (!isNaN(p)) fyDate = p; }
    }
    const month = fyDate.getMonth() + 1;
    const yr = fyDate.getFullYear();
    const fyStart = month >= 4 ? yr : yr - 1;
    const fyShort = `${String(fyStart).slice(-2)}-${String(fyStart + 1).slice(-2)}`;
    const ref = details.reference_number || '';
    const gcnNo = supply.lorrey_receipt_number || `DAC/${fyShort}${ref ? `-${ref}` : ''}`;

    return {
        company_name: 'DIPALI ASSOCIATES & CO.',
        gcn_no: gcnNo,
        gcn_date: details.invoice_date || new Date().toLocaleDateString('en-IN'),
        company_site_office_address: '1st Floor, Panja Hotel, Darjeeling More, Panagarh',
        company_phone_number: '7810935738 / 8116221063 / 9474485192',
        company_email: 'dipaliassociates.durgapur@gmail.com',
        company_gst: '19AATFD1733C1ZH',
        consignor_name: seller.seller_name || buyer.buyer_name || '',
        consignee_name: consignee.consignee_name || '',
        consignee_address: consignee.consignee_address || '',
        destination: supply.destination || '',
        consignee_pincode: consignee.consignee_pincode || '',
        truck_no: supply.vehicle_number || '',
        agent_name: supply.transporter_name || '',
        invoice_no: details.invoice_number || '',
        shipment_no: supply.shipment_number || '',
        challan_number: supply.challan_number || '',
        e_way_bill_number: ewb.ewb_number || '',
        e_way_bill_creation_date: ewb.ewb_create_date || '',
        e_way_bill_creation_time: ewb.ewb_create_time || '',
        e_way_bill_validUpto_date: ewb.ewb_valid_date || '',
        e_way_bill_validUpto_time: ewb.ewb_valid_time || '',
        material: firstItem.description_of_product || firstItem.material_code || '',
        bags: String(supply.bags || firstItem.bags || ''),
        qty_mt: String(firstItem.quantity || ''),
        material_value: String(firstItem.taxable_value || amount.net_payable || ''),
    };
};

/* ─── Small helper component ─────────────────────────────────────────────── */
const InfoRow = ({ label, value, mono }) => (
    value ? (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            py: 1,
            borderBottom: '1px solid #f0f0f0',
            gap: 2
        }}>
            <Typography variant="body2" sx={{ color: '#666', flexShrink: 0, fontWeight: 400 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{
                fontWeight: 700,
                textAlign: 'right',
                wordBreak: 'break-word',
                fontFamily: mono ? 'monospace' : 'inherit',
                color: '#1a1a1a'
            }}>
                {value}
            </Typography>
        </Box>
    ) : null
);

const SectionCard = ({ icon, title, color = '#1a73e8', children }) => (
    <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={1.2} mb={1.5}>
            {React.cloneElement(icon, { sx: { fontSize: 18, color } })}
            <Typography variant="subtitle2" fontWeight="900" sx={{ color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {title}
            </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 0.5, bgcolor: 'transparent' }}>
            {children}
        </Paper>
    </Box>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const LorryHireSlipReview = ({ invoiceId, onBack, formData: propFormData, onOpenFuelSlip }) => {
    const [step, setStep] = useState(0); // 0 = review, 1 = document
    const [invoiceData, setInvoiceData] = useState(null);
    const [gcnData, setGcnData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedUrl, setSavedUrl] = useState(null);
    const [snack, setSnack] = useState(null);

    // Editable advance fields
    const [loadingAdv, setLoadingAdv] = useState('');
    const [dieselLtrs, setDieselLtrs] = useState('');

    // Derived
    const dieselAdv = (parseFloat(dieselLtrs) || 0) * DIESEL_RATE;
    const totalAdv = (parseFloat(loadingAdv) || 0) + dieselAdv;

    // Random slip numbers, fixed on mount
    const [slipNo] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
    const [fuelSlipNo] = useState(() => String(Math.floor(1000 + Math.random() * 90000)));

    const docRef = useRef();

    // ── Fetch invoice + truck contact ──────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem('token');
                let inv = propFormData;

                if (!inv) {
                    const res = await axios.get(`${API_URL}/invoice/lorry-data/${invoiceId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    inv = res.data;
                }
                setInvoiceData(inv);

                // Pre-fill advance if already saved
                if (inv?.lorry_hire_slip_data?.lorry_hire_slip_url) {
                    setSavedUrl(inv.lorry_hire_slip_data.lorry_hire_slip_url);
                    setLoadingAdv(String(inv.lorry_hire_slip_data.loading_advance ?? ''));
                    setDieselLtrs(String(inv.lorry_hire_slip_data.diesel_litres ?? ''));
                }

                const derived = buildGcnDataFromInvoice(inv);
                const truckNo = derived.truck_no;
                let dbContact = {};
                if (truckNo) {
                    try {
                        const tc = await axios.get(
                            `${API_URL}/invoice/truck-contact/${encodeURIComponent(truckNo)}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (tc.data.found) {
                            dbContact = tc.data;
                        }
                    } catch (_) { }
                }

                const savedGcn = inv?.gcn_data || {};
                setGcnData({
                    ...derived,
                    ...savedGcn,
                    agent_name: dbContact.owner || savedGcn.agent_name || derived.agent_name || '',
                    owner_agent_contact: dbContact.contact || savedGcn.owner_agent_contact || '',
                    driver_name: dbContact.driver_name || savedGcn.driver_name || '',
                    driver_license_no: dbContact.license_no || savedGcn.driver_license_no || '',
                    owner_agent_aadhaar: dbContact.aadhar_no || savedGcn.owner_agent_aadhaar || '',
                    owner_agent_pan: dbContact.pan_no || savedGcn.owner_agent_pan || '',
                    address: dbContact.address || savedGcn.address || '',
                    rc_validity: dbContact.rc_validity || savedGcn.rc_validity || '',
                    insurance_validity: dbContact.insurance_validity || savedGcn.insurance_validity || '',
                    fitness_validity: dbContact.fitness_validity || savedGcn.fitness_validity || '',
                    road_tax_validity: dbContact.road_tax_validity || savedGcn.road_tax_validity || '',
                    permit: dbContact.permit || savedGcn.permit || '',
                    puc: dbContact.puc || savedGcn.puc || '',
                    np_validity: dbContact.np_validity || savedGcn.np_validity || '',
                });
            } catch (err) {
                setSnack({ type: 'error', message: 'Failed to load data: ' + err.message });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [invoiceId, propFormData]);

    const handleSaveAndUpload = async () => {
        setSaving(true);
        try {
            const pdfBlob = await html2pdf().set({
                margin: 0,
                filename: `lorry_hire_slip_${slipNo}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            }).from(docRef.current).outputPdf('blob');

            const slipData = {
                lorry_hire_slip_no: slipNo,
                fuel_slip_no: fuelSlipNo,
                loading_advance: parseFloat(loadingAdv) || 0,
                diesel_litres: parseFloat(dieselLtrs) || 0,
                diesel_rate: DIESEL_RATE,
                diesel_advance: parseFloat(dieselAdv.toFixed(2)),
                total_advance: parseFloat(totalAdv.toFixed(2)),
            };

            const formData = new FormData();
            formData.append('softcopy', pdfBlob, `lorry_hire_slip_${slipNo}.pdf`);
            formData.append('invoice_id', invoiceData?._id || invoiceId);
            formData.append('slip_data', JSON.stringify(slipData));

            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_URL}/invoice/lorry-hire-slip-softcopy`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
            );
            setSavedUrl(res.data.url);
            setSnack({ type: 'success', message: '✅ Lorry Hire Slip saved to S3 successfully!' });
        } catch (err) {
            setSnack({ type: 'error', message: '❌ Upload failed: ' + err.message });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (step === 1 && !savedUrl && gcnData && !saving) {
            handleSaveAndUpload();
        }
    }, [step]);

    const handleDownload = async () => {
        if (!docRef.current) {
            setSnack({
                type: 'error',
                message: 'Document reference not found. This usually happens if the preview is still loading. Please wait a moment and try again.'
            });
            return;
        }
        try {
            setSnack({ type: 'info', message: 'Preparing high-quality PDF. Please wait...' });
            await html2pdf().set({
                margin: 0,
                filename: `lorry_hire_slip_${slipNo}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            }).from(docRef.current).save();
            setSnack({ type: 'success', message: '✅ Download started successfully!' });
        } catch (err) {
            console.error('Download error:', err);
            setSnack({ type: 'error', message: '❌ Download failed: ' + err.message });
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column" gap={2}>
            <CircularProgress size={48} />
            <Typography color="text.secondary">Loading invoice data from database…</Typography>
        </Box>
    );

    if (step === 0) {
        return (
            <Box sx={{ bgcolor: '#f4f7f9', minHeight: '100vh', pb: 6 }}>
                <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e8eaed', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={onBack} size="small" sx={{ bgcolor: '#f0f6ff', '&:hover': { bgcolor: '#d0e4ff' }, flexShrink: 0 }}>
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box flex={1} sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight="900" color="primary" sx={{
                            lineHeight: 1.1,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            Lorry Hire Slip — Review
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Review details and enter advance
                        </Typography>
                    </Box>
                    <Stepper activeStep={step} alternativeLabel sx={{ minWidth: 200, display: { xs: 'none', md: 'flex' } }}>
                        {STEPS.map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<DescriptionIcon />}
                        onClick={onBack}
                        sx={{ ml: { xs: 0, sm: 2 }, borderRadius: 2, px: 2, bgcolor: '#333', '&:hover': { bgcolor: '#000' }, whiteSpace: 'nowrap' }}
                    >
                        Dashboard
                    </Button>
                </Box>

                <Container maxWidth="lg" sx={{ pt: 4, px: { xs: 2.5, md: 6 } }}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={7}>
                            <SectionCard icon={<BusinessIcon />} title="Transport Company" color="#1a73e8">
                                <InfoRow label="Company" value={gcnData?.company_name} />
                                <InfoRow label="Site Office" value={gcnData?.company_site_office_address} />
                                <InfoRow label="Mobile" value={gcnData?.company_phone_number} />
                                <InfoRow label="Email" value={gcnData?.company_email} />
                                <InfoRow label="GST No." value={gcnData?.company_gst} mono />
                            </SectionCard>
                            <SectionCard icon={<ReceiptIcon />} title="Slip Reference" color="#7b1fa2">
                                <InfoRow label="GCN No." value={gcnData?.gcn_no} mono />
                                <InfoRow label="Date" value={gcnData?.gcn_date} />
                                <InfoRow label="Invoice No." value={gcnData?.invoice_no} mono />
                            </SectionCard>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <SectionCard icon={<PersonIcon />} title="Consignor (From)" color="#0b8043">
                                        <InfoRow label="Name" value={gcnData?.consignor_name} />
                                        <InfoRow label="Destination" value={gcnData?.destination} />
                                    </SectionCard>
                                </Grid>
                                <Grid item xs={6}>
                                    <SectionCard icon={<PersonIcon />} title="Consignee (To)" color="#c62828">
                                        <InfoRow label="Name" value={gcnData?.consignee_name} />
                                        <InfoRow label="Pincode" value={gcnData?.consignee_pincode} mono />
                                    </SectionCard>
                                </Grid>
                            </Grid>
                            <SectionCard icon={<LocalShippingIcon />} title="Vehicle Details" color="#e65100">
                                <InfoRow label="Truck No." value={gcnData?.truck_no} mono />
                                <InfoRow label="Truck Owner" value={gcnData?.agent_name} />
                                <InfoRow label="Driver Name" value={gcnData?.driver_name} />
                            </SectionCard>
                            <SectionCard icon={<InventoryIcon />} title="Material Details" color="#00695c">
                                <InfoRow label="Material" value={gcnData?.material} />
                                <InfoRow label="Bags (Nos)" value={gcnData?.bags} />
                                <InfoRow label="Quantity (MT)" value={gcnData?.qty_mt} />
                            </SectionCard>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Paper sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: 4,
                                position: { xs: 'static', md: 'sticky' },
                                top: 24,
                                bgcolor: '#fff',
                                border: '1px solid #e0e0e0',
                                mb: { xs: 4, md: 0 }
                            }} elevation={0}>
                                <Typography variant="h6" fontWeight="900" mb={3}>Trip Advance</Typography>
                                <TextField label="Loading Advance (Rs.)" type="number" fullWidth value={loadingAdv} onChange={e => setLoadingAdv(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#777', fontWeight: 700 }}>₹</Typography> }} />
                                <TextField label="Diesel (Litres)" type="number" fullWidth value={dieselLtrs} onChange={e => setDieselLtrs(e.target.value)} sx={{ mb: 2 }} InputProps={{ endAdornment: <LocalGasStationIcon sx={{ color: '#f57c00' }} /> }} />
                                <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, px: 3, py: 2.5, border: '1px solid #e0e0e0', mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="500" color="text.secondary">Total Advance</Typography>
                                    <Typography variant="h5" fontWeight="900" color="primary">₹{totalAdv.toFixed(2)}</Typography>
                                </Box>
                                <Button variant="contained" fullWidth size="large" endIcon={<ArrowForwardIcon />} onClick={() => setStep(1)} sx={{ borderRadius: 2, fontWeight: 800, py: 1.6, background: 'linear-gradient(45deg, #f57c00, #ff9800)', boxShadow: '0 6px 16px rgba(245,124,0,0.35)' }}>
                                    Generate Lorry Hire Slip
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
                <Snackbar open={!!snack} autoHideDuration={5000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert severity={snack?.type || 'info'} onClose={() => setSnack(null)} variant="filled">
                        {snack?.message}
                    </Alert>
                </Snackbar>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f0f0f0', minHeight: '100vh' }}>
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
                <Box display="flex" gap={2} alignItems="center">
                    <IconButton onClick={() => setStep(0)} size="small" sx={{ bgcolor: '#f0f6ff', '&:hover': { bgcolor: '#d0e4ff' } }}>
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" fontWeight="900" color="primary" sx={{ lineHeight: 1.2 }}>
                            Lorry Hire Slip — Final Document
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Slip No. {slipNo} · Fuel Slip No. {fuelSlipNo}
                        </Typography>
                    </Box>
                    <Stepper activeStep={step} alternativeLabel sx={{ minWidth: 280, display: { xs: 'none', lg: 'flex' }, ml: 2 }}>
                        {STEPS.map(label => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>
                </Box>

                <Box display="flex" sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                    <Box display="flex" gap={1.5} sx={{ justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2, px: 2, flex: { xs: 1, sm: 'none' } }}>
                            Print
                        </Button>
                        <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={handleDownload} sx={{ borderRadius: 2, px: 2, background: 'linear-gradient(45deg, #1a73e8, #4285f4)', flex: { xs: 1, sm: 'none' } }}>
                            PDF
                        </Button>
                    </Box>
                    <Box display="flex" gap={1.5} sx={{ justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        {savedUrl && onOpenFuelSlip && (
                            <Button
                                variant="contained"
                                size="small"
                                color="secondary"
                                startIcon={<LocalGasStationIcon />}
                                onClick={() => onOpenFuelSlip(invoiceId)}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    flex: { xs: 1, sm: 'none' },
                                    background: 'linear-gradient(45deg, #7b1fa2, #9c27b0)',
                                    boxShadow: '0 4px 12px rgba(123,31,162,0.3)',
                                    '&:hover': { background: 'linear-gradient(45deg, #6a1b9a, #7b1fa2)' }
                                }}
                            >
                                Fuel Slip
                            </Button>
                        )}
                        <Button variant="contained" size="small" startIcon={<DescriptionIcon />} onClick={onBack} sx={{ borderRadius: 2, px: 2, bgcolor: '#333', '&:hover': { bgcolor: '#000' }, flex: { xs: 1, sm: 'none' } }}>
                            Dashboard
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ overflowX: 'auto', py: 5, px: { xs: 1, sm: 2, md: 10 }, display: 'flex', justifyContent: 'center', pt: { xs: 20, sm: 14, md: 12 } }}>
                <Box sx={{
                    transform: { xs: 'scale(0.35)', sm: 'scale(0.65)', md: 'scale(0.85)', lg: 'scale(1)' },
                    transformOrigin: 'top center',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                    mb: { xs: -100, sm: -40, md: -10 } // Compensate for scaling whitespace
                }}>
                    <LorryHireSlipDocument
                        ref={docRef}
                        gcnData={gcnData}
                        slipNo={slipNo}
                        fuelSlipNo={fuelSlipNo}
                        loadingAdv={parseFloat(loadingAdv) || 0}
                        dieselLtrs={parseFloat(dieselLtrs) || 0}
                        dieselRate={DIESEL_RATE}
                        dieselAdv={dieselAdv.toFixed(2)}
                        totalAdv={totalAdv.toFixed(2)}
                        invoiceData={invoiceData}
                    />
                </Box>
            </Box>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        .no-print { display: none !important; }
                        body { background: #fff !important; margin: 0 !important; }
                    }
                `
            }} />
        </Box>
    );
};

export default LorryHireSlipReview;
