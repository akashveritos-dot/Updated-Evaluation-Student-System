// Hard Stop Row Coloring Function
function updateRowColor(questionId, toolName) {
  console.log(`[Row Color] Updating Question ${questionId} with tool ${toolName}`);
  
  // Step 1: Correct Targeting - Find the button and get its row
  const button = document.querySelector(`button.select-question[data-id="${questionId}"]`);
  if (!button) return;
  
  const row = button.closest('tr');
  if (!row) return;
  
  // Step 2: Only process add-marks and mark-incorrect for color grading
  if (toolName !== 'add-marks' && toolName !== 'mark-incorrect') {
    console.log(`[Row Color] Tool ${toolName} not part of color grading system - skipping`);
    return;
  }
  
  // Step 3: Apply Color
  // Remove old classes
  row.classList.remove('row-green', 'row-red', 'row-orange');
  
  // Add new class based on tool name
  let newColorClass = null;
  switch (toolName) {
    case 'add-marks':
      newColorClass = 'row-green';
      break;
    case 'mark-incorrect':
      newColorClass = 'row-red';
      break;
  }
  
  if (newColorClass) {
    row.classList.add(newColorClass);
    console.log(`[Row Color] Applied ${newColorClass} to Question ${questionId}`);
  }
}

// syncUndoStateForQuestion Function - Undo State Sync Logic
function syncUndoStateForQuestion(questionId, activeIndex) {
  // Look at paperSheet data for the currentQuestionId
  const allSheetData = paperSheet.getSheet(activeIndex);
  
  // Filter for the specific questionId
  const questionData = allSheetData.filter(item => item.question_id === questionId);
  const itemCount = questionData.length;
  
  console.log(`[Undo Sync] Question ${questionId}: ${itemCount} items remaining`);
  
  // Count remaining items
  if (itemCount === 0) {
    // If 0 items remain: Remove the CSS classes (row-green, row-red, row-orange) from the row
    // and delete the global state
    const button = document.querySelector(`button.select-question[data-id="${questionId}"]`);
    if (button) {
      const row = button.closest('tr');
      if (row) {
        // Remove all color classes
        row.classList.remove('row-green', 'row-red', 'row-orange');
        
        // Delete the global state - this is crucial to prevent reappearing colors
        delete window.rowVisualState[questionId];
        
        console.log(`[Undo Sync] Question ${questionId} empty, state reset and color removed.`);
      }
    }
  } else if (itemCount > 0) {
    // If items > 0: Recalculate which color should show (prioritizing 'add-marks' as Green)
    recalculateColorForQuestion(questionId, questionData);
  }
}

// recalculateColorForQuestion Function - Color Recalculation with Green Priority
function recalculateColorForQuestion(questionId, remainingItems) {
  // Find the button and row
  const button = document.querySelector(`button.select-question[data-id="${questionId}"]`);
  if (!button) return;
  
  const row = button.closest('tr');
  if (!row) return;
  
  // Extract tool names from remaining items
  const toolNames = remainingItems.map(item => item.tool);
  
  // Only consider add-marks and mark-incorrect for color grading
  const relevantTools = toolNames.filter(tool => tool === 'add-marks' || tool === 'mark-incorrect');
  
  // Determine color with 'add-marks' as highest priority (Green)
  let newColorClass = null;
  
  if (relevantTools.includes('add-marks')) {
    newColorClass = 'row-green';
  } else if (relevantTools.includes('mark-incorrect')) {
    newColorClass = 'row-red';
  }
  
  // Apply the new color
  if (newColorClass) {
    // Remove existing classes
    row.classList.remove('row-green', 'row-red', 'row-orange');
    
    // Apply new color
    row.classList.add(newColorClass);
    
    // Update global state
    window.rowVisualState[questionId] = newColorClass;
    
    console.log(`[Recalculate] Color recalculated for Question ${questionId}: ${newColorClass}`);
  } else {
    // No relevant tools found, remove all colors
    row.classList.remove('row-green', 'row-red', 'row-orange');
    delete window.rowVisualState[questionId];
    console.log(`[Recalculate] No relevant tools for Question ${questionId}, colors removed`);
  }
}

// PHASE 1: JAVASCRIPT (State Management)
// Global object to store row visual states
window.rowVisualState = {};

// Function 1: Only updates memory, doesn't touch DOM yet.
function updateRowState(questionId, toolName) {
  console.log(`[Update State] Question ${questionId} with tool ${toolName}`);
  
  // Only process add-marks and mark-incorrect for color grading
  if (toolName !== 'add-marks' && toolName !== 'mark-incorrect') {
    console.log(`[Update State] Tool ${toolName} not part of color grading system - skipping`);
    return;
  }
  
  // Map the tool to the class (add-marks→row-green, mark-incorrect→row-red)
  switch (toolName) {
    case 'add-marks':
      window.rowVisualState[questionId] = 'row-green';
      console.log(`[Update State] Set Question ${questionId} to green`);
      break;
    case 'mark-incorrect':
      window.rowVisualState[questionId] = 'row-red';
      console.log(`[Update State] Set Question ${questionId} to red`);
      break;
    default:
      // If no specific tool, ensure no state is stored or clear it
      delete window.rowVisualState[questionId];
      console.log(`[Update State] Cleared state for Question ${questionId}`);
      break;
  }
}

// Function 2: Re-paints the table based on memory and current data.
function reapplyAllRowColors() {
  // Get all current sheet data to verify which questions actually have actions
  const allSheets = paperSheet.getAll();
  const questionsWithCurrentActions = new Set();
  
  // Collect all question IDs that have current actions
  for (const sheetName in allSheets) {
    const sheetTools = allSheets[sheetName];
    for (const tool of sheetTools) {
      if (tool.question_id) {
        questionsWithCurrentActions.add(tool.question_id);
      }
    }
  }
  
  console.log('[Reapply Colors] Questions with current actions:', Array.from(questionsWithCurrentActions));
  console.log('[Reapply Colors] Global state keys:', Object.keys(window.rowVisualState));
  
  // Loop through all keys in window.rowVisualState.
  for (const questionId in window.rowVisualState) {
    if (window.rowVisualState.hasOwnProperty(questionId)) {
      // IMPORTANT: Only apply color if this question actually has current actions
      if (!questionsWithCurrentActions.has(questionId)) {
        console.log(`[Reapply Colors] Question ${questionId} has no current actions, removing from global state`);
        delete window.rowVisualState[questionId];
        continue;
      }
      
      // For each questionId, find the row:
      const button = document.querySelector(`button.select-question[data-id="${questionId}"]`);
      if (!button) continue;
      
      const row = button.closest('tr');
      if (!row) continue;

      // Remove old classes
      row.classList.remove('row-green', 'row-red', 'row-orange');
      
      // Add the stored class to that row.
      row.classList.add(window.rowVisualState[questionId]);
      console.log(`[Reapply Colors] Applied ${window.rowVisualState[questionId]} to Question ${questionId}`);
    }
  }
}

function addBadgeToButton(element, count) {
  if (!element) return;

  // Remove existing badge if any
  const existingBadge = element.querySelector('.badge');
  if (existingBadge) existingBadge.remove();

  // Create badge element
  const badge = document.createElement('span');
  badge.classList.add('badge');
  badge.style.position = 'absolute';
  badge.style.top = '-5px';
  badge.style.right = '-5px';
  badge.style.background = 'red';
  badge.style.color = 'white';
  badge.style.borderRadius = '50%';
  badge.style.padding = '2px 6px';
  badge.style.fontSize = '12px';
  badge.textContent = count;

  // Make sure button is relative
  element.style.position = 'relative';

  // Append badge
  element.appendChild(badge);
}

