document.addEventListener('DOMContentLoaded', () => {

    // --- CLOCK ---
    const clockElement = document.getElementById('clock');
    if (clockElement) { const updateClock = () => { const now = new Date(); const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; const day = days[now.getDay()]; let hours = now.getHours(); hours = hours < 10 ? '0' + hours : hours; let minutes = now.getMinutes(); minutes = minutes < 10 ? '0' + minutes : minutes; let seconds = now.getSeconds(); seconds = seconds < 10 ? '0' + seconds : seconds; const timeString = `${day} ${hours}:${minutes}:${seconds}`; clockElement.textContent = timeString; }; updateClock(); setInterval(updateClock, 1000); }
    
    // --- WINDOW MANAGEMENT ---
    let topZ = 1;
    const bringToFront = (windowEl) => { topZ++; windowEl.style.zIndex = topZ; };
    const openWindow = (windowEl) => { if (windowEl.classList.contains('hidden')) { const viewportWidth = window.innerWidth; const viewportHeight = window.innerHeight; const MENU_BAR_HEIGHT = 28; const BORDER_BUFFER = 20; const style = getComputedStyle(windowEl); let finalWidth = parseFloat(style.width); let finalHeight = parseFloat(style.height); let finalTop = parseFloat(style.top); let finalLeft = parseFloat(style.left); if ((finalLeft + finalWidth) > viewportWidth) { finalWidth = viewportWidth - finalLeft - BORDER_BUFFER; } if ((finalTop + finalHeight) > viewportHeight) { finalHeight = viewportHeight - finalTop - BORDER_BUFFER; } if (finalLeft < 0) { finalLeft = BORDER_BUFFER; } if (finalTop < MENU_BAR_HEIGHT) { finalTop = MENU_BAR_HEIGHT + BORDER_BUFFER; } windowEl.style.width = `${finalWidth}px`; windowEl.style.height = `${finalHeight}px`; windowEl.style.top = `${finalTop}px`; windowEl.style.left = `${finalLeft}px`; } windowEl.classList.remove('hidden'); bringToFront(windowEl); };
    const dragElement = (elmnt) => { const titleBar = elmnt.querySelector(".window-title-bar, .safari-toolbar"); let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; const MENU_BAR_HEIGHT = 28; if (titleBar) { titleBar.onmousedown = dragMouseDown; } function dragMouseDown(e) { if (elmnt.classList.contains('maximized')) { return; } e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmousemove = elementDrag; document.onmouseup = closeDragElement; } function elementDrag(e) { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; let newTop = elmnt.offsetTop - pos2; if (newTop < MENU_BAR_HEIGHT) { newTop = MENU_BAR_HEIGHT; } elmnt.style.top = newTop + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; } function closeDragElement() { document.onmouseup = null; document.onmousemove = null; } };
    const resizableElement = (elmnt) => { const resizers = elmnt.querySelectorAll(".resizer"); const MIN_WIDTH = 250; const MIN_HEIGHT = 150; resizers.forEach(resizer => { resizer.addEventListener('mousedown', resizeMouseDown); }); function resizeMouseDown(e) { e.preventDefault(); const original_width = parseFloat(getComputedStyle(elmnt, null).getPropertyValue('width').replace('px', '')); const original_height = parseFloat(getComputedStyle(elmnt, null).getPropertyValue('height').replace('px', '')); const original_x = elmnt.getBoundingClientRect().left; const original_y = elmnt.getBoundingClientRect().top; const original_mouse_x = e.pageX; const original_mouse_y = e.pageY; const currentResizer = e.target; const elementResize = (e) => { const width = original_width + (e.pageX - original_mouse_x); const height = original_height + (e.pageY - original_mouse_y); const left = original_x + (e.pageX - original_mouse_x); const top = original_y + (e.pageY - original_mouse_y); if (currentResizer.classList.contains('bottom-right')) { if (width > MIN_WIDTH) elmnt.style.width = width + 'px'; if (height > MIN_HEIGHT) elmnt.style.height = height + 'px'; } else if (currentResizer.classList.contains('bottom-left')) { if (height > MIN_HEIGHT) elmnt.style.height = height + 'px'; if (original_width - (e.pageX - original_mouse_x) > MIN_WIDTH) { elmnt.style.width = original_width - (e.pageX - original_mouse_x) + 'px'; elmnt.style.left = left + 'px'; } } else if (currentResizer.classList.contains('top-right')) { if (width > MIN_WIDTH) elmnt.style.width = width + 'px'; if (original_height - (e.pageY - original_mouse_y) > MIN_HEIGHT) { elmnt.style.height = original_height - (e.pageY - original_mouse_y) + 'px'; elmnt.style.top = top + 'px'; } } else { if (original_width - (e.pageX - original_mouse_x) > MIN_WIDTH) { elmnt.style.width = original_width - (e.pageX - original_mouse_x) + 'px'; elmnt.style.left = left + 'px'; } if (original_height - (e.pageY - original_mouse_y) > MIN_HEIGHT) { elmnt.style.height = original_height - (e.pageY - original_mouse_y) + 'px'; elmnt.style.top = top + 'px'; } } }; const closeResizeElement = () => { window.removeEventListener('mousemove', elementResize); window.removeEventListener('mouseup', closeResizeElement); }; window.addEventListener('mousemove', elementResize); window.addEventListener('mouseup', closeResizeElement); } };
    
    // --- UNIVERSAL WINDOW INITIALIZATION ---
    function initializeWindow(iconId) { const icon = document.getElementById(iconId); if (!icon) return; const windowId = icon.id.replace('-icon', '-window'); const windowEl = document.getElementById(windowId); if (icon && windowEl) { let mouseDownTime = 0; let isDragging = false; icon.addEventListener('mousedown', () => { mouseDownTime = Date.now(); isDragging = false; }); icon.addEventListener('mousemove', () => { isDragging = true; }); icon.addEventListener('mouseup', () => { const timeElapsed = Date.now() - mouseDownTime; if (timeElapsed < 250 && !isDragging) { openWindow(windowEl); } }); windowEl.querySelector('.close').addEventListener('click', () => windowEl.classList.add('hidden')); windowEl.querySelector('.maximize')?.addEventListener('click', () => windowEl.classList.toggle('maximized')); windowEl.addEventListener('mousedown', () => bringToFront(windowEl)); dragElement(windowEl); resizableElement(windowEl); } }
    
    document.querySelectorAll('.icon').forEach(icon => initializeWindow(icon.id));
    
    // --- DOCK MAGNIFICATION ---
    const dockContainer = document.querySelector('.dock');
    if (dockContainer) { const icons = dockContainer.querySelectorAll('.icon'); const defaultIconSize = 60; const maxIconSize = 85; const magnificationRange = 100; const handleMouseMove = (e) => { const mouseX = e.clientX; icons.forEach(icon => { const rect = icon.getBoundingClientRect(); const iconCenter = rect.left + rect.width / 2; const distance = Math.abs(mouseX - iconCenter); let newSize = defaultIconSize; if (distance < magnificationRange) { const falloff = distance / magnificationRange; newSize = defaultIconSize + (maxIconSize - defaultIconSize) * (1 - falloff); } const margin = (newSize - defaultIconSize) / -2; icon.style.width = `${newSize}px`; icon.style.height = `${newSize}px`; icon.style.marginLeft = `${margin}px`; icon.style.marginRight = `${margin}px`; }); }; const handleMouseLeave = () => { icons.forEach(icon => { icon.style.width = `${defaultIconSize}px`; icon.style.height = `${defaultIconSize}px`; icon.style.marginLeft = '0'; icon.style.marginRight = '0'; }); }; dockContainer.addEventListener('mousemove', handleMouseMove); dockContainer.addEventListener('mouseleave', handleMouseLeave); }

    // --- PROFILE TABS ---
    document.querySelectorAll('.tab-link').forEach(button => { button.addEventListener('click', () => { const tabContainer = button.closest('.cv-body'); if (!tabContainer) return; const tabName = button.dataset.tab; tabContainer.querySelector('.tab-link.active')?.classList.remove('active'); button.classList.add('active'); tabContainer.querySelector('.cv-tab-content.active')?.classList.remove('active'); const newActiveContent = tabContainer.querySelector(`#${tabName}`); if (newActiveContent) newActiveContent.classList.add('active'); }); });
    
    // --- COLLAPSIBLE BIO ON MOBILE ---
    const cvWindowBody = document.querySelector('#finder-window .cv-body');
    if(cvWindowBody) { cvWindowBody.addEventListener('scroll', () => { const header = cvWindowBody.querySelector('.cv-header'); if(header) { if (cvWindowBody.scrollTop > 10) { header.classList.add('collapsed'); } else { header.classList.remove('collapsed'); } } }); }
    document.querySelectorAll('.bio-toggle-link').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const bioParagraph = link.previousElementSibling; if (bioParagraph) { bioParagraph.classList.toggle('collapsed'); link.textContent = bioParagraph.classList.contains('collapsed') ? 'Show more' : 'Show less'; } }); });
    
    // --- DIALOG WINDOW OPENER ---
    const fileMenuButton = document.getElementById('file-menu-btn');
    if(fileMenuButton) { fileMenuButton.addEventListener('click', (e) => { e.preventDefault(); const dialogWindow = document.getElementById('dialog-window'); if(dialogWindow) { openWindow(dialogWindow); } }); }

    // --- THEME TOGGLE ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) { themeToggleButton.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); const isDarkMode = document.body.classList.contains('dark-mode'); themeToggleButton.textContent = isDarkMode ? 'Light' : 'Dark'; }); }
});

