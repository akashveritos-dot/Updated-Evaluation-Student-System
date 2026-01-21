import os
import io
import base64
from PIL import Image
import pytesseract
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class PageExtractionService:
    """Service for extracting and classifying page content using OCR"""
    
    def __init__(self):
        # Configure tesseract path if needed (adjust for your system)
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        self.extraction_cache = {}
        
    def extract_page_data(self, image_path, page_number):
        """
        Extract data from a single page image
        
        Args:
            image_path: Path to the image file
            page_number: Page number (1-based)
            
        Returns:
            dict: Page data with classification and extracted text
        """
        cache_key = f"{image_path}_{page_number}"
        
        # Check cache first
        if cache_key in self.extraction_cache:
            return self.extraction_cache[cache_key]
            
        try:
            # Open and preprocess image
            image = self._preprocess_image(image_path)
            
            # Extract text using OCR
            extracted_text = self._extract_text(image)
            
            # Classify page
            page_classification = self._classify_page(extracted_text)
            
            # Prepare result
            result = {
                'page_number': page_number,
                'image_path': image_path,
                'has_text': page_classification['has_text'],
                'is_blank': page_classification['is_blank'],
                'extracted_text': extracted_text,
                'word_count': page_classification['word_count'],
                'confidence_score': page_classification['confidence_score'],
                'classification': 'blank' if page_classification['is_blank'] else 'text'
            }
            
            # Cache the result
            self.extraction_cache[cache_key] = result
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting data from page {page_number}: {str(e)}")
            # Return safe default on error
            return {
                'page_number': page_number,
                'image_path': image_path,
                'has_text': False,
                'is_blank': True,
                'extracted_text': '',
                'word_count': 0,
                'confidence_score': 0,
                'classification': 'error',
                'error': str(e)
            }
    
    def _preprocess_image(self, image_path):
        """Preprocess image for better OCR results"""
        try:
            image = Image.open(image_path)
            
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Resize if too large (for performance)
            max_width, max_height = 2000, 2000
            if image.width > max_width or image.height > max_height:
                image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            return image
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {str(e)}")
            raise
    
    def _extract_text(self, image):
        """Extract text from image using OCR"""
        try:
            # Configure tesseract parameters for better accuracy
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?;:()[]{}"\' '
            
            # Extract text with confidence data
            data = pytesseract.image_to_data(image, config=custom_config, output_type=pytesseract.Output.DICT)
            
            # Filter out low confidence text
            text_parts = []
            total_confidence = 0
            word_count = 0
            
            for i in range(len(data['text'])):
                confidence = int(data['conf'][i])
                text = data['text'][i].strip()
                
                if confidence > 30 and text:  # Only include text with confidence > 30%
                    text_parts.append(text)
                    total_confidence += confidence
                    word_count += 1
            
            extracted_text = ' '.join(text_parts)
            avg_confidence = total_confidence / word_count if word_count > 0 else 0
            
            return {
                'text': extracted_text,
                'confidence': avg_confidence,
                'word_count': word_count
            }
            
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return {
                'text': '',
                'confidence': 0,
                'word_count': 0
            }
    
    def _classify_page(self, text_data):
        """Classify page as blank or text based on extracted content"""
        text = text_data['text']
        word_count = text_data['word_count']
        confidence = text_data['confidence']
        
        # Classification rules
        has_text = False
        is_blank = True
        
        # Consider page has text if:
        # 1. More than 3 words with reasonable confidence
        # 2. OR any text with high confidence (>70%)
        if word_count > 3 and confidence > 40:
            has_text = True
            is_blank = False
        elif word_count > 0 and confidence > 70:
            has_text = True
            is_blank = False
        
        return {
            'has_text': has_text,
            'is_blank': is_blank,
            'word_count': word_count,
            'confidence_score': confidence
        }
    
    def process_multiple_pages(self, image_paths):
        """
        Process multiple pages and return comprehensive results
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            dict: Complete extraction results with summary
        """
        results = {
            'pages': [],
            'summary': {
                'total_pages': len(image_paths),
                'blank_pages': 0,
                'text_pages': 0,
                'error_pages': 0
            },
            'blank_page_numbers': [],
            'text_page_numbers': []
        }
        
        for i, image_path in enumerate(image_paths):
            page_number = i + 1  # 1-based numbering
            page_data = self.extract_page_data(image_path, page_number)
            results['pages'].append(page_data)
            
            # Update summary
            if page_data.get('error'):
                results['summary']['error_pages'] += 1
            elif page_data['is_blank']:
                results['summary']['blank_pages'] += 1
                results['blank_page_numbers'].append(page_number)
            else:
                results['summary']['text_pages'] += 1
                results['text_page_numbers'].append(page_number)
        
        return results
    
    def clear_cache(self):
        """Clear the extraction cache"""
        self.extraction_cache.clear()
    
    def get_cached_result(self, image_path, page_number):
        """Get cached extraction result if available"""
        cache_key = f"{image_path}_{page_number}"
        return self.extraction_cache.get(cache_key)

# Global instance
page_extractor = PageExtractionService()
