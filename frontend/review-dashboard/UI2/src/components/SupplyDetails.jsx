import React from 'react';
import { Box, TextField, Card, CardHeader, CardContent } from '@mui/material';

export default function SupplyDetails({ data, errors, onChange }) {
    const handleChange = (e) => {
        onChange('supply_details', e.target.name, e.target.value);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Supply Details" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField fullWidth label="Delivery Number" name="delivery_number" value={data?.delivery_number || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Order Reference" name="order_reference_number" value={data?.order_reference_number || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Destination" name="destination" value={data?.destination || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Mode of Transport" name="mode_of_transport" value={data?.mode_of_transport || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Vehicle Number" name="vehicle_number" value={data?.vehicle_number || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Challan Number" name="challan_number" value={data?.challan_number || ''} onChange={handleChange} variant="outlined" />

                    <TextField fullWidth label="Transporter Name" name="transporter_name" value={data?.transporter_name || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Transporter Address" name="transporter_address" value={data?.transporter_address || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Transporter Pincode" name="transporter_pincode" value={data?.transporter_pincode || ''} onChange={handleChange} error={!!errors?.transporter_pincode} helperText={errors?.transporter_pincode} variant="outlined" />
                    <TextField fullWidth label="Shipment Number" name="shipment_number" value={data?.shipment_number || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Lorrey Receipt" name="lorrey_receipt_number" value={data?.lorrey_receipt_number || ''} onChange={handleChange} variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
}
