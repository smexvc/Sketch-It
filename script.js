document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    const brushColorInput = document.getElementById('brush-color');
    const brushSizeInput = document.getElementById('brush-size');
    const clearCanvasButton = document.getElementById('clear-canvas');
    const downloadButton = document.getElementById('download-canvas');
    const eraserButton = document.getElementById('eraser');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.querySelector('header').offsetHeight - document.querySelector('footer').offsetHeight;

    let painting = false;
    let brushColor = '#000000';
    let brushSize = 5;
    let isErasing = false;
    let undoStack = [];
    let redoStack = [];
    let SHS = [];

    function saveState() {
        if (undoStack.length >= 10) undoStack.shift();
        undoStack.push(canvas.toDataURL());
        redoStack = [];
    }

    function undoLastAction() {
        if (undoStack.length > 0) {
            redoStack.push(undoStack.pop());
            redrawCanvas();
        }
    }

    function redoLastAction() {
        if (redoStack.length > 0) {
            undoStack.push(redoStack.pop());
            redrawCanvas();
        }
    }

    function redrawCanvas() {
        const lastState = new Image();
        lastState.src = undoStack[undoStack.length - 1];
        lastState.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(lastState, 0, 0, canvas.width, canvas.height);
        }
    }

    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        if (!painting) return;
        painting = false;
        ctx.beginPath();
        saveState();
    }

    function draw(e) {
        if (!painting) return;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isErasing ? 'white' : brushColor;

        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    }

    function downloadCanvas() {
        const image = canvas.toDataURL('image/jpeg', 1.0); 
        const link = document.createElement('a');
        link.download = 'sketch.jpg'; 
        link.href = image;
        link.click();
    }

    function toggleEraser() {
        isErasing = !isErasing;
        eraserButton.textContent = isErasing ? 'Paint' : 'Eraser';
        brushColorInput.disabled = isErasing;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', finishedPosition);

    brushColorInput.addEventListener('change', e => brushColor = e.target.value);
    brushSizeInput.addEventListener('input', e => brushSize = e.target.value);

    clearCanvasButton.addEventListener('click', clearCanvas);
    downloadButton.addEventListener('click', downloadCanvas);
    eraserButton.addEventListener('click', toggleEraser);
    undoButton.addEventListener('click', undoLastAction);
    redoButton.addEventListener('click', redoLastAction);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});