// Global variable declarations
var currentMagnifier = null;
let myCarousel;
let carousel;
let canvasArray = [];
const canvasHistory = [];

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
    key = 'Page ' + (parseInt(key) + 1);
    if (!this.sheets[key]) {
      this.sheets[key] = []; // create array if not exists
    }

    const newItem = { question_id, marks, tool, image };
    this.sheets[key].push(newItem);

    // console.log(`✅ Pushed item to ${key}`, newItem);

    addBadgeToButton($('[data-name="undo_tool"]')[0], this.sheets[key].length);
    refreshData();

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
  console.log('DOM Content Loaded - Starting initialization');
  
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize carousel after DOM is ready
  console.log('Looking for carousel element #sliderCarousel');
  myCarousel = document.querySelector('#sliderCarousel');
  console.log('Carousel element found:', !!myCarousel);
  console.log('Carousel items found:', $('.carousel-item').length);
  
  if (myCarousel && $('.carousel-item').length > 0) {
    try {
      console.log('Initializing Bootstrap carousel');
      carousel = new bootstrap.Carousel(myCarousel, {
        interval: false,  // Prevent automatic sliding
        ride: false,      // Prevent automatic riding
        touch: false,     // Prevent touch/swipe sliding
        keyboard: false,  // Prevent keyboard navigation
        pause: true,      // Start paused
        wrap: false       // Prevent wrapping
      });
      canvasArray = $('.carousel-item').map((index, item) => $(item).find('canvas').get(0));
      console.log('Carousel initialized successfully');
      console.log('Canvas array length:', canvasArray.length);
      
      // Update carousel canvas for first item
      updateCarouselCanvas($('.carousel-item').first());
    } catch (error) {
      console.error('Error initializing carousel:', error);
      carousel = null;
    }
  } else {
    console.warn('No carousel items found, skipping carousel initialization');
    console.warn('myCarousel exists:', !!myCarousel);
    console.warn('carousel-item count:', $('.carousel-item').length);
  }
  
  // Add carousel event listener after initialization
  if (myCarousel) {
    console.log('Adding carousel event listener');
    myCarousel.addEventListener('slid.bs.carousel', function (event) {
      console.log('Carousel slide event triggered, slide:', event.to);
      $('#pageSelect').val(event.to);
      updateCarouselCanvas($(this).find('.carousel-item').eq(event.to));
      addBadgeToButton($('[data-name="undo_tool"]')[0], paperSheet.getSheet(event.to).length);
      // Navigation Observer handles the detection automatically
    });
  } else {
    console.warn('Carousel element #sliderCarousel not found - slide event listener not attached');
  }
  
  // Initialize other components
  initializeComponents();
});

// Define tools object globally
let tools;

