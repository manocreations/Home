
    const textEl = document.getElementById("mano-text");
    const isMobile = window.innerWidth <= 600;
    const words = textEl.innerText.split(" ");

    textEl.innerHTML = words
      .map(word => word.split("").map(l => `<span>${l}</span>`).join(""))
      .join(isMobile ? "<br>" : `<span class="space"> </span>`);

    const allSpans = document.querySelectorAll("#mano-text span:not(.space)");

    function randColor() {
      const r = Math.floor(Math.random() * 156) + 100;
      const g = Math.floor(Math.random() * 156) + 100;
      const b = Math.floor(Math.random() * 156) + 100;
      return `rgb(${r},${g},${b})`;
    }

    function activateSpan(span, clientX) {
      const rect = span.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      span.style.transition = "transform 0.15s ease, color 0.8s ease";
      span.style.transform = clientX < centerX ? "rotate(20deg)" : "rotate(-20deg)";
      span.style.color = randColor();
    }

    function resetSpan(span) {
      span.style.transition = "transform 1s ease, color 0.8s ease";
      span.style.transform = "rotate(0deg)";
      setTimeout(() => {
        span.style.color = "white";
        setTimeout(() => {
          span.style.transition = "transform 0.15s ease, color 0.8s ease";
        }, 1000);
      }, 2000);
    }

    // Desktop hover
    allSpans.forEach(span => {
      span.addEventListener("mouseenter", (e) => activateSpan(span, e.clientX));
      span.addEventListener("mouseleave", () => resetSpan(span));
    });

    // Mobile: swipe finger across letters to trigger each one
    const hero = document.querySelector(".hero");

    hero.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.tagName === "SPAN" && el.closest("#mano-text") && !el.classList.contains("space")) {
        activateSpan(el, touch.clientX);
      }
    }, { passive: true });

    allSpans.forEach(span => {
      span.addEventListener("touchstart", (e) => {
        activateSpan(span, e.touches[0].clientX);
      }, { passive: true });
    });

    hero.addEventListener("touchend", () => {
      allSpans.forEach(span => resetSpan(span));
    }, { passive: true });
  
