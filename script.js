/* ====== script-clean.js — cleaned + commented (cursor + letter tuning) ======
   I cleaned & organized your original script without changing behavior.
   Sections marked "TUNING" show exactly where to change animation math (cursor + letters).
   Keep defaults to preserve visuals. */

/* ----------------------
   Strict mode + DOM ready helper
   ---------------------- */
'use strict';

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("snap-enabled");
});

/* ----------------------
   Helpers
   ---------------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
}

function debounce(fn, wait = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* ----------------------
   DOM references
   ---------------------- */
const body = document.body;
const cursor = $('.cursor');
const pupil = $('.pupil');
const cursorMagnifier = $('.cursor-magnifier');

const hoverTargets = $$('a, button, .hover-target');

const logo = $('#logo-MAYO');                // SVG root
const eyeLeft = $('#eye-left');
const eyeRight = $('#eye-right');

// letters: all polygon/path children of logo except eyes
const letters = $$('#logo-MAYO polygon, #logo-MAYO path').filter(el => el.id !== 'eye-left' && el.id !== 'eye-right');

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

/* ----------------------
   Feature flags & state
   ---------------------- */
/* Disable custom cursor on touch devices by default */
let enableCursor = !isTouchDevice();

if (!enableCursor) {
  if (cursor) cursor.style.display = 'none';
  if (cursorMagnifier) cursorMagnifier.style.display = 'none';
} else {
  body.classList.remove('no-cursor');
}

/* ----------------------
   Animation tuning constants (TUNING AREA)
   Change these to adjust animation "feel" — defaults preserve original behavior.
   - cursorLerp: how quickly the cursor follows the mouse (0.0 - 1.0). Higher = snappier.
   - scaleLerp: how quickly cursor scales when hovering.
   - pupilLerp: smoothing for pupil movement.
   - maxPupil: max pixel offset for pupil center.
   - eyeLerp: smoothing for SVG eye rotation angle.
   - letterTimeStep: controls base speed of letter float.
   - letterAmplitudeLerp: smoothing to interpolate amplitude towards target.
   - letterRotateMultiplier: multiplies rotation effect on letters.
*/
const cursorLerp = 0.15;           // original used 0.15
const scaleLerp = 0.15;            // original used 0.15 for scale lerp
const pupilLerp = 0.3;             // original used 0.3 for pupil smoothing
const maxPupil = 8;                // original hard cap
const eyeLerp = 0.03;              // original used 0.03 for eye angle smoothing

const letterTimeStep = 0.05;       // original increment per frame
const letterAmplitudeLerp = 0.08;  // original used 0.08
const letterRotateMultiplier = 1.7;// original used 1.7

/* ----------------------
   Runtime state
   ---------------------- */
let mouseX = 0, mouseY = 0;
let eyeX = 0, eyeY = 0;
let pupilX = 0, pupilY = 0;
let currentScale = 1, targetScale = 1;

/* ----------------------
   SVG + letter state (computed & recomputed on resize)
   ---------------------- */
let letterState = []; // { el, cx, cy, amplitude, targetAmplitude, phase }
let eyeBoxes = { left: null, right: null }; // cached bboxes

function computeSvgMetrics() {
  if (!logo) return;

  // Rebuild letterState (recalculate centers for transforms)
  letterState = letters.map(l => {
    const b = l.getBBox();
    return {
      el: l,
      cx: b.x + b.width / 2,
      cy: b.y + b.height / 2,
      amplitude: 0,
      targetAmplitude: 0,
      phase: Math.random() * Math.PI * 1.6
    };
  });

  // cache eye bounding boxes (used for center calc)
  if (eyeLeft) eyeBoxes.left = eyeLeft.getBBox();
  if (eyeRight) eyeBoxes.right = eyeRight.getBBox();
}

// run once on load
computeSvgMetrics();

/* Recompute on resize — debounced */
window.addEventListener('resize', debounce(() => {
  computeSvgMetrics();

  // Optional: keep enableCursor in sync with width thresholds (mirrors some CSS breakpoints)
  const shouldDisable = window.innerWidth < 900 || isTouchDevice();
  if (shouldDisable && enableCursor) {
    enableCursor = false;
    body.classList.add('no-cursor');
    if (cursor) cursor.style.display = 'none';
    if (cursorMagnifier) cursorMagnifier.style.display = 'none';
  } else if (!shouldDisable && !enableCursor && !isTouchDevice()) {
    enableCursor = true;
    body.classList.remove('no-cursor');
    if (cursor) cursor.style.display = '';
    if (cursorMagnifier) cursorMagnifier.style.display = '';
  }
}, 120));