function initializeComponents() {
  let seconds = 0;
  const timeDisplay = document.getElementById('timeTaken');

  function formatTime(s) {
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  // Only start timer if timeDisplay element exists
  if (timeDisplay) {
    setInterval(() => {
      seconds++;
      timeDisplay.textContent = formatTime(seconds);
    }, 1000);
  } else {
    console.warn('Time display element not found, timer not started');
  }

  // Initialize tools object
  tools = {
    'add-marks': { name: 'add-marks', icon: 'bi-plus-circle', label: 'Add Marks', tooltip: 'Add marks to this section' },
    'mark-correct': { name: 'mark-correct', icon: 'bi-check2-circle', label: 'Mark Correct', tooltip: 'Mark answer as correct' },
    'mark-incorrect': { name: 'mark-incorrect', icon: 'bi-x-circle', label: 'Mark Incorrect', tooltip: 'Mark answer as incorrect' },
    'pencil-tool': { name: 'pencil-tool', icon: 'bi-pencil', label: 'Pencil Tool', tooltip: 'Freehand drawing tool' },
    'text-tool': { name: 'text-tool', icon: 'bi-type', label: 'Text Tool', tooltip: 'Insert typed text' },
    'draw-line': { name: 'draw-line', icon: 'bi-dash-lg', label: 'Draw Line', tooltip: 'Draw a straight line' },
    'draw-box': { name: 'draw-box', icon: 'bi-square', label: 'Draw Box', tooltip: 'Draw a rectangle/box' }
  };

  // Initialize tool buttons
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

  // Initialize tool button handlers
  $('.btn-tool').click(function (e) {
    selectedTool($(this).data('name'));
  });

  // Sheets panel toggle functionality
  $('#sheetsToggleBtn').click(function() {
    const modal = new bootstrap.Modal(document.getElementById('sheetsModal'));
    loadSheetsGrid();
    modal.show();
    
    // Update total sheets count
    $('#totalSheetsCount').text($('.carousel-item').length);
  });

  // Load sheets grid function
  function loadSheetsGrid() {
    const sheetsGrid = $('#sheetsGrid');
    
    let gridHtml = '<div class="container-fluid p-3"><div class="row g-3">';
    
    // Get all carousel items and create thumbnails
    $('.carousel-item').each(function(index) {
      const img = $(this).find('img').first();
      const imgSrc = img.attr('src');
      const pageNumber = index + 1;
      
      gridHtml += `
        <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6">
          <div class="sheet-card" data-page="${pageNumber}" data-index="${index}">
            <div class="sheet-thumbnail-wrapper">
              <img draggable="false" src="${imgSrc}" alt="Page ${pageNumber}" class="sheet-image" loading="lazy">
              <div class="sheet-overlay">
                <div class="sheet-number">${pageNumber}</div>
                <div class="sheet-actions">
                  <button class="btn btn-sm btn-light btn-view-fullscreen" onclick="openFullscreenViewer(${index})" title="View Full Screen">
                    <i class="bi bi-fullscreen"></i>
                  </button>
                  <button class="btn btn-sm btn-primary btn-go-to-page" onclick="goToSlide(${index}); bootstrap.Modal.getInstance(document.getElementById('sheetsModal')).hide();" title="Go to Page">
                    <i class="bi bi-arrow-right-circle"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="sheet-controls">
              <div class="form-check">
                <input class="form-check-input mark-for-blank" type="checkbox" data-index="${index}" id="sheet-${index}">
                <label class="form-check-label" for="sheet-${index}">
                  <i class="bi bi-square"></i> Mark Blank
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    gridHtml += '</div></div>';
    sheetsGrid.html(gridHtml);
    
    // Add hover effects and interactions
    $('.sheet-card').hover(
      function() {
        $(this).addClass('sheet-card-hover');
      },
      function() {
        $(this).removeClass('sheet-card-hover');
      }
    );
    
    // Add click handler for image to open fullscreen
    $('.sheet-image').click(function() {
      const index = $(this).closest('.sheet-card').data('index');
      openFullscreenViewer(index);
    });
    
    console.log('Sheets grid loaded with', $('.carousel-item').length, 'sheets');
  }

  // Full-screen viewer functionality
  let currentFullscreenIndex = 0;
  let fullscreenImages = [];

  function openFullscreenViewer(startIndex = 0) {
    currentFullscreenIndex = startIndex;
    fullscreenImages = [];
    
    // Collect all images from carousel
    $('.carousel-item').each(function(index) {
      const img = $(this).find('img').first();
      fullscreenImages.push({
        src: img.attr('src'),
        page: index + 1
      });
    });
    
    updateFullscreenImage();
    loadThumbnailStrip();
    
    // Show fullscreen modal
    const modal = new bootstrap.Modal(document.getElementById('fullscreenViewer'));
    modal.show();
    
    // Hide sheets modal if it's open
    const sheetsModal = bootstrap.Modal.getInstance(document.getElementById('sheetsModal'));
    if (sheetsModal) {
      sheetsModal.hide();
    }
  }

  function updateFullscreenImage() {
    const imageData = fullscreenImages[currentFullscreenIndex];
    if (imageData) {
      $('#fullscreenImage').attr('src', imageData.src);
      $('#currentPageNumber').text(imageData.page);
      $('#totalPages').text(fullscreenImages.length);
      
      // Update thumbnail selection
      $('.thumbnail-item').removeClass('active');
      $(`.thumbnail-item[data-index="${currentFullscreenIndex}"]`).addClass('active');
      
      // Update navigation buttons
      $('#prevPageBtn').prop('disabled', currentFullscreenIndex === 0);
      $('#nextPageBtn').prop('disabled', currentFullscreenIndex === fullscreenImages.length - 1);
    }
  }

  function loadThumbnailStrip() {
    const thumbnailStrip = $('#thumbnailStrip');
    let thumbnailsHtml = '';
    
    fullscreenImages.forEach((image, index) => {
      thumbnailsHtml += `
        <div class="thumbnail-item ${index === currentFullscreenIndex ? 'active' : ''}" 
             data-index="${index}" 
             onclick="goToFullscreenPage(${index})">
          <img src="${image.src}" alt="Page ${image.page}" class="thumbnail-image">
          <div class="thumbnail-number">${image.page}</div>
        </div>
      `;
    });
    
    thumbnailStrip.html(thumbnailsHtml);
  }

  function goToFullscreenPage(index) {
    currentFullscreenIndex = index;
    updateFullscreenImage();
    
    // Scroll thumbnail into view
    const activeThumbnail = $(`.thumbnail-item[data-index="${index}"]`);
    if (activeThumbnail.length) {
      activeThumbnail[0].scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }

  // Full-screen viewer event handlers
  $(document).ready(function() {
    // Previous page button
    $('#prevPageBtn').click(function() {
      if (currentFullscreenIndex > 0) {
        goToFullscreenPage(currentFullscreenIndex - 1);
      }
    });
    
    // Next page button
    $('#nextPageBtn').click(function() {
      if (currentFullscreenIndex < fullscreenImages.length - 1) {
        goToFullscreenPage(currentFullscreenIndex + 1);
      }
    });
    
    // Keyboard navigation
    $(document).on('keydown', function(e) {
      if ($('#fullscreenViewer').hasClass('show')) {
        if (e.key === 'ArrowLeft' && currentFullscreenIndex > 0) {
          goToFullscreenPage(currentFullscreenIndex - 1);
        } else if (e.key === 'ArrowRight' && currentFullscreenIndex < fullscreenImages.length - 1) {
          goToFullscreenPage(currentFullscreenIndex + 1);
        } else if (e.key === 'Escape') {
          bootstrap.Modal.getInstance(document.getElementById('fullscreenViewer')).hide();
        }
      }
    });
    
    // Fullscreen button in sheets modal
    $('#fullscreenBtn').click(function() {
      openFullscreenViewer(0);
    });
    
    // Toggle view button (placeholder for future functionality)
    $('#toggleViewBtn').click(function() {
      // This could toggle between grid view and list view
      console.log('Toggle view clicked');
    });
  });


// Phase 7: Undo State Sync - syncUndoStateForQuestion Function
function syncUndoStateForQuestion(questionId, activeIndex) {
  // Get all objects from paperSheet.getSheet(activeIndex)
  const allObjects = paperSheet.getSheet(activeIndex);
  
  // Filter specifically for item.question_id === questionId
  const filteredObjects = allObjects.filter(item => item.question_id === questionId);
  const objectCount = filteredObjects.length;
  
  console.log(`Phase 7: Undo sync for Question ${questionId}: ${objectCount} objects remaining`);
  
  // Count Check Logic
  if (objectCount === 0) {
    // If Count == 0: Remove .row-green, .row-red, .row-orange and delete the state from window.questionRowState
    const questionRows = document.querySelectorAll('#questions-table tbody tr');
    let targetRow = null;
    
    questionRows.forEach((row) => {
      const selectButton = row.querySelector('.select-question');
      if (selectButton && selectButton.getAttribute('data-id') === questionId.toString()) {
        targetRow = row;
      }
    });
    
    if (targetRow) {
      // Remove all color classes
      targetRow.classList.remove('row-green', 'row-red', 'row-orange');
      
      // Delete the state from window.questionRowState
      delete window.questionRowState[questionId];
      delete window.rowVisualState[questionId];
      
      console.log(`Phase 7: Question ${questionId} empty, state reset.`);
    }
  } else if (objectCount > 0) {
    // If Count > 0: Call recalculateColorForQuestion (Phase 8 logic) to decide which color should stay
    recalculateColorForQuestion(questionId, filteredObjects);
  }
}

// Phase 8: Color Recalculation Function with Green Lock Priority
function recalculateColorForQuestion(questionId, remainingObjects) {
  // Find the question row
  const questionRows = document.querySelectorAll('#questions-table tbody tr');
  let targetRow = null;
  
  questionRows.forEach((row) => {
    const selectButton = row.querySelector('.select-question');
    if (selectButton && selectButton.getAttribute('data-id') === questionId.toString()) {
      targetRow = row;
    }
  });
  
  if (!targetRow) {
    console.warn(`Phase 8: Row not found for questionId: ${questionId}`);
    return;
  }
  
  // Extract tool names from remaining objects
  const toolNames = remainingObjects.map(obj => obj.tool);
  
  // Determine color based on remaining tools with Green Lock priority
  let newColorClass = null;
  
  // Check for add-marks first (Green Lock - highest priority)
  if (toolNames.includes('add-marks')) {
    newColorClass = 'row-green';
  }
  // Check for mark-incorrect second
  else if (toolNames.includes('mark-incorrect')) {
    newColorClass = 'row-red';
  }
  // Check for mark-correct last (can be overridden by add-marks)
  else if (toolNames.includes('mark-correct')) {
    newColorClass = 'row-orange';
  }
  
  // Apply the new color if determined
  if (newColorClass) {
    // Remove existing color classes
    targetRow.classList.remove('row-green', 'row-red', 'row-orange');
    
    // Apply new color class
    targetRow.classList.add(newColorClass);
    
    // Update the state storage
    window.questionRowState[questionId] = newColorClass;
    
    console.log(`Phase 8: Color recalculated for Question ${questionId}: ${newColorClass}`);
  }
}

const activeCanvasMouseDownEvent = (e) => {
  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  
  if (!canvas) {
    console.warn('Canvas not found at index:', activeIndex);
    return;
  }
  
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

      // Set flag for drawing completion - triggers updateRowColor via canvas listener
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

    // Set flag for drawing completion - triggers updateRowColor via canvas listener
    canvas.dataset.drawingComplete = 'true';

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

    // Set flag for drawing completion - triggers updateRowColor via canvas listener
    canvas.dataset.drawingComplete = 'true';

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
    // ✅ Draw question label
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(questionLabel, startX, startY - 10);

    // ✅ Draw marks beside the question label
    const offsetX = startX + 70;  // right of text
    const offsetY = startY - 10;  // vertically aligned

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "red"; // use red if you prefer for positive marks
    ctx.fillText(marksText, offsetX, offsetY);

    // Optionally, draw a small underline for emphasis
    const textWidth = ctx.measureText(marksText).width;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + 5);
    ctx.lineTo(offsetX + textWidth, offsetY + 5);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    // saveState();
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));

    // Set flag for drawing completion - triggers updateRowColor via canvas listener
    canvas.dataset.drawingComplete = 'true';

    clearSelectedQuestion();
  }

  else {
    drawing = true;
  }
}

const activeCanvasMouseMoveEvent = (e) => {
  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  
  if (!canvas) {
    return;
  }
  
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
  
  if (!canvas) {
    return;
  }
  
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

  } else if (activeTool === 'draw-box') {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));

  }
  else if (activeTool === 'pencil-tool') {
    paperSheet.pushData(activeIndex, activeQuestion.id, marksOrText, activeTool, canvas.toDataURL('image/png'));
  }
  
  // Set flag for drawing completion - triggers updateRowColor via canvas listener
  // This flag must only be set after the data is successfully pushed to paperSheet
  canvas.dataset.drawingComplete = 'true';
  
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

  toolHtml += `
    <label class="tool-box border rounded p-2 text-center ${isDisabledStyle}" 
           style="width: 100px; cursor: pointer;" ${tooltipAttr} data-value="${tool.name}">
      <input type="radio" name="toolOption" id="${id}" value="${tool.name}" class="d-none" ${isDisabled}>
      <i class="bi ${tool.icon} fs-4 d-block mb-1"></i>
      <small>${tool.label}</small>
    </label>
  `;
};

toolHtml += `</div>`;




// });


// Variables are now declared at the top of the file


function goToSlide(index) {
  if (!carousel) {
    console.warn('Carousel not initialized, cannot navigate');
    return;
  }
  
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
// Carousel event listener is now handled in DOM ready event above


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

// Update carousel canvas will be handled in DOM ready event

// Initialize history array (one stack per carousel item)
var activeCanvas = null;
var activeQuestion = null;
let startX = 0,
  drawing = 0,
  marksOrText = null,
  startY = 0,
  activeTool = null;
const clearSelectedQuestion = () => {
  $('tr.active').removeClass('active');
  $('.select-question').addClass('btn-outline-success').removeClass('btn-success').empty().html('<i class="bi bi-check-circle"></i>');

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
  if (cursor.length === 0) return; // Skip if cursor element doesn't exist
  
  if (tools[tool]) {
    cursor.removeClass().addClass(tools[tool].icon);
    cursor.css('display', 'block');
  } else {
    cursor.css('display', 'none');
  }
}

function hideCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    cursor.style.display = 'none';
  }
}

// Move cursor with mouse
document.addEventListener('mousemove', (e) => {
  const cursor = document.getElementById('custom-cursor');
  const activeItem = document.querySelector('.carousel-item.active');
  
  if (!cursor) return; // Skip if cursor element doesn't exist
  
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
  }
});


const selectedTool = (tool, text = null) => {



  marksOrText = text;


  let activeIndex = $('.carousel-item').index($('.carousel-item.active'));
  let canvas = canvasArray[activeIndex];
  
  if (!canvas) {
    console.warn('Canvas not found at index:', activeIndex);
    return;
  }
  
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

      break;

    // ✅ "Mark Blank" tool (draws cross in center)
    case 'mark_blank':
      if (paperSheet.getSheet(activeIndex)?.some(item => item.tool === "mark_blank")) {
        markedToolPopup();
        return;
      }
      
      // Check with AI service before marking as blank
      checkWithAIBeforeMarkBlank(activeIndex, () => {
        // User confirmed - proceed with marking blank
        performMarkBlank(activeIndex, tool);
      });
      break;

    // ✅ "Undo" tool
    case 'undo_tool':
      let lastObject = paperSheet.popData(activeIndex);
      let questionIdToCheck = lastObject?.question_id;

      // Create image only if there's a Base64 image
      if (lastObject?.image) {
        const img = new Image();
        img.src = lastObject.image;

        img.onload = () => {
          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // After restoring canvas, check and sync row state
          if (questionIdToCheck) {
            syncUndoStateForQuestion(questionIdToCheck, activeIndex);
          }
        };
      } else {
        // If no image, just clear canvas (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // After clearing canvas, check and sync row state
        if (questionIdToCheck) {
          syncUndoStateForQuestion(questionIdToCheck, activeIndex);
        }
      }

      break;
    // ✅ "Add Marks" tool
    case 'add-marks':
    case 'mark-correct':
    case 'mark-incorrect':
    case 'pencil-tool':
    case 'text-tool':
    case 'draw-line':
    case 'draw-box':



      activeCanvas = canvasArray[activeIndex];
      if (!activeCanvas) {
        console.warn('Canvas not found at index:', activeIndex);
        break;
      }
      activeTool = tool;
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
  const display = isDisabled ? 'flex' : 'none';
  console.log(`Loader called: isDisabled=${isDisabled}, display=${display}`);
  return $('#loader-main').css('display', display);
};





// Parse JSON data with error handling to prevent crashes
let questions = [];
let questionStatus = {};
let paperSheets = [];

try {
  const questionsEl = document.getElementById('questionsData');
  if (questionsEl && questionsEl.innerHTML) {
    questions = JSON.parse(questionsEl.innerHTML);
  }
} catch (e) {
  console.error('Error parsing questions data:', e);
}

try {
  const statusEl = document.getElementById('statusData');
  if (statusEl && statusEl.innerHTML) {
    questionStatus = JSON.parse(statusEl.innerHTML);
  }
} catch (e) {
  console.error('Error parsing status data:', e);
}

try {
  const imagesEl = document.getElementById('imagesData');
  if (imagesEl && imagesEl.innerHTML) {
    paperSheets = JSON.parse(imagesEl.innerHTML);
  }
} catch (e) {
  console.error('Error parsing images data:', e);
}

// Loader will be handled by the main loading mechanism below

const paperSheetMarks = {};
function getNextStatus(currentStatus) {
  if (!questionStatus || Object.keys(questionStatus).length === 0) {
    return null;
  }
  const keys = Object.keys(questionStatus); // ["NM", "A", "OA", "NA"]
  const index = keys.indexOf(currentStatus);

  if (index === -1) return null; // current status not found
  const nextIndex = (index + 1) % keys.length; // wraps around to first
  return questionStatus[keys[nextIndex]];
}
const QuestionIdAndQuestionNo = questions && questions.length ? 
  Object.fromEntries(questions.map(item => [item.id, item.question_no])) : {};
const toolTable = tools;
toolTable['seen'] = { name: 'seen', label: 'Seen' };
toolTable['mark_blank'] = { name: 'mark_blank', label: 'Mark Blank' };
const refreshData = () => {
  try {
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
    if (question.status !== 'NM' && question.obtained !== 0) totals.Correct++;
    if (question.status !== 'NM' && question.obtained === 0) totals.Wrong++;

    totals.TotalMarks += parseFloat(question.obtained) || 0;

    // Build question row
    const statusData = questionStatus[question.status] || { class: '', title: 'Unknown' };
    tbody += `
    <tr>
      <td>${question.question_no}</td>
      <td>${question.question}</td>
      <td>${question.obtained} / ${question.marks}</td>
      <td class="text-center">
        <span class="badge ${statusData.class} question-status-badge"
              data-status="${question.status}"
              data-bs-toggle="tooltip"
              data-bs-html="true"
              title="<span style='white-space:nowrap;'>Status: ${statusData.title}</span><br>Click to Change">
          ${question.status}
        </span>
        <button class="btn btn-xs btn-default update-status" 
                data-question-id="${question.id}"
                data-bs-toggle="tooltip" 
                title="Update Status">
          <i class="bi bi-arrow-repeat"></i>
        </button>
      </td>
      <td>
        <button class="btn btn-xs btn-outline-success w-100 select-question" 
                data-id="${question.id}">
          <i class="bi bi-check-circle"></i>
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
    <td colspan="5" class="text-end fw-bold statistics-container">
      <div class="resize-handle" title="Drag to expand/collapse statistics">
        <i class="bi bi-grip-horizontal"></i>
      </div>
      <div class="statistics-content">
        <span data-bs-toggle="tooltip" title="Total number of questions assigned">TQ: ${f.TQ}</span> |
        <span class="badge ${questionStatus.NM.class}" data-bs-toggle="tooltip" title="Untouched questions">NM: ${f.NM}</span> |
        <span class="badge ${questionStatus.A.class}" data-bs-toggle="tooltip" title="Attempted questions">A: ${f.A}</span> |
        <span class="badge ${questionStatus.OA.class}" data-bs-toggle="tooltip" title="Over attempted questions">OA: ${f.OA}</span> |
        <span class="badge ${questionStatus.NA.class}" data-bs-toggle="tooltip" title="Not attempted questions">NA: ${f.NA}</span> |
        <span data-bs-toggle="tooltip" title="Marked for review">Marked: ${f.Marked}</span> |
        <span data-bs-toggle="tooltip" title="Correct answers">Correct: ${f.Correct}</span> |
        <span data-bs-toggle="tooltip" title="Incorrect answers">Wrong: ${f.Wrong}</span> |
        <span data-bs-toggle="tooltip" title="Total marks obtained">Total Marks: ${f.TotalMarks}</span>
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

  } catch (error) {
    console.error('Error in refreshData:', error);
  }
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
    $('.select-question').addClass('btn-outline-success').removeClass('btn-success').empty().html('<i class="bi bi-check-circle"></i>');
    $(this).addClass('btn-success').removeClass('btn-outline-success').empty().html('<i class="bi bi-check-circle-fill"></i>');
    
    // Remove focus from the button to prevent persistent outline
    $(this).blur();
    
    loadTools();

  }
});


$(document).on('click', '.update-status', function () {
  let questionId = $(this).data('question-id');
  activeQuestion = questions.find(question => question.id == questionId)

  activeQuestion.status = getNextStatus(activeQuestion.status).key;
  refreshData();
});

// Simple submit modal handler with table population and validation
$(document).ready(function() {
  // Populate entries table and validate when modal opens
  $('#submitEntriesModal').on('show.bs.modal', function () {
    populateEntriesTable();
    validateSubmitButton();
  });
  
  // Handle checkbox change
  $('#confirmCheckbox').change(function() {
    validateSubmitButton();
  });
  
  // Submit button handler with validation popup
  $('#submitLockBtn').click(function() {
    console.log('Submit button clicked!');
    alert('Submit button clicked!');
    
    // Validate before submission
    if (!validateAllQuestionsProcessed()) {
      const unattempted = window.unattemptedQuestions || [];
      let message = 'You not attempt all question please check and then submit\n\n';
      message += 'Unattempted Questions:\n';
      
      unattempted.forEach(q => {
        message += `Page ${q.page} - Question ${q.questionNo}\n`;
      });
      
      Swal.fire({
        icon: 'warning',
        title: 'Validation Required',
        text: message,
        confirmButtonText: 'OK',
        width: '500px'
      });
      return;
    }
    
    // Check if checkbox is confirmed
    if (!$('#confirmCheckbox').is(':checked')) {
      Swal.fire({
        icon: 'warning',
        title: 'Confirmation Required',
        text: 'Please check the confirmation checkbox to proceed.',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Proceed with submission
    const payload = {
      images: paperSheets,
      questions: questions,
      paperSheet: paperSheet.getAll()
    };

    $.ajax({
      url: "submit",
      method: "POST",
      headers: {
        "X-CSRFToken": $('[name="csrfmiddlewaretoken"]').val()
      },
      data: JSON.stringify(payload),
      contentType: "application/json",
      processData: false,
      success: function (result) {
        console.log(result);
        $("#h11").html(result.success ? "Uploaded Successfully" : result.error);
        $('#submitEntriesModal').modal('hide');
      },
      error: function (xhr) {
        console.error("Error:", xhr.responseText);
      }
    });
  });
});

function populateEntriesTable() {
  const allSheets = paperSheet.getAll();
  const tbody = $('#entriesTableBody');
  tbody.empty();
  
  let hasEntries = false;
  
  // Go through each page and collect entries
  for (const sheetName in allSheets) {
    const sheetTools = allSheets[sheetName];
    
    for (const tool of sheetTools) {
      if (tool.tool === "add-marks" && tool.marks) {
        hasEntries = true;
        const pageNumber = sheetName.replace('Page ', '');
        const questionNumber = QuestionIdAndQuestionNo[tool.question_id] || '-';
        const marksGiven = tool.marks || 0;
        const toolUsed = toolTable[tool.tool]?.label || tool.tool;
        
        tbody.append(`
          <tr>
            <td>${pageNumber}</td>
            <td>${questionNumber}</td>
            <td>${marksGiven}</td>
            <td>${toolUsed}</td>
          </tr>
        `);
      }
    }
  }
  
  if (!hasEntries) {
    tbody.append(`
      <tr>
        <td colspan="4" class="text-center text-muted">
          No entries found to submit.
        </td>
      </tr>
    `);
  }
}

function validateSubmitButton() {
  const validationMessage = $('#validationMessage');
  
  // Check if all questions have been processed
  const allQuestionsProcessed = validateAllQuestionsProcessed();
  
  // Show/hide validation message
  if (!allQuestionsProcessed) {
    validationMessage.show();
  } else {
    validationMessage.hide();
  }
}

// Modal creation removed - sheets are now handled by the sheets panel in the top navigation
refreshData();

// Single loader hide mechanism - hide when everything is loaded
$(document).ready(function() {
  console.log('Document ready, starting loader management');
  
  // Wait for all images to load
  const images = document.querySelectorAll('img[src*="page_"]');
  let loadedImages = 0;
  
  console.log(`Found ${images.length} page images to load`);
  
  if (images.length === 0) {
    console.log('No images found, hiding loader immediately');
    loader(0);
    return;
  }
  
  images.forEach((img, index) => {
    if (img.complete) {
      console.log(`Image ${index} already loaded`);
      loadedImages++;
    } else {
      console.log(`Setting up load listeners for image ${index}`);
      img.addEventListener('load', () => {
        console.log(`Image ${index} loaded successfully`);
        loadedImages++;
        if (loadedImages === images.length) {
          console.log('All images loaded, hiding loader');
          loader(0);
        }
      });
      img.addEventListener('error', () => {
        console.log(`Image ${index} failed to load`);
        loadedImages++;
        if (loadedImages === images.length) {
          console.log('All images processed (some with errors), hiding loader');
          loader(0);
        }
      });
    }
  });
  
  // Check if all images are already loaded
  if (loadedImages === images.length) {
    console.log('All images were already loaded, hiding loader immediately');
    loader(0);
  }
  
  // Fallback: hide loader after maximum 10 seconds
  setTimeout(() => {
    loader(0);
    console.log('Loader hidden by maximum timeout');
  }, 10000);
});

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
  const originalRefreshData = refreshData;
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

// Page Detection Results Storage - Individual tracking for each page
const pageDetectionResults = {};
const currentPageStatus = {}; // Track current active page and its status
const navigationObserver = {
  currentPage: -1,
  isProcessing: false,
  lastNavigationTime: 0,
  navigationDebounceDelay: 300 // ms to debounce rapid navigation
};

// Navigation Observer System
class NavigationObserver {
  constructor() {
    this.currentPage = -1;
    this.isProcessing = false;
    this.lastNavigationTime = 0;
    this.navigationDebounceDelay = 300;
    this.observers = [];
    this.init();
  }

  init() {
    // Monitor all possible navigation events
    this.observeCarouselEvents();
    this.observeDirectNavigation();
    this.observeKeyboardNavigation();
    this.observeTouchNavigation();
    this.observeThumbnailNavigation();
    
    // Initial page detection
    setTimeout(() => {
      this.onPageChange(this.getCurrentPage());
    }, 500);
  }

  observeCarouselEvents() {
    // Check if myCarousel exists before adding event listeners
    if (!myCarousel) {
      console.warn('Carousel not found, skipping event listeners');
      return;
    }
    
    // Bootstrap carousel slide events are handled in the main DOM ready event
    // No need for duplicate listeners here

    // Also listen for slide events (before slide completes)
    myCarousel.addEventListener('slide.bs.carousel', (event) => {
      this.onPageChangeStart(event.to);
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

    // Next/Prev buttons
    $('.carousel-control-prev').on('click', () => {
      setTimeout(() => {
        this.onPageChange(this.getCurrentPage());
      }, 100);
    });

    $('.carousel-control-next').on('click', () => {
      setTimeout(() => {
        this.onPageChange(this.getCurrentPage());
      }, 100);
    });
  }

  observeKeyboardNavigation() {
    $(document).on('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const currentPage = this.getCurrentPage();
      let newPage = -1;

      if (e.key === 'ArrowLeft' && currentPage > 0) {
        newPage = currentPage - 1;
      } else if (e.key === 'ArrowRight' && currentPage < this.getTotalPages() - 1) {
        newPage = currentPage + 1;
      }

      if (newPage >= 0) {
        setTimeout(() => {
          this.onPageChange(newPage);
        }, 100);
      }
    });
  }

  observeTouchNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;

    $('.carousel').on('touchstart', (e) => {
      touchStartX = e.originalEvent.touches[0].clientX;
    });

    $('.carousel').on('touchend', (e) => {
      touchEndX = e.originalEvent.changedTouches[0].clientX;
      this.handleSwipeGesture(touchStartX, touchEndX);
    });
  }

  observeThumbnailNavigation() {
    // Monitor any thumbnail or grid navigation clicks
    $(document).on('click', '[data-page-index], .thumbnail-nav, .page-thumbnail', (e) => {
      const pageIndex = parseInt($(e.target).closest('[data-page-index]').attr('data-page-index'));
      if (!isNaN(pageIndex)) {
        setTimeout(() => {
          this.onPageChange(pageIndex);
        }, 100);
      }
    });
  }

  handleSwipeGesture(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;
    const currentPage = this.getCurrentPage();
    let newPage = -1;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentPage < this.getTotalPages() - 1) {
        // Swipe left - next page
        newPage = currentPage + 1;
      } else if (diff < 0 && currentPage > 0) {
        // Swipe right - previous page
        newPage = currentPage - 1;
      }
    }

    if (newPage >= 0) {
      setTimeout(() => {
        this.onPageChange(newPage);
      }, 100);
    }
  }

  onPageChangeStart(newPage) {
    // Called when navigation starts (before slide completes)
    this.currentPage = newPage;
    this.updateCurrentPageStatus(newPage, 'loading');
  }

  onPageChange(newPage) {
    // Debounce rapid navigation
    const now = Date.now();
    if (now - this.lastNavigationTime < this.navigationDebounceDelay) {
      return;
    }
    this.lastNavigationTime = now;

    // Update current page tracking
    this.currentPage = newPage;
    
    console.log(`🔄 Navigation Observer: Page changed to ${newPage + 1}`);
    
    // Trigger instant detection for this specific page
    this.triggerPageDetection(newPage);
    
    // Update UI elements
    this.updatePageIndicators(newPage);
    
    // Notify observers
    this.notifyObservers(newPage);
  }

  triggerPageDetection(pageIndex) {
    if (this.isProcessing) {
      console.log(`⏳ Detection already in progress for page ${pageIndex + 1}`);
      return;
    }

    this.isProcessing = true;
    this.updateCurrentPageStatus(pageIndex, 'detecting');

    // Ensure canvas exists for this page
    if (!canvasArray[pageIndex]) {
      console.warn(`⚠️ No canvas found for page ${pageIndex + 1}`);
      this.isProcessing = false;
      this.updateCurrentPageStatus(pageIndex, 'error');
      return;
    }

    console.log(`🔍 Starting detection for page ${pageIndex + 1}`);
    detectPageContentInstantly(pageIndex);
    
    // Set processing flag back after detection completes
    setTimeout(() => {
      this.isProcessing = false;
    }, 2000);
  }

  updateCurrentPageStatus(pageIndex, status) {
    currentPageStatus[pageIndex] = {
      status: status,
      timestamp: Date.now(),
      page: pageIndex + 1
    };

    // Update visual indicators
    this.updatePageStatusIndicator(pageIndex, status);
  }

  updatePageStatusIndicator(pageIndex, status) {
    const item = $(`.carousel-item:nth-child(${pageIndex + 1})`);
    let indicator = item.find('.navigation-status');
    
    if (indicator.length === 0) {
      item.append(`
        <div class="navigation-status position-absolute top-0 start-0 m-2">
          <span class="badge bg-secondary"></span>
        </div>
      `);
      indicator = item.find('.navigation-status .badge');
    }

    // Update indicator based on status
    indicator.removeClass('bg-success bg-info bg-warning bg-danger bg-secondary');
    
    switch (status) {
      case 'loading':
        indicator.addClass('bg-secondary').text('⏳');
        break;
      case 'detecting':
        indicator.addClass('bg-warning').text('🔍');
        break;
      case 'blank':
        indicator.addClass('bg-success').text('📋');
        break;
      case 'content':
        indicator.addClass('bg-info').text('📄');
        break;
      case 'error':
        indicator.addClass('bg-danger').text('❌');
        break;
      default:
        indicator.addClass('bg-secondary').text('❓');
    }
  }

  updatePageIndicators(pageIndex) {
    // Update page selector dropdown
    $('#pageSelect').val(pageIndex);
    
    // Update active page styling
    $('.carousel-item').removeClass('navigation-active');
    $(`.carousel-item:nth-child(${pageIndex + 1})`).addClass('navigation-active');
  }

  getCurrentPage() {
    return $('.carousel-item.active').index();
  }

  getTotalPages() {
    return $('.carousel-item').length;
  }

  notifyObservers(pageIndex) {
    this.observers.forEach(callback => callback(pageIndex, currentPageStatus[pageIndex]));
  }

  subscribe(callback) {
    this.observers.push(callback);
  }

  getCurrentPageStatus() {
    return currentPageStatus[this.currentPage] || null;
  }

  forceRedetection(pageIndex = null) {
    const targetPage = pageIndex !== null ? pageIndex : this.getCurrentPage();
    
    // Clear cached results for this page
    delete pageDetectionResults[targetPage];
    
    // Force new detection
    this.triggerPageDetection(targetPage);
  }
}

// Initialize Navigation Observer
const navObserver = new NavigationObserver();

// Instant Page Detection System
function detectPageContentInstantly(pageIndex) {
  let canvas = canvasArray[pageIndex];
  if (!canvas) {
    console.warn(`⚠️ No canvas available for page ${pageIndex + 1}`);
    navObserver.updateCurrentPageStatus(pageIndex, 'error');
    return;
  }
  
  console.log(`🔍 Starting individual analysis for page ${pageIndex + 1}`);
  
  const imageData = canvas.toDataURL('image/png');
  const pageId = `page_${pageIndex}`;
  const sessionId = `session_${Date.now()}_${pageIndex}`; // Unique session per page
  
  // Show loading indicator
  showPageDetectionLoading(pageIndex);
  
  // Call AI service for instant detection for this specific page
  fetch('/api/ai/validate-page/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({
      session_id: sessionId,
      page_id: pageId,
      image_data: imageData,
      page_number: pageIndex + 1
    })
  })
  .then(response => response.json())
  .then(result => {
    hidePageDetectionLoading(pageIndex);
    
    if (result.status === 'success' && result.page_analysis) {
      // Store detection results specifically for this page
      pageDetectionResults[pageIndex] = {
        ...result.page_analysis,
        page_index: pageIndex,
        detection_timestamp: Date.now(),
        session_id: sessionId
      };
      
      console.log(`✅ Page ${pageIndex + 1} analysis complete:`, {
        is_content: result.page_analysis.is_content,
        pixel_density: result.page_analysis.pixel_density
      });
      
      // Update navigation observer status
      const status = result.page_analysis.is_content ? 'content' : 'blank';
      navObserver.updateCurrentPageStatus(pageIndex, status);
      
      // Update page indicators
      updatePageDetectionIndicator(pageIndex, result.page_analysis);
      
      // Update dropdown with page-specific status
      updatePageDropdownStatus(pageIndex, result.page_analysis);
      
    } else {
      console.error(`❌ Page ${pageIndex + 1} analysis failed:`, result);
      navObserver.updateCurrentPageStatus(pageIndex, 'error');
    }
  })
  .catch(error => {
    hidePageDetectionLoading(pageIndex);
    console.error(`❌ Page ${pageIndex + 1} detection error:`, error);
    navObserver.updateCurrentPageStatus(pageIndex, 'error');
  });
}

