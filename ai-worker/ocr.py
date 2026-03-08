import boto3
import os
from dotenv import load_dotenv

load_dotenv()

textract = boto3.client(
    "textract",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

def run_ocr(file_path):

    with open(file_path, "rb") as document:
        img_bytes = document.read()

    response = textract.analyze_document(
        Document={"Bytes": img_bytes},
        FeatureTypes=["FORMS", "TABLES"]
    )

    text = ""

    for block in response["Blocks"]:
        if block["BlockType"] == "LINE":
            text += f"{block['Text']}\n"
    
    print("OCR TEXT:\n", text)

    return text