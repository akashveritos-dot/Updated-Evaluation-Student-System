import fitz  # PyMuPDF
import os
from django.conf import settings
import glob

def extract_images_from_pdf(pdf_path,file_id, password=None, force_refresh=False):
    """
    Extract images from PDF, with caching to avoid re-extraction.
    
    Args:
        pdf_path: Path to the PDF file
        file_id: Unique identifier for the PDF (used in output directory)
        password: Optional password for encrypted PDFs
        force_refresh: If True, force re-extraction even if images exist
    
    Returns:
        List of image URLs
    """
    images = []
    output_dir = os.path.join(settings.MEDIA_ROOT, f"pdf_images/{file_id}")
    os.makedirs(output_dir, exist_ok=True)
    
    # Check if images already exist (unless force_refresh is True)
    if not force_refresh:
        existing_images = glob.glob(os.path.join(output_dir, "*.png"))
        if existing_images:
            # Sort images by filename to maintain page order
            existing_images.sort()
            # Convert to URLs
            for img_path in existing_images:
                img_filename = os.path.basename(img_path)
                image_url = os.path.join(settings.MEDIA_URL, f"pdf_images/{file_id}/" + img_filename).replace('\\', '/')
                images.append(image_url)
            
            # Validate that we have the correct number of images by checking PDF page count
            try:
                doc = fitz.open(pdf_path)
                if doc.needs_pass:
                    if not doc.authenticate(password):
                        doc.close()
                        raise Exception("Incorrect PDF password")
                
                pdf_page_count = len(doc)
                doc.close()
                
                # If page count matches, return cached images
                if len(images) == pdf_page_count:
                    return images
                # If page count doesn't match, we need to re-extract
                # Clear existing images and proceed with extraction
                else:
                    # Remove old images that don't match page count
                    for img_path in existing_images:
                        try:
                            os.remove(img_path)
                        except:
                            pass
                    images = []  # Reset images list for fresh extraction
            except Exception as e:
                print(f"Error validating cached images: {e}")
                # If validation fails, proceed with extraction
                images = []
    
    # Extract images if they don't exist or if force_refresh is True
    if not images:
        try:
            doc = fitz.open(pdf_path)
            if doc.needs_pass:
                if not doc.authenticate(password):
                    doc.close()
                    raise Exception("Incorrect PDF password")

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                # Use consistent naming: page_1.png, page_2.png, etc. for easier caching
                image_filename = f"page_{page_num + 1}.png"
                image_path = os.path.join(output_dir, image_filename)
                pix.save(image_path)
                image_url = os.path.join(settings.MEDIA_URL, f"pdf_images/{file_id}/" + image_filename).replace('\\', '/')
                images.append(image_url)

            doc.close()
        except Exception as e:
            print("Error:", e)

    return images
