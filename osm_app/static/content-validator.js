/**
 * Smart Content Validation System for Student Evaluation
 * Detects handwritten content vs blank areas on lined paper
 */
class ContentValidator {
    constructor() {
        // Configuration constants
        this.LUMINANCE_THRESHOLD = 135;
        this.GLOBAL_PAGE_THRESHOLD = 0.0015; // 0.15%
        this.REGION_THRESHOLD = 0.03; // 3.0%
        this.PIXEL_STRIDE = 5;
        
        // Layout-aware masking zones (percentages)
        this.LEFT_MARGIN_EXCLUDE = 0.18; // Ignore first 18% of width
        this.TOP_HEADER_EXCLUDE = 0.08; // Ignore top 8% of height
        this.BOTTOM_FOOTER_EXCLUDE = 0.08; // Ignore bottom 8% of height
        
        // Visual debugging flag (DISABLED - no drawing allowed)
        this.ENABLE_DEBUG_RECTANGLE = false;
        
        // Cache for analysis results
        this.analysisCache = new Map();
        
        // Bind methods to maintain context
        this.analyzePageContent = this.analyzePageContent.bind(this);
        this.analyzeCursorRegion = this.analyzeCursorRegion.bind(this);
        this.checkMarkBlankTool = this.checkMarkBlankTool.bind(this);
        this.checkAddMarksTool = this.checkAddMarksTool.bind(this);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }
    
    // System Message Bank - Human-Centric Minimalist Messages
    static SYSTEM_MESSAGES = {
        CONTENT_DETECTED: [
            "Wait, I see some writing on this page.",
            "There seems to be an answer written here. Please check again.",
            "This page isn't empty. Please verify before marking it blank.",
            "I found some handwriting here. Are you sure it's blank?",
            "Please review: This page appears to have student answers."
        ],
        BLANK_PAGE: [
            "This page looks completely blank. Are you on the correct sheet?",
            "We couldn't find any answers written on this page. Please verify.",
            "This sheet appears to be empty. Please double-check.",
            "No student handwriting detected. Please confirm you're on the right page.",
            "This page seems empty. Please verify before adding marks."
        ],
        BLANK_REGION: [
            "Please place your mark closer to the student's answer.",
            "That spot looks empty. Try clicking directly on handwritten text.",
            "We couldn't find any writing at this location.",
            "This area appears to be empty. Please click on the answer.",
            "No handwriting detected here. Try clicking closer to the student's text."
        ]
    };
    
    /**
     * Check if pixel is dominantly Red ink (user marks)
     */
    isRedInk(r, g, b) {
        // Red ink: High Red channel, Low Green/Blue channels
        const redDominance = r > 100 && (r / Math.max(g, b)) > 2.0;
        const minSaturation = Math.abs(r - g) + Math.abs(r - b) > 80;
        return redDominance && minSaturation;
    }
    
    /**
     * Check if pixel is Printed Text (dark/grayscale)
     */
    isPrintedText(r, g, b) {
        // Printed text: Dark/Grayscale with low saturation
        const luminance = this.calculateLuminance(r, g, b);
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        return luminance < this.LUMINANCE_THRESHOLD && saturation < 50;
    }
    
