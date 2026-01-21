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
const tools = [
  { name: 'add-marks', icon: 'bi-plus-circle', label: 'Add Marks', tooltip: 'Add marks to this section' },
  { name: 'mark-correct', icon: 'bi-check2-circle', label: 'Mark Correct', tooltip: 'Mark answer as correct' },
  { name: 'mark-incorrect', icon: 'bi-x-circle', label: 'Mark Incorrect', tooltip: 'Mark answer as incorrect' },
  { name: 'pencil-tool', icon: 'bi-pencil', label: 'Pencil Tool', tooltip: 'Freehand drawing tool' },
  { name: 'text-tool', icon: 'bi-type', label: 'Text Tool', tooltip: 'Insert typed text' },
  { name: 'draw-line', icon: 'bi-dash-lg', label: 'Draw Line', tooltip: 'Draw a straight line' },
  { name: 'draw-box', icon: 'bi-square', label: 'Draw Box', tooltip: 'Draw a rectangle/box' }
];


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
    clearSelectedQuestion();
  } else if (activeTool === 'add-marks') {
    // Example: current question label (replace dynamically)


    const questionLabel = 'Q.' + activeQuestion.question_no;
    const marksText = '+' + marksOrText; // or dynamically set marks earned
    activeQuestion.obtained += parseFloat(marksOrText) || 0;
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
    clearSelectedQuestion();
    refreshData();
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
  } else if (activeTool === 'draw-box') {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  clearSelectedQuestion();

  // saveState(); // Save after each drawing
}


let toolHtml = `<div class="d-flex flex-wrap justify-content-center gap-2" id="toolSelector">`;

tools.forEach((tool, index) => {
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
});

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
  const ctx = canvas.getContext('2d');
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
  activeCanvas.removeEventListener('mousedown', activeCanvasMouseDownEvent);
  activeCanvas.removeEventListener('mousemove', activeCanvasMouseMoveEvent);
  activeCanvas.removeEventListener('mouseup', activeCanvasMouseUpEvent);
  hideCustomCursor();
}

