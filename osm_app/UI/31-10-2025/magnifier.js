function setupMagnifier(imageElement) {
    if (!imageElement) return;

    let magnifierLens = document.createElement('div');
    let imageElementReal = imageElement; // Keep original reference

    // Style the lens
    magnifierLens.classList.add('magnifier-lens');
    magnifierLens.style.position = 'absolute';
    magnifierLens.style.border = '1px solid #000';
    magnifierLens.style.borderRadius = '50%';
    magnifierLens.style.width = '200px';
    magnifierLens.style.height = '200px';
    magnifierLens.style.pointerEvents = 'none';
    magnifierLens.style.boxShadow = '0 0 5px #000';
    magnifierLens.style.visibility = 'hidden';
    magnifierLens.style.cursor = 'crosshair';
    magnifierLens.style.backgroundRepeat = 'no-repeat';
    document.body.appendChild(magnifierLens);

    let magnifierSize = 200;
    let magnificationFactor = 3;

    function updateLensMagnification(mouseX, mouseY) {
        if (!imageElement) return;

        magnifierLens.style.backgroundImage = `url('${imageElement.src}')`;
        magnifierLens.style.backgroundSize = `${imageElement.width * magnificationFactor}px ${imageElement.height * magnificationFactor}px`;
        let bgPosX = -(mouseX * magnificationFactor - magnifierLens.offsetWidth / 2);
        let bgPosY = -(mouseY * magnificationFactor - magnifierLens.offsetHeight / 2);
        magnifierLens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
    }

    function updateMagnifierSize(deltaY) {
        magnifierSize += deltaY > 0 ? -20 : 20;
        magnifierSize = Math.max(100, Math.min(magnifierSize, 400));
        magnificationFactor = 2 + (magnifierSize - 100) * (5 - 2) / (400 - 100);
        magnifierLens.style.width = magnifierSize + 'px';
        magnifierLens.style.height = magnifierSize + 'px';
    }

    function mouseMoveHandler(e) {
        magnifierLens.style.visibility = 'visible';
        let bounds = imageElement.getBoundingClientRect();
        let mouseX = e.clientX - bounds.left;
        let mouseY = e.clientY - bounds.top;

        magnifierLens.style.left = (bounds.left + window.pageXOffset + mouseX - magnifierLens.offsetWidth / 2) + 'px';
        magnifierLens.style.top = (bounds.top + window.pageYOffset + mouseY - magnifierLens.offsetHeight / 2) + 'px';

        updateLensMagnification(mouseX, mouseY);
        imageElement.style.cursor = 'none';
    }

    function mouseLeaveHandler() {
        magnifierLens.style.visibility = 'hidden';
        imageElement.style.cursor = 'default';
    }

    function wheelHandler(e) {
        e.preventDefault();
        updateMagnifierSize(e.deltaY);
        // Update background with current mouse position
        let bounds = imageElement.getBoundingClientRect();
        let mouseX = e.clientX - bounds.left;
        let mouseY = e.clientY - bounds.top;
        updateLensMagnification(mouseX, mouseY);
    }

    // Attach events
    imageElement.addEventListener('mousemove', mouseMoveHandler);
    imageElement.addEventListener('mouseleave', mouseLeaveHandler);
    imageElement.addEventListener('wheel', wheelHandler, { passive: false });
    $(imageElement).siblings('canvas').hide(); 


    // Return destroy function
    return () => {
        magnifierLens.remove();
        imageElement.removeEventListener('mousemove', mouseMoveHandler);
        imageElement.removeEventListener('mouseleave', mouseLeaveHandler);
        imageElement.removeEventListener('wheel', wheelHandler);
        $(imageElement).siblings('canvas').show(); 
    };
}

function destroyMagnifier(cleanupFn) {
    if (cleanupFn) cleanupFn();
}
