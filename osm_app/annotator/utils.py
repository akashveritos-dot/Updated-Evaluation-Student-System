import fitz
import os
from pathlib import Path

def extract_images_from_pdf(pdf_path, output_dir, pdf_id, password=None):
    try:
        # Open the PDF
        doc = fitz.open(pdf_path)
        
        # If the PDF needs a password and one is provided, authenticate
        if doc.needs_pass:
            if password:
                if not doc.authenticate(password):
                    raise Exception("Password authentication failed.")
            else:
                raise Exception("This document is encrypted, but no password was provided.")
        
        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Extract images from each page
        for page_number in range(len(doc)):
            page = doc.load_page(page_number)
            print(f"Extracting page {page_number + 1}")
            
            pix = page.get_pixmap()
            output_path = os.path.join(output_dir, f"page_{page_number+1}.jpg")
            print(f"Saving image to: {output_path}")
            pix.save(output_path)

    except Exception as e:
        print(f"Error during PDF extraction: {e}")
        raise  # Reraise the exception to propagate the error

    finally:
        doc.close()