/* ----------------------
   Mouse events & hover
   ---------------------- */
if (enableCursor) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => targetScale = 1.5);
    el.addEventListener('mouseleave', () => targetScale = 1);
  });

  document.addEventListener('click', () => {
    if (!cursor) return;
    cursor.classList.add('blink');
    setTimeout(() => cursor.classList.remove('blink'), 300);
  });

  // random blink loop (non-blocking) — TUNING: modify baseDelay / randomRange / blinkDuration
  (function randomBlink() {
    if (!cursor) return;
    cursor.classList.add('blink');
    setTimeout(() => cursor.classList.remove('blink'), 200); // blinkDuration
    setTimeout(randomBlink, 2000 + Math.random() * 3000);    // baseDelay + randomRange
  })();
}

/* ----------------------
   Nav / hamburger behavior
   ---------------------- */
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    if (navLinks) navLinks.classList.toggle('open');
  });
}

// close mobile menu when clicking a nav link (helpful on small screens)
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('active');
      }
    });
  });
}

/* ----------------------
   Big-eye (break section)
   ---------------------- */
const breakSection = $('#break');
const bigEye = $('.big-eye');
const bigPupil = $('.big-eye-ball');
let inBreakSection = false;

if (breakSection) {
  breakSection.addEventListener('mouseenter', () => inBreakSection = true);
  breakSection.addEventListener('mouseleave', () => {
    inBreakSection = false;
    if (pupil) pupil.style.transform = 'translate(0,0)';
  });
}

/* big-eye follows mouse. Note: maxMove is independent here. */
document.addEventListener('mousemove', (e) => {
  if (!bigEye || !bigPupil) return;

  const rect = bigEye.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(e.clientY - cy, e.clientX - cx);

  const maxMove = 75;
  const moveX = Math.cos(angle) * maxMove;
  const moveY = Math.sin(angle) * maxMove;
  bigPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;

  if (inBreakSection && enableCursor && pupil) {
    const angleToBig = Math.atan2(cy - e.clientY, cx - e.clientX);
    pupil.style.transform = `translate(${Math.cos(angleToBig)*8}px, ${Math.sin(angleToBig)*8}px)`;
  }
});

/* ----------------------
   Letter animation (subtle float)
   ---------------------- */
/* TUNING NOTES:
   - letterTimeStep controls the playhead speed (larger = faster movement)
   - letterAmplitudeLerp controls how quickly amplitude eases to target (larger = snappier)
   - letterRotateMultiplier increases rotation effect relative to amplitude
   - targetAmplitude is set on hover; default is 0
*/
letterState.forEach(s => {
  s.el.addEventListener('mouseenter', () => s.targetAmplitude = 1.3);
  s.el.addEventListener('mouseleave', () => s.targetAmplitude = 0);
});

let letterTime = 0;
function animateLetters() {
  // advance time (controls frequency). Increase to speed animation.
  letterTime += letterTimeStep;

  letterState.forEach(s => {
    // ease amplitude toward target
    s.amplitude += (s.targetAmplitude - s.amplitude) * letterAmplitudeLerp;

    // position/rotation math (sin/cos waves)
    const moveX = Math.sin(letterTime + s.phase) * s.amplitude;
    const moveY = Math.cos(letterTime + s.phase) * s.amplitude;
    const rotate = Math.sin(letterTime * 0.5 + s.phase) * s.amplitude * letterRotateMultiplier;

    // apply SVG transform (preserves origin via cx/cy)
    s.el.setAttribute('transform', `translate(${moveX},${moveY}) rotate(${rotate},${s.cx},${s.cy})`);
  });

  requestAnimationFrame(animateLetters);
}
requestAnimationFrame(animateLetters);

/* ----------------------
   Logo eyes: convert SVG viewBox -> screen pixels
   ---------------------- */
