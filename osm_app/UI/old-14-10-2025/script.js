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


$(document).ready(function () {
  var tools = JSON.parse($('#tools').html());// tools.splice(0, 2); tools.pop();




  let toolHtml = `<div class="d-flex flex-wrap justify-content-center gap-2" id="toolSelector">`;

  tools.forEach((tool, index) => {
    const id = `tool-${index}`;
    const isDisabled = tool.disabled ? 'disabled' : '';
    const isDisabledStyle = tool.disabled ? 'opacity-50 pointer-events-none' : '';
    const tooltipAttr = `data-bs-toggle="tooltip" title="${tool.tooltip}"`;

    toolHtml += `
    <label class="tool-box border rounded p-2 text-center ${isDisabledStyle}" 
           style="width: 100px; cursor: pointer;" ${tooltipAttr} data-value="${tool.label}">
      <input type="radio" name="toolOption" id="${id}" value="${tool.label}" class="d-none" ${isDisabled}>
      <i class="bi ${tool.icon} fs-4 d-block mb-1"></i>
      <small>${tool.label}</small>
    </label>
  `;
  });

  toolHtml += `</div>`;

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
            if (selectedLabel === "Add Marks") {
              extraInput.type = "number";
              extraInputLabel.textContent = "Enter Marks";
              extraInput.placeholder = "e.g. 5";
              extraInput.value = "";
              extraInputContainer.classList.remove("d-none");
            } else if (selectedLabel === "Text Tool") {
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
        console.log("Selected Tool:", result.value.tool);
        if (result.value.value) {
          console.log("Entered Value:", result.value.value);
        }
        // 🔁 Continue logic here
      }
    });

  }


  $('.select-question').click(function (e) {
    e.preventDefault();
    $('.select-question').addClass('btn-outline-success').removeClass('btn-success').html('Select');
    $(this).addClass('btn-success').removeClass('btn-outline-success').html('Selected');
    loadTools();

  });
});