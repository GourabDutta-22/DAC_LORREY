import React from 'react';
import {
    Card, CardHeader, CardContent, TextField, IconButton, Button, Box, Typography, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function ItemsTable({ items = [], onChange, errors }) {

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange('items', null, newItems);
    };

    const handleAddItem = () => {
        const newItem = {
            description_of_product: '',
            hsn_code: '',
            bags: '',
            quantity: '',
            uom: '',
            rate: '',
            taxable_value: ''
        };
        onChange('items', null, [...items, newItem]);
    };

    const handleDeleteItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange('items', null, newItems);
    };

    return (
        <Card sx={{ mb: 3, boxShadow: 0, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <CardHeader title="Items Details" sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }} />
            <CardContent>
                {items.map((item, index) => {
                    const itemErrors = errors?.[index] || {};
                    return (
                        <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa', position: 'relative' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="text.secondary">Item #{index + 1}</Typography>
                                <IconButton color="error" onClick={() => handleDeleteItem(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField
                                    fullWidth
                                    label="Description of Product"
                                    value={item.description_of_product || ''}
                                    onChange={(e) => handleItemChange(index, 'description_of_product', e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="HSN Code"
                                    value={item.hsn_code || ''}
                                    onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Bags"
                                    value={item.bags || ''}
                                    onChange={(e) => handleItemChange(index, 'bags', e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    value={item.quantity || ''}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    error={!!itemErrors.quantity}
                                    helperText={itemErrors.quantity}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="UOM"
                                    value={item.uom || ''}
                                    onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Rate"
                                    value={item.rate || ''}
                                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                    error={!!itemErrors.rate}
                                    helperText={itemErrors.rate}
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Taxable Value"
                                    value={item.taxable_value || ''}
                                    onChange={(e) => handleItemChange(index, 'taxable_value', e.target.value)}
                                    error={!!itemErrors.taxable_value}
                                    helperText={itemErrors.taxable_value}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    );
                })}
                {items.length === 0 && (
                    <Typography variant="body1" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        No items added yet. Click the button below to add an item.
                    </Typography>
                )}
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    sx={{ mt: 2 }}
                >
                    Add New Item
                </Button>
            </CardContent>
        </Card>
    );
}