// Usage


class PaperSheet {
  constructor() {
    // Holds all sheets as object of arrays
    this.sheets = {};
  }

  /**
   * Push new data into the specified sheet
   * @param {string} key - The object key (like "sheetA" or "sheetB")
   * @param {number} question_id
   * @param {number} marks
   * @param {string} tool
   * @param {string} image
   * @param {number} sequence
   * @param {string} sheet
   */
  pushData(key, question_id, marks, tool, image) {
    
    // --- [NEW] 1. SAVE VISUAL STATE (Before Re-render) ---
    // Only capture the tool usage to memory for color grading tools
    if (typeof updateRowState === 'function' && (tool === 'add-marks' || tool === 'mark-incorrect')) {
        updateRowState(question_id, tool);
    }
    // -----------------------------------------------------

    // [EXISTING LOGIC START] - Preserved exactly as it was
    key = 'Page ' + (parseInt(key) + 1);
    if (!this.sheets[key]) {
        this.sheets[key] = []; // create array if not exists
    }

    const newItem = { question_id, marks, tool, image };
    this.sheets[key].push(newItem);

    addBadgeToButton($('[data-name="undo_tool"]')[0], this.sheets[key].length);
    // [EXISTING LOGIC END]

    // [EXISTING REFRESH] - This wipes the DOM
    refreshData();

    // --- [FIXED] 2. RE-APPLY VISUAL STATE (After Re-render) ---
    // CRITICAL FIX: refreshData() completely rebuilds the table, wiping out all color classes
    // We need to reapply colors to ALL questions that have stored visual state
    setTimeout(() => {
      console.log('[Push Data] Reapplying colors after refreshData()...');
      console.log('[Push Data] Current global state:', window.rowVisualState);
      
      // Apply colors to ALL questions in global state, regardless of current actions
      for (const questionId in window.rowVisualState) {
        if (window.rowVisualState.hasOwnProperty(questionId)) {
          const colorClass = window.rowVisualState[questionId];
          console.log(`[Push Data] Attempting to apply ${colorClass} to Question ${questionId}`);
          
          // Find the button and row
          const button = document.querySelector(`button.select-question[data-id="${questionId}"]`);
          if (button) {
            const row = button.closest('tr');
            if (row) {
              // Remove all color classes first
              row.classList.remove('row-green', 'row-red', 'row-orange');
              // Apply the stored color
              row.classList.add(colorClass);
              console.log(`[Push Data] Successfully reapplied ${colorClass} to Question ${questionId}`);
            } else {
              console.warn(`[Push Data] Could not find row for Question ${questionId}`);
            }
          } else {
            console.warn(`[Push Data] Could not find button for Question ${questionId}`);
          }
        }
      }
    }, 100); // Increased timeout to ensure DOM is fully rebuilt
    // --------------------------------------------------------

    return this.sheets[key];
  }

  /**
   * Pop last item from the specified sheet
   * @param {string} key - The object key
   */
  popData(key) {
    key = 'Page ' + (parseInt(key) + 1);
    if (!this.sheets[key] || this.sheets[key].length === 0) {
      console.warn(`⚠️ No data found for sheet: ${key}`);
      return null;
    }

    const removed = this.sheets[key].pop();
    // console.log(`🗑️ Popped item from ${key}`, removed);
    addBadgeToButton($('[data-name="undo_tool"]')[0], this.sheets[key].length);
    refreshData();
    
    // ROW COLORING: Properly sync undo state for all questions after data refresh
    setTimeout(() => {
      const allSheetData = this.sheets[key];
      const affectedQuestions = new Set();
      
      // Collect all question IDs that might be affected
      if (removed && removed.question_id) {
        affectedQuestions.add(removed.question_id);
      }
      
      // Also check remaining items for other questions that might need color recalculation
      allSheetData.forEach(item => {
        if (item.question_id) {
          affectedQuestions.add(item.question_id);
        }
      });
      
      // Sync state for all affected questions
      affectedQuestions.forEach(questionId => {
        syncUndoStateForQuestion(questionId, parseInt(key.replace('Page ', '')) - 1);
      });
    }, 50);

    return this.sheets[key].at(-1);
  }

  /**
   * Get all data from a specific sheet
   * @param {string} key
   */
  getSheet(key) {
    key = 'Page ' + (parseInt(key) + 1);
    return this.sheets[key] || [];
  }

  /**
   * Get all sheets data
   */
  getAll() {
    return this.sheets;
  }

  /**
   * Clear a specific sheet
   */
  clearSheet(key) {
    key = 'Page ' + (parseInt(key) + 1);
    if (this.sheets[key]) {
      this.sheets[key] = [];
      // console.log(`🧹 Cleared all data from ${key}`);
    }
  }
}
const paperSheet = new PaperSheet();
// // Create an instance

// // Push entries
// paperSheet.pushData('sheetA', 1, 5, 'pen', 'img1.png', 1, 'SheetA');
// paperSheet.pushData('sheetA', 2, 10, 'marker', 'img2.png', 2, 'SheetA');
// paperSheet.pushData('sheetB', 3, 8, 'eraser', 'img3.png', 1, 'SheetB');

// // Pop last element from sheetA
// paperSheet.popData('sheetA');

// // Get current data
// console.log('📄 SheetA Data:', paperSheet.getSheet('sheetA'));
// console.log('📚 All Sheets:', paperSheet.getAll());

document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
let seconds = 0;
const timeDisplay = document.getElementById('timerDisplay');

