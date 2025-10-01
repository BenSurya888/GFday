// script.js
// Animasi sederhana dan inisialisasi playback musik ketika user berinteraksi

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("header").classList.add("fade-in");
  document.querySelector(".hero").classList.add("fade-in");
  document.querySelector(".game").classList.add("fade-in");

  // munculkan kontrol sentuh bila perangkat mobile
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const touchControls = document.getElementById('touchControls');
  if (isTouch && touchControls) {
    touchControls.setAttribute('aria-hidden', 'false');
    touchControls.style.display = 'flex';
  } else if (touchControls) {
    touchControls.style.display = 'none';
  }

  // resize canvas awal
  if (typeof resizeCanvas === "function") {
    try { resizeCanvas(); } catch (e) { /* ignore */ }
  }
});

// Auto play music: menunggu gesture / klik
const bgMusic = document.getElementById("bgMusic");
document.body.addEventListener("click", () => {
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.90;
    bgMusic.play().catch(()=>{/* some browsers block autoplay */});
  }
}, { once: true });
