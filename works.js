// -----------------------------------------------
// BASIC IN-VIEW ANIMATIONS (match homepage)
// -----------------------------------------------
const inAnimations = document.querySelectorAll(".in-animation");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.3 });

inAnimations.forEach(el => observer.observe(el));


// -----------------------------------------------
// DRAGGABLE PORTFOLIO NAV
// -----------------------------------------------
(function() {
    const nav = document.getElementById("project-nav");
    if (!nav) return;

    const links = nav.querySelectorAll("ul li a");
    const sections = Array.from(links).map(link => document.querySelector(link.getAttribute("href")));

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    nav.addEventListener("mousedown", startDrag);
    nav.addEventListener("touchstart", startDrag, { passive: false });

    function startDrag(e) {
        isDragging = true;

        const rect = nav.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);

        document.addEventListener("touchmove", drag, { passive: false });
        document.addEventListener("touchend", endDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - offsetX;
        const y = clientY - offsetY;

        const maxX = window.innerWidth - nav.offsetWidth;
        const maxY = window.innerHeight - nav.offsetHeight;

        nav.style.left = Math.min(Math.max(0, x), maxX) + "px";
        nav.style.top = Math.min(Math.max(0, y), maxY) + "px";

        updateAlignment();
    }

    function endDrag() {
        isDragging = false;
    }

    // Auto-align text based on which side it's on
    function updateAlignment() {
        const rect = nav.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        if (centerX < window.innerWidth / 2) {
            nav.classList.add("align-left");
            nav.classList.remove("align-right");
        } else {
            nav.classList.add("align-right");
            nav.classList.remove("align-left");
        }
    }

    // Active link logic (stays active until next section)
    function updateActiveLink() {
        const scrollPos = window.scrollY + window.innerHeight / 3; // trigger a bit before section top

        let current = sections[0]; // default to first section
        for (let i = 0; i < sections.length; i++) {
            if (scrollPos >= sections[i].offsetTop) {
                current = sections[i];
            }
        }

        links.forEach(link => link.classList.remove("active"));
        const activeLink = nav.querySelector(`ul li a[href="#${current.id}"]`);
        if (activeLink) activeLink.classList.add("active");
    }

    window.addEventListener("scroll", updateActiveLink);
    window.addEventListener("resize", updateActiveLink);

    // Initial checks
    updateAlignment();
    updateActiveLink();
})();


// -----------------------------------------------
// TOOLTIP LOGIC
// -----------------------------------------------
(function() {
    const nav = document.getElementById("project-nav");
    const tip = document.getElementById("drag-tip");

    let tipShown = false;
    let hoverTimeout = null;

    if (!nav || !tip) return;

    nav.addEventListener("mouseenter", () => {
        if (tipShown) return;
        hoverTimeout = setTimeout(() => {
            nav.classList.add("show-tip");
        }, 300);
    });

    nav.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        nav.classList.remove("show-tip");
    });

    nav.addEventListener("mousedown", () => {
        tipShown = true;
        nav.classList.remove("show-tip");
    });

    nav.addEventListener("touchstart", () => {
        tipShown = true;
        nav.classList.remove("show-tip");
    });
})();


// -----------------------------------------------
// CUSTOM CURSOR
// -----------------------------------------------
const cursor = document.querySelector('.cursor');
const pupil = document.querySelector('.pupil');
const hoverTargets = document.querySelectorAll('a, button, .hover-target');


// -----------------------------------------------
// LOGO EYES
// -----------------------------------------------
const eyeLeft = document.querySelector('#eye-left');
const eyeRight = document.querySelector('#eye-right');
const logo = document.querySelector('#logo-MAYO');

let mouseX = 0, mouseY = 0;
let eyeX = 0, eyeY = 0;
let pupilX = 0, pupilY = 0;
let currentScale = 1, targetScale = 1;


// -----------------------------------------------
// MAIN NAVIGATION
// -----------------------------------------------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navMain = document.getElementById("nav");

function updateMenuPosition() {
    const navTop = navMain.getBoundingClientRect().top;
    navLinks.classList.remove("from-top", "from-bottom");

    if (navTop > 50) {
        navLinks.classList.add("from-bottom");
    } else {
        navLinks.classList.add("from-top");
    }
}

hamburger.addEventListener("click", () => {
    updateMenuPosition();
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("open"); // <-- supports X animation

    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
    navLinks.setAttribute("aria-hidden", expanded);
});

window.addEventListener("scroll", updateMenuPosition);


