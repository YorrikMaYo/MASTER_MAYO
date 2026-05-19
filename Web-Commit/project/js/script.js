// 1. Setup the Observer
const observerOptions = {
    root: null,
    rootMargin: "0px 0px -5% 0px",
    threshold: 0
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
    // Reveal Observer setup
    const elementsToReveal = document.querySelectorAll(".reveal");
    elementsToReveal.forEach(el => revealObserver.observe(el));

    // Carousel setup
    const projects = [
        {
            title: "The table is served",
            desc: `A magazine project By Marcel van Ranst.
Combining photography, typography and printed lay-out in an experimental art-book.

An academical work made During our studies at LUCA School of Arts.`,
            img: "assets/images/homeliness-collage.jpg",
            link: "#"
        },
        {
            title: "I am not an object",
            desc: `This project, by Yorrik Oyen and Eelke Hinnekens, was a special edition magazine in our last year at LUCA School of Arts. The project was about the objectification of homeless people. I wanted to show the world that homeless people are not just objects, but human beings with feelings and stories. 

I used unconventional printing techniques and typography to create a powerful message about the importance of treating homeless people with dignity and respect.`,
            img: "assets/images/iamnotanobject-collage.jpg",
            link: "#"
        },
        {
            title: "Twinning fontface",
            desc: `A custom font by Yorrik Oyen designed for a project about twinning. It is based on the idea of two identical shapes that are connected to each other. The shapes are inspired by the concept of twinning, which is the phenomenon of two people being born at the same time and sharing a special bond. 
        
The font is designed to be used in a variety of contexts, such as headlines, logos, and body text. It is a unique and eye-catching font that can add a touch of personality to any design project.`,
            img: "assets/images/twinning-collage.jpg",
            link: "#"
        },
        {
            title: "ANIPFY",
            desc: `ANIPFY or And now i pray for you, is Marcel's graduation project. It's an alternative magazine / LP cover about the music and artistic approach of Westside Gunn, a rapper from Buffalo New York.
        
It is a tribute to Westside's unique style and his influence on the hip-hop scene. As well as a tribute to the influence hi-hop has had on Marcel's work and life. 
        
The project combines photography, typography, and layout design to create a visually stunning magazine.`,
            img: "assets/images/anipfy-collage.jpg",
            link: "#"
        },
    ];

    let currentIndex = 0;
    const titleEl = document.getElementById('work-title');
    const descEl = document.getElementById('work-content');
    const imgEl = document.getElementById('work-image');
    const linkEl = document.getElementById('work-link');

    function updateWork() {
        const p = projects[currentIndex];
        const elements = [titleEl, descEl.querySelector('p'), imgEl];
        
        // Remove class to reset animation
        elements.forEach(el => el.classList.remove('slide-in'));
        
        // Timeout to allow reflow
        setTimeout(() => {
            titleEl.textContent = p.title;
            descEl.querySelector('p').textContent = p.desc;
            imgEl.src = p.img;
            linkEl.href = p.link;
            
            // Add class to trigger animation
            elements.forEach(el => el.classList.add('slide-in'));
        }, 50);
    }

    document.getElementById('btn-next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % projects.length;
        updateWork();
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + projects.length) % projects.length;
        updateWork();
    });
});