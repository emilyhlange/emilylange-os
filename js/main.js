// js/main.js (FINAL CORRECTED VERSION)

document.addEventListener("DOMContentLoaded", () => {
  // --- CLOCK ---
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    const updateClock = () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[now.getDay()];
      let hours = now.getHours();
      hours = hours < 10 ? "0" + hours : hours;
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? "0" + minutes : minutes;
      let seconds = now.getSeconds();
      seconds = seconds < 10 ? "0" + seconds : seconds;
      const timeString = `${day} ${hours}:${minutes}:${seconds}`;
      clockElement.textContent = timeString;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // --- WINDOW MANAGEMENT ---
  let topZ = 1;
  const bringToFront = (windowEl) => {
    topZ++;
    if (topZ > 10000) {
      // Reset all windows' z-index to 1 if overflow
      document.querySelectorAll('.window').forEach(win => win.style.zIndex = 1);
      topZ = 2;
    }
    windowEl.style.zIndex = topZ;
  };
  const openWindow = (windowEl) => {
    if (windowEl.classList.contains("hidden")) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const MENU_BAR_HEIGHT = 28;
      const BORDER_BUFFER = 20;
      const style = getComputedStyle(windowEl);
      let finalWidth = parseFloat(style.width);
      let finalHeight = parseFloat(style.height);
      let finalTop = parseFloat(style.top);
      let finalLeft = parseFloat(style.left);
      if (finalLeft + finalWidth > viewportWidth) {
        finalWidth = viewportWidth - finalLeft - BORDER_BUFFER;
      }
      if (finalTop + finalHeight > viewportHeight) {
        finalHeight = viewportHeight - finalTop - BORDER_BUFFER;
      }
      if (finalLeft < 0) {
        finalLeft = BORDER_BUFFER;
      }
      if (finalTop < MENU_BAR_HEIGHT) {
        finalTop = MENU_BAR_HEIGHT + BORDER_BUFFER;
      }
      windowEl.style.width = `${finalWidth}px`;
      windowEl.style.height = `${finalHeight}px`;
      windowEl.style.top = `${finalTop}px`;
      windowEl.style.left = `${finalLeft}px`;
    }
    windowEl.classList.remove("hidden");
    bringToFront(windowEl);
  };
  const dragElement = (elmnt) => {
    const titleBar = elmnt.querySelector(".window-title-bar, .safari-toolbar");
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (titleBar) {
      titleBar.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
      if (elmnt.classList.contains("maximized")) {
        return;
      }
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmousemove = elementDrag;
      document.onmouseup = closeDragElement;
    }
    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  };
  const resizableElement = (elmnt) => {
    const resizers = elmnt.querySelectorAll(".resizer");
    const MIN_WIDTH = 250;
    const MIN_HEIGHT = 150;
    resizers.forEach((resizer) => {
      resizer.addEventListener("mousedown", resizeMouseDown);
    });
    function resizeMouseDown(e) {
      e.preventDefault();
      const original_width = parseFloat(
        getComputedStyle(elmnt, null)
          .getPropertyValue("width")
          .replace("px", "")
      );
      const original_height = parseFloat(
        getComputedStyle(elmnt, null)
          .getPropertyValue("height")
          .replace("px", "")
      );
      const original_x = elmnt.getBoundingClientRect().left;
      const original_y = elmnt.getBoundingClientRect().top;
      const original_mouse_x = e.pageX;
      const original_mouse_y = e.pageY;
      const currentResizer = e.target;
      const elementResize = (e) => {
        const width = original_width + (e.pageX - original_mouse_x);
        const height = original_height + (e.pageY - original_mouse_y);
        const left = original_x + (e.pageX - original_mouse_x);
        const top = original_y + (e.pageY - original_mouse_y);
        if (currentResizer.classList.contains("bottom-right")) {
          if (width > MIN_WIDTH) elmnt.style.width = width + "px";
          if (height > MIN_HEIGHT) elmnt.style.height = height + "px";
        } else if (currentResizer.classList.contains("bottom-left")) {
          if (height > MIN_HEIGHT) elmnt.style.height = height + "px";
          if (original_width - (e.pageX - original_mouse_x) > MIN_WIDTH) {
            elmnt.style.width =
              original_width - (e.pageX - original_mouse_x) + "px";
            elmnt.style.left = left + "px";
          }
        } else if (currentResizer.classList.contains("top-right")) {
          if (width > MIN_WIDTH) elmnt.style.width = width + "px";
          if (original_height - (e.pageY - original_mouse_y) > MIN_HEIGHT) {
            elmnt.style.height =
              original_height - (e.pageY - original_mouse_y) + "px";
            elmnt.style.top = top + "px";
          }
        } else {
          if (original_width - (e.pageX - original_mouse_x) > MIN_WIDTH) {
            elmnt.style.width =
              original_width - (e.pageX - original_mouse_x) + "px";
            elmnt.style.left = left + "px";
          }
          if (original_height - (e.pageY - original_mouse_y) > MIN_HEIGHT) {
            elmnt.style.height =
              original_height - (e.pageY - original_mouse_y) + "px";
            elmnt.style.top = top + "px";
          }
        }
      };
      const closeResizeElement = () => {
        window.removeEventListener("mousemove", elementResize);
        window.removeEventListener("mouseup", closeResizeElement);
      };
      window.addEventListener("mousemove", elementResize);
      window.addEventListener("mouseup", closeResizeElement);
    }
  };

  // --- WINDOW INITIALIZATION LOGIC ---
  function initializeWindow(iconEl) {
    const windowId = iconEl.id.replace('-icon', '-window');
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
        // Accessibility: make icon keyboard accessible
        iconEl.setAttribute('tabindex', '0');
        iconEl.setAttribute('role', 'button');
        iconEl.setAttribute('aria-label', iconEl.querySelector('span')?.textContent || 'Open window');
        iconEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openWindow(windowEl);
            e.preventDefault();
          }
        });
        // Logic to open window on click
        let mouseDownTime = 0;
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;
        iconEl.addEventListener('mousedown', (e) => {
            mouseDownTime = Date.now();
            isDragging = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        });
        iconEl.addEventListener('mousemove', (e) => {
            // Only set isDragging if moved more than 5px
            if (!isDragging && (Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5)) {
                isDragging = true;
            }
        });
        iconEl.addEventListener('mouseup', () => {
            const timeElapsed = Date.now() - mouseDownTime;
            if (timeElapsed < 250 && !isDragging) {
                openWindow(windowEl);
            }
        });
        // Setup window buttons and core functions (robust)
        const closeBtn = windowEl.querySelector('.close');
        if (closeBtn) {
          if (!closeBtn.querySelector('svg')) {
            closeBtn.innerHTML = '<svg viewBox="0 0 10 10" width="10" height="10"><path d="M0,0 L10,10 M10,0 L0,10" stroke="#555" stroke-width="1.8"/></svg>';
          }
          closeBtn.addEventListener('click', () => windowEl.classList.add('hidden'));
        }
        const maximizeBtn = windowEl.querySelector('.maximize');
        if (maximizeBtn) {
          maximizeBtn.addEventListener('click', () => windowEl.classList.toggle('maximized'));
        }
        windowEl.addEventListener('mousedown', () => bringToFront(windowEl));
        dragElement(windowEl);
        resizableElement(windowEl);
    }
}

  // --- DRAGGABLE DESKTOP ICONS LOGIC ---
  const dragDesktopIcon = (iconEl) => {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const dragTarget =
      iconEl.parentNode.tagName === "A" ? iconEl.parentNode : iconEl;

    // Mouse events
    const dragMouseDown = (e) => {
      if (e.target.closest(".window")) return; // Prevent interference
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
      dragTarget.style.top = dragTarget.offsetTop - pos2 + "px";
      dragTarget.style.left = dragTarget.offsetLeft - pos1 + "px";
    };
    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
      // Save icon position to localStorage
      saveIconPositions();
    };
    iconEl.onmousedown = dragMouseDown;

    // Touch events
    const dragTouchStart = (e) => {
      if (e.target.closest(".window")) return;
      if (e.touches.length !== 1) return;
      e.preventDefault();
      pos3 = e.touches[0].clientX;
      pos4 = e.touches[0].clientY;
      document.ontouchmove = elementTouchDrag;
      document.ontouchend = closeTouchDragElement;
    };
    const elementTouchDrag = (e) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      dragTarget.style.top = dragTarget.offsetTop - pos2 + "px";
      dragTarget.style.left = dragTarget.offsetLeft - pos1 + "px";
    };
    const closeTouchDragElement = () => {
      document.ontouchmove = null;
      document.ontouchend = null;
      saveIconPositions();
    };
    iconEl.ontouchstart = dragTouchStart;
  };

  // --- ICON POSITION PERSISTENCE ---
  function saveIconPositions() {
    const positions = {};
    document.querySelectorAll("#desktop .icon").forEach(icon => {
      positions[icon.id] = {
        top: icon.style.top,
        left: icon.style.left
      };
    });
    localStorage.setItem("desktopIconPositions", JSON.stringify(positions));
  }

  function restoreIconPositions() {
    const positions = JSON.parse(localStorage.getItem("desktopIconPositions") || '{}');
    document.querySelectorAll("#desktop .icon").forEach(icon => {
      if (positions[icon.id]) {
        icon.style.top = positions[icon.id].top;
        icon.style.left = positions[icon.id].left;
      }
    });
  }

  // --- SETUP ALL ELEMENTS ON PAGE LOAD ---
  document.querySelectorAll(".icon").forEach((icon) => {
    // Setup window opening for all icons
    initializeWindow(icon);

    // If an icon is on the desktop, make it draggable and position it
    if (icon.closest("#desktop")) {
      const desktop = document.getElementById("desktop");
      const ICON_SIZE = 150;
      // Only randomize if no saved position
      if (!icon.style.top || !icon.style.left) {
        let top, left, isOverlapping;
        do {
          top = Math.random() * (desktop.clientHeight - ICON_SIZE) + 20;
          left = Math.random() * (desktop.clientWidth - ICON_SIZE) + 20;
          isOverlapping = Array.from(desktop.querySelectorAll(".icon")).some((otherIcon) => {
            if (otherIcon === icon) return false;
            const otherTop = parseFloat(otherIcon.style.top || 0);
            const otherLeft = parseFloat(otherIcon.style.left || 0);
            return (
              Math.abs(top - otherTop) < ICON_SIZE &&
              Math.abs(left - otherLeft) < ICON_SIZE
            );
          });
        } while (isOverlapping);
        icon.style.top = `${top}px`;
        icon.style.left = `${left}px`;
      }
      dragDesktopIcon(icon);
    }
  });
  // Restore icon positions after all icons are initialized
  restoreIconPositions();

  // --- OTHER EVENT LISTENERS ---
  const themeToggleButton = document.getElementById("theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      themeToggleButton.textContent = document.body.classList.contains(
        "dark-mode"
      )
        ? "Lighten"
        : "Darken";
    });
  }
});