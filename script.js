


// -----------------------------
// CUSTOM CURSOR
// -----------------------------
const cursor = document.querySelector('.cursor');
const pupil = document.querySelector('.pupil');
const hoverTargets = document.querySelectorAll('a, button, .hover-target');


// -----------------------------
// LOGO EYES
// -----------------------------
const eyeLeft = document.querySelector('#eye-left');
const eyeRight = document.querySelector('#eye-right');
const logo = document.querySelector('#logo-MAYO');

let mouseX = 0, mouseY = 0;
let eyeX = 0, eyeY = 0;
let pupilX = 0, pupilY = 0;
let currentScale = 1, targetScale = 1;



const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const nav = document.getElementById("nav");

function updateMenuPosition() {
    const navTop = nav.getBoundingClientRect().top;

    navLinks.classList.remove("from-top", "from-bottom");

    if (navTop > 50) {
        navLinks.classList.add("from-bottom");  // nav at bottom → menu slides UP
    } else {
        navLinks.classList.add("from-top");     // nav at top → menu slides DOWN
    }
}

hamburger.addEventListener("click", () => {
    updateMenuPosition();
    navLinks.classList.toggle("open");

    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
    navLinks.setAttribute("aria-hidden", expanded);
});

window.addEventListener("scroll", updateMenuPosition);



// -----------------------------
// MOUSE MOVE
// -----------------------------
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// -----------------------------
// HOVER EFFECTS
// -----------------------------
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => targetScale = 1);
  el.addEventListener('mouseleave', () => targetScale = 1.5);
});


// -----------------------------
// CLICK BLINK
// -----------------------------
document.addEventListener('click', () => {
  cursor.classList.add('blink');
  setTimeout(() => cursor.classList.remove('blink'), 300);
});

// -----------------------------
// RANDOM BLINK
// -----------------------------
function randomBlink() {
  cursor.classList.add('blink');
  setTimeout(() => cursor.classList.remove('blink'), 200);
  const nextBlink = 2000 + Math.random() * 3000;
  setTimeout(randomBlink, nextBlink);
}
randomBlink();

// -----------------------------
// ANIMATE CURSOR, PUPIL & EYES
// -----------------------------
let currentAngleLeft = 0;
let currentAngleRight = 0;

function animate() {
  // Smooth cursor movement
  eyeX += (mouseX - eyeX) * 0.15;
  eyeY += (mouseY - eyeY) * 0.15;
  currentScale += (targetScale - currentScale) * 0.15;

  cursor.style.left = `${eyeX}px`;
  cursor.style.top = `${eyeY}px`;
  cursor.style.transform = `translate(-50%, -50%) scale(${currentScale})`;

  // Pupil follows cursor
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

  // Logo eyes rotation around their geometric centers
  const eyes = [
    {el: eyeLeft, current: () => currentAngleLeft, set: v => currentAngleLeft = v},
    {el: eyeRight, current: () => currentAngleRight, set: v => currentAngleRight = v}
  ];

  eyes.forEach(eyeObj => {
    const eye = eyeObj.el;
    if(!eye || !logo) return;

    const bbox = eye.getBBox();
    const cx = bbox.x + bbox.width/2;  // geometric center
    const cy = bbox.y + bbox.height/2;

    const svgRect = logo.getBoundingClientRect();
    const centerScreenX = svgRect.left + cx * (svgRect.width / logo.viewBox.baseVal.width);
    const centerScreenY = svgRect.top + cy * (svgRect.height / logo.viewBox.baseVal.height);

    const dxEye = mouseX - centerScreenX;
    const dyEye = mouseY - centerScreenY;

    const targetAngle = Math.atan2(dyEye, dxEye) * (180/Math.PI);
    const easedAngle = eyeObj.current() + (targetAngle - eyeObj.current()) * 0.03 // easing
    eyeObj.set(easedAngle);

    const maxMove = 10;
    const moveX = Math.max(Math.min(dxEye*0.03, maxMove), -maxMove);
    const moveY = Math.max(Math.min(dyEye*0.03, maxMove), -maxMove);

    eye.setAttribute('transform', `translate(${moveX},${moveY}) rotate(${easedAngle} ${cx} ${cy})`);
  });

  requestAnimationFrame(animate);
}

animate();





// -----------------------------
// INTERSECTION OBSERVER
// -----------------------------
const inElements = document.querySelectorAll('.in-animation');
inElements.forEach((el,i) => el.style.transitionDelay = `${i*0.05}s`);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('show');   // trigger animation once
      observer.unobserve(entry.target);     // stop observing so it won't trigger again
    }
  });
}, { threshold: 0.1 });

inElements.forEach(el => observer.observe(el));







// -----------------------------
// LETTER ANIMATION
// -----------------------------
const letters = Array.from(document.querySelectorAll('#logo-MAYO polygon, #logo-MAYO path'))
  .filter(el => el.id !== 'eye-left' && el.id !== 'eye-right'); // exclude eyes

// Initialize state for each letter
const letterState = letters.map(letter => {
  const bbox = letter.getBBox();
  return {
    el: letter,
    cx: bbox.x + bbox.width / 2,
    cy: bbox.y + bbox.height / 2,
    amplitude: 0,
    targetAmplitude: 0,
    phase: Math.random() * Math.PI * 1
  };
});

// Hover triggers
letters.forEach((letter, i) => {
  letter.addEventListener('mouseenter', () => letterState[i].targetAmplitude = 1.2); // subtle
  letter.addEventListener('mouseleave', () => letterState[i].targetAmplitude = 0);
});

let time = 0;

function animateLetters() {
  time += 0.03; // slower for subtle motion

  letterState.forEach(state => {
    // Smooth easing towards target amplitude
    state.amplitude += (state.targetAmplitude - state.amplitude) * 0.08;

    // Small translations
    const moveX = Math.sin(time + state.phase) * state.amplitude;
    const moveY = Math.cos(time + state.phase) * state.amplitude;

    // Subtle rotation
    const rotate = Math.sin(time * 0.5 + state.phase) * state.amplitude * 2; // smaller multiplier for subtlety

    state.el.setAttribute('transform', `translate(${moveX},${moveY}) rotate(${rotate},${state.cx},${state.cy})`);
  });

  requestAnimationFrame(animateLetters);
}

animateLetters();



const magnifier = document.querySelector('.cursor-magnifier');
const magnifierContent = document.querySelector('.magnifier-content');

document.addEventListener('mousemove', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // position the circular lens
  magnifier.style.left = `${x}px`;
  magnifier.style.top = `${y}px`;

  // move the zoomed layer so the right area appears under the lens
  magnifierContent.style.transform = `translate(-${x}px, -${y}px) scale(2)`;
});