function formatTime(s) {
  const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

setInterval(() => {
  seconds++;
  if (timeDisplay) {
    timeDisplay.textContent = formatTime(seconds);
  }
}, 1000);


// $(document).ready(function () {
const tools = {
  'add-marks': { name: 'add-marks', icon: 'plus-circle', label: 'Add Marks', tooltip: 'Add marks to this section' },
  'mark-correct': { name: 'mark-correct', icon: 'check-circle-2', label: 'Mark Correct', tooltip: 'Mark answer as correct' },
  'mark-incorrect': { name: 'mark-incorrect', icon: 'circle-slash', label: 'Mark Incorrect', tooltip: 'Mark answer as incorrect' },
  'pencil-tool': { name: 'pencil-tool', icon: 'pen-tool', label: 'Pencil Tool', tooltip: 'Freehand drawing tool' },
  'text-tool': { name: 'text-tool', icon: 'type', label: 'Text Tool', tooltip: 'Insert typed text' },
  'draw-line': { name: 'draw-line', icon: 'minus', label: 'Draw Line', tooltip: 'Draw a straight line' },
  'draw-box': { name: 'draw-box', icon: 'square', label: 'Draw Box', tooltip: 'Draw a rectangle/box' }
};


const activeCanvasMouseDownEvent = (e) => {
  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });


  startX = e.offsetX;
  startY = e.offsetY;
  if (activeTool === 'text-tool') {

    if (marksOrText) {
      ctx.font = "20px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(marksOrText, startX, startY);
      // saveState();
      paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
      
      // ROW COLORING: Trigger MutationObserver after data push
      canvas.dataset.drawingComplete = 'true';
      
      clearSelectedQuestion();
    }
  } else if (activeTool === 'mark-incorrect') {
    // Example: current question label (you can replace with dynamic variable)
    const questionLabel = 'Q.' + activeQuestion.question_no;

    // ✅ Draw question label
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(questionLabel, startX, startY - 10);

    // ✅ Draw big red "X" slightly beside question text
    const crossSize = 30;
    const offsetX = startX + 60; // shift X to the right of text
    const offsetY = startY - 40; // center vertically with text

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.lineTo(offsetX + crossSize, offsetY + crossSize);
    ctx.moveTo(offsetX + crossSize, offsetY);
    ctx.lineTo(offsetX, offsetY + crossSize);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.stroke();
    // saveState();
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }
    
    clearSelectedQuestion();

  } else if (activeTool === 'mark-correct') {
    // Example: current question label (replace with dynamic variable if available)
    const questionLabel = 'Q.' + activeQuestion.question_no;

    // ✅ Draw question label
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(questionLabel, startX, startY - 10);

    // ✅ Draw red check mark beside the text
    const offsetX = startX + 60; // shift right of text
    const offsetY = startY - 30; // vertical alignment
    const checkSize = 30;

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + checkSize / 2);
    ctx.lineTo(offsetX + checkSize / 3, offsetY + checkSize);
    ctx.lineTo(offsetX + checkSize, offsetY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 6;
    ctx.stroke();

    // saveState();
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }

    clearSelectedQuestion();
  } else if (activeTool === 'add-marks') {
    // Example: current question label (replace dynamically)


    const questionLabel = 'Q.' + activeQuestion.question_no;
    const marksText = '+' + marksOrText; // or dynamically set marks earned
    // activeQuestion.obtained += parseFloat(marksOrText) || 0;
    if (!paperSheetMarks[activeIndex]) {
      paperSheetMarks[activeIndex] = {};
    }

    paperSheetMarks[activeIndex][activeQuestion.id] =
      (paperSheetMarks[activeIndex][activeQuestion.id] || 0) + (parseFloat(marksOrText) || 0);
    
    // Fix 1: Reset context state to prevent ghost box and artifacts
    ctx.beginPath(); // CLEAR any previous paths (fixes the ghost box connection)
    ctx.setLineDash([]); // RESET dashed lines to solid (fixes the dashed border artifact)
    ctx.shadowBlur = 0; // RESET any glow/shadows (fixes misprinting)
    ctx.globalAlpha = 1.0; // Ensure full opacity
    ctx.strokeStyle = 'red'; // Set explicit colors
    ctx.fillStyle = 'red';
    
    // Fix 2: Text Quality - Set explicit font and render cleanly
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(questionLabel, startX, startY - 10);

    // Draw marks beside the question label with clean rendering
    const offsetX = startX + 70;  // right of text
    const offsetY = startY - 10;  // vertically aligned

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(marksText, offsetX, offsetY);

    // Draw clean underline under the marks only
    const textWidth = ctx.measureText(marksText).width;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + 5);
    ctx.lineTo(offsetX + textWidth, offsetY + 5);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    // saveState();
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }
    
    clearSelectedQuestion();
  }

  else {
    drawing = true;
  }
}

const activeCanvasMouseMoveEvent = (e) => {
  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;

  if (activeTool === 'pencil-tool') {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    startX = x;
    startY = y;
    // clearSelectedQuestion();
  }
}

const activeCanvasMouseUpEvent = (e) => {
  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!drawing) return;
  drawing = false;
  const x = e.offsetX;
  const y = e.offsetY;

  if (activeTool === 'draw-line') {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }

  } else if (activeTool === 'draw-box') {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }

  }
  else if (activeTool === 'pencil-tool') {
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
    
    // ROW COLORING: Update row color AFTER the tool action is completed
    if (activeQuestion && activeQuestion.id) {
      updateRowColor(activeQuestion.id, activeTool);
    }

  }
  clearSelectedQuestion();

  // saveState(); // Save after each drawing
}


let toolHtml = `<div class="d-flex flex-wrap justify-content-center gap-2" id="toolSelector">`;

for (const index in tools) {
  const tool = tools[index];
  const id = `tool-${index}`;
  const isDisabled = tool.disabled ? 'disabled' : '';
  const isDisabledStyle = tool.disabled ? 'opacity-50 pointer-events-none' : '';
  const tooltipAttr = `data-bs-toggle="tooltip" title="${tool.tooltip}"`;
  const iconAttr = tool.icon ? `data-lucide="${tool.icon}"` : '';

  toolHtml += `
    <label class="tool-box border rounded p-2 text-center ${isDisabledStyle}" 
           style="width: 100px; cursor: pointer;" ${tooltipAttr} data-value="${tool.name}">
      <input type="radio" name="toolOption" id="${id}" value="${tool.name}" class="d-none" ${isDisabled}>
      <i ${iconAttr} style="width: 24px; height: 24px; display: block; margin: 0 auto 4px;"></i>
      <small>${tool.label}</small>
    </label>
  `;
};

toolHtml += `</div>`;




// });


var currentMagnifier = null;

const myCarousel = document.querySelector('#sliderCarousel');
const carousel = new bootstrap.Carousel(myCarousel, {
  interval: false,  // Prevent automatic sliding
  ride: false,      // Prevent automatic riding
  touch: false,     // Prevent touch/swipe sliding
  keyboard: false,  // Prevent keyboard navigation
  pause: true,      // Start paused
  wrap: false       // Prevent wrapping
});
var canvasArray = $('.carousel-item').map((index, item) => $(item).find('canvas').get(0));

const canvasHistory = [];


function goToSlide(index) {
  switch (index) {
    case 'next':
      carousel.next();
      break;
    case 'prev':
      carousel.prev();
      break;

    default:
      carousel.to(index);
      break;
  }
  if (currentMagnifier) {
    $('#zoomInBtn').removeClass('active');
    destroyMagnifier(currentMagnifier);
    currentMagnifier = null;
  }

}
// Update existing carousel slide handler to work with Navigation Observer
myCarousel.addEventListener('slid.bs.carousel', function (event) {
  $('#pageSelect').val(event.to);
  updateCarouselCanvas($(this).find('.carousel-item').eq(event.to));
  addBadgeToButton($('[data-name="undo_tool"]')[0], paperSheet.getSheet(event.to).length);
  // Navigation Observer handles the detection automatically
});


function updateCarouselCanvas(item) {
  const activeImage = item.find('img').get(0);
  const canvas = item.find('canvas').get(0);

  if (!activeImage || !canvas) return;

  // Ensure image is loaded before reading its size
  if (!activeImage.complete || activeImage.naturalHeight === 0) {
    activeImage.onload = () => updateCanvasToImage(activeImage, canvas);
  } else {
    updateCanvasToImage(activeImage, canvas);
  }
}

function updateCanvasToImage(image, canvas) {
  const rect = image.getBoundingClientRect();

  // Save current canvas content
  const temp = document.createElement('canvas');
  temp.width = canvas.width;
  temp.height = canvas.height;
  const tempCtx = temp.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);

  // Resize canvas (internal resolution and CSS)
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  // Restore old content scaled to new size

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(temp, 0, 0, rect.width, rect.height);
}

updateCarouselCanvas($('.carousel-item').first());

