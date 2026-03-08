import React from 'react';
import { Box, TextField, Card, CardHeader, CardContent } from '@mui/material';

export default function TaxDetails({ data, errors, onChange }) {
    const handleChange = (e) => {
        onChange('tax_details', e.target.name, e.target.value);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Tax Details" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField fullWidth label="CGST Rate (%)" name="cgst_rate" value={data?.cgst_rate || ''} onChange={handleChange} error={!!errors?.cgst_rate} helperText={errors?.cgst_rate} variant="outlined" />
                    <TextField fullWidth label="CGST Amount" name="cgst_amount" value={data?.cgst_amount || ''} onChange={handleChange} error={!!errors?.cgst_amount} helperText={errors?.cgst_amount} variant="outlined" />
                    <TextField fullWidth label="SGST Rate (%)" name="sgst_rate" value={data?.sgst_rate || ''} onChange={handleChange} error={!!errors?.sgst_rate} helperText={errors?.sgst_rate} variant="outlined" />
                    <TextField fullWidth label="SGST Amount" name="sgst_amount" value={data?.sgst_amount || ''} onChange={handleChange} error={!!errors?.sgst_amount} helperText={errors?.sgst_amount} variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
}