function updatePageDropdownStatus(pageIndex, analysis) {
  const pageOption = $(`#pageSelect option:nth-child(${pageIndex + 1})`);
  const statusIcon = analysis.is_content ? '📄' : '📋';
  const density = analysis.pixel_density?.density || analysis.pixel_density || 0;
  const densityPercentage = (density * 100).toFixed(1);
  
  pageOption.text(`${statusIcon} Page ${pageIndex + 1} (${densityPercentage}%)`);
}

function showPageDetectionLoading(pageIndex) {
  const indicator = $(`.carousel-item:nth-child(${pageIndex + 1}) .page-detection-indicator`);
  if (indicator.length === 0) {
    $(`.carousel-item:nth-child(${pageIndex + 1})`).append(`
      <div class="page-detection-indicator position-absolute top-0 start-0 m-2">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Detecting...</span>
        </div>
      </div>
    `);
  }
}

function hidePageDetectionLoading(pageIndex) {
  const indicator = $(`.carousel-item:nth-child(${pageIndex + 1}) .page-detection-indicator`);
  indicator.remove();
}

function updatePageDetectionIndicator(pageIndex, analysis) {
  const item = $(`.carousel-item:nth-child(${pageIndex + 1})`);
  let indicator = item.find('.page-detection-status');
  
  if (indicator.length === 0) {
    item.append(`
      <div class="page-detection-status position-absolute top-0 end-0 m-2">
        <span class="badge"></span>
      </div>
    `);
    indicator = item.find('.page-detection-status .badge');
  }
  
  // Update indicator based on detection results
  const pixelDensity = analysis.pixel_density?.density || analysis.pixel_density || 0;
  const densityPercentage = (pixelDensity * 100).toFixed(3);
  
  if (analysis.is_content) {
    indicator.removeClass('bg-success bg-secondary').addClass('bg-info')
           .attr('title', `Content detected (${densityPercentage}%)`);
  } else {
    indicator.removeClass('bg-info bg-secondary').addClass('bg-success')
           .attr('title', `Blank page detected (${densityPercentage}%)`);
  }
  
  // Update page selector dropdown to show detection status
  const pageOption = $(`#pageSelect option:nth-child(${pageIndex + 1})`);
  const statusIcon = analysis.is_content ? '📄' : '📋';
  pageOption.text(`${statusIcon} Page ${pageIndex + 1}`);
}

