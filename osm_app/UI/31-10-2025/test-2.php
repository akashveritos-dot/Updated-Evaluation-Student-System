<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Multi-Tool with Undo</title>
  <style>
    #canvas-container {
      position: relative;
      border: 1px solid #ccc;
      width: 800px;
      height: 500px;
    }

    canvas {
      position: absolute;
      left: 0;
      top: 0;
    }

    .toolbar button {
      margin-right: 5px;
    }
  </style>
</head>

<body>

  <div class="toolbar">
    <button onclick="setTool('pencil')">Pencil</button>
    <button onclick="setTool('line')">Line</button>
    <button onclick="setTool('rect')">Square</button>
    <button onclick="setTool('text')">Text</button>
    <button onclick="undo()">Undo</button>
    <input type="file" id="imageLoader" name="imageLoader" />
  </div>

  <div id="canvas-container">
    <canvas id="canvas" width="800" height="500"></canvas>
  </div>

  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let tool = 'pencil';
    let drawing = false;
    let startX = 0,
      startY = 0;
    let img = null;
    const history = []; // Stack for undo

    // Tool setter
    function setTool(selectedTool) {
      tool = selectedTool;
    }

    // Save canvas state for undo
    function saveState() {
      console.log(canvas.toDataURL());

      history.push(canvas.toDataURL());
    }

    // Undo function
    function undo() {
      if (history.length === 0) return;
      const previousState = history.pop();
      const image = new Image();
      image.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
      image.src = previousState;
    }

    // Image loader
    document.getElementById('imageLoader').addEventListener('change', function(e) {
      const reader = new FileReader();
      reader.onload = function(event) {
        img = new Image();
        img.onload = function() {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveState(); // Save after loading image
        }
        img.src = event.target.result;
      }
      reader.readAsDataURL(e.target.files[0]);
    }, false);

    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
      startX = e.offsetX;
      startY = e.offsetY;
      if (tool === 'text') {
        const text = prompt("Enter text:");
        if (text) {
          ctx.font = "20px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(text, startX, startY);
          saveState();
        }
      } else {
        drawing = true;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      const x = e.offsetX;
      const y = e.offsetY;

      if (tool === 'pencil') {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        startX = x;
        startY = y;
      }
    });

    canvas.addEventListener('mouseup', (e) => {
      if (!drawing) return;
      drawing = false;
      const x = e.offsetX;
      const y = e.offsetY;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      }
      saveState(); // Save after each drawing
    });
  </script>

</body>