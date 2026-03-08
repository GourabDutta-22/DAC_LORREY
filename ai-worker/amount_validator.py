def clean_float(value):
    if value is None:
        return 0.0

    value = str(value).replace(",", "").replace("%", "").strip()

    if value == "":
        return 0.0

    try:
        return float(value)
    except:
        return 0.0


def validate_amounts(invoice_json):

    items = invoice_json.get("items", [])
    tax = invoice_json.get("tax_details", {})
    summary = invoice_json.get("amount_summary", {})

    if not items:
        return invoice_json

    taxable = sum(clean_float(item.get("taxable_value")) for item in items)

    # Get rates
    cgst_rate_raw = clean_float(tax.get("cgst_rate"))
    sgst_rate_raw = clean_float(tax.get("sgst_rate"))

    # Default GST rates if missing
    cgst_rate = (cgst_rate_raw if cgst_rate_raw != 0 else 9) / 100
    sgst_rate = (sgst_rate_raw if sgst_rate_raw != 0 else 9) / 100

    correct_cgst = round(taxable * cgst_rate, 2)
    correct_sgst = round(taxable * sgst_rate, 2)

    tax["cgst_rate"] = str(cgst_rate * 100) + "%"
    tax["sgst_rate"] = str(sgst_rate * 100) + "%"

    tax["cgst_amount"] = str(correct_cgst)
    tax["sgst_amount"] = str(correct_sgst)

    total_tax = correct_cgst + correct_sgst
    summary["total_tax_amount"] = str(round(total_tax, 2))

    invoice_json["tax_details"] = tax
    invoice_json["amount_summary"] = summary

    return invoice_json