$(document).ready(function () {

  $('#zoomInBtn').click(function () {
    $(this).toggleClass('active'); // toggle button state

    // Destroy previous magnifier if exists
    if (currentMagnifier) {
      destroyMagnifier(currentMagnifier);

      currentMagnifier = null;
    }

    // Only create a new magnifier if button is active
    if ($(this).hasClass('active')) {
      var activeImg = $(carousel._getActive()).find('img').first().get(0);

      currentMagnifier = setupMagnifier(activeImg);
    }
  });


  $('#rotate-image').click(function (e) {
    let image = $(carousel._getActive()).find('img').first().get(0);

    $.ajax({
      type: "GET",
      url: "rotate-image",
      data: {
        'image': $(image).attr('src').split('?')[0]
      },
      dataType: "text", // PHP returns plain text
      success: function (response) {
        image.src = $(image).attr('src').split('?')[0] + "?t=" + new Date().getTime();
        updateCarouselCanvas($(image).closest('.carousel-item'))
      },
      error: function (xhr, status, error) {
        console.error("Rotate failed:", error);
      }
    });
  });

});
// Initialize history array (one stack per carousel item)

// Tool button click handler
$('.btn-tool').click(function (e) {
  const toolName = $(this).data('name');
  console.log('[Tool Selection] Switching tool to:', toolName);
  console.log('[Tool Selection] Button element:', this);
  console.log('[Tool Selection] Button classes:', $(this).attr('class'));
  
  selectedTool(toolName);

});
var activeCanvas = null;
var activeQuestion = null;
let startX = 0,
  drawing = 0,
  marksOrText = null,
  startY = 0,
  activeTool = null;
const clearSelectedQuestion = () => {
  $('tr.active').removeClass('active');
  $('.select-question').addClass('btn-outline-success').removeClass('btn-success').html('<img src="https://img.icons8.com/?size=14&id=13HpMwhzW71Q&format=png&color=000000" class="select-icon" alt="Select">');

  startX = 0;
  drawing = 0;
  startY = 0;
  activeTool = null;
  activeQuestion = null;
  if (activeCanvas) {
    activeCanvas.removeEventListener('mousedown', activeCanvasMouseDownEvent);
    activeCanvas.removeEventListener('mousemove', activeCanvasMouseMoveEvent);
    activeCanvas.removeEventListener('mouseup', activeCanvasMouseUpEvent);
  }
  hideCustomCursor();
}



function setCustomCursor(tool) {
  const cursor = $('#custom-cursor');
  if (tools[tool]) {
    // Clear existing content
    cursor.empty();
    // Create new i element with Lucide icon
    const iconElement = document.createElement('i');
    // Add safety check for icon existence
    const iconName = tools[tool]?.icon;
    if (iconName) {
      iconElement.setAttribute('data-lucide', iconName);
    }
    cursor.append(iconElement);
    // Initialize Lucide icons for the new element
    lucide.createIcons();
    cursor.css('display', 'block');
  } else {
    cursor.css('display', 'none');
  }
}

function hideCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  cursor.style.display = 'none';
}

// Move cursor with mouse
document.addEventListener('mousemove', (e) => {
  const cursor = document.getElementById('custom-cursor');
  const activeItem = document.querySelector('.carousel-item.active');
  cursor.style.left = `${e.pageX}px`;
  cursor.style.top = `${e.pageY - 10}px`;
  // Only move cursor if visible and inside active carousel item
  if (activeTool) {
    if (activeItem && activeItem.contains(e.target)) {
      cursor.style.display = 'block';
      $(activeItem).css('cursor', 'none');

    } else {
      $(activeItem).css('cursor', 'default');
      cursor.style.display = `none`;

    }
  } else {
    // Always ensure default cursor is visible when no tool is active
    cursor.style.display = 'none';
    $(activeItem).css('cursor', 'default');
    $('body').css('cursor', 'default');
  }
});