// AI Blank Detection Helper Functions
function performMarkBlank(activeIndex, tool) {
  let canvas = canvasArray[activeIndex];
  
  if (!canvas) {
    console.warn('Canvas not found at index:', activeIndex);
    return;
  }
  
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
}

async function checkWithAIBeforeMarkBlank(activeIndex, onConfirmCallback) {
  try {
    console.log(`🔍 Checking page ${activeIndex + 1} before marking blank`);
    
    // Check if we already have detection results for this specific page
    let analysis = pageDetectionResults[activeIndex];
    
    // If no cached results, perform instant detection for this specific page
    if (!analysis) {
      console.log(`⏳ No cached results for page ${activeIndex + 1}, performing detection...`);
      await new Promise((resolve) => {
        detectPageContentInstantly(activeIndex);
        // Wait for detection to complete
        setTimeout(() => {
          analysis = pageDetectionResults[activeIndex];
          resolve();
        }, 2000);
      });
    }
    
    // If still no analysis, allow with basic confirmation
    if (!analysis) {
      console.warn(`⚠️ No analysis available for page ${activeIndex + 1}, using basic confirmation`);
      showBasicBlankConfirmation(onConfirmCallback);
      return;
    }
    
    // Get pixel density percentage for this specific page
    const pixelDensity = analysis.pixel_density?.density || analysis.pixel_density || 0;
    const densityPercentage = pixelDensity * 100;
    
    console.log(`📊 Page ${activeIndex + 1} analysis:`, {
      density_percentage: densityPercentage.toFixed(3),
      is_content: analysis.is_content,
      page_index: activeIndex,
      detection_timestamp: analysis.detection_timestamp
    });
    
    // Apply the 1.80% threshold logic for this specific page
    if (densityPercentage <= 1.80) {
      // Blank Page Detection (No Alerts/Blocking): Below 1.80%
      // Allow the "Mark as Blank" tool to work immediately
      console.log(`✅ Page ${activeIndex + 1} confirmed blank (${densityPercentage.toFixed(3)}% ≤ 1.80%)`);
      Swal.fire({
        icon: 'success',
        title: 'Page Confirmed Blank',
        text: `Page ${activeIndex + 1}: Pixel density ${densityPercentage.toFixed(3)}% (≤ 1.80% threshold)`,
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      }).then(() => {
        onConfirmCallback();
      });
    } else {
      // Content Detection: Above 1.80%
      // Show warning: "Content detected on this page. Are you sure?"
      console.log(`⚠️ Page ${activeIndex + 1} has content (${densityPercentage.toFixed(3)}% > 1.80%)`);
      showContentWarningDialog(activeIndex, densityPercentage, onConfirmCallback);
    }
    
  } catch (error) {
    console.error(`❌ Error checking page ${activeIndex + 1} before marking blank:`, error);
    showBasicBlankConfirmation(onConfirmCallback);
  }
}

