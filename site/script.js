const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

const demo = document.getElementById('demo');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const timeline = [[0, 1400], [1, 2200], [2, 1300], [3, 3600]];
let step = 0;
let timer = 0;

function play() {
  const [state, wait] = timeline[step];
  demo.dataset.state = state;
  step = (step + 1) % timeline.length;
  timer = setTimeout(play, wait);
}

function restart() {
  clearTimeout(timer);
  step = 0;
  play();
}

if (reduce) {
  demo.dataset.state = 3;
} else {
  const start = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { restart(); start.disconnect(); }
  }, { threshold: 0.4 });
  start.observe(demo);
}

document.getElementById('replay').addEventListener('click', restart);
