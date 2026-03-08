import React from 'react';
import { Box, TextField, Card, CardHeader, CardContent } from '@mui/material';

export default function SellerDetails({ data, errors, onChange }) {
    const handleChange = (e) => {
        onChange('seller_details', e.target.name, e.target.value);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Seller Details" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField fullWidth label="Seller Name" name="seller_name" value={data?.seller_name || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Seller Address" name="seller_address" value={data?.seller_address || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="State" name="seller_state" value={data?.seller_state || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="State Code" name="seller_state_code" value={data?.seller_state_code || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Pincode" name="seller_pincode" value={data?.seller_pincode || ''} onChange={handleChange} error={!!errors?.seller_pincode} helperText={errors?.seller_pincode} variant="outlined" />
                    <TextField fullWidth label="GSTIN" name="seller_gstin" value={data?.seller_gstin || ''} onChange={handleChange} error={!!errors?.seller_gstin} helperText={errors?.seller_gstin} variant="outlined" />
                    <TextField fullWidth label="PAN" name="seller_pan" value={data?.seller_pan || ''} onChange={handleChange} error={!!errors?.seller_pan} helperText={errors?.seller_pan} variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
}