const selectedTool = (tool, text = null) => {
  console.log('[selectedTool Function] Called with tool:', tool, 'text:', text);
  console.log('[selectedTool Function] Before update - activeTool was:', activeTool);



  marksOrText = text;


  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Ensure history array exists for this slide
  if (!canvasHistory[activeIndex]) {
    canvasHistory[activeIndex] = [];
  }


  const markedToolPopup = () => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Tool already marked in this sheet!',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  setCustomCursor(tool)
  switch (tool) {
    // ✅ "Seen" tool (draws diagonal)
    case 'seen':
      if (paperSheet.getSheet(activeIndex)?.some(item => item.tool === "seen")) {
        markedToolPopup();
        return;
      }
      // Save current state (snapshot before drawing)

      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(0, 150);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
      ctx.stroke();


      paperSheet.pushData(activeIndex, null, null, tool, canvas.toDataURL('image/png'));
      
      // ROW COLORING: Update row color AFTER the tool action is completed
      if (activeQuestion && activeQuestion.id) {
        updateRowColor(activeQuestion.id, tool);
      }

      break;

    // ✅ "Mark Blank" tool (draws cross in center)
    case 'mark_blank':
      if (paperSheet.getSheet(activeIndex)?.some(item => item.tool === "mark_blank")) {
        markedToolPopup();
        return;
      }
      
      performMarkBlank(activeIndex, tool);
      break;

    // "Undo" tool
    case 'undo_tool':
      let lastObject = paperSheet.popData(activeIndex);
      
      // ROW COLORING: Sync undo state after removing item
      if (lastObject && lastObject.question_id) {
        syncUndoStateForQuestion(lastObject.question_id, activeIndex);
      }

      // Create image only if there's a Base64 image
      if (lastObject?.image) {
        const img = new Image();
        img.src = lastObject.image;

        img.onload = () => {
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      } else {
        // If no image, just clear canvas (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      }

      // const activeHistory = canvasHistory[activeIndex];

      // // If we have more than one state, undo last action
      // if (activeHistory && activeHistory.length > 0) {
      //   activeHistory.pop(); // remove latest snapshot

      //   const prevState = activeHistory[activeHistory.length - 1];
      //   if (prevState) {
      //     ctx.putImageData(prevState, 0, 0); // restore previous state
      //   } else {
      //     // nothing left — clear canvas
      //     ctx.clearRect(0, 0, canvas.width, canvas.height);
      //   }
      // }
      // else {
      //   // If no history — just clear canvas
      //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      // }

      break;
    // ✅ "Add Marks" tool
    case 'add-marks':
    case 'mark-incorrect':
      // NOTE: Row color will be updated AFTER tool action is completed, not on selection
      // Fall through to set up canvas events
    case 'pencil-tool':
    case 'text-tool':
    case 'draw-line':
    case 'draw-box':



      activeCanvas = canvasArray[activeIndex];
      activeTool = tool;
      
      // FORCE GLOBAL STATE UPDATE
      window.GLOBAL_ACTIVE_TOOL = tool;
      window.GLOBAL_QUESTION_ID = (typeof activeQuestion !== 'undefined' && activeQuestion) ? activeQuestion.id : null;
      console.log('[Global Bridge] Updated:', window.GLOBAL_ACTIVE_TOOL, window.GLOBAL_QUESTION_ID);
      
      console.log('[selectedTool Function] After update - activeTool is now:', activeTool);
      console.log('[selectedTool Function] Tool type:', tool, 'is add-marks:', tool === 'add-marks');
      activeCanvas.addEventListener('mousedown', activeCanvasMouseDownEvent);

      activeCanvas.addEventListener('mousemove', activeCanvasMouseMoveEvent);

      activeCanvas.addEventListener('mouseup', activeCanvasMouseUpEvent);

      break;

    // ✅ "Mark Correct" tool - NOT part of color grading system
    case 'mark-correct':
      // Set up canvas events but no color grading
      activeCanvas = canvasArray[activeIndex];
      activeTool = tool;
      
      // FORCE GLOBAL STATE UPDATE
      window.GLOBAL_ACTIVE_TOOL = tool;
      window.GLOBAL_QUESTION_ID = (typeof activeQuestion !== 'undefined' && activeQuestion) ? activeQuestion.id : null;
      console.log('[Global Bridge] Updated:', window.GLOBAL_ACTIVE_TOOL, window.GLOBAL_QUESTION_ID);
      
      activeCanvas.addEventListener('mousedown', activeCanvasMouseDownEvent);
      activeCanvas.addEventListener('mousemove', activeCanvasMouseMoveEvent);
      activeCanvas.addEventListener('mouseup', activeCanvasMouseUpEvent);
      break;

    default:
      console.warn('Unknown tool:', tool);
      break;
  }

  // Update reference
  canvasArray[activeIndex] = canvas;
  if (tool != 'undo_tool')
    canvasHistory[activeIndex].push(ctx.getImageData(0, 0, canvas.width, canvas.height));

  if ($('#questionOffcanvas').hasClass('show')) {
    $('#questionOffcanvas').offcanvas('hide');
  }
}

const loader = (isDisabled = 1) => {
  return $('#loader-main').css('display', isDisabled ? 'flex' : 'none');
};





var questions = JSON.parse(document.getElementById('questionsData').textContent);
const questionStatus = JSON.parse(document.getElementById('statusData').textContent);
const paperSheets = JSON.parse(document.getElementById('imagesData').textContent);
const paperSheetMarks = {};
function getNextStatus(currentStatus) {
  const keys = Object.keys(questionStatus); // ["NM", "A", "OA", "NA"]
  const index = keys.indexOf(currentStatus);

  if (index === -1) return null; // current status not found
  const nextIndex = (index + 1) % keys.length; // wraps around to first
  return questionStatus[keys[nextIndex]];
}
const QuestionIdAndQuestionNo = Object.fromEntries(
  questions.map(item => [item.id, item.question_no])
);
const toolTable = tools;
toolTable['seen'] = { name: 'seen', label: 'Seen' };
toolTable['mark_blank'] = { name: 'mark_blank', label: 'Mark Blank' };
const refreshData = () => {
  const totalByQuestion = {};
  const allSheets = paperSheet.getAll();
  $('#sheet-questions-table tbody').html('');
  for (const sheetName in allSheets) {
    const sheetTools = allSheets[sheetName]; // array of objects

    for (const tool of sheetTools) { // use 'of' to iterate objects in array
      if (tool.tool === "add-marks") {
        totalByQuestion[tool.question_id] =
          (totalByQuestion[tool.question_id] || 0) + parseFloat(tool.marks);
      }
      $('#sheet-questions-table tbody').append(`
          <tr>
            <td>${sheetName}</td>
            <td>${QuestionIdAndQuestionNo[tool.question_id] ?? '-'}</td>
            <td>${toolTable[tool.tool].label}</td>
            <td>${tool.marks !== null ? tool.marks : '-'}</td>
          </tr>
        `);
    }
  }

  // for (const sheetId in paperSheetMarks) {
  //   const questions = paperSheetMarks[sheetId];
  //   for (const qid in questions) {
  //     totalByQuestion[qid] = (totalByQuestion[qid] || 0) + questions[qid];
  //   }
  // }


  // Prepare totals first — avoids multiple .filter() runs
  const totals = {
    TQ: questions.length,
    NM: 0,
    A: 0,
    OA: 0,
    NA: 0,
    Marked: 0,
    Correct: 0,
    Wrong: 0,
    TotalMarks: 0
  };

  let tbody = '';

  questions.forEach(question => {
    question.obtained = totalByQuestion[question.id] || 0;

    // Count status types efficiently
    if (question.status in totals) totals[question.status]++;
    if (question.status !== 'NM') totals.Marked++;
    
    // Count correct and incorrect based on tool usage
    if (question.tool === 'mark-correct') {
      totals.Correct++;
    } else if (question.tool === 'mark-incorrect') {
      totals.Wrong++;
    }

    totals.TotalMarks += parseFloat(question.obtained) || 0;

    // Build question row
    tbody += `
    <tr>
      <td>${question.question_no}</td>
      <td>${question.question}</td>
      <td>${question.obtained} / ${question.marks}</td>
      <td>
        <button class="select-question" 
                data-id="${question.id}">
          <img src="https://img.icons8.com/?size=14&id=13HpMwhzW71Q&format=png&color=000000" 
               class="select-icon" alt="Select">
        </button>
      </td>
    </tr>`;
  });

  // Render tbody
  $('#questions-table tbody').html(tbody);

  // Build footer dynamically using pre-calculated totals with resizable functionality
  const f = totals;
  $('#questions-table tfoot').html(`
  <tr class="statistics-row">
    <td colspan="4" class="text-center fw-bold statistics-container">
      <div class="statistics-content d-flex justify-content-between align-items-center w-100">
        <div class="total-questions-stat" data-bs-toggle="tooltip" title="Total number of questions assigned">
          <div class="stat-icon-wrapper">
            <i class="bi bi-question-circle-fill stat-icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Questions</div>
            <div class="stat-value">${f.TQ}</div>
          </div>
        </div>
        <div class="total-marks-stat" data-bs-toggle="tooltip" title="Total marks obtained">
          <div class="stat-icon-wrapper">
            <i class="bi bi-star-fill stat-icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Marks</div>
            <div class="stat-value">${f.TotalMarks}</div>
          </div>
        </div>
      </div>
    </td>
  </tr>
`);
  $('.tooltip').remove();
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    const tooltipInstance = bootstrap.Tooltip.getInstance(el);
    if (tooltipInstance) {
      tooltipInstance.dispose();
    }
  });

  // 2️⃣ Re-initialize tooltips
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el);
  });

}

