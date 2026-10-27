const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const video = document.getElementById('video');
const videoToggle = document.getElementById('video-toggle');
function setVideoButton(paused) {
  videoToggle.setAttribute('aria-pressed', String(paused));
  videoToggle.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
}
if (reduce) {
  video.removeAttribute('autoplay');
  video.pause();
  setVideoButton(true);
}
videoToggle.addEventListener('click', () => {
  if (video.paused) video.play(); else video.pause();
});
video.addEventListener('play', () => setVideoButton(false));
video.addEventListener('pause', () => setVideoButton(true));
if (video.paused && !video.autoplay) setVideoButton(true);

const drift = document.getElementById('drift');
const driftToggle = document.getElementById('drift-toggle');
let driftPaused = false;
driftToggle.addEventListener('click', () => {
  driftPaused = !driftPaused;
  driftToggle.setAttribute('aria-pressed', String(driftPaused));
  driftToggle.setAttribute('aria-label', driftPaused ? 'Play examples' : 'Pause examples');
});

if (!reduce) {
  const NORMAL = 32;
  const SLOW = 6;
  const rows = [...drift.querySelectorAll('.drift-row')].map((row) => ({
    row, x: 0, speed: 0, width: 1, hover: false,
    dir: row.classList.contains('drift-row-rev') ? -1 : 1,
  }));
  const measure = () => rows.forEach((r) => { r.width = r.row.firstElementChild.getBoundingClientRect().width + 16; });
  measure();
  window.addEventListener('resize', measure);
  rows.forEach((r) => {
    r.row.addEventListener('pointerenter', () => { r.hover = true; });
    r.row.addEventListener('pointerleave', () => { r.hover = false; });
  });
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    for (const r of rows) {
      const target = driftPaused ? 0 : r.hover ? SLOW : NORMAL;
      r.speed += (target - r.speed) * Math.min(1, dt * 5);
      r.x = (r.x + r.speed * r.dir * dt) % r.width;
      if (r.x < 0) r.x += r.width;
      r.row.style.transform = `translateX(${-r.x}px)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
