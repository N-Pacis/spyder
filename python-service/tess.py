import os
import re
import pytesseract
from pdf2image import convert_from_path
import pikepdf
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path
from io import BytesIO
import concurrent.futures

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set a base directory to store files
BASE_DIR = Path("./pdf_files")
BASE_DIR.mkdir(parents=True, exist_ok=True)

def convert_pdf_to_images(input_pdf, dpi=300):
    """Convert PDF to PIL images in memory with parallel processing"""
    thread_count = os.cpu_count() or 4
    return convert_from_path(input_pdf, dpi=dpi, thread_count=thread_count)

def ocr_image_to_pdf(image):
    """Process single image to searchable PDF"""
    return pytesseract.image_to_pdf_or_hocr(image, extension='pdf')

def process_images_parallel(images):
    """Process images in parallel using multiprocessing"""
    with concurrent.futures.ProcessPoolExecutor() as executor:
        return list(executor.map(ocr_image_to_pdf, images))

def merge_pdf_bytes(pdf_bytes_list, output_pdf):
    """Merge PDF bytes in memory"""
    with pikepdf.Pdf.new() as pdf:
        for pdf_bytes in pdf_bytes_list:
            with pikepdf.open(BytesIO(pdf_bytes)) as src:
                pdf.pages.extend(src.pages)
        pdf.save(output_pdf)

def convert_pdf_to_searchable_pdf(input_pdf, output_pdf, dpi=300):
    """Main conversion process with in-memory handling"""
    images = convert_pdf_to_images(input_pdf, dpi)
    pdf_bytes_list = process_images_parallel(images)
    merge_pdf_bytes(pdf_bytes_list, output_pdf)
    return output_pdf

def ocr_image_to_text(image):
    """Process single image to text"""
    return pytesseract.image_to_string(image)

def extract_text_from_images(images):
    """Extract text from images in parallel"""
    with concurrent.futures.ProcessPoolExecutor() as executor:
        texts = list(executor.map(ocr_image_to_text, images))
    return "\n\n".join(texts)

@app.post("/convert/")
async def convert_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    input_pdf_path = BASE_DIR / file.filename
    output_pdf_path = BASE_DIR / f"output_{file.filename}"
    
    # Save uploaded file
    with open(input_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        convert_pdf_to_searchable_pdf(input_pdf_path, output_pdf_path)
        return FileResponse(output_pdf_path, media_type="application/pdf", filename=f"searchable_{file.filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    finally:
        input_pdf_path.unlink(missing_ok=True)

@app.post("/extract_text/")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_input = Path(temp_dir) / "input.pdf"
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            images = convert_pdf_to_images(temp_input)
            text = extract_text_from_images(images)
            return PlainTextResponse(text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text: {str(e)}")

@app.delete("/cleanup/")
def cleanup_files():
    try:
        for file in BASE_DIR.glob("*"):
            file.unlink(missing_ok=True)
        return {"message": "Files cleaned successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)