function loadTools() {


  Swal.fire({
    title: "<strong>Select a Tool</strong>",
    html: `
    ${toolHtml}
    <div id="extraInputContainer" class="mt-3 d-none">
      <label id="extraInputLabel" class="form-label"></label>
      <input id="extraInput" class="form-control" />
    </div>
  `,
    showCloseButton: true,
    showCancelButton: true,
    confirmButtonText: `<i class="bi bi-check-circle"></i> Confirm`,
    cancelButtonText: `<i class="bi bi-x-circle"></i> Cancel`,
    focusConfirm: false,
    allowOutsideClick: false,
    // didClose: () => {
    //   clearSelectedQuestion();
    // },
    didOpen: () => {
      // Initialize Lucide icons
      lucide.createIcons();
      
      // Tooltips
      const tooltipList = [].slice.call(Swal.getHtmlContainer().querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipList.forEach(el => new bootstrap.Tooltip(el));

      const boxes = Swal.getHtmlContainer().querySelectorAll('.tool-box');
      const extraInputContainer = Swal.getHtmlContainer().querySelector('#extraInputContainer');
      const extraInputLabel = Swal.getHtmlContainer().querySelector('#extraInputLabel');
      const extraInput = Swal.getHtmlContainer().querySelector('#extraInput');

      boxes.forEach(box => {
        box.addEventListener('click', () => {
          if (box.classList.contains('pointer-events-none')) return;

          // Highlight selected box
          boxes.forEach(b => b.classList.remove('border-primary', 'bg-light'));
          box.classList.add('border-primary', 'bg-light');

          const input = box.querySelector('input[type="radio"]');
          input.checked = true;

          // Show relevant input based on selection
          const selectedLabel = input.value;
          if (selectedLabel === "add-marks") {
            extraInput.type = "number";
            extraInputLabel.textContent = "Enter Marks";
            extraInput.placeholder = "e.g. 5";

            // Apply min/max dynamically
            const maxMarks = activeQuestion.marks - activeQuestion.obtained;
            extraInput.min = 0;
            extraInput.max = maxMarks;
            extraInput.value = "";

            extraInputContainer.classList.remove("d-none");
          } else if (selectedLabel === "text-tool") {
            extraInput.type = "text";
            extraInputLabel.textContent = "Enter Text";
            extraInput.placeholder = "Type your annotation here";
            extraInput.value = "";
            extraInputContainer.classList.remove("d-none");
          } else {
            extraInputContainer.classList.add("d-none");
            extraInput.value = "";

            Swal.clickConfirm();

          }
        });
      });
    },

    // ==============================================
    // ✅ SweetAlert Validation (min / max / required)
    // ==============================================
    preConfirm: () => {
      const selected = Swal.getHtmlContainer().querySelector('input[name="toolOption"]:checked');
      const extraInputContainer = Swal.getHtmlContainer().querySelector('#extraInputContainer');
      const extraInput = Swal.getHtmlContainer().querySelector('#extraInput');

      if (!selected) {
        Swal.showValidationMessage('Please select a tool before confirming.');
        return false;
      }

      const tool = selected.value;

      if (!extraInputContainer.classList.contains('d-none')) {
        const val = extraInput.value.trim();

        if (!val) {
          Swal.showValidationMessage('Please fill in the required field.');
          return false;
        }

        // ✅ Number validation for add-marks
        if (tool === "add-marks") {
          const numVal = parseFloat(val);
          const min = parseFloat(extraInput.min) || 0.1;
          const max = parseFloat(extraInput.max) || 0;

          if (isNaN(numVal)) {
            Swal.showValidationMessage('Please enter a valid number.');
            return false;
          }

          if (numVal < min) {
            Swal.showValidationMessage(`Marks cannot be less than ${min}.`);
            return false;
          }

          if (numVal > max) {
            Swal.showValidationMessage(`Marks cannot exceed ${max}.`);
            return false;
          }
        }

        return { tool, value: val };
      }

      return { tool };
    }

  }).then(result => {
    if (result.isConfirmed) {
      selectedTool(result.value.tool, result.value.value)
    } else {
      clearSelectedQuestion()
    }
  });

}

$(document).on('click', '.select-question', function () {
  // Remove 'active' class from all rows and reset button labels


  if ($(this).closest('tr').hasClass('active')) {
    clearSelectedQuestion();
  } else {
    $('tr.active').removeClass('active');          // Remove active class from all rows
    // Add 'active' to the clicked row and change its button label
    $(this).closest('tr').addClass('active');

    // Optional: get the question ID (if you have a data-id attribute)
    var questionId = $(this).data('id');
    activeQuestion = questions.find(question => question.id == questionId)
    $('.select-question').removeClass('selected');
    $(this).addClass('selected');
    loadTools();

  }
});


// Modern Submit Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Checkbox validation for proceed button
  const confirmCheckbox = document.getElementById('confirmCheckbox');
  const proceedBtn = document.getElementById('proceedBtn');
  
  if (confirmCheckbox && proceedBtn) {
    confirmCheckbox.addEventListener('change', function() {
      proceedBtn.disabled = !this.checked;
    });
  }
  
  // Populate modal data when shown
  const submitModal = document.getElementById('submitEntriesModal');
  if (submitModal) {
    submitModal.addEventListener('show.bs.modal', function() {
      populateSubmitModal();
    });
  }
  
  // Handle proceed button click
  if (proceedBtn) {
    proceedBtn.addEventListener('click', function() {
      if (confirmCheckbox && confirmCheckbox.checked) {
        submitAllEntries();
      }
    });
  }
  
  // Also handle jQuery modal events for compatibility
  if (typeof $ !== 'undefined') {
    $('#submitEntriesModal').on('show.bs.modal', function () {
      populateSubmitModal();
    });
    
    $('#confirmCheckbox').change(function() {
      if (proceedBtn) {
        proceedBtn.disabled = !$(this).is(':checked');
      }
    });
  }
});

// Function to populate submit modal with statistics
function populateSubmitModal() {
  // Get statistics data
  const totalQuestions = document.querySelector('.stat-value')?.textContent || '0';
  const totalMarks = document.querySelectorAll('.stat-value')[1]?.textContent || '0';
  const totalTime = document.getElementById('timerDisplay')?.textContent || '00:00:00';
  const totalSheets = document.querySelectorAll('.carousel-item').length || '0';
  
  // Update statistics table
  document.getElementById('modalTotalQuestions').textContent = totalQuestions;
  document.getElementById('modalTotalMarks').textContent = totalMarks;
  document.getElementById('modalTotalTime').textContent = totalTime;
  document.getElementById('modalTotalSheets').textContent = totalSheets;
  
  // Populate action details table
  populateActionTable();
}

// Modal creation removed - sheets are now handled by the sheets panel in the top navigation

// Handle Save button click
$('#dynamicModalSave').click(function () {
  const indexes = [];

  $('.mark-for-blank').each(function (index) {
    if ($(this).prop('checked')) {
      indexes.push(index);
      // goToSlide(index);
      // const intervalId = setInterval(() => {
      //   console.log(`Slide ${index} is waiting`);

      //   const $items = $('#sliderCarousel .carousel-inner .carousel-item');
      //   const $targetItem = $items.eq(index); // jQuery-safe way

      //   if ($targetItem.hasClass('active')) {
      //     clearInterval(intervalId); // ✅ stop interval
      //     console.log(`Slide ${index} is active — marking blank.`);
      //     $('button[data-name="mark_blank"]').click();
      //   }
      // }, 1);

    }

  });
  markAsBlank(indexes);

  loader();
});
const markAsBlank = (slides) => {
  if (!slides.length) {
    goToSlide(0);
    loader(0);

    return;
  }
  currentIndex = slides.shift();
  goToSlide(currentIndex);
  const intervalId = setInterval(() => {
    console.log(`Slide ${currentIndex} is waiting`);

    const $items = $('#sliderCarousel .carousel-inner .carousel-item');
    const $targetItem = $items.eq(currentIndex); // jQuery-safe way

    if ($targetItem.hasClass('active')) {
      clearInterval(intervalId); // ✅ stop interval
      console.log(`Slide ${currentIndex} is active — marking blank.`);
      $('button[data-name="mark_blank"]').click();
      markAsBlank(slides);
    }
  }, 1500);

};

/*
// Handle Save button click
$('#dynamicModalSave').click(function () {
  const results = [];

  $('.mark-for-blank').each(function (index) {
    if ($(this).prop('checked')) {

      goToSlide(index);
      const intervalId = setInterval(() => {
        console.log(`Slide ${index} is waiting`);

        const $items = $('#sliderCarousel .carousel-inner .carousel-item');
        const $targetItem = $items.eq(index); // jQuery-safe way

        if ($targetItem.hasClass('active')) {
          clearInterval(intervalId); // ✅ stop interval
          console.log(`Slide ${index} is active — marking blank.`);
          $('button[data-name="mark_blank"]').click();
        }
      }, 1);

    }
  });


  modal.hide();
});

*/

refreshData();
loader(0);

