import re

def normalize_time(time_str):
    if not time_str:
        return ""
    if re.match(r"^\d{2}:\d{2}$", time_str):
        return time_str + ":00"
    return time_str


def clean_number(num):
    if not num:
        return ""
    return num.replace(",", "")


def clear_hallucinated_fields(invoice_json, ocr_text):
    """
    Hard guard: wipe fields that the AI should never invent.
    challan_number is only valid if the word 'challan' appears
    explicitly in the raw OCR text.
    """
    ocr_lower = ocr_text.lower()
    if "challan" not in ocr_lower:
        invoice_json["supply_details"]["challan_number"] = ""
    return invoice_json


def validate_invoice(invoice_json):

    # Fix invoice time
    invoice_json["invoice_details"]["invoice_time"] = normalize_time(
        invoice_json["invoice_details"]["invoice_time"]
    )

    # Prevent buyer and consignee address being identical
    buyer_addr = invoice_json["buyer_details"]["buyer_address"]
    consignee_addr = invoice_json["consignee_details"]["consignee_address"]

    if buyer_addr == consignee_addr:
        invoice_json["consignee_details"]["consignee_address"] = ""

    # Clean numbers
    for item in invoice_json["items"]:
        item["rate"] = clean_number(item["rate"])
        item["taxable_value"] = clean_number(item["taxable_value"])

    invoice_json["tax_details"]["cgst_amount"] = clean_number(
        invoice_json["tax_details"]["cgst_amount"]
    )

    invoice_json["tax_details"]["sgst_amount"] = clean_number(
        invoice_json["tax_details"]["sgst_amount"]
    )

    return invoice_json