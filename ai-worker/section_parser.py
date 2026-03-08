def split_invoice_sections(ocr_text):

    sections = {
        "seller": [],
        "billed_to": [],
        "delivery_to": [],
        "transporter": [],
        "others": []
    }

    current = "seller"

    for line in ocr_text.split("\n"):
        l = line.strip().upper()

        if not l:
            continue

        # Detect headers
        if "BILLED TO" in l:
            current = "billed_to"
            continue

        if "SHIP TO" in l or "ADDRESS OF DELIVERY" in l or "DELIVERY ADDRESS" in l:
            current = "delivery_to"
            continue

        if "TRANSPORTER" in l:
            current = "transporter"
            continue

        sections[current].append(line.strip())

    # convert lists to text
    for k in sections:
        sections[k] = "\n".join(sections[k])

    return sections