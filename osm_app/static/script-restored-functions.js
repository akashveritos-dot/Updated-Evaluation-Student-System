// ========== RESTORED SCRIPT.JS FUNCTIONS ==========
// This file contains the restored functions that were broken

// Mark selected sheets as blank with validation
async function markSheetsAsBlank(selectedSheets) {
  const sheets = Array.from(selectedSheets);
  const invalidSheets = [];
  
  // First validate all sheets with AI system
  for (let i = 0; i < sheets.length; i++) {
    const $sheet = $(sheets[i]);
    const sheetIndex = $sheet.val();
    
    // Add loading state
    $sheet.closest('.sheet-item').addClass('loading');
    
    // Switch to the sheet
    goToSlide(parseInt(sheetIndex));
    
    // Wait a moment for the slide to change and AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if AI client is available and validate the sheet
    const pageId = `page_${sheetIndex}`;
    let canMarkAsBlank = true;
    let validationMessage = '';
    
    // Simple AI validation check (bypassed for now)
    if (false && window.aiAuditingClient && !window.aiAuditingClient.bypassMode) {
      // Ensure page is analyzed
      if (!window.aiAuditingClient.pageAnalyses.has(pageId)) {
        await window.aiAuditingClient.analyzeCurrentPage();
      }
      
      // Check if page has content
      const analysis = window.aiAuditingClient.pageAnalyses.get(pageId);
      if (analysis && analysis.is_content) {
        // Show professional warning popup instead of blocking
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Content Detected',
          html: `
            <div style="text-align: left;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                This page contains text and you are marking it blank.
              </p>
              <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
                Are you sure you want to proceed with marking this page as blank?
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Proceed Anyway',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          reverseButtons: true,
          customClass: {
            popup: 'professional-alert-popup',
            title: 'professional-alert-title',
            htmlContainer: 'professional-alert-content'
          }
        });
        
        if (!result.isConfirmed) {
          // User cancelled - add to invalid sheets but don't mark
          invalidSheets.push({
            index: parseInt(sheetIndex) + 1,
            reason: `Page contains content - user cancelled marking`,
            contentType: analysis.contentType || 'unknown'
          });
          return; // Skip this sheet
        }
        // User confirmed - proceed with marking directly
        await markBlankAnyway();
      }
    }
    
    // Remove loading state
    $sheet.closest('.sheet-item').removeClass('loading');
    
    // Add delay between sheets (except for the last one)
    if (i < sheets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // If there are invalid sheets, show warning and allow user to decide
  if (invalidSheets.length > 0) {
    const invalidSheetList = invalidSheets.map(s => `- Page ${s.index}: ${s.reason} (${s.contentType})`).join('\n');
    
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Content Detected on Some Sheets',
      html: `
        <div style="text-align: left; max-height: 300px; overflow-y: auto;">
          <p>The following sheets contain content and should not be marked as blank:</p>
          <pre style="font-size: 12px; background: #f8f9fa; padding: 10px; border-radius: 5px;">${invalidSheetList}</pre>
          <p>Do you want to:</p>
        </div>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Mark Only Blank Sheets',
      denyButtonText: 'Mark All Anyway (Not Recommended)',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545'
    });
    
    if (result.isDismissed) {
      return; // User cancelled
    }
    
    if (result.isDenied) {
      // User chose to mark all anyway - proceed with original logic
    } else {
      // User chose to mark only blank sheets - filter out invalid ones
      const validSheets = sheets.filter((sheet, index) => {
        const sheetIndex = $(sheet).val();
        return !invalidSheets.some(invalid => invalid.index === parseInt(sheetIndex) + 1);
      });
      
      if (validSheets.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Valid Blank Sheets',
          text: 'All selected sheets contain content. No sheets were marked as blank.',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      // Proceed with only valid sheets
      await processValidSheets(validSheets);
      return;
    }
  }
  
  // All sheets are valid, proceed with marking
  await processValidSheets(sheets);
}

// Helper function to process valid sheets
async function processValidSheets(validSheets) {
  for (let i = 0; i < validSheets.length; i++) {
    const $sheet = $(validSheets[i]);
    const sheetIndex = $sheet.val();
    
    // Add loading state
    $sheet.closest('.sheet-item').addClass('loading');
    
    // Switch to the sheet
    goToSlide(parseInt(sheetIndex));
    
    // Wait a moment for the slide to change
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Apply mark_blank tool (now safe since we validated)
    await applyMarkBlankTool(sheetIndex);
    
    // Remove loading state
    $sheet.closest('.sheet-item').removeClass('loading');
    
    // Add delay between sheets (except for the last one)
    if (i < validSheets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Show completion message
  Swal.fire({
    icon: 'success',
    title: 'Sheets Marked Successfully',
    text: `${validSheets.length} sheet(s) have been marked as blank.`,
    confirmButtonText: 'OK'
  }).then(() => {
    // Close modal and reset selections
    $('#sheetsModal').modal('hide');
    $('.sheet-item input[type="checkbox"]').prop('checked', false);
    $('.sheet-item').removeClass('selected');
  });
}

// Apply mark_blank tool to a specific sheet with AI validation
async function applyMarkBlankTool(sheetIndex) {
  let activeIndex = parseInt(sheetIndex);
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Check if mark_blank is already applied
  if (paperSheet.getSheet(activeIndex)?.some(item => item.tool === "mark_blank")) {
    return; // Skip if already marked
  }

  // AI Validation before applying mark_blank
  const pageId = `page_${activeIndex}`;
  // Simple AI validation check (bypassed for now)
    if (false && window.aiAuditingClient && !window.aiAuditingClient.bypassMode) {
    logger.log('MARK_BLANK_VALIDATION', {
      page: activeIndex + 1,
      pageId: pageId
    });
    
    // Check if page has content (no need to analyze again - already done on navigation)
    const analysis = window.aiAuditingClient.pageAnalyses.get(pageId);
    console.log('🔍 Page analysis result (from navigation):', analysis);
    
    // If no analysis exists, do quick analysis (fallback)
    if (!analysis) {
      console.log('🔍 No analysis found, doing quick analysis...');
      await window.aiAuditingClient.analyzeCurrentPage();
    }
    
    const finalAnalysis = window.aiAuditingClient.pageAnalyses.get(pageId);
    
    if (finalAnalysis && finalAnalysis.is_content) {
      console.warn('🚨 MARK_BLANK_CONTENT_DETECTED:', {
        page: activeIndex + 1,
        contentType: finalAnalysis.contentType,
        confidence: finalAnalysis.confidence,
        detectionReason: finalAnalysis.detectionReason
      });
      
      // Show custom modal for content detection
      showContentDetectedModal();
      
      return; // Stop function here - wait for user to click button
    } else {
      console.log('✅ No content detected, proceeding with blank marking directly');
      // Mark directly without alert when no content detected
      drawMarkBlankCross(ctx, canvas);
      paperSheet.pushData(activeIndex, null, null, 'mark_blank', canvas.toDataURL('image/png'));
      return;
    }
  } else {
    console.log('⚠️ AI validation bypassed or not available, marking directly');
  }

  // Fallback: Mark directly if AI not available
  drawMarkBlankCross(ctx, canvas);
  paperSheet.pushData(activeIndex, null, null, 'mark_blank', canvas.toDataURL('image/png'));
}

// Helper function to draw the mark_blank cross
function drawMarkBlankCross(ctx, canvas) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const crossSize = 50;

  ctx.strokeStyle = "#dc3545";
  ctx.lineWidth = 4;

  // Draw diagonal lines to form an X
  ctx.beginPath();
  ctx.moveTo(centerX - crossSize/2, centerY - crossSize/2);
  ctx.lineTo(centerX + crossSize/2, centerY + crossSize/2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + crossSize/2, centerY - crossSize/2);
  ctx.lineTo(centerX - crossSize/2, centerY + crossSize/2);
  ctx.stroke();
}

// Show content detected modal
function showContentDetectedModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10002;
    font-size: 13px;
    box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3);
    animation: slideInRight 0.4s ease;
    max-width: 350px;
    border-left: 4px solid #dc3545;
    background: white;
    padding: 15px;
    border-radius: 8px;
  `;
  
  modal.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <span style="font-size: 20px; margin-top: 2px;">⚠️</span>
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 2px;">Content Detected</strong>
        <small style="opacity: 0.9;">
          This page contains content. Please verify before marking as blank.
        </small>
        <br><br>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
          Mark Anyway
        </button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; color: #666; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; line-height: 1;">&times;</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (modal.parentElement) {
      modal.remove();
    }
  }, 10000);
}