// Resizable Statistics Section Functionality
$(document).ready(function() {
  let isDragging = false;
  let startY = 0;
  let startHeight = 0;
  let currentHeight = 40; // Default collapsed height
  const minHeight = 40;
  const maxHeight = 120;
  
  // Initialize the resize functionality
  function initializeResizableStatistics() {
    const statisticsContainer = $('.statistics-container');
    const resizeHandle = $('.resize-handle');
    
    if (statisticsContainer.length === 0 || resizeHandle.length === 0) {
      return;
    }
    
    // Mouse down on resize handle
    resizeHandle.on('mousedown', function(e) {
      isDragging = true;
      startY = e.clientY;
      startHeight = statisticsContainer.outerHeight();
      
      // Add dragging state
      statisticsContainer.addClass('dragging');
      $('body').css('cursor', 'ns-resize');
      e.preventDefault();
    });
    
    // Mouse move on document
    $(document).on('mousemove', function(e) {
      if (!isDragging) return;
      
      const deltaY = startY - e.clientY;
      let newHeight = startHeight + deltaY;
      
      // Constrain height
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      // Apply new height
      statisticsContainer.css('height', newHeight + 'px');
      currentHeight = newHeight;
      
      // Update visual states
      updateStatisticsState(newHeight);
    });
    
    // Mouse up on document
    $(document).on('mouseup', function() {
      if (!isDragging) return;
      
      isDragging = false;
      statisticsContainer.removeClass('dragging');
      $('body').css('cursor', 'default');
      
      // Snap to nearest state (collapsed or expanded)
      const midPoint = (minHeight + maxHeight) / 2;
      if (currentHeight < midPoint) {
        // Snap to collapsed
        statisticsContainer.animate({
          height: minHeight + 'px'
        }, 200, function() {
          updateStatisticsState(minHeight);
        });
      } else {
        // Snap to expanded
        statisticsContainer.animate({
          height: maxHeight + 'px'
        }, 200, function() {
          updateStatisticsState(maxHeight);
        });
      }
    });
    
    // Touch support for mobile devices
    resizeHandle.on('touchstart', function(e) {
      const touch = e.originalEvent.touches[0];
      isDragging = true;
      startY = touch.clientY;
      startHeight = statisticsContainer.outerHeight();
      
      statisticsContainer.addClass('dragging');
      e.preventDefault();
    });
    
    $(document).on('touchmove', function(e) {
      if (!isDragging) return;
      
      const touch = e.originalEvent.touches[0];
      const deltaY = startY - touch.clientY;
      let newHeight = startHeight + deltaY;
      
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      statisticsContainer.css('height', newHeight + 'px');
      currentHeight = newHeight;
      
      updateStatisticsState(newHeight);
      e.preventDefault();
    });
    
    $(document).on('touchend', function() {
      if (!isDragging) return;
      
      isDragging = false;
      statisticsContainer.removeClass('dragging');
      
      const midPoint = (minHeight + maxHeight) / 2;
      if (currentHeight < midPoint) {
        statisticsContainer.animate({
          height: minHeight + 'px'
        }, 200, function() {
          updateStatisticsState(minHeight);
        });
      } else {
        statisticsContainer.animate({
          height: maxHeight + 'px'
        }, 200, function() {
          updateStatisticsState(maxHeight);
        });
      }
    });
    
    // Double-click to toggle
    resizeHandle.on('dblclick', function() {
      if (statisticsContainer.hasClass('expanded')) {
        // Collapse
        statisticsContainer.removeClass('expanded').addClass('collapsed');
        statisticsContainer.animate({
          height: minHeight + 'px'
        }, 300);
      } else {
        // Expand
        statisticsContainer.removeClass('collapsed').addClass('expanded');
        statisticsContainer.animate({
          height: maxHeight + 'px'
        }, 300);
      }
    });
  }
  
  // Update visual state based on height
  function updateStatisticsState(height) {
    const statisticsContainer = $('.statistics-container');
    const threshold = (minHeight + maxHeight) / 2;
    
    if (height < threshold) {
      statisticsContainer.removeClass('expanded').addClass('collapsed');
    } else {
      statisticsContainer.removeClass('collapsed').addClass('expanded');
    }
  }
  
  // Initialize on page load and after refreshData
  initializeResizableStatistics();
  
  // Re-initialize after data refresh
  let originalRefreshData = refreshData;
  refreshData = function() {
    originalRefreshData();
    setTimeout(initializeResizableStatistics, 100);
  };
});





$(function () {

  // Check if browser supports cookies
  if (navigator.cookieEnabled) {
    // Simple mobile detection
    var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var cookies = document.cookie;
    // If it's mobile and cookie not yet set
    if (isMobile && cookies.indexOf("mode=mobile") === -1) {
      // Set cookie for 7 days
      document.cookie = "mode=mobile; path=/; max-age=" + (7 * 24 * 60 * 60);

      // Reload only once
      sessionStorage.setItem("reloaded", "true");
      // location.reload();
    }
    // Prevent infinite reloads
    else if (sessionStorage.getItem("reloaded")) {
      // sessionStorage.removeItem("reloaded");
    }
  }
});

// Navigation Observer System
class NavigationObserver {
  constructor() {
    this.currentPage = -1;
    this.observers = [];
    this.init();
  }

  init() {
    // Monitor carousel navigation events
    this.observeCarouselEvents();
    this.observeDirectNavigation();
  }

  observeCarouselEvents() {
    // Bootstrap carousel slide events
    myCarousel.addEventListener('slid.bs.carousel', (event) => {
      this.onPageChange(event.to);
    });
  }

  observeDirectNavigation() {
    // Page selection dropdown
    $('#pageSelect').on('change', (e) => {
      const selectedPage = parseInt($(e.target).val());
      if (!isNaN(selectedPage)) {
        this.onPageChange(selectedPage);
      }
    });
  }

  onPageChange(newPage) {
    // Update current page tracking
    this.currentPage = newPage;
    
    // Update UI elements
    this.updatePageIndicators(newPage);
    
    // Notify observers
    this.notifyObservers(newPage);
  }

  updatePageIndicators(pageIndex) {
    // Update page selector dropdown
    $('#pageSelect').val(pageIndex);
  }

  getCurrentPage() {
    return $('.carousel-item.active').index();
  }

  getTotalPages() {
    return $('.carousel-item').length;
  }

  notifyObservers(pageIndex) {
    this.observers.forEach(callback => callback(pageIndex));
  }

  subscribe(callback) {
    this.observers.push(callback);
  }
}

// Initialize Navigation Observer
const navObserver = new NavigationObserver();

// Mark Blank Helper Functions
function performMarkBlank(activeIndex, tool) {
  let canvas = canvasArray[activeIndex];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const crossSize = 50;

  // Draw first diagonal (\)
  ctx.beginPath();
  ctx.moveTo(centerX - crossSize, centerY - crossSize);
  ctx.lineTo(centerX + crossSize, centerY + crossSize);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Draw second diagonal (/)
  ctx.beginPath();
  ctx.moveTo(centerX + crossSize, centerY - crossSize);
  ctx.lineTo(centerX - crossSize, centerY + crossSize);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.stroke();

  paperSheet.pushData(activeIndex, null, null, tool, canvas.toDataURL('image/png'));
  
  // ROW COLORING: Update row color AFTER the tool action is completed
  if (activeQuestion && activeQuestion.id) {
    updateRowColor(activeQuestion.id, tool);
  }
}

  