    /**
     * Calculate luminance using the standard formula
     * L = 0.299*R + 0.587*G + 0.114*B
     */
    calculateLuminance(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    
    /**
     * Get current page index from carousel
     */
    getCurrentPageIndex() {
        return $('.carousel-item').index($('.carousel-item.active'));
    }
    
    /**
     * Get canvas for current page
     */
    getCurrentCanvas() {
        const activeIndex = this.getCurrentPageIndex();
        return window.canvasArray ? window.canvasArray[activeIndex] : null;
    }
    
    /**
     * Get image for current page
     */
    getCurrentImage() {
        const activeItem = $('.carousel-item.active');
        return activeItem.find('img.magnifiable-image').get(0);
    }
    
    /**
     * Calculate active zone boundaries for layout-aware analysis
     */
    calculateActiveZone(width, height) {
        return {
            startX: Math.floor(width * this.LEFT_MARGIN_EXCLUDE),
            endX: Math.floor(width * (1 - this.LEFT_MARGIN_EXCLUDE)),
            startY: Math.floor(height * this.TOP_HEADER_EXCLUDE),
            endY: Math.floor(height * (1 - this.BOTTOM_FOOTER_EXCLUDE))
        };
    }
    
    /**
     * Check if pixel coordinates are within active zone
     */
    isInActiveZone(x, y, activeZone) {
        return x >= activeZone.startX && x < activeZone.endX && 
               y >= activeZone.startY && y < activeZone.endY;
    }
    
    /**
     * Analyze full page content for blank detection with layout-aware masking
     */
    analyzePageContent() {
        const pageIndex = this.getCurrentPageIndex();
        
        // Check cache first
        if (this.analysisCache.has(pageIndex)) {
            const cached = this.analysisCache.get(pageIndex);
            console.log(`[Validator - Mark Blank] Cached Density: ${(cached.density * 100).toFixed(3)}%`);
            return cached;
        }
        
        const image = this.getCurrentImage();
        if (!image) {
            console.warn('[Validator - Mark Blank] No image found for page', pageIndex);
            return { hasContent: false, density: 0 };
        }
        
        // Create temporary canvas for image analysis
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        // Set canvas size to image size
        tempCanvas.width = image.naturalWidth || image.width;
        tempCanvas.height = image.naturalHeight || image.height;
        
        // Draw image to canvas
        ctx.drawImage(image, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        // Calculate Safe Zone boundaries (strictly ignore margins)
        const safeZone = {
            minX: Math.floor(tempCanvas.width * 0.18),  // Skip Left Margin/Vertical Line
            minY: Math.floor(tempCanvas.height * 0.08),  // Skip Header
            maxY: Math.floor(tempCanvas.height * 0.92)   // Skip Footer
        };
        
        console.log(`[Validator - Mark Blank] Safe Zone: X=${safeZone.minX}-${tempCanvas.width}, Y=${safeZone.minY}-${safeZone.maxY}`);
        
        let inkPixelCount = 0;
        let totalActivePixels = 0;
        
        // Sample pixels using stride, but strictly SKIP pixels outside Safe Zone
        for (let y = 0; y < tempCanvas.height; y += this.PIXEL_STRIDE) {
            // Skip rows outside Safe Zone
            if (y < safeZone.minY || y >= safeZone.maxY) {
                continue;
            }
            
            for (let x = safeZone.minX; x < tempCanvas.width; x += this.PIXEL_STRIDE) {
                const i = (y * tempCanvas.width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                const luminance = this.calculateLuminance(r, g, b);
                
                // If luminance is below threshold, it's considered ink
                if (luminance < this.LUMINANCE_THRESHOLD) {
                    inkPixelCount++;
                }
                totalActivePixels++;
            }
        }
        
        // Calculate density based on Safe Zone only
        const actualInkPixels = inkPixelCount * this.PIXEL_STRIDE;
        const actualTotalPixels = totalActivePixels * this.PIXEL_STRIDE;
        const density = actualTotalPixels > 0 ? actualInkPixels / actualTotalPixels : 0;
        
        const result = {
            hasContent: density > this.GLOBAL_PAGE_THRESHOLD,
            density: density,
            inkPixels: actualInkPixels,
            totalPixels: actualTotalPixels,
            safeZone: safeZone
        };
        
        // Cache the result
        this.analysisCache.set(pageIndex, result);
        
        // Verbose console logging for Mark Blank tool
        console.log(`[Validator - Mark Blank] Analysis Complete:`);
        console.log(`[Validator - Mark Blank] - Safe Zone: X>=${safeZone.minX}, Y=${safeZone.minY}-${safeZone.maxY}`);
        console.log(`[Validator - Mark Blank] - Ink Pixels: ${actualInkPixels.toLocaleString()}`);
        console.log(`[Validator - Mark Blank] - Total Active Pixels: ${actualTotalPixels.toLocaleString()}`);
        console.log(`[Validator - Mark Blank] - Density: ${(density * 100).toFixed(3)}%`);
        console.log(`[Validator - Mark Blank] - Has Content: ${result.hasContent}`);
        
        return result;
    }
    
    /**
     * Analyze cursor region with dynamic sizing based on stamp dimensions and layout-aware masking
     */
    analyzeCursorRegion(clientX, clientY, stampWidth = null, stampHeight = null) {
        const image = this.getCurrentImage();
        if (!image) {
            return { hasContent: false, density: 0 };
        }
        
        // Get cursor dimensions from the custom cursor element or use stamp dimensions
        const cursorElement = document.getElementById('custom-cursor');
        let cursorWidth, cursorHeight;
        
        if (stampWidth && stampHeight) {
            // Use provided stamp dimensions
            cursorWidth = stampWidth;
            cursorHeight = stampHeight;
        } else if (cursorElement) {
            // Use actual cursor dimensions (default to 24x24 if not available)
            cursorWidth = cursorElement.offsetWidth || 24;
            cursorHeight = cursorElement.offsetHeight || 24;
        } else {
            // Default fallback
            cursorWidth = 24;
            cursorHeight = 24;
        }
        
        // Get image position relative to viewport
        const rect = image.getBoundingClientRect();
        
        // Convert viewport coordinates to image coordinates
        const imageX = clientX - rect.left;
        const imageY = clientY - rect.top;
        
        // Calculate scaling factors
        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;
        
        // Calculate scan area based on cursor/stamp dimensions
        const scanWidth = cursorWidth * scaleX;
        const scanHeight = cursorHeight * scaleY;
        const scanX = (imageX - (cursorWidth / 2)) * scaleX;
        const scanY = (imageY - (cursorHeight / 2)) * scaleY;
        
        // Ensure scan area is within image bounds
        const startX = Math.max(0, Math.floor(scanX));
        const startY = Math.max(0, Math.floor(scanY));
        const endX = Math.min(image.naturalWidth, Math.floor(scanX + scanWidth));
        const endY = Math.min(image.naturalHeight, Math.floor(scanY + scanHeight));
        
        // Get Safe Zone for layout-aware masking
        const safeZone = {
            minX: Math.floor(image.naturalWidth * 0.18),  // Skip Left Margin/Vertical Line
            minY: Math.floor(image.naturalHeight * 0.08),  // Skip Header
            maxY: Math.floor(image.naturalHeight * 0.92)   // Skip Footer
        };
        
        // NO VISUAL DEBUGGING - Validator is read-only
        
        // Create temporary canvas for region analysis
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        tempCanvas.width = endX - startX;
        tempCanvas.height = endY - startY;
        
        // Draw specific region to canvas
        ctx.drawImage(
            image,
            startX, startY, endX - startX, endY - startY,
            0, 0, tempCanvas.width, tempCanvas.height
        );
        
        // Get region image data
        const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;
        
        let printedPixelCount = 0;
        let userInkPixelCount = 0;
        let totalActivePixels = 0;
        
        // Sample pixels using stride, but only count pixels in Safe Zone
        for (let y = 0; y < tempCanvas.height; y += this.PIXEL_STRIDE) {
            for (let x = 0; x < tempCanvas.width; x += this.PIXEL_STRIDE) {
                // Map region coordinates back to original image coordinates
                const originalX = startX + x;
                const originalY = startY + y;
                
                // Check if this pixel is in the Safe Zone
                if (originalX < safeZone.minX || originalY < safeZone.minY || originalY >= safeZone.maxY) {
                    continue; // Skip pixels outside Safe Zone
                }
                
                const i = (y * tempCanvas.width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                // Smart Ink Separation
                if (this.isPrintedText(r, g, b)) {
                    printedPixelCount++;
                } else if (this.isRedInk(r, g, b)) {
                    userInkPixelCount++;
                }
                totalActivePixels++;
            }
        }
        
        // Calculate densities based on Safe Zone pixels only
        const actualPrintedPixels = printedPixelCount * this.PIXEL_STRIDE;
        const actualUserInkPixels = userInkPixelCount * this.PIXEL_STRIDE;
        const actualTotalPixels = totalActivePixels * this.PIXEL_STRIDE;
        const printedDensity = actualTotalPixels > 0 ? actualPrintedPixels / actualTotalPixels : 0;
        const userInkDensity = actualTotalPixels > 0 ? actualUserInkPixels / actualTotalPixels : 0;
        
        // Refined Rule: Blank spot detection cares about printedDensity only
        // If printedDensity is high, the spot is Valid (contains question), even if userInkDensity is also high
        const result = {
            hasContent: printedDensity > this.REGION_THRESHOLD,
            density: printedDensity, // For backward compatibility
            printedDensity: printedDensity,
            userInkDensity: userInkDensity,
            printedPixels: actualPrintedPixels,
            userInkPixels: actualUserInkPixels,
            totalPixels: actualTotalPixels,
            cursorWidth: cursorWidth,
            cursorHeight: cursorHeight,
            scanWidth: scanWidth,
            scanHeight: scanHeight,
            safeZone: safeZone
        };
        
        console.log(`[Validator - Add Marks] Layout-aware region analysis - Stamp: ${cursorWidth}x${cursorHeight}, Scan: ${scanWidth.toFixed(1)}x${scanHeight.toFixed(1)}, Printed Density: ${(printedDensity * 100).toFixed(3)}%, User Ink Density: ${(userInkDensity * 100).toFixed(3)}%, Has Content: ${result.hasContent}`);
        console.log(`[Validator - Add Marks] Debug: Click at (${clientX}, ${clientY}) -> Image coords (${imageX.toFixed(1)}, ${imageY.toFixed(1)}) -> Scaled (${scanX.toFixed(1)}, ${scanY.toFixed(1)})`);
        
        return result;
    }
    
    /**
     * REMOVED: drawActiveZoneRectangle - Validator is read-only
     */
    
    /**
     * REMOVED: drawDebugRectangle - Validator is read-only
     */
    
    /**
     * Generate unique response with random message and reference ID
     */
    generateResponse(type) {
        const messages = ContentValidator.SYSTEM_MESSAGES[type];
        if (!messages || messages.length === 0) {
            return { message: 'System alert', refId: 'VAL-ERROR' };
        }
        
        // Select random message
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        
        // Generate unique reference ID: VAL-{timestamp}-{random}
        const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
        const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
        const randomNum = Math.floor(Math.random() * 10); // 0-9
        const refId = `VAL-${timestamp}-${randomChar}${randomNum}`;
        
        return { message, refId };
    }
    
    /**
     * Show Minimalist Red Alert Card
     */
    showToast(message, refId, icon = 'warning') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            iconColor: '#ef4444',
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: false,
            background: '#fee2e2',
            color: '#991b1b',
            html: `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 0;
                ">
                    <div style="
                        flex: 1;
                        font-size: 14px;
                        line-height: 1.4;
                        font-weight: 500;
                    ">
                        ${message}
                    </div>
                </div>
                <div style="
                    position: absolute;
                    bottom: 4px;
                    right: 8px;
                    opacity: 0.5;
                    font-size: 10px;
                    color: #991b1b;
                ">
                    ${refId}
                </div>
            `,
            customClass: {
                popup: 'minimalist-red-alert',
                container: 'minimalist-alert-container'
            },
            showClass: {
                popup: 'animate__animated animate__fadeInRight'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutRight'
            }
        });
        
        // Log reference ID to console for debugging purposes
        console.log(`[Red Alert] ${refId} - ${message}`);
    }
    
    /**
     * Show warning toast for blank page detection (Add Marks tool - Scenario 1)
     */
    showBlankPageWarning() {
        const response = this.generateResponse('BLANK_PAGE');
        this.showToast(response.message, response.refId, 'warning');
    }
    
    /**
     * Show info toast for blank area detection (Add Marks tool - Scenario 2)
     */
    showBlankAreaInfo() {
        const response = this.generateResponse('BLANK_REGION');
        this.showToast(response.message, response.refId, 'info');
    }
    
    /**
     * Show warning toast for content detection (Mark Blank tool)
     */
    showContentWarning() {
        const response = this.generateResponse('CONTENT_DETECTED');
        this.showToast(response.message, response.refId, 'warning');
    }
    
    /**
     * Check content when Mark Blank tool is used
     */
    checkMarkBlankTool() {
        // Run analysis IMMEDIATELY without blocking the tool action
        const analysis = this.analyzePageContent();
        
        // Use specific logging for Mark Blank tool
        console.log(`[Validator - Mark Blank] Tool activated - Density: ${(analysis.density * 100).toFixed(3)}%`);
        
        // Show warning NON-BLOCKING after a short delay
        if (analysis.hasContent) {
            setTimeout(() => {
                this.showContentWarning();
            }, 200); // Very short delay to show toast AFTER tool action
        }
        
        // IMPORTANT: Do NOT return false, do NOT stop propagation
        // Allow the normal Mark Blank function to proceed immediately
    }
    
    /**
     * Check content when Add Marks tool is used with two distinct alert scenarios (layout-aware)
     * Implements Two-Stage Check with Visual Debugging (Red/Blue rectangles)
     */
    checkAddMarksTool(event, stampWidth = null, stampHeight = null) {
        if (!event || typeof event.clientX === 'undefined') return;
        
        console.log('[Validator - Add Marks] Starting Two-Stage Check...');
        
        // Step 0: Setup & Scaling
        const image = this.getCurrentImage();
        if (!image) {
            console.warn('[Validator - Add Marks] No image available');
            return;
        }
        
        // Get actual stamp image dimensions (naturalWidth, naturalHeight)
        const actualStampWidth = stampWidth || 50; // Default fallback
        const actualStampHeight = stampHeight || 50; // Default fallback
        
        // Get image position relative to viewport
        const rect = image.getBoundingClientRect();
        
        // Calculate Scaling
        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;
        
        // Calculate Scan Box: Center the stamp on the mouse click
        const imageX = event.clientX - rect.left;
        const imageY = event.clientY - rect.top;
        
        const scanX = (imageX - (actualStampWidth / 2)) * scaleX;
        const scanY = (imageY - (actualStampHeight / 2)) * scaleY;
        const scanWidth = actualStampWidth * scaleX;
        const scanHeight = actualStampHeight * scaleY;
        
        console.log(`[Validator - Add Marks] Box: ${Math.floor(scanX)},${Math.floor(scanY)},${Math.floor(scanWidth)},${Math.floor(scanHeight)}`);
        console.log(`[Validator - Add Marks] Click at (${event.clientX}, ${event.clientY}) -> Image coords (${imageX.toFixed(1)}, ${imageY.toFixed(1)})`);
        
        // Run analysis with proper sequence
        setTimeout(() => {
            // Step 1: Check Full Page (Pre-Check)
            console.log('[Validator - Add Marks] Step 1: Full Page Pre-Check...');
            const pageAnalysis = this.analyzePageContent();
            
            if (pageAnalysis.density < 0.0015) { // 0.15% threshold
                // Page is blank in active zone - show warning and BLUE rectangle
                console.log('[Validator - Add Marks] Page is BLANK (density < 0.15%)');
                this.showBlankPageWarning();
                
                // NO VISUAL DEBUGGING - Validator is read-only
                
                // STOP - Do not run Step 2
                console.log('[Validator - Add Marks] STOP: Blank page detected, skipping Step 2');
                return;
            }
            
            console.log(`[Validator - Add Marks] Page has content (density: ${(pageAnalysis.density * 100).toFixed(3)}%), proceeding to Step 2`);
            
            // Step 2: Check Cursor Spot (Precision Check)
            console.log('[Validator - Add Marks] Step 2: Cursor Spot Precision Check...');
            const regionAnalysis = this.analyzeCursorRegion(event.clientX, event.clientY, actualStampWidth, actualStampHeight);
            
            if (regionAnalysis.density < 0.03) { // 3.0% threshold
                // Spot is blank - show info and RED rectangle
                console.log('[Validator - Add Marks] Cursor spot is BLANK (density < 3.0%)');
                this.showBlankAreaInfo();
                
                // NO VISUAL DEBUGGING - Validator is read-only
                // Red rectangle visualization removed
            } else {
                console.log(`[Validator - Add Marks] Cursor spot has content (density: ${(regionAnalysis.density * 100).toFixed(3)}%)`);
            }
        }, 100);
    }
    
    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Wait for DOM to be ready
        $(document).ready(() => {
            // Mark Blank tool detection - NON-BLOCKING
            $(document).on('click', '[data-name="mark_blank"]', (event) => {
                // Run analysis immediately but do NOT interfere with the tool action
                this.checkMarkBlankTool();
                // IMPORTANT: Do NOT call event.preventDefault() or event.stopPropagation()
                // Allow the normal Mark Blank function to proceed
            });
            
            // NOTE: Add Marks tool detection is now handled in script.js
            // to ensure proper integration with the existing canvas event system
            
            // Clear cache when navigating to different page
            $('#sliderCarousel').on('slid.bs.carousel', () => {
                // Optional: You can clear cache or keep it
                // this.analysisCache.clear();
            });
        });
    }
    
