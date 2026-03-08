import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def extract_invoice_data(ocr_text, target_schema):

    prompt = f"""
TASK:
Extract structured invoice data from the provided OCR text and return JSON.

IMPORTANT INVOICE STRUCTURE RULES:

1. Seller is the company issuing the invoice (usually at the top of the document).
2. Buyer details must come from the section labeled:
   - "BILLED TO"
   - "BILL TO"
3. Consignee details must come from the section labeled:
   - "SHIP TO"
   - "ADDRESS OF DELIVERY"
   - "DELIVERY ADDRESS"

4. Never confuse these sections:
   - Seller
   - Billed To
   - Delivery Address
   - Transporter

5. Transporter details must NOT be used as buyer or consignee details.

6. Buyer name is usually the first company/person name under BILLED TO.

7. Consignee name is usually the first name under DELIVERY ADDRESS.

DATA EXTRACTION RULES:

8. Return ONLY valid JSON.
9. Follow the schema exactly.
10. If any field is missing return "".
11. Do not hallucinate values.
12. Preserve numeric values exactly as written.

ADDRESS RULES:

13. Extract only valid 6 digit pincodes.
14. Do not mix addresses between buyer, consignee and transporter.
15. BILLED TO address is the buyer's address
16. SHIP TO or ADDRESS OF DELIVERY or DELIVERY TO is the consginee details and address
15. Fix obvious OCR mistakes like:
    ITH FLOOR → 11TH FLOOR.

TIME RULES:

16. Normalize time to HH:MM:SS.
17. Replace "." with ":" in time values.

TAX RULES:

18. total_tax_amount = cgst_amount + sgst_amount.

TRANSPORT RULES:

19. If mode_of_transport is missing use "Road".
20. If lorrey_receipt_number is missing return "".
21. For challan_number: ONLY extract it if the word "Challan" or "Challan No" is explicitly printed on the invoice document. If not present, return "". Never derive it from the invoice number or any other field.

SCHEMA:
{json.dumps(target_schema, indent=2)}

OCR TEXT:
{ocr_text}

Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model="gpt-4.1",
        temperature=0,
        messages=[
            {"role": "system", "content": "You are an invoice extraction engine."},
            {"role": "user", "content": prompt}
        ]
    )

    result = response.choices[0].message.content

    return json.loads(result)