// js/main.js

/* ========================================================================= */
/* --- DRAGGABLE & RANDOM DESKTOP ICONS --- */
/* ========================================================================= */

const desktop = document.getElementById('desktop');
if (desktop) {
    const desktopIcons = desktop.querySelectorAll('.icon');
    const MENU_BAR_HEIGHT = 28;

    // --- Function to drag desktop icons ---
    const dragDesktopIcon = (elmnt) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        const dragMouseDown = (e) => {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };
        
        const elementDrag = (e) => {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            let newTop = elmnt.offsetTop - pos2;
            let newLeft = elmnt.offsetLeft - pos1;

            // Prevent dragging under the menu bar
            if (newTop < 0) newTop = 0;
            
            elmnt.style.top = newTop + "px";
            elmnt.style.left = newLeft + "px";
        };

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        elmnt.onmousedown = dragMouseDown;
    };

    // --- Position and activate each desktop icon ---
    desktopIcons.forEach(icon => {
        // 1. Set a random initial position
        const desktopWidth = desktop.clientWidth;
        const desktopHeight = desktop.clientHeight;
        
        const randomTop = Math.random() * (desktopHeight - 150) + 20; // -150 to avoid bottom, +20 to avoid top
        const randomLeft = Math.random() * (desktopWidth - 150) + 20;

        icon.style.top = `${randomTop}px`;
        icon.style.left = `${randomLeft}px`;

        // 2. Make it draggable
        dragDesktopIcon(icon);
    });
}

// --- DIALOG WINDOW OPENER ---
const fileMenuButton = document.getElementById('file-menu-btn');
if(fileMenuButton) {
    fileMenuButton.addEventListener('click', (e) => {
        e.preventDefault();
        const dialogWindow = document.getElementById('dialog-window');
        if(dialogWindow) {
            openWindow(dialogWindow);
        }
    });
}