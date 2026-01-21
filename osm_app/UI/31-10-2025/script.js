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
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
let seconds = 0;
const timeDisplay = document.getElementById('timeTaken');

function formatTime(s) {
  const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
  const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const secs = String(s % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

setInterval(() => {
  seconds++;
  timeDisplay.textContent = formatTime(seconds);
}, 1000);


// $(document).ready(function () {
const tools = {
  'add-marks': { name: 'add-marks', icon: 'bi-plus-circle', label: 'Add Marks', tooltip: 'Add marks to this section' },
  'mark-correct': { name: 'mark-correct', icon: 'bi-check2-circle', label: 'Mark Correct', tooltip: 'Mark answer as correct' },
  'mark-incorrect': { name: 'mark-incorrect', icon: 'bi-x-circle', label: 'Mark Incorrect', tooltip: 'Mark answer as incorrect' },
  'pencil-tool': { name: 'pencil-tool', icon: 'bi-pencil', label: 'Pencil Tool', tooltip: 'Freehand drawing tool' },
  'text-tool': { name: 'text-tool', icon: 'bi-type', label: 'Text Tool', tooltip: 'Insert typed text' },
  'draw-line': { name: 'draw-line', icon: 'bi-dash-lg', label: 'Draw Line', tooltip: 'Draw a straight line' },
  'draw-box': { name: 'draw-box', icon: 'bi-square', label: 'Draw Box', tooltip: 'Draw a rectangle/box' }
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
myCarousel.addEventListener('slid.bs.carousel', function (event) {
  $('#pageSelect').val(event.to);

  updateCarouselCanvas($(this).find('.carousel-item').eq(event.to))
  addBadgeToButton($('[data-name="undo_tool"]')[0], paperSheet.getSheet(event.to).length);

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
  selectedTool($(this).data('name'));

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
  $('.select-question').addClass('btn-outline-success').removeClass('btn-success').html('Select');

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
    cursor.removeClass().addClass(tools[tool].icon);
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
  }
});


const selectedTool = (tool, text = null) => {



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

      break;

    // ✅ "Mark Blank" tool (draws cross in center)
    case 'mark_blank':
      if (paperSheet.getSheet(activeIndex)?.some(item => item.tool === "mark_blank")) {
        markedToolPopup();
        return;
      }
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

      break;

    // ✅ "Undo" tool
    case 'undo_tool':
      let lastObject = paperSheet.popData(activeIndex);

      // Create image only if there’s a Base64 image
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
    case 'mark-correct':
    case 'mark-incorrect':
    case 'pencil-tool':
    case 'text-tool':
    case 'draw-line':
    case 'draw-box':



      activeCanvas = canvasArray[activeIndex];
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


}

const loader = (isDisabled = 1) => {
  return $('#loader-main').css('display', isDisabled ? 'flex' : 'none');
};





var questions = JSON.parse(document.getElementById('questionsData').innerHTML);
const questionStatus = JSON.parse(document.getElementById('statusData').innerHTML);
const paperSheets = JSON.parse(document.getElementById('imagesData').innerHTML);
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
          Select
        </button>
      </td>
    </tr>`;
  });

  // Render tbody
  $('#questions-table tbody').html(tbody);

  // Build footer dynamically using pre-calculated totals
  const f = totals;
  $('#questions-table tfoot').html(`
  <tr>
    <td colspan="5" class="text-end fw-bold">
      <span data-bs-toggle="tooltip" title="Total number of questions assigned">TQ: ${f.TQ}</span> |
      <span class="badge ${questionStatus.NM.class}" data-bs-toggle="tooltip" title="Untouched questions">NM: ${f.NM}</span> |
      <span class="badge ${questionStatus.A.class}" data-bs-toggle="tooltip" title="Attempted questions">A: ${f.A}</span> |
      <span class="badge ${questionStatus.OA.class}" data-bs-toggle="tooltip" title="Over attempted questions">OA: ${f.OA}</span> |
      <span class="badge ${questionStatus.NA.class}" data-bs-toggle="tooltip" title="Not attempted questions">NA: ${f.NA}</span> |
      <span data-bs-toggle="tooltip" title="Marked for review">Marked: ${f.Marked}</span> |
      <span data-bs-toggle="tooltip" title="Correct answers">Correct: ${f.Correct}</span> |
      <span data-bs-toggle="tooltip" title="Incorrect answers">Wrong: ${f.Wrong}</span> |
      <span data-bs-toggle="tooltip" title="Total marks obtained">Total Marks: ${f.TotalMarks}</span>
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
    $('.select-question').addClass('btn-outline-success').removeClass('btn-success').html('Select');
    $(this).addClass('btn-success').removeClass('btn-outline-success').html('Selected');
    loadTools();

  }
});


$(document).on('click', '.update-status', function () {
  let questionId = $(this).data('question-id');
  activeQuestion = questions.find(question => question.id == questionId)

  activeQuestion.status = getNextStatus(activeQuestion.status).key;
  refreshData();
});





$(document).on('submit', 'form', function (e) {
  e.preventDefault();

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
    data: JSON.stringify(payload),  // ✅ send raw JSON
    contentType: "application/json", // ✅ correct content type
    processData: false,              // ✅ prevent jQuery from form-encoding
    success: function (result) {
      console.log(result);
      $("#h11").html(result.success ? "Uploaded Successfully" : result.error);
    },
    error: function (xhr) {
      console.error("Error:", xhr.responseText);
    }
  });
});


$('#dynamicModal').remove();

// Modal creation removed - sheets are now handled by the sheets panel in the top navigation

// Handle Save button click
$('#dynamicModalSave').click(function () {
  const results = [];

  $('.mark-for-blank').each(function (index) {
    if ($(this).prop('checked')) {

      goToSlide(index);
      $('button[data-name="mark_blank"]').click();
    }
  });


  modal.hide();
});




refreshData();
loader(0);