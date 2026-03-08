import React from 'react';
import { Box, TextField, Card, CardHeader, CardContent } from '@mui/material';

export default function AmountSummary({ data, errors, onChange }) {
    const handleChange = (e) => {
        onChange('amount_summary', e.target.name, e.target.value);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardHeader title="Amount Summary" />
            <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField fullWidth label="Net Value" name="net_value" value={data?.net_value || ''} onChange={handleChange} error={!!errors?.net_value} helperText={errors?.net_value} variant="outlined" />
                    <TextField fullWidth label="Total Tax Amount" name="total_tax_amount" value={data?.total_tax_amount || ''} onChange={handleChange} error={!!errors?.total_tax_amount} helperText={errors?.total_tax_amount} variant="outlined" />
                    <TextField fullWidth label="Round Off" name="round_off" value={data?.round_off || ''} onChange={handleChange} error={!!errors?.round_off} helperText={errors?.round_off} variant="outlined" />
                    <TextField fullWidth label="Net Payable" name="net_payable" value={data?.net_payable || ''} onChange={handleChange} error={!!errors?.net_payable} helperText={errors?.net_payable} variant="outlined" />
                    <TextField fullWidth label="Currency" name="currency" value={data?.currency || ''} onChange={handleChange} variant="outlined" />
                    <TextField fullWidth label="Amount In Words" name="amount_in_words" value={data?.amount_in_words || ''} onChange={handleChange} variant="outlined" />
                </Box>
            </CardContent>
        </Card>
    );
}
