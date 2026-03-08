import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Box, Chip, IconButton, CircularProgress,
    Grid, Card, CardContent, Divider, Collapse, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, Checkbox, Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import PrintIcon from '@mui/icons-material/Print';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Dashboard = ({ onUploadNew, onOpenLorrySlip, onOpenFuelSlip }) => {
    const { logout } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const [selectedDocTypes, setSelectedDocTypes] = useState({}); // { invoiceId: 'invoice_soft' }

    useEffect(() => { fetchInvoices(); }, []);

    const fetchInvoices = async () => {
        try {
            const response = await axios.get(`${API_URL}/invoice/all`);
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/invoice/${deleteTarget._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(prev => prev.filter(i => i._id !== deleteTarget._id));
            setSelectedIds(prev => { const s = new Set(prev); s.delete(deleteTarget._id); return s; });
            setDeleteTarget(null);
        } catch (e) {
            console.error('Delete failed:', e);
        } finally {
            setDeleting(false);
        }
    };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const allSelected = invoices.length > 0 && selectedIds.size === invoices.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    const toggleSelectAll = () => {
        if (allSelected || someSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(invoices.map(i => i._id)));
    };

    const handleBulkDelete = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/invoice/bulk-delete`,
                { ids: [...selectedIds] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInvoices(prev => prev.filter(i => !selectedIds.has(i._id)));
            setSelectedIds(new Set());
            setBulkConfirm(false);
        } catch (e) {
            console.error('Bulk delete failed:', e);
        } finally {
            setDeleting(false);
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => prev === id ? null : id);
        if (!selectedDocTypes[id]) {
            setSelectedDocTypes(prev => ({ ...prev, [id]: 'invoice_soft' }));
        }
    };

    const getField = (inv, ...paths) => {
        for (const path of paths) {
            const keys = path.split('.');
            let val = inv;
            for (const k of keys) { val = val?.[k]; }
            if (val) return val;
        }
        return null;
    };

    const statusColor = (status) => {
        switch (status) {
            case 'approved': return { label: 'Approved', color: 'success' };
            case 'pending': return { label: 'Pending', color: 'warning' };
            default: return { label: status, color: 'default' };
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}
                    sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 2 } }}>
                    <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <Typography variant="h3" fontWeight="900" color="primary"
                            sx={{ letterSpacing: '-1.5px', fontSize: { xs: '2rem', sm: '2.4rem', md: '2.8rem' }, textAlign: { xs: 'center', md: 'left' } }}>
                            DIPALI ASSOCIATES &amp; CO
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" fontWeight="500" sx={{ textAlign: { xs: 'center', md: 'left' }, opacity: 0.8 }}>
                            Premium Slip &amp; Invoice Management Portal
                        </Typography>
                    </Box>
                    <Box display="flex" gap={2}
                        sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={logout}
                            sx={{ borderRadius: '12px', px: { xs: 2.5, sm: 3 }, fontWeight: 700, flex: { xs: 1, md: 'none' } }}>
                            Logout
                        </Button>
                        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={onUploadNew}
                            sx={{
                                borderRadius: '12px', px: { xs: 2.5, sm: 4 }, py: 1.5,
                                fontWeight: 800, flex: { xs: 1, md: 'none' },
                                boxShadow: '0 10px 20px rgba(26,115,232,0.2)',
                                background: 'linear-gradient(45deg, #1a73e8 30%, #4285f4 90%)',
                            }}>
                            New Slip
                        </Button>
                    </Box>
                </Box>

                {/* ── Selection toolbar ── */}
                {selectedIds.size > 0 && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 2,
                        px: 2, py: 1.2, mb: 2, borderRadius: 2,
                        background: 'linear-gradient(90deg,#1a73e8,#4285f4)',
                        color: '#fff', boxShadow: '0 4px 14px rgba(26,115,232,0.3)',
                    }}>
                        <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={toggleSelectAll}
                            sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' }, '&.MuiCheckbox-indeterminate': { color: '#fff' }, p: 0.5 }}
                        />
                        <Typography fontWeight="700" sx={{ flex: 1 }}>
                            {selectedIds.size} invoice{selectedIds.size > 1 ? 's' : ''} selected
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setBulkConfirm(true)}
                            sx={{ background: '#d32f2f', '&:hover': { background: '#b71c1c' }, borderRadius: 2, fontWeight: 700 }}>
                            Delete Selected
                        </Button>
                        <Button size="small" onClick={() => setSelectedIds(new Set())}
                            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', border: '1px solid', borderRadius: 2 }}>
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* Select All row when nothing selected yet */}
                {selectedIds.size === 0 && invoices.length > 0 && (
                    <Box display="flex" alignItems="center" mb={1} sx={{ px: 1 }}>
                        <Tooltip title="Select all">
                            <Checkbox
                                checked={false}
                                onChange={toggleSelectAll}
                                size="small"
                            />
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary">Select all</Typography>
                    </Box>
                )}
                <Grid container spacing={3} sx={{ flexDirection: { xs: 'column-reverse', md: 'row' } }}>

                    {/* ── Vault Stats ─────────────────────────────────────────── */}
                    <Grid item xs={12} md={3} sx={{ order: { xs: 2, md: 1 } }}>
                        <Card sx={{
                            borderRadius: 6,
                            mb: 4,
                            background: 'linear-gradient(135deg, #0d1b4e 0%, #1a237e 100%)',
                            color: '#fff',
                            boxShadow: '0 20px 40px rgba(13,27,78,0.25)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Box display="flex" alignItems="center" gap={2} mb={3}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <StorageIcon sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '0.5px' }}>Vault Stats</Typography>
                                </Box>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
                                <Box display="flex" sx={{ flexDirection: { xs: 'row', md: 'column' }, flexWrap: 'wrap', gap: { xs: 2, md: 2.5 } }}>
                                    {[
                                        { label: 'Total Slips', val: invoices.length, color: '#fff' },
                                        { label: 'Approved', val: invoices.filter(i => i.status === 'approved').length, color: '#4caf50' },
                                        { label: 'In S3', val: invoices.filter(i => i.s3_exists).length, color: '#4285f4' },
                                        { label: 'Pending', val: invoices.filter(i => i.status === 'pending').length, color: '#ff9800' },
                                    ].map(({ label, val, color }) => (
                                        <Box key={label} sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flex: { xs: '1 1 120px', md: '1 1 auto' },
                                            bgcolor: { xs: 'rgba(255,255,255,0.05)', md: 'transparent' },
                                            p: { xs: 1.5, md: 0 },
                                            borderRadius: { xs: 2, md: 0 }
                                        }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</Typography>
                                            <Typography variant="h6" fontWeight="900" sx={{ color }}>{val}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        <Typography variant="overline" color="text.secondary" fontWeight="900" sx={{ mb: 2, px: 1, display: { xs: 'none', md: 'block' }, letterSpacing: 1.5 }}>
                            RESOURCES
                        </Typography>
                        <Box sx={{ display: { xs: 'flex', md: 'flex' }, flexDirection: { xs: 'row', md: 'column' }, flexWrap: 'wrap', gap: 1, mb: { xs: 4, md: 0 } }}>
                            {['User Guide', 'GST Compliance', 'Settings', 'Archive'].map((item) => (
                                <Button key={item} sx={{
                                    justifyContent: 'flex-start', color: 'text.primary', borderRadius: 3, px: 2.5, py: 1.5,
                                    fontWeight: 700,
                                    flex: { xs: '1 1 150px', md: '1 1 auto' },
                                    fontSize: '13px',
                                    letterSpacing: '-0.2px',
                                    border: { xs: '1px solid #e8e8e8', md: 'none' },
                                    '&:hover': { backgroundColor: 'rgba(26,115,232,0.08)', color: '#1a73e8' },
                                }}>
                                    {item}
                                </Button>
                            ))}
                        </Box>
                    </Grid>

                    {/* ── Slips List ──────────────────────────────────────── */}
                    <Grid item xs={12} md={9} sx={{ order: { xs: 1, md: 2 } }}>
                        {/* Panel header */}
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Box sx={{
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                p: 1.5,
                                borderRadius: 3,
                                boxShadow: '0 8px 16px rgba(26,115,232,0.2)'
                            }}>
                                <DescriptionIcon />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>Slips Management</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>System health: Optimized</Typography>
                            </Box>
                            <Chip
                                label={`${invoices.length} Total Records`}
                                size="medium"
                                sx={{ ml: 'auto', fontWeight: 900, borderRadius: 2, bgcolor: '#f0f6ff', color: '#1a73e8', border: '1px solid rgba(26,115,232,0.1)' }}
                            />
                        </Box>

                        {loading ? (
                            <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
                        ) : invoices.length === 0 ? (
                            <Card sx={{ borderRadius: 3, p: 6, textAlign: 'center', opacity: 0.5 }}>
                                <DescriptionIcon sx={{ fontSize: 56, mb: 1 }} />
                                <Typography variant="h6">No records in the vault</Typography>
                                <Typography variant="body2">Slips will appear here once uploaded and approved.</Typography>
                            </Card>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {invoices.map((inv, idx) => {
                                    const invNo = getField(inv, 'human_verified_data.invoice_details.invoice_number', 'ai_data.invoice_data.invoice_details.invoice_number');
                                    const consignee = getField(inv, 'human_verified_data.consignee_details.consignee_name', 'ai_data.invoice_data.consignee_details.consignee_name');
                                    const vehicle = getField(inv, 'human_verified_data.supply_details.vehicle_number', 'ai_data.invoice_data.supply_details.vehicle_number');
                                    const buyer = getField(inv, 'human_verified_data.buyer_details.buyer_name', 'ai_data.invoice_data.buyer_details.buyer_name');
                                    const amount = getField(inv, 'human_verified_data.amount_summary.net_payable', 'ai_data.invoice_data.amount_summary.net_payable');
                                    const transporter = getField(inv, 'human_verified_data.supply_details.transporter_name', 'ai_data.invoice_data.supply_details.transporter_name');
                                    const lorry = getField(inv, 'human_verified_data.supply_details.lorrey_receipt_number', 'ai_data.invoice_data.supply_details.lorrey_receipt_number');
                                    const ewbNo = getField(inv, 'human_verified_data.ewb_details.ewb_number', 'ai_data.invoice_data.ewb_details.ewb_number');
                                    const ewbValid = getField(inv, 'human_verified_data.ewb_details.ewb_valid_date', 'ai_data.invoice_data.ewb_details.ewb_valid_date');
                                    const ewbCreateTime = getField(inv, 'human_verified_data.ewb_details.ewb_create_time', 'ai_data.invoice_data.ewb_details.ewb_create_time');
                                    const ewbValidTime = getField(inv, 'human_verified_data.ewb_details.ewb_valid_time', 'ai_data.invoice_data.ewb_details.ewb_valid_time');
                                    const date = new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                    const isOpen = expanded === inv._id;
                                    const st = statusColor(inv.status);

                                    return (
                                        <Card key={inv._id} elevation={0} sx={{
                                            borderRadius: 3,
                                            border: selectedIds.has(inv._id) ? '1.5px solid #d32f2f' : isOpen ? '1.5px solid #1a73e8' : '1px solid #e8e8e8',
                                            boxShadow: isOpen ? '0 8px 30px rgba(26,115,232,0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            overflow: 'hidden',
                                            '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.06)', borderColor: '#4285f4' },
                                        }}>
                                            {/* ── Collapsed Row (click to expand) ── */}
                                            <Box
                                                onClick={() => toggleExpand(inv._id)}
                                                sx={{
                                                    p: { xs: 1.5, sm: 2 },
                                                    display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 },
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedIds.has(inv._id) ? '#fff5f5' : isOpen ? '#f0f6ff' : '#fff',
                                                    transition: 'background 0.2s',
                                                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                                }}
                                            >
                                                {/* Checkbox */}
                                                <Checkbox
                                                    checked={selectedIds.has(inv._id)}
                                                    onClick={e => toggleSelect(inv._id, e)}
                                                    size="small"
                                                    sx={{ p: 0.5, flexShrink: 0, color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' } }}
                                                />

                                                {/* Invoice No */}
                                                <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Invoice No.</Typography>
                                                    <Typography fontWeight="700" sx={{ fontSize: { xs: '12px', sm: '14px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {invNo || '---'}
                                                    </Typography>
                                                </Box>

                                                {/* Consignee */}
                                                <Box sx={{ flex: '1 1 160px', minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>Consignee</Typography>
                                                    <Typography sx={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{consignee || '---'}</Typography>
                                                </Box>

                                                {/* Vehicle */}
                                                {vehicle && (
                                                    <Chip label={vehicle} size="small" variant="filled"
                                                        sx={{ fontWeight: '700', borderRadius: 1.5, px: 0.5, flexShrink: 0, display: { xs: 'none', md: 'flex' } }} />
                                                )}

                                                {/* Date */}
                                                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>{date}</Typography>

                                                {/* Status */}
                                                <Chip label={st.label} color={st.color} size="small" variant="outlined" sx={{ flexShrink: 0 }} />

                                                {/* Vault badge */}
                                                {inv.softcopy_url && inv.s3_exists ? (
                                                    <Chip icon={<StorageIcon style={{ fontSize: 14 }} />} label="In Vault" size="small" sx={{ backgroundColor: '#e6f4ea', color: '#1e7e34', fontWeight: '700', flexShrink: 0 }} />
                                                ) : (
                                                    <Chip label={inv.softcopy_url ? 'S3 MISSING' : 'NOT READY'} size="small"
                                                        sx={{ backgroundColor: inv.softcopy_url ? '#fff0f0' : '#f1f3f4', color: inv.softcopy_url ? '#c0392b' : '#888', fontWeight: '700', flexShrink: 0 }} />
                                                )}

                                                {/* Expand icon */}
                                                <Box sx={{ flexShrink: 0, ml: 'auto' }}>
                                                    {isOpen ? <ExpandLessIcon sx={{ color: '#1a73e8' }} /> : <ExpandMoreIcon sx={{ color: '#aaa' }} />}
                                                </Box>
                                            </Box>

                                            {/* ── Expanded Detail Panel ── */}
                                            <Collapse in={isOpen} unmountOnExit>
                                                <Divider />
                                                <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#fafcff' }}>
                                                    <Grid container spacing={2}>

                                                        {/* Invoice Info */}
                                                        <Grid item xs={12} sm={6} md={4}>
                                                            <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, border: '1px solid #e8eaed', height: '100%' }}>
                                                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                                                    <ReceiptLongIcon sx={{ fontSize: 18, color: '#1a73e8' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary">Invoice Details</Typography>
                                                                </Box>
                                                                <DetailRow label="Invoice No." value={invNo} />
                                                                <DetailRow label="Date" value={date} />
                                                                {lorry && <DetailRow label="LR No." value={lorry} />}
                                                                {ewbNo && <DetailRow label="EWB No." value={ewbNo + (ewbCreateTime ? ` (${ewbCreateTime})` : '')} />}
                                                                {ewbValid && <DetailRow label="EWB Valid" value={ewbValid + (ewbValidTime ? ` (${ewbValidTime})` : '')} />}
                                                            </Box>
                                                        </Grid>

                                                        {/* Party Info */}
                                                        <Grid item xs={12} sm={6} md={4}>
                                                            <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, border: '1px solid #e8eaed', height: '100%' }}>
                                                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                                                    <PersonIcon sx={{ fontSize: 18, color: '#34a853' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#34a853' }}>Party Details</Typography>
                                                                </Box>
                                                                {buyer && <DetailRow label="Buyer" value={buyer} />}
                                                                {consignee && <DetailRow label="Consignee" value={consignee} />}
                                                            </Box>
                                                        </Grid>

                                                        {/* Transport & Amount */}
                                                        <Grid item xs={12} sm={6} md={4}>
                                                            <Box sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, border: '1px solid #e8eaed', height: '100%' }}>
                                                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                                                    <LocalShippingIcon sx={{ fontSize: 18, color: '#f4511e' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#f4511e' }}>Transport &amp; Amount</Typography>
                                                                </Box>
                                                                {vehicle && <DetailRow label="Vehicle" value={vehicle} />}
                                                                {transporter && <DetailRow label="Transporter" value={transporter} />}
                                                                {amount && (
                                                                    <Box display="flex" alignItems="center" gap={0.5} mt={1.5} sx={{ backgroundColor: '#e8f0fe', borderRadius: 2, p: 1 }}>
                                                                        <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#1a73e8' }} />
                                                                        <Typography variant="body2" fontWeight="900" color="primary">{amount}</Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Grid>

                                                    </Grid>

                                                    {/* ── Unified Document Hub ── */}
                                                    <Box sx={{ mt: 3, width: '100%' }}>
                                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900, mb: 1.5, display: 'block', letterSpacing: 1 }}>
                                                            Document Hub — Select Copy to Download
                                                        </Typography>

                                                        <Box sx={{
                                                            display: 'flex',
                                                            gap: 2,
                                                            overflowX: 'auto',
                                                            pb: 2,
                                                            '::-webkit-scrollbar': { height: '6px' },
                                                            '::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' }
                                                        }}>
                                                            {[
                                                                { id: 'invoice_hard', label: 'Invoice Hardcopy', icon: <DescriptionIcon />, url: inv.file_url, ready: !!inv.file_url },
                                                                { id: 'invoice_soft', label: 'Invoice Softcopy', icon: <ReceiptLongIcon />, url: inv.softcopy_url, ready: inv.softcopy_url && inv.s3_exists },
                                                                { id: 'gcn_soft', label: 'GCN Softcopy', icon: <AssignmentIcon />, url: inv.gcn_url, ready: !!inv.gcn_url },
                                                                { id: 'lorry_soft', label: 'Lorry Slip Softcopy', icon: <ReceiptIcon />, url: inv.lorry_hire_slip_data?.lorry_hire_slip_url, ready: !!inv.lorry_hire_slip_data?.lorry_hire_slip_url },
                                                                { id: 'fuel_soft', label: 'Fuel Slip Softcopy', icon: <LocalGasStationIcon />, url: inv.lorry_hire_slip_data?.fuel_slip_url, ready: !!inv.lorry_hire_slip_data?.fuel_slip_url }
                                                            ].map((doc) => {
                                                                const isActive = (selectedDocTypes[inv._id] || 'invoice_soft') === doc.id;
                                                                return (
                                                                    <Box
                                                                        key={doc.id}
                                                                        onClick={() => doc.ready && setSelectedDocTypes(prev => ({ ...prev, [inv._id]: doc.id }))}
                                                                        sx={{
                                                                            flex: '0 0 160px',
                                                                            p: 2,
                                                                            borderRadius: 3,
                                                                            cursor: doc.ready ? 'pointer' : 'default',
                                                                            border: '2px solid',
                                                                            borderColor: isActive ? '#1a73e8' : 'rgba(0,0,0,0.05)',
                                                                            background: isActive ? 'linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)' : doc.ready ? '#fff' : '#f9f9f9',
                                                                            boxShadow: isActive ? '0 8px 20px rgba(26,115,232,0.15)' : 'none',
                                                                            transition: 'all 0.2s ease',
                                                                            opacity: doc.ready ? 1 : 0.5,
                                                                            position: 'relative',
                                                                            '&:hover': doc.ready ? { borderColor: '#1a73e8', transform: 'translateY(-2px)' } : {}
                                                                        }}
                                                                    >
                                                                        <Box sx={{ color: isActive ? '#1a73e8' : 'text.secondary', mb: 1, display: 'flex', alignItems: 'center' }}>
                                                                            {doc.icon}
                                                                        </Box>
                                                                        <Typography variant="body2" fontWeight={isActive ? 800 : 500} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                                            {doc.label}
                                                                        </Typography>
                                                                        {isActive && (
                                                                            <Chip label="Selected" size="small" sx={{ height: 16, fontSize: '9px', fontWeight: 900, bgcolor: '#1a73e8', color: '#fff' }} />
                                                                        )}
                                                                        {!doc.ready && (
                                                                            <Chip label="Not Ready" size="small" variant="outlined" sx={{ height: 16, fontSize: '9px', fontWeight: 700 }} />
                                                                        )}
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>

                                                        {/* Consolidated Actions */}
                                                        <Box display="flex" sx={{
                                                            flexDirection: { xs: 'column', md: 'row' },
                                                            alignItems: { xs: 'stretch', md: 'center' },
                                                            gap: { xs: 2.5, md: 2 }, mt: 2, p: 2,
                                                            bgcolor: 'rgba(26,115,232,0.04)', borderRadius: '16px',
                                                            border: '1px solid rgba(26,115,232,0.08)'
                                                        }}>
                                                            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>CURRENTLY ACTIVE:</Typography>
                                                                <Typography variant="body1" fontWeight={900} color="primary" sx={{ fontSize: '1.1rem' }}>
                                                                    {(selectedDocTypes[inv._id] || 'invoice_soft').replace(/_/g, ' ').toUpperCase()}
                                                                </Typography>
                                                            </Box>

                                                            <Box display="flex" sx={{
                                                                gap: 1.5,
                                                                flexWrap: 'wrap',
                                                                justifyContent: { xs: 'center', md: 'flex-end' },
                                                                width: { xs: '100%', md: 'auto' }
                                                            }}>
                                                                {/* Secondary Actions (Generation Flow) */}
                                                                {!inv.lorry_hire_slip_data?.lorry_hire_slip_url && (
                                                                    <Button variant="outlined" size="small" color="warning" onClick={() => onOpenLorrySlip(inv._id)}
                                                                        sx={{ borderRadius: 2.5, px: 2, fontWeight: 700, flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' }, py: 1 }}>
                                                                        Create Lorry Slip
                                                                    </Button>
                                                                )}
                                                                {inv.lorry_hire_slip_data?.lorry_hire_slip_url && !inv.lorry_hire_slip_data?.fuel_slip_url && (
                                                                    <Button variant="outlined" size="small" color="secondary" onClick={() => onOpenFuelSlip(inv._id)}
                                                                        sx={{ borderRadius: 2.5, px: 2, fontWeight: 700, flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' }, py: 1 }}>
                                                                        Create Fuel Slip
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<VisibilityIcon />}
                                                                    component="a"
                                                                    target="_blank"
                                                                    href={(() => {
                                                                        const sel = selectedDocTypes[inv._id] || 'invoice_soft';
                                                                        if (sel === 'invoice_hard') return inv.file_url;
                                                                        if (sel === 'invoice_soft') return inv.softcopy_url;
                                                                        if (sel === 'gcn_soft') return inv.gcn_url;
                                                                        if (sel === 'lorry_soft') return inv.lorry_hire_slip_data?.lorry_hire_slip_url;
                                                                        if (sel === 'fuel_soft') return inv.lorry_hire_slip_data?.fuel_slip_url;
                                                                    })()}
                                                                    sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700, flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' }, py: 1, background: 'linear-gradient(45deg, #1a237e, #3949ab)', textTransform: 'none' }}
                                                                >
                                                                    View
                                                                </Button>

                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<PrintIcon />}
                                                                    onClick={() => {
                                                                        const sel = selectedDocTypes[inv._id] || 'invoice_soft';
                                                                        let url = '';
                                                                        if (sel === 'invoice_hard') url = inv.file_url;
                                                                        if (sel === 'invoice_soft') url = inv.softcopy_url;
                                                                        if (sel === 'gcn_soft') url = inv.gcn_url;
                                                                        if (sel === 'lorry_soft') url = inv.lorry_hire_slip_data?.lorry_hire_slip_url;
                                                                        if (sel === 'fuel_soft') url = inv.lorry_hire_slip_data?.fuel_slip_url;
                                                                        if (url) {
                                                                            const printWin = window.open(url, '_blank');
                                                                            printWin.onload = () => printWin.print();
                                                                        }
                                                                    }}
                                                                    sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 700, flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' }, py: 1, background: 'linear-gradient(45deg, #455a64, #78909c)', textTransform: 'none' }}
                                                                >
                                                                    Print
                                                                </Button>

                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<DownloadIcon />}
                                                                    onClick={async () => {
                                                                        const sel = selectedDocTypes[inv._id] || 'invoice_soft';
                                                                        let url = '';
                                                                        if (sel === 'invoice_hard') url = inv.file_url;
                                                                        else if (sel === 'invoice_soft') url = inv.softcopy_url;
                                                                        else if (sel === 'gcn_soft') url = inv.gcn_url;
                                                                        else if (sel === 'lorry_soft') url = inv.lorry_hire_slip_data?.lorry_hire_slip_url;
                                                                        else if (sel === 'fuel_soft') url = inv.lorry_hire_slip_data?.fuel_slip_url;

                                                                        if (!url) return;
                                                                        const ext = url.split('?')[0].split('.').pop().toLowerCase() || 'pdf';
                                                                        const fileName = `${sel}_${invNo}.${ext}`;

                                                                        try {
                                                                            // Use backend proxy to bypass CORS
                                                                            const proxyUrl = `${API_URL}/invoice/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;

                                                                            const token = localStorage.getItem('token');
                                                                            const response = await axios({
                                                                                url: proxyUrl,
                                                                                method: 'GET',
                                                                                headers: { 'Authorization': `Bearer ${token}` },
                                                                                responseType: 'blob'
                                                                            });

                                                                            const blob = response.data;
                                                                            const blobUrl = window.URL.createObjectURL(blob);
                                                                            const link = document.createElement('a');
                                                                            link.href = blobUrl;
                                                                            link.download = fileName;
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                            window.URL.revokeObjectURL(blobUrl);
                                                                        } catch (e) {
                                                                            console.error('Download failed:', e);
                                                                            const msg = e.response?.data?.error || e.message;
                                                                            setSnack({ type: 'error', message: 'Download failed: ' + msg });
                                                                        }
                                                                    }}
                                                                    sx={{ borderRadius: 2.5, px: 2.5, fontWeight: 800, flex: { xs: '1 1 100%', sm: '1 1 auto', md: 'none' }, py: 1, background: 'linear-gradient(45deg, #1a73e8, #4285f4)', textTransform: 'none' }}
                                                                >
                                                                    Download
                                                                </Button>

                                                                <IconButton color="error" onClick={() => setDeleteTarget(inv)}
                                                                    sx={{
                                                                        ml: { xs: 0, md: 1 },
                                                                        border: '1px solid rgba(211,47,47,0.15)',
                                                                        borderRadius: 2.5, flexShrink: 0,
                                                                        bgcolor: 'rgba(211,47,47,0.02)',
                                                                        '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' }
                                                                    }}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </Card>
                                    );
                                })}
                            </Box>
                        )}

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {invoices.length} records stored in your secure AWS S3 Cloud Instance.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* ── Delete confirmation dialog ── */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle sx={{ color: '#d32f2f', fontWeight: 700 }}>⚠ Delete Invoice?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete invoice <strong>{deleteTarget?.human_verified_data?.invoice_details?.invoice_number || deleteTarget?.ai_data?.invoice_data?.invoice_details?.invoice_number || deleteTarget?._id}</strong> and its associated files from S3. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={deleting}>Cancel</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}>
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Bulk delete confirmation dialog ── */}
            <Dialog open={bulkConfirm} onClose={() => setBulkConfirm(false)}>
                <DialogTitle sx={{ color: '#d32f2f', fontWeight: 700 }}>⚠ Delete {selectedIds.size} Invoice{selectedIds.size > 1 ? 's' : ''}?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete <strong>{selectedIds.size} selected invoice{selectedIds.size > 1 ? 's' : ''}</strong> and all associated S3 files. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => setBulkConfirm(false)} variant="outlined" disabled={deleting}>Cancel</Button>
                    <Button
                        onClick={handleBulkDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}>
                        {deleting ? 'Deleting…' : `Yes, Delete ${selectedIds.size}`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// Small helper component for detail rows in expanded panel
const DetailRow = ({ label, value }) => (
    value ? (
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.8} sx={{ gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, lineHeight: 1.5 }}>{label}</Typography>
            <Typography variant="caption" fontWeight="600" sx={{ textAlign: 'right', lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</Typography>
        </Box>
    ) : null
);

export default Dashboard;
