<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Canvas Tool Overlay</title>

    <!-- Bootstrap & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <style>
        .canvas-wrapper {
            position: relative;
            display: inline-block;
            max-width: 100%;
        }

        #overlayCanvas {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
        }

        img {
            display: block;
            max-width: 100%;
            height: auto;
        }

        .tool-box:hover {
            background-color: #f1f1f1;
        }
    </style>
</head>

<body class="p-3">

    <!-- Image + Canvas Overlay -->
    <div class="canvas-wrapper">
        <img id="bgImage" src="/images/08e6cb8853b4438fb6e033dcedee68d2.png" alt="Canvas Background" />
        <canvas id="overlayCanvas"></canvas>
    </div>

    <!-- Hidden Tools JSON -->
    <div id="tools" style="display: none;">
        [
        {"icon": "bi-plus-circle", "label": "Add Marks", "tooltip": "Add marks to this section"},
        {"icon": "bi-check2-circle", "label": "Mark Correct", "tooltip": "Mark answer as correct"},
        {"icon": "bi-x-circle", "label": "Mark Incorrect", "tooltip": "Mark answer as incorrect"},
        {"icon": "bi-pencil", "label": "Pencil Tool", "tooltip": "Freehand drawing tool"},
        {"icon": "bi-type", "label": "Text Tool", "tooltip": "Insert typed text"},
        {"icon": "bi-dash-lg", "label": "Draw Line", "tooltip": "Draw a straight line"},
        {"icon": "bi-square", "label": "Draw Box", "tooltip": "Draw a rectangle/box"}
        ]
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const canvas = document.getElementById('overlayCanvas');
            const ctx = canvas.getContext('2d');
            const image = document.getElementById('bgImage');
            const tools = JSON.parse(document.getElementById('tools').textContent);
            let selectedTool = null;

            function resizeCanvas() {
                canvas.width = image.clientWidth;
                canvas.height = image.clientHeight;
                canvas.style.width = image.clientWidth + "px";
                canvas.style.height = image.clientHeight + "px";
            }

            image.onload = resizeCanvas;
            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();

            // Press T to open tool selector
            document.addEventListener("keydown", e => {
                if (e.key.toLowerCase() === "t") {
                    showToolSelector();
                }
            });

            function showToolSelector() {
                let toolHtml = `<div class="d-flex flex-wrap justify-content-center gap-2" id="toolSelector">`;

                tools.forEach((tool, index) => {
                    const id = `tool-${index}`;
                    toolHtml += `
            <label class="tool-box border rounded p-2 text-center" style="width: 100px; cursor: pointer;" data-bs-toggle="tooltip" title="${tool.tooltip}">
              <input type="radio" name="toolOption" id="${id}" value="${tool.label}" class="form-check-input d-none" />
              <i class="bi ${tool.icon} fs-4 d-block"></i>
              <small>${tool.label}</small>
            </label>`;
                });

                toolHtml += `</div>`;

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
                        // Initialize tooltips
                        const tooltipList = [].slice.call(Swal.getHtmlContainer().querySelectorAll('[data-bs-toggle="tooltip"]'));
                        tooltipList.forEach(el => new bootstrap.Tooltip(el));

                        const boxes = Swal.getHtmlContainer().querySelectorAll('.tool-box');
                        const extraInputContainer = Swal.getHtmlContainer().querySelector('#extraInputContainer');
                        const extraInputLabel = Swal.getHtmlContainer().querySelector('#extraInputLabel');
                        const extraInput = Swal.getHtmlContainer().querySelector('#extraInput');

                        boxes.forEach(box => {
                            box.addEventListener('click', () => {
                                boxes.forEach(b => b.classList.remove('border-primary', 'bg-light'));
                                box.classList.add('border-primary', 'bg-light');
                                const input = box.querySelector('input[type="radio"]');
                                input.checked = true;

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
                            return {
                                tool,
                                value: val
                            };
                        }

                        return {
                            tool
                        };
                    }
                }).then(result => {
                    if (result.isConfirmed) {
                        selectedTool = result.value;
                        enableCanvasInteraction(result.value.tool, result.value.value);
                    }
                });
            }

            function enableCanvasInteraction(toolLabel, extraValue = "") {
                canvas.style.pointerEvents = 'auto';

                let isDrawing = false;
                let startX = 0,
                    startY = 0;

                const rect = canvas.getBoundingClientRect();
                const tempCanvas = document.createElement("canvas");
                const tempCtx = tempCanvas.getContext("2d");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;

                function clearOverlay() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(tempCanvas, 0, 0);
                }

                const mousedownHandler = (e) => {
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    if (toolLabel === "Add Marks") {
                        ctx.fillText("+" + extraValue, x, y);
                        cleanup();
                    } else if (toolLabel === "Text Tool") {
                        ctx.fillText(extraValue, x, y);
                        cleanup();
                    } else if (toolLabel === "Mark Correct") {
                        ctx.fillText("✔️", x, y);
                        cleanup();
                    } else if (toolLabel === "Mark Incorrect") {
                        ctx.fillText("❌", x, y);
                        cleanup();
                    } else if (toolLabel === "Draw Line" || toolLabel === "Draw Box") {
                        isDrawing = true;
                        startX = x;
                        startY = y;
                        ctx.lineWidth = 2;
                    }
                };

                const mousemoveHandler = (e) => {
                    if (!isDrawing) return;

                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    clearOverlay();

                    ctx.beginPath();
                    if (toolLabel === "Draw Line") {
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(x, y);
                    } else if (toolLabel === "Draw Box") {
                        ctx.rect(startX, startY, x - startX, y - startY);
                    }
                    ctx.stroke();
                };

                const mouseupHandler = (e) => {
                    if (!isDrawing) return;
                    isDrawing = false;

                    // Save current canvas to temp for future preservation
                    tempCtx.drawImage(canvas, 0, 0);
                    canvas.removeEventListener("mousedown", mousedownHandler);
                    canvas.removeEventListener("mousemove", mousemoveHandler);
                    canvas.removeEventListener("mouseup", mouseupHandler);
                    canvas.style.pointerEvents = "none";
                };

                function cleanup() {
                    canvas.removeEventListener("mousedown", mousedownHandler);
                    canvas.removeEventListener("mousemove", mousemoveHandler);
                    canvas.removeEventListener("mouseup", mouseupHandler);
                    canvas.style.pointerEvents = "none";
                }

                canvas.addEventListener("mousedown", mousedownHandler);
                canvas.addEventListener("mousemove", mousemoveHandler);
                canvas.addEventListener("mouseup", mouseupHandler);
            }

        });
    </script>

</body>

</html>