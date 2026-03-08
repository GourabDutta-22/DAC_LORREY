import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Card, CardContent,
    CircularProgress, Snackbar, Alert, Paper, Divider, InputAdornment, IconButton, Chip,
    Fade, Container, Backdrop
} from '@mui/material';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../config';
import { toWords } from 'number-to-words';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SpeedIcon from '@mui/icons-material/Speed';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FuelSlipDocument from './FuelSlipDocument';

const FuelSlipReview = ({ invoiceId, onBack }) => {
    const entrySlipRef = useRef();
    const reviewSlipRef = useRef();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeStep, setActiveStep] = useState('entry'); // 'entry' or 'review'
    const [invoiceData, setInvoiceData] = useState(null);
    const [fuelData, setFuelData] = useState({
        stationName: '',
        stationAddress: '',
        lorrySlipNo: '',
        qty: '',
        rate: '',
        amount: 0
    });
    const [snack, setSnack] = useState(null);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoiceData();
        }
    }, [invoiceId]);

    const fetchInvoiceData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/invoice/lorry-data/${invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const inv = response.data;
            setInvoiceData(inv);

            // Prefill with existing lorry slip details
            const lsd = inv.lorry_hire_slip_data || {};
            setFuelData({
                stationName: lsd.station_name || '',
                stationAddress: lsd.station_address || '',
                lorrySlipNo: lsd.lorry_hire_slip_no || '',
                qty: lsd.diesel_litres || '',
                rate: lsd.diesel_rate || 90,
                amount: lsd.diesel_advance || 0
            });
        } catch (error) {
            console.error('Error fetching invoice for fuel slip:', error);
            setSnack({ type: 'error', message: 'Failed to load invoice data' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFuelData(prev => ({ ...prev, [name]: value }));
    };

    const getAmountWords = (amt) => {
        try {
            if (amt > 0) return toWords(Math.floor(amt)).toUpperCase() + ' RUPEES ONLY';
        } catch (e) { return ''; }
        return '';
    };

    const hsdSlipNo = invoiceData?.lorry_hire_slip_data?.fuel_slip_no || 'AUTO-GEN';
    const slipDate = new Date().toLocaleDateString('en-IN');
    const amountWords = getAmountWords(fuelData.amount);

    const qrPayload = JSON.stringify({
        hsd_slip: hsdSlipNo,
        date: slipDate,
        vehicle: invoiceData?.human_verified_data?.supply_details?.vehicle_number || '',
        lorry_slip: fuelData.lorrySlipNo,
        station: fuelData.stationName,
        qty: fuelData.qty,
        rate: fuelData.rate,
        amount: Number(fuelData.amount).toFixed(2)
    });

    const handleSaveAndGenerate = async () => {
        if (!fuelData.stationName) {
            setSnack({ type: 'error', message: 'Station Name is required' });
            return;
        }

        setSaving(true);
        try {
            // 1. Generate PDF
            const opt = {
                margin: 0,
                filename: `fuel_slip_${invoiceId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const blob = await html2pdf().set(opt).from(entrySlipRef.current).output('blob');

            // 2. Upload to S3 & Save to MongoDB
            const formData = new FormData();
            formData.append('invoice_id', invoiceId);
            formData.append('slip_data', JSON.stringify({
                station_name: fuelData.stationName,
                station_address: fuelData.stationAddress,
                diesel_litres: fuelData.qty,
                diesel_rate: fuelData.rate,
                diesel_advance: fuelData.amount
            }));
            formData.append('softcopy', blob, `fuel_slip_${invoiceId}.pdf`);

            const token = localStorage.getItem('token');
            console.log('Sending Fuel Slip for invoice:', invoiceId);
            const res = await axios.post(`${API_URL}/invoice/fuel-slip-softcopy`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });

            console.log('Fuel Slip save response:', res.data);
            setSnack({ type: 'success', message: 'Fuel Slip generated and stored successfully!' });
            setActiveStep('review');
        } catch (error) {
            console.error('Error saving fuel slip:', error);
            const msg = error.response?.data?.error || error.message;
            setSnack({ type: 'error', message: 'Failed to upload/save Fuel Slip: ' + msg });
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!reviewSlipRef.current) {
            setSnack({
                type: 'error',
                message: 'Document reference not found. This usually happens if the preview is still loading. Please wait a moment and try again.'
            });
            return;
        }

        try {
            setSnack({ type: 'info', message: 'Generating high-quality PDF...' });
            const opt = {
                margin: 0,
                filename: `fuel_slip_${hsdSlipNo}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 3, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(reviewSlipRef.current).save();
            setSnack({ type: 'success', message: 'Download started!' });
        } catch (error) {
            console.error('Download error:', error);
            setSnack({ type: 'error', message: 'Failed to generate PDF download' });
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <CircularProgress size={60} thickness={4} />
        </Box>
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at 50% 50%, #fdfbfb 0%, #ebedee 100%)',
            pt: 4, pb: 8, px: 3,
            overflowX: 'hidden',
            '@media print': {
                background: 'none !important',
                p: '0 !important',
                m: '0 !important',
                '.no-print': { display: 'none !important' },
                '.print-only': { display: 'block !important', width: '100%', margin: '0 !important' },
                'body, html': { background: '#fff !important' }
            }
        }}>
            {/* Action Header */}
            <Box className="no-print" sx={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                p: 2,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.3)'
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={activeStep === 'review' ? () => setActiveStep('entry') : onBack} sx={{ bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight="900" color="#1a237e" sx={{ letterSpacing: '-0.5px' }}>
                            {activeStep === 'entry' ? 'Fuel Slip Entry' : 'Fuel Slip Review'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Ref: {hsdSlipNo} | {activeStep === 'entry' ? 'Step 1: Data Entry' : 'Step 2: Generation Success'}
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" gap={2}>
                    {activeStep === 'review' && (
                        <>
                            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: '12px', fontWeight: 700 }}>Print</Button>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownload}
                                disabled={saving}
                                sx={{ borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
                            >
                                Download PDF
                            </Button>
                        </>
                    )}
                    <Button variant="contained" startIcon={<DashboardIcon />} onClick={onBack} sx={{ borderRadius: '12px', fontWeight: 700, bgcolor: '#333' }}>Dashboard</Button>
                </Box>
            </Box>

            <Container maxWidth="lg">
                <Fade in={activeStep === 'entry'} unmountOnExit>
                    <Grid container justifyContent="center" className="no-print">
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                borderRadius: '32px',
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.4)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                p: 2
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box mb={4}>
                                        <Typography variant="subtitle1" fontWeight="800" color="#1a237e" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocalGasStationIcon fontSize="small" /> Station Information
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Petrol Pump Name"
                                                    name="stationName"
                                                    value={fuelData.stationName}
                                                    onChange={handleInputChange}
                                                    variant="outlined"
                                                    required
                                                    autoFocus
                                                    InputProps={{
                                                        sx: { borderRadius: '16px', bgcolor: '#fff' },
                                                        startAdornment: <InputAdornment position="start"><LocalGasStationIcon color="action" /></InputAdornment>,
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Address"
                                                    name="stationAddress"
                                                    value={fuelData.stationAddress}
                                                    onChange={handleInputChange}
                                                    variant="outlined"
                                                    multiline
                                                    rows={3}
                                                    InputProps={{
                                                        sx: { borderRadius: '16px', bgcolor: '#fff' },
                                                        startAdornment: <InputAdornment position="start"><LocationOnIcon color="action" /></InputAdornment>,
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                                    <Box mb={4}>
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight="900" mb={2} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Fetched Details
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Lorry Hire No." value={fuelData.lorrySlipNo} disabled variant="filled"
                                                    InputProps={{ sx: { borderRadius: '12px' }, startAdornment: <InputAdornment position="start"><ConfirmationNumberIcon fontSize="inherit" /></InputAdornment> }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Vehicle" value={invoiceData?.human_verified_data?.supply_details?.vehicle_number || ''} disabled variant="filled"
                                                    InputProps={{ sx: { borderRadius: '12px' }, startAdornment: <InputAdornment position="start"><LocalGasStationIcon fontSize="inherit" /></InputAdornment> }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Quantity (Ltrs)" value={fuelData.qty} disabled variant="filled"
                                                    InputProps={{ sx: { borderRadius: '12px' }, startAdornment: <InputAdornment position="start"><SpeedIcon fontSize="inherit" /></InputAdornment> }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField fullWidth label="Rate" value={fuelData.rate} disabled variant="filled"
                                                    InputProps={{ sx: { borderRadius: '12px' }, startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon fontSize="inherit" /></InputAdornment> }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleSaveAndGenerate}
                                        sx={{
                                            py: 2,
                                            borderRadius: '18px',
                                            fontWeight: 900,
                                            background: 'linear-gradient(45deg, #ff4081, #f50057)',
                                            boxShadow: '0 10px 30px rgba(245,0,87,0.3)',
                                            '&:hover': { background: 'linear-gradient(45deg, #f50057, #c51162)', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        Save & Generate Fuel Slip
                                    </Button>

                                    <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                                        <FuelSlipDocument
                                            ref={entrySlipRef}
                                            data={invoiceData}
                                            fuelData={fuelData}
                                            hsdSlipNo={hsdSlipNo}
                                            slipDate={slipDate}
                                            amountWords={amountWords}
                                            qrPayload={qrPayload}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Fade>

                <Fade in={activeStep === 'review'} unmountOnExit>
                    <Box>
                        <Grid container justifyContent="center">
                            <Grid item xs={12} md={10}>
                                <Box sx={{
                                    maxHeight: { xs: '85vh', print: 'none' },
                                    overflowY: { xs: 'auto', print: 'visible' },
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}>
                                    <Box className="print-only" sx={{
                                        boxShadow: { xs: '0 20px 60px rgba(0,0,0,0.1)', print: 'none' },
                                        borderRadius: '4px',
                                        bgcolor: '#fff'
                                    }}>
                                        <FuelSlipDocument
                                            ref={reviewSlipRef}
                                            data={invoiceData}
                                            fuelData={fuelData}
                                            hsdSlipNo={hsdSlipNo}
                                            slipDate={slipDate}
                                            amountWords={amountWords}
                                            qrPayload={qrPayload}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </Container>

            {/* Professional Upload Backdrop */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(8px)', flexDirection: 'column' }}
                open={saving}
            >
                <CircularProgress color="inherit" size={60} thickness={4} sx={{ mb: 2 }} />
                <Typography variant="h6" fontWeight="700">Uploading to Secure Storage...</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Please wait while we sync with S3 and MongoDB</Typography>
            </Backdrop>

            <Snackbar open={!!snack} autoHideDuration={6000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snack?.type || 'info'} variant="filled" onClose={() => setSnack(null)} sx={{ borderRadius: '16px', fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                    {snack?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FuelSlipReview;