function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ============================================================================
// ADD MARKS TOOL: Clean Non-Blocking Validation
// ============================================================================
$(document).ready(function() {
  console.log('[AddMarks Debug] Initializing Clean Add Marks listener...');
  
  // Force Event Attachment - Global delegated event listener
  $(document).on('mousedown', '#sliderCarousel canvas', function(e) {
    console.log('[AddMarks Debug] Canvas mousedown detected');
    
    // The Validation Flow (Using Global Bridge)
    if (window.GLOBAL_ACTIVE_TOOL === 'add-marks') {
      console.log('[AddMarks Debug] Add Marks tool detected - running background validation...');
      
      // Ensure ContentValidator is available
      if (window.contentValidator) {
        // Step 1: Page Check
        console.log('[AddMarks Debug] Running Step 1: Page Check...');
        const pageAnalysis = window.contentValidator.analyzePageContent();
        
        if (pageAnalysis.density < 0.0015) { // 0.15% threshold
          console.log('[AddMarks Debug] Page is BLANK (density < 0.15%)');
          
          // Use ContentValidator method for consistent styling
          if (window.contentValidator) {
            window.contentValidator.showBlankPageWarning();
          }
          
          // Action: Stop further validation checks, but Allow the mark to be placed
          console.log('[AddMarks Debug] Validation complete - allowing mark placement');
          
        } else {
          console.log('[AddMarks Debug] Page has content (density:', (pageAnalysis.density * 100).toFixed(3) + '%), proceeding to Step 2');
          
          // Step 2: Cursor Spot Check
          console.log('[AddMarks Debug] Running Step 2: Cursor Spot Check...');
          
          // Get stamp dimensions (if available)
          let stampWidth = null;
          let stampHeight = null;
          
          if (window.stampDimensions) {
            stampWidth = window.stampDimensions.width;
            stampHeight = window.stampDimensions.height;
          }
          
          const regionAnalysis = window.contentValidator.analyzeCursorRegion(e.clientX, e.clientY, stampWidth, stampHeight);
          
          if (regionAnalysis.density < 0.03) { // 3.0% threshold
            console.log('[AddMarks Debug] Cursor spot is BLANK (density < 3.0%)');
            
            // Use ContentValidator method for consistent styling
            if (window.contentValidator) {
              window.contentValidator.showBlankAreaInfo();
            }
            
          } else {
            console.log('[AddMarks Debug] Cursor spot has content (density:', (regionAnalysis.density * 100).toFixed(3) + '%)');
          }
        }
        
      } else {
        console.warn('[AddMarks Debug] ContentValidator not available!');
      }
      
      // Crucial: Continue execution - allow existing drawing logic to place the mark
      console.log('[AddMarks Debug] Validation complete - continuing to mark placement...');
    }
  });
  
  console.log('[AddMarks Debug] Clean Add Marks listener attached successfully');
});

// Modern Submit Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Checkbox validation for proceed button
  const confirmCheckbox = document.getElementById('confirmCheckbox');
  const proceedBtn = document.getElementById('proceedBtn');
  
  if (confirmCheckbox && proceedBtn) {
    confirmCheckbox.addEventListener('change', function() {
      proceedBtn.disabled = !this.checked;
    });
  }
  
  // Populate modal data when shown
  const submitModal = document.getElementById('submitEntriesModal');
  if (submitModal) {
    submitModal.addEventListener('show.bs.modal', function() {
      populateSubmitModal();
    });
  }
  
  // Handle proceed button click
  if (proceedBtn) {
    proceedBtn.addEventListener('click', function() {
      if (confirmCheckbox && confirmCheckbox.checked) {
        submitAllEntries();
      }
    });
  }
});

// Function to populate submit modal with statistics
function populateSubmitModal() {
  // Get statistics data
  const totalQuestions = document.querySelector('.stat-value')?.textContent || '0';
  const totalMarks = document.querySelectorAll('.stat-value')[1]?.textContent || '0';
  const totalTime = document.getElementById('timerDisplay')?.textContent || '00:00:00';
  const totalSheets = document.querySelectorAll('.carousel-item').length || '0';
  
  // Update statistics table
  document.getElementById('modalTotalQuestions').textContent = totalQuestions;
  document.getElementById('modalTotalMarks').textContent = totalMarks;
  document.getElementById('modalTotalTime').textContent = totalTime;
  document.getElementById('modalTotalSheets').textContent = totalSheets;
  
  // Fetch data directly from sheet-questions-table
  populateModalFromSheetTable();
}

// Function to populate modal table from sheet-questions-table
function populateModalFromSheetTable() {
  const modalTableBody = document.getElementById('modalQuestionsTableBody');
  const sheetTableBody = document.querySelector('#sheet-questions-table tbody');
  
  if (!modalTableBody || !sheetTableBody) return;
  
  // Clear existing content
  modalTableBody.innerHTML = '';
  
  // Get all rows from sheet-questions-table
  const sheetRows = sheetTableBody.querySelectorAll('tr');
  
  sheetRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      // Get exact same data as sheet-questions-table
      const page = cells[0].textContent.trim();
      const questionNo = cells[1].textContent.trim();
      const tool = cells[2].innerHTML.trim(); // Get HTML content for tools
      const marksText = cells[3].textContent.trim();
      
      // Create identical row in modal
      const modalRow = document.createElement('tr');
      modalRow.innerHTML = `
        <td>${page}</td>
        <td>${questionNo}</td>
        <td>${tool}</td>
        <td>${marksText}</td>
      `;
      
      modalTableBody.appendChild(modalRow);
    }
  });
  
  // If no data, show message
  if (modalTableBody.children.length === 0) {
    modalTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">No data available</td>
      </tr>
    `;
  }
}

// Real-time connection to sheet-questions-table
document.addEventListener('DOMContentLoaded', function() {
  // Monitor changes to sheet-questions-table
  const sheetTable = document.getElementById('sheet-questions-table');
  if (sheetTable) {
    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver(function(mutations) {
      // Check if modal is currently shown
      const modal = document.getElementById('submitEntriesModal');
      if (modal && modal.classList.contains('show')) {
        // Update modal data when sheet table changes
        populateModalFromSheetTable();
      }
    });
    
    // Start observing the sheet table body for changes
    const sheetTableBody = sheetTable.querySelector('tbody');
    if (sheetTableBody) {
      observer.observe(sheetTableBody, {
        childList: true,    // Watch for added/removed rows
        subtree: true,      // Watch for changes in child elements
        characterData: true, // Watch for text changes
        attributes: true    // Watch for attribute changes
      });
    }
  }
});

// Modal creation removed - sheets are now handled by the sheets panel in the top navigation

// Function to submit all entries
function submitAllEntries() {
  // Show loading state
  const proceedBtn = document.getElementById('proceedBtn');
  const originalText = proceedBtn.innerHTML;
  proceedBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Submitting...';
  proceedBtn.disabled = true;
  
  // Simulate submission process
  setTimeout(function() {
    // Close modal
    const submitModal = bootstrap.Modal.getInstance(document.getElementById('submitEntriesModal'));
    if (submitModal) {
      submitModal.hide();
    }
    
    // Show completion message and logout
    Swal.fire({
      icon: 'success',
      title: 'Procedure Completed',
      text: 'Thank you your all actions is blocked you have completed the procedure',
      confirmButtonColor: '#28a745',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to Django logout
        window.location.href = '/users/logout/';
      }
    });
    
    // Reset button state
    proceedBtn.innerHTML = originalText;
    proceedBtn.disabled = false;
    
    // Reset checkbox
    const confirmCheckbox = document.getElementById('confirmCheckbox');
    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
    }
    
  }, 2000);
}
