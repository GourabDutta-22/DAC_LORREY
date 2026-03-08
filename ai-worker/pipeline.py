from fastapi import FastAPI
from pydantic import BaseModel
import requests
import tempfile
import os

from ocr import run_ocr
from extractor import extract_invoice_data
from schema import target_schema
from section_parser import split_invoice_sections
from postprocess import validate_invoice, clear_hallucinated_fields
from address_validator import validate_addresses
from gst_pan_validator import validate_gst_pan
from amount_validator import validate_amounts
from validationGPT import validate_invoice_with_gpt
from time_validator import fill_invoice_time

app = FastAPI()


class InvoiceRequest(BaseModel):
    file: str


@app.get("/")
def home():
    return {"message": "Invoice AI Worker Running"}


@app.post("/process")
def process_invoice(data: InvoiceRequest):

    file_url = data.file

    print("Received file:", file_url)

    # -------------------------------
    # Download file from S3
    # -------------------------------
    response = requests.get(file_url)

    if response.status_code != 200:
        return {"error": "Failed to download file from S3"}

    # Save temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(response.content)
        file_path = tmp.name

    print("Saved file locally:", file_path)

    # -------------------------------
    # OCR
    # -------------------------------
    print("Running Textract OCR...")
    ocr_text = run_ocr(file_path)
    print("OCR Completed")

    # -------------------------------
    # Section Parsing
    # -------------------------------
    sections = split_invoice_sections(ocr_text)
    print("Sections detected:", sections)

    # -------------------------------
    # Extraction
    # -------------------------------
    invoice_json = extract_invoice_data(ocr_text, target_schema)

    # Hard guard: clear fields the AI should never hallucinate
    invoice_json = clear_hallucinated_fields(invoice_json, ocr_text)

    # Rule validations
    invoice_json = validate_invoice(invoice_json)

    # Address validation
    invoice_json = validate_addresses(invoice_json)

    # GST / PAN validation
    invoice_json = validate_gst_pan(invoice_json)

    # Amount validation
    invoice_json = validate_amounts(invoice_json)

    #Time validation
    invoice_json = fill_invoice_time(invoice_json)

    # GPT validation
    invoice_json = validate_invoice_with_gpt(file_path, invoice_json)

    print("Extraction + GPT Validation Completed")

    return {
        "status": "success",
        "invoice_data": invoice_json
    }