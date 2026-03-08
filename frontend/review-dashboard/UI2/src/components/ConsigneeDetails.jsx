import React from 'react';
import { Box, TextField, Card, CardHeader, CardContent } from '@mui/material';

export default function ConsigneeDetails({ data, errors, onChange }) {
    const handleChange = (e) => {
        onChange('consignee_details', e.target.name, e.target.value);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Consignee Details" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField fullWidth label="Consignee Name" name="consignee_name" value={data?.consignee_name || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Consignee Address" name="consignee_address" value={data?.consignee_address || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="State" name="consignee_state" value={data?.consignee_state || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Pincode" name="consignee_pincode" value={data?.consignee_pincode || ''} onChange={handleChange} error={!!errors?.consignee_pincode} helperText={errors?.consignee_pincode} variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
}