// -----------------------------------------------
// MOBILE PORTFOLIO NAV (NEW)
// -----------------------------------------------
if (window.innerWidth <= 768) { // only on mobile
    // Remove default nav links
    navLinks.innerHTML = '';

    // Clone links from project-nav into mobile nav
    const projectItems = document.querySelectorAll('.project-nav ul li a');
    projectItems.forEach(link => {
        const a = document.createElement('a');
        a.href = link.getAttribute("href");
        a.textContent = link.textContent;
        navLinks.appendChild(a);
    });

    // Ensure mobile nav hidden initially
    navLinks.style.display = 'none';
    navLinks.style.flexDirection = 'column';

    // Hamburger toggles menu visibility
    hamburger.addEventListener('click', () => {
        navLinks.style.display =
            navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}


// ----------------------------------------------------------
// CLOSE MENU WHEN LINK IS CLICKED (mobile only)
// ----------------------------------------------------------
document.addEventListener("click", (e) => {
    if (e.target.closest("#navLinks a")) {
        navLinks.style.display = "none";
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
    }
});


// ----------------------------------------------------------
// ACTIVE PAGE HIGHLIGHTING
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        }
    });
});



// -----------------------------------------------
// MOUSE MOVE
// -----------------------------------------------
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});


// -----------------------------------------------
// HOVER EFFECTS
// -----------------------------------------------
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => targetScale = 1);
  el.addEventListener('mouseleave', () => targetScale = 1.5);
});


// -----------------------------------------------
// CLICK & RANDOM BLINK
// -----------------------------------------------
document.addEventListener('click', () => {
  cursor.classList.add('blink');
  setTimeout(() => cursor.classList.remove('blink'), 300);
});

function randomBlink() {
  cursor.classList.add('blink');
  setTimeout(() => cursor.classList.remove('blink'), 200);
  const nextBlink = 2000 + Math.random() * 3000;
  setTimeout(randomBlink, nextBlink);
}
randomBlink();


// -----------------------------------------------
// ANIMATE CURSOR, PUPIL & EYES
// -----------------------------------------------
let currentAngleLeft = 0;
let currentAngleRight = 0;

function animate() {
  eyeX += (mouseX - eyeX) * 0.15;
  eyeY += (mouseY - eyeY) * 0.15;
  currentScale += (targetScale - currentScale) * 0.15;

  cursor.style.left = `${eyeX}px`;
  cursor.style.top = `${eyeY}px`;
  cursor.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

  const dx = mouseX - eyeX;
  const dy = mouseY - eyeY;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const maxDist = 8;
  let targetX = 0, targetY = 0;
  if(dist > 0.1){
    const scale = Math.min(dist, maxDist)/dist;
    targetX = dx*scale;
    targetY = dy*scale;
  }
  pupilX += (targetX - pupilX)*0.3;
  pupilY += (targetY - pupilY)*0.3;
  pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;

  const eyes = [
    {el: eyeLeft, current: () => currentAngleLeft, set: v => currentAngleLeft = v},
    {el: eyeRight, current: () => currentAngleRight, set: v => currentAngleRight = v}
  ];

  eyes.forEach(eyeObj => {
    const eye = eyeObj.el;
    if(!eye || !logo) return;

    const bbox = eye.getBBox();
    const cx = bbox.x + bbox.width/2;
    const cy = bbox.y + bbox.height/2;

    const svgRect = logo.getBoundingClientRect();
    const centerScreenX = svgRect.left + cx * (svgRect.width / logo.viewBox.baseVal.width);
    const centerScreenY = svgRect.top + cy * (svgRect.height / logo.viewBox.baseVal.height);

    const dxEye = mouseX - centerScreenX;
    const dyEye = mouseY - centerScreenY;

    const targetAngle = Math.atan2(dyEye, dxEye) * (180/Math.PI);
    const easedAngle = eyeObj.current() + (targetAngle - eyeObj.current()) * 0.03;
    eyeObj.set(easedAngle);

    const maxMove = 10;
    const moveX = Math.max(Math.min(dxEye*0.03, maxMove), -maxMove);
    const moveY = Math.max(Math.min(dyEye*0.03, maxMove), -maxMove);

    eye.setAttribute('transform', `translate(${moveX},${moveY}) rotate(${easedAngle} ${cx} ${cy})`);
  });

  requestAnimationFrame(animate);
}

animate();



//---------------------------------------------------------------------
// ACTIVE PAGE HIGHLIGHT — works for both desktop & mobile menus
//---------------------------------------------------------------------
function highlightActivePage() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Run after DOM loaded
document.addEventListener("DOMContentLoaded", highlightActivePage);

// Run again after mobile nav is rebuilt
requestAnimationFrame(highlightActivePage);
requestAnimationFrame(highlightActivePage); // ensures execution after all layout
