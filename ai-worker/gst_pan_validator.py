import re


# GSTIN format validation
def is_valid_gstin(gstin):
    if not gstin:
        return False

    gstin_pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(gstin_pattern, gstin))


# PAN validation
def is_valid_pan(pan):
    if not pan:
        return False

    pan_pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    return bool(re.match(pan_pattern, pan))


# Extract PAN from GSTIN
def extract_pan_from_gstin(gstin):
    if gstin and len(gstin) >= 12:
        return gstin[2:12]
    return ""


def validate_gst_pan(invoice_json):

    seller = invoice_json.get("seller_details", {})
    buyer = invoice_json.get("buyer_details", {})

    seller_gstin = seller.get("seller_gstin", "")
    seller_pan = seller.get("seller_pan", "")

    buyer_gstin = buyer.get("buyer_gstin", "")
    buyer_pan = buyer.get("buyer_pan", "")

    # GSTIN validation
    if not is_valid_gstin(seller_gstin):
        seller["seller_gstin"] = ""

    if not is_valid_gstin(buyer_gstin):
        buyer["buyer_gstin"] = ""

    # PAN validation
    if not is_valid_pan(seller_pan):
        seller["seller_pan"] = ""

    if not is_valid_pan(buyer_pan):
        buyer["buyer_pan"] = ""

    # PAN extraction from GSTIN if PAN missing
    if not seller_pan and seller_gstin:
        seller["seller_pan"] = extract_pan_from_gstin(seller_gstin)

    if not buyer_pan and buyer_gstin:
        buyer["buyer_pan"] = extract_pan_from_gstin(buyer_gstin)

    invoice_json["seller_details"] = seller
    invoice_json["buyer_details"] = buyer

    return invoice_json