function svgPointToScreen(svgEl, x, y) {
  if (!svgEl || !svgEl.viewBox || !svgEl.viewBox.baseVal) {
    const r = svgEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const rect = svgEl.getBoundingClientRect();
  const vb = svgEl.viewBox.baseVal;
  return {
    x: rect.left + (x * rect.width / vb.width),
    y: rect.top + (y * rect.height / vb.height)
  };
}

/* ----------------------
   Main animate loop: cursor, pupil, eyes
   ---------------------- */
/* TUNING NOTES:
   - cursorLerp controls how quickly the visual cursor follows mouse (0.0 - 1.0)
   - scaleLerp controls how quickly the cursor scales when hovering
   - pupilLerp controls smoothness of pupil movement within cursor
   - eyeLerp controls smoothing of SVG eye rotations
   - maxPupil controls the maximum pixel offset for the pupil from center
   To tweak: change the constants in the TUNING AREA at top.
*/
let currentAngleLeft = 0;
let currentAngleRight = 0;

function animate() {
  // cursor + pupil (only when enabled)
  if (enableCursor && cursor) {
    // smooth-follow cursor position
    eyeX += (mouseX - eyeX) * cursorLerp;
    eyeY += (mouseY - eyeY) * cursorLerp;

    // smooth scale
    currentScale += (targetScale - currentScale) * scaleLerp;

    // move cursor element
    cursor.style.left = `${eyeX}px`;
    cursor.style.top = `${eyeY}px`;
    cursor.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

    // compute pupil target (clamped by maxPupil)
    const dx = mouseX - eyeX;
    const dy = mouseY - eyeY;
    const dist = Math.hypot(dx, dy);
    let tx = 0, ty = 0;
    if (dist > 0.1) {
      const scale = Math.min(dist, maxPupil) / dist;
      tx = dx * scale; ty = dy * scale;
    }

    // smooth pupil towards target
    pupilX += (tx - pupilX) * pupilLerp;
    pupilY += (ty - pupilY) * pupilLerp;
    if (pupil) pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
  }

  // logo eyes — work even if cursor disabled (use last known mouse pos)
  if (logo && (eyeLeft || eyeRight)) {
    const eyes = [];
    if (eyeLeft) eyes.push({ el: eyeLeft, cache: eyeBoxes.left, angleState: 'left' });
    if (eyeRight) eyes.push({ el: eyeRight, cache: eyeBoxes.right, angleState: 'right' });

eyes.forEach((eyeObj, idx) => {
    const el = eyeObj.el;
    const bbox = eyeObj.cache || el.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const screen = svgPointToScreen(logo, cx, cy);

    const dxEye = mouseX - screen.x;
    const dyEye = mouseY - screen.y;
    const targetAngle = Math.atan2(dyEye, dxEye) * (180 / Math.PI);

    // === Smooth angle interpolation (NO JUMP FIX) ===
    if (idx === 0) {
        let diff = targetAngle - currentAngleLeft;
        diff = ((diff + 180) % 360) - 180;  // wrap
        currentAngleLeft += diff * 0.03;
    } else {
        let diff = targetAngle - currentAngleRight;
        diff = ((diff + 180) % 360) - 180; // wrap
        currentAngleRight += diff * 0.03;
    }

    const currentAngle = idx === 0 ? currentAngleLeft : currentAngleRight;

    const maxMove = 10;
    const moveX = Math.max(Math.min(dxEye * 0.03, maxMove), -maxMove);
    const moveY = Math.max(Math.min(dyEye * 0.03, maxMove), -maxMove);

    el.setAttribute(
      'transform',
      `translate(${moveX},${moveY}) rotate(${currentAngle} ${cx} ${cy})`
    );
});

  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* ----------------------
   Animate NAV + HERO on load
   ---------------------- */
window.addEventListener("DOMContentLoaded", () => {
    const immediate = document.querySelectorAll(
        "nav .in-animation, .hero .in-animation, .nav-logo"
    );

    immediate.forEach(el => {
        el.classList.add("show");
    });
});

/* ----------------------
   IntersectionObserver for .in-animation
   ---------------------- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            observer.unobserve(entry.target); // prevents re-triggers
        }
    });
}, { 
    threshold: 0.2 // forgiving threshold to catch things early
});

/* Observe all .in-animation EXCEPT nav + hero */
document.addEventListener("DOMContentLoaded", () => {
    const animatedItems = document.querySelectorAll(".in-animation");

    animatedItems.forEach((item) => {
        // Skip nav + hero items (they animate on load)
        if (
            item.closest("nav") ||
            item.closest(".hero") ||
            item.classList.contains("nav-logo")
        ) return;

        observer.observe(item);
    });
});

const cards = document.querySelectorAll('.carousel-card');
let index = 0;

function showCard(i) {
  cards.forEach(card => card.classList.remove('active'));
  cards[i].classList.add('active');
}

document.querySelector('.next').addEventListener('click', () => {
  index = (index + 1) % cards.length;
  showCard(index);
});

document.querySelector('.prev').addEventListener('click', () => {
  index = (index - 1 + cards.length) % cards.length;
  showCard(index);
});
