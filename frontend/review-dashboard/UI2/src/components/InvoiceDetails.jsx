import React from "react";
import { Box, TextField, Card, CardHeader, CardContent } from "@mui/material";

export default function InvoiceDetails({ data, errors, onChange }) {
  const handleChange = (e) => {
    onChange("invoice_details", e.target.name, e.target.value);
  };

  // Convert DD/MM/YYYY → YYYY-MM-DD
  const convertDate = (date) => {
    if (!date) return "";

    const parts = date.split("/");
    if (parts.length !== 3) return date;

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader title="Invoice Details" />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            fullWidth
            label="Invoice Number"
            name="invoice_number"
            value={data?.invoice_number || ""}
            onChange={handleChange}
            error={!!errors?.invoice_number}
            helperText={errors?.invoice_number}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Invoice Date"
            name="invoice_date"
            type="text"
            placeholder="e.g. 10/01/2026"
            InputLabelProps={{ shrink: true }}
            value={data?.invoice_date || ""}
            onChange={handleChange}
            error={!!errors?.invoice_date}
            helperText={errors?.invoice_date}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Invoice Time"
            name="invoice_time"
            type="text"
            placeholder="e.g. 14:30"
            InputLabelProps={{ shrink: true }}
            value={data?.invoice_time || ""}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Reference Number"
            name="reference_number"
            value={data?.reference_number || ""}
            onChange={handleChange}
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