function showContentWarningDialog(pageIndex, densityPercentage, onConfirmCallback) {
  Swal.fire({
    title: '⚠️ Content Detected on Page',
    html: `
      <div style="text-align: left;">
        <p><strong>AI Analysis Results for Page ${pageIndex + 1}:</strong></p>
        <p>📝 High ink density detected</p>
        <p><strong>Pixel Density:</strong> ${densityPercentage.toFixed(3)}%</p>
        <p><strong>Threshold:</strong> 1.80%</p>
        <p><strong>Rule:</strong> Above 1.80% = Content, ≤ 1.80% = Blank</p>
        <hr>
        <p><strong>Are you sure you want to mark page ${pageIndex + 1} as blank?</strong></p>
        <p style="color: #666; font-size: 12px;">
          The AI system has detected content on this specific page. 
          Marking it as blank may not be appropriate.
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Mark as Blank',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => {
    if (result.isConfirmed) {
      console.log(`⚠️ User confirmed marking page ${pageIndex + 1} as blank despite content detection`);
      onConfirmCallback();
    } else {
      console.log(`✅ User cancelled marking page ${pageIndex + 1} as blank`);
    }
  });
}

// Debug and Testing Utilities
const PageDetectionDebugger = {
  logAllPageResults() {
    console.group('🔍 Page Detection Results Summary');
    Object.keys(pageDetectionResults).forEach(pageIndex => {
      const result = pageDetectionResults[pageIndex];
      console.log(`Page ${parseInt(pageIndex) + 1}:`, {
        is_content: result.is_content,
        pixel_density: result.pixel_density?.density || result.pixel_density,
        detection_timestamp: new Date(result.detection_timestamp).toLocaleTimeString(),
        page_index: result.page_index
      });
    });
    console.groupEnd();
  },

  getCurrentPageInfo() {
    const currentPage = navObserver.getCurrentPage();
    const status = navObserver.getCurrentPageStatus();
    const analysis = pageDetectionResults[currentPage];
    
    console.group(`📊 Current Page ${currentPage + 1} Info`);
    console.log('Navigation Status:', status);
    console.log('Analysis Results:', analysis);
    console.log('Cached Results Exist:', !!analysis);
    console.groupEnd();
    
    return { currentPage, status, analysis };
  },

  forceRedetectAllPages() {
    console.log('🔄 Forcing redetection of all pages...');
    const totalPages = navObserver.getTotalPages();
    
    for (let i = 0; i < totalPages; i++) {
      delete pageDetectionResults[i];
      delete currentPageStatus[i];
    }
    
    // Force detect current page
    navObserver.forceRedetection();
  },

  simulateNavigation(pageIndex) {
    console.log(`🎯 Simulating navigation to page ${pageIndex + 1}`);
    goToSlide(pageIndex);
  },

  validateIndividualDetection() {
    const totalPages = navObserver.getTotalPages();
    const results = [];
    
    console.group('🧪 Individual Detection Validation');
    
    for (let i = 0; i < totalPages; i++) {
      const result = pageDetectionResults[i];
      const status = currentPageStatus[i];
      
      results.push({
        page: i + 1,
        has_cached_result: !!result,
        has_status: !!status,
        result_page_index: result?.page_index,
        status_matches: result ? (result.is_content ? 'content' : 'blank') === status?.status : false
      });
      
      console.log(`Page ${i + 1}:`, results[results.length - 1]);
    }
    
    console.groupEnd();
    return results;
  }
};

// Make debugger available globally for testing
window.PageDetectionDebugger = PageDetectionDebugger;

// Add keyboard shortcuts for debugging
$(document).on('keydown', (e) => {
  // Ctrl+Shift+D: Debug current page
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    PageDetectionDebugger.getCurrentPageInfo();
  }
  
  // Ctrl+Shift+L: Log all results
  if (e.ctrlKey && e.shiftKey && e.key === 'L') {
    e.preventDefault();
    PageDetectionDebugger.logAllPageResults();
  }
  
  // Ctrl+Shift+R: Force redetect all
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    PageDetectionDebugger.forceRedetectAllPages();
  }
  
  // Ctrl+Shift+V: Validate individual detection
  if (e.ctrlKey && e.shiftKey && e.key === 'V') {
    e.preventDefault();
    PageDetectionDebugger.validateIndividualDetection();
  }
});

// Test and Validation Functions
function testDetectionThresholds() {
  console.group('🧪 Testing Detection Thresholds');
  
  const testCases = [
    { density: 0.005, expected: 'blank', description: '0.5% - should be blank' },
    { density: 0.015, expected: 'blank', description: '1.5% - should be blank' },
    { density: 0.018, expected: 'blank', description: '1.8% - should be blank (threshold)' },
    { density: 0.0181, expected: 'content', description: '1.81% - should be content' },
    { density: 0.025, expected: 'content', description: '2.5% - should be content' },
    { density: 0.05, expected: 'content', description: '5% - should be content' }
  ];
  
  testCases.forEach(testCase => {
    const densityPercentage = testCase.density * 100;
    const result = densityPercentage <= 1.80 ? 'blank' : 'content';
    const passed = result === testCase.expected;
    
    console.log(`${passed ? '✅' : '❌'} ${testCase.description}: ${densityPercentage.toFixed(3)}% → ${result} ${passed ? '' : '(expected: ' + testCase.expected + ')'}`);
  });
  
  console.groupEnd();
}

// Add to debugger
PageDetectionDebugger.testThresholds = testDetectionThresholds;

console.log('🎯 Navigation Observer and Individual Page Detection System Initialized');
console.log('🔧 Debug shortcuts: Ctrl+Shift+D (current page), Ctrl+Shift+L (all results), Ctrl+Shift+R (redetect all), Ctrl+Shift+V (validate), Ctrl+Shift+T (test thresholds)');

// Add keyboard shortcut for threshold testing
$(document).on('keydown', (e) => {
  // Ctrl+Shift+T: Test thresholds
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    PageDetectionDebugger.testThresholds();
  }
});

function showBasicBlankConfirmation(onConfirmCallback) {
  Swal.fire({
    title: 'Mark Page as Blank?',
    html: `
      <div style="text-align: left;">
        <p>Are you sure you want to mark this page as blank?</p>
        <p style="color: #666; font-size: 12px;">
          AI service is unavailable. Please verify page is actually blank before proceeding.
        </p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Mark as Blank',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirmCallback();
    }
  });
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
}

