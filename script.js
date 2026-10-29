document.querySelectorAll('#year').forEach(x=>x.textContent=new Date().getFullYear());

(() => {
  const overlay = document.getElementById("introOverlay");
  if (!overlay) return;

  const skipButton = document.getElementById("skipIntro");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dismissed = false;

  function dismissIntro() {
    if (dismissed) return;
    dismissed = true;
    overlay.classList.add("intro-dismissed");
    window.setTimeout(() => overlay.remove(), reduceMotion ? 0 : 450);
  }

  skipButton?.addEventListener("click", dismissIntro);
  if (reduceMotion) {
    dismissIntro();
  } else {
    window.setTimeout(dismissIntro, 2600);
  }
})();
