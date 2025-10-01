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

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bgMusic");
  if (bgMusic) {
    bgMusic.volume = 0.35; // volume lebih pelan
    // coba play otomatis
    bgMusic.play().catch(() => {
      // kalau gagal, tunggu interaksi user
      document.body.addEventListener("click", () => {
        bgMusic.play().catch(()=>{});
      }, { once: true });
    });
  }
});