    /**
     * Toggle visual debugging on/off
     */
    toggleDebug(enabled = null) {
        if (enabled !== null) {
            this.ENABLE_DEBUG_RECTANGLE = enabled;
        } else {
            this.ENABLE_DEBUG_RECTANGLE = !this.ENABLE_DEBUG_RECTANGLE;
        }
        console.log(`ContentValidator: Debug rectangle ${this.ENABLE_DEBUG_RECTANGLE ? 'ENABLED' : 'DISABLED'}`);
        return this.ENABLE_DEBUG_RECTANGLE;
    }
    
    /**
     * Clear analysis cache (useful for testing or when images change)
     */
    clearCache() {
        this.analysisCache.clear();
        console.log('ContentValidator: Cache cleared');
    }
    
    /**
     * Get cached analysis for a page
     */
    getCachedAnalysis(pageIndex) {
        return this.analysisCache.get(pageIndex);
    }
    
    /**
     * Debug method to test current page
     */
    debugCurrentPage() {
        const analysis = this.analyzePageContent();
        console.log('ContentValidator Debug:', analysis);
        return analysis;
    }
}

// Initialize ContentValidator when DOM is ready
$(document).ready(() => {
    window.contentValidator = new ContentValidator();
    console.log('ContentValidator initialized');
});
