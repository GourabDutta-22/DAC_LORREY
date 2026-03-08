def fill_invoice_time(invoice_json):

    invoice_time = invoice_json["invoice_details"].get("invoice_time")

    if not invoice_time:
        ewb_time = invoice_json.get("ewb_irn_details", {}).get("ewb_create_time", "")
        invoice_json["invoice_details"]["invoice_time"] = ewb_time

    return invoice_json