// Simple, scalable monochrome SVG icons (inline strings).
// Keys match exactly the names you requested.
const cursorIcons = {
  "add-marks": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Add Marks</title>
      <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M5 20c2.5-3 6-4.5 7-4.5s4.5 1 7 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M19 11v6M16 14h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

  "mark-correct": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Correct / Check</title>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 12.5l2 2.5L16 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  "mark-incorrect": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Incorrect / Cross</title>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <path d="M9 9l6 6M15 9l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  "pencil-tool": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Pencil</title>
      <path d="M3 21l3-1 11-11 1-3-4-0.5-11 11L3 21z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 7l3 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

  "text-tool": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Text Tool</title>
      <path d="M4 6h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M8 6v12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 6v12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M8 18h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

  "draw-line": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Draw Line</title>
      <line x1="3" y1="21" x2="21" y2="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="3" cy="21" r="1.6" fill="currentColor"/>
      <circle cx="21" cy="3" r="1.6" fill="currentColor"/>
    </svg>`,

  "draw-box": `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>Draw Box</title>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2"/>
      <rect x="8" y="8" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </svg>`
};

function setCustomCursor(tool) {
  const cursor = document.getElementById('custom-cursor');
  if (cursorIcons[tool]) {
    cursor.innerHTML = cursorIcons[tool];
    cursor.style.display = 'block';
  } else {
    cursor.style.display = 'none';
  }
}

function hideCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  cursor.style.display = 'none';
}

// Move cursor with mouse
document.addEventListener('mousemove', (e) => {
  const cursor = document.getElementById('custom-cursor');
  if (cursor.style.display !== 'none') {
    cursor.style.left = (e.pageX) + 'px';
    cursor.style.top = (e.pageY) + 'px';
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



  setCustomCursor(tool)
  switch (tool) {
    // ✅ "Seen" tool (draws diagonal)
    case 'seen':
      // Save current state (snapshot before drawing)
      canvasHistory[activeIndex].push(ctx.getImageData(0, 0, canvas.width, canvas.height));

      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(0, 150);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
      ctx.stroke();
      break;

    // ✅ "Mark Blank" tool (draws cross in center)
    case 'mark_blank':
      canvasHistory[activeIndex].push(ctx.getImageData(0, 0, canvas.width, canvas.height));

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
      break;

    // ✅ "Undo" tool
    case 'undo_tool':
      const activeHistory = canvasHistory[activeIndex];

      // If we have more than one state, undo last action
      if (activeHistory && activeHistory.length > 0) {
        activeHistory.pop(); // remove latest snapshot

        const prevState = activeHistory[activeHistory.length - 1];
        if (prevState) {
          ctx.putImageData(prevState, 0, 0); // restore previous state
        } else {
          // nothing left — clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // If no history — just clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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


      canvasHistory[activeIndex].push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (tool === 'add-marks') {


      }


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


}

const loader = (isDisabled = 1) => {
  return $('#loader-main').css('display', isDisabled ? 'flex' : 'none');
};





var questions = JSON.parse(document.getElementById('questionsData').innerHTML);
const questionStatus = JSON.parse(document.getElementById('statusData').innerHTML);
const paperSheets = JSON.parse(document.getElementById('imagesData').innerHTML);
const refreshData = () => {
  let tbody = '';
  questions.forEach(question => {
    tbody += `<tr class="">
                    <td>${question.question_no}</td>
                    <td>${question.question}</td>
                    <td>${question.obtained} / ${question.marks}</td>
                    <td class="text-center">
                      <span class="badge ${questionStatus[question.status].class}" data-bs-toggle="tooltip" title="${questionStatus[question.status].title}">${question.status}</span>
                    </td>
                    <td><button class="btn btn-xs btn-outline-success w-100 select-question" data-id="${question.id}">Select</button></td>
                  </tr>`;
  });
  $('#questions-table tbody').html(tbody);
  $('#questions-table tfoot').html(`<tr>
                    <td colspan="5" class="text-end fw-bold">
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Total number of questions assigned">TQ: 50</span> |
                      <span class="cursor-pointer badge ${questionStatus['NM'].class}" data-bs-toggle="tooltip" title="Questions untouched or not marked">NM: 5</span> |
                      <span class="cursor-pointer badge ${questionStatus['A'].class}" data-bs-toggle="tooltip" title="Questions the candidate attempted">A: 10</span> |
                      <span class="cursor-pointer badge ${questionStatus['OA'].class}" data-bs-toggle="tooltip" title="Questions attempted more than once (if allowed)">OA: 5</span> |
                      <span class="cursor-pointer badge ${questionStatus['NA'].class}" data-bs-toggle="tooltip" title="Questions left unattempted">NA: 35</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions marked for review (yet to be submitted)">Marked: 2</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions correctly answered (auto-evaluated)">Correct: 8</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions incorrectly answered">Wrong: 2</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Total marks obtained (70) out of 40 allocated — may include bonus or extra attempts.">Total Marks: 70/40</span>
                    </td>
                  </tr>`);

  // paperSheets.forEach(element => {

  // });

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
          }
        });
      });
    },

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
        return { tool, value: val };
      }

      return { tool };
    }
  }).then(result => {
    if (result.isConfirmed) {

      selectedTool(result.value.tool, result.value.value)


      // if (result.value.value) {
      //   
      // }
      // 🔁 Continue logic here
    }
  });

}

$(document).on('click', '.select-question', function () {
  // Remove 'active' class from all rows and reset button labels
  $('tr.active').removeClass('active');          // Remove active class from all rows

  // Add 'active' to the clicked row and change its button label
  $(this).closest('tr').addClass('active');

  // Optional: get the question ID (if you have a data-id attribute)
  var questionId = $(this).data('id');
  activeQuestion = questions.find(question => question.id == questionId)
  $('.select-question').addClass('btn-outline-success').removeClass('btn-success').html('Select');
  $(this).addClass('btn-success').removeClass('btn-outline-success').html('Selected');
  loadTools();
});



refreshData();
loader(0);