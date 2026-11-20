document.addEventListener('DOMContentLoaded', () => {
  const portrait = document.getElementById('imgToggle');
  portrait?.addEventListener('click', () => {const on = portrait.classList.toggle('revealed'); portrait.setAttribute('aria-pressed', String(on));});
  const viewport = document.getElementById('viewport'), track = document.getElementById('track');
  const controls = document.getElementById('carouselControls'), dots = document.getElementById('dots'), next = document.getElementById('nextBtn'), hint = document.getElementById('swipeHint');
  if (!viewport || !track || !controls || !dots || !next) return;
  const slides = [...track.querySelectorAll('.carousel-slide')]; if (!slides.length) return;
  let current = 0, startX = 0, startY = 0, locked = null;
  const buttons = slides.map((slide, i) => {
    slide.id = 'founder-story-' + (i + 1);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dot'; btn.setAttribute('aria-label', 'Read story part ' + (i + 1));
    btn.setAttribute('aria-controls',slide.id); btn.addEventListener('click', () => goTo(i));dots.appendChild(btn);return btn;
  });
  function goTo(i) {
    current = Math.max(0,Math.min(slides.length - 1,i));
    const offsets = slides.map(s => s.offsetTop - slides[0].offsetTop);
    viewport.style.height = slides[current].offsetHeight + 'px';
    track.style.transform = `translateY(-${offsets[current]}px)`;
    slides.forEach((slide,j) => {slide.setAttribute('aria-hidden',String(j!==current));slide.inert = j!==current;});
    buttons.forEach((btn,j)=>{btn.classList.toggle('active',j===current);btn.setAttribute('aria-current',j===current?'step':'false');});
    next.disabled = current===slides.length-1;
    next.textContent = next.disabled ? 'That’s the full story ✓' : 'Continue reading ›';
    if(hint) hint.textContent = next.disabled?'That was my kutty story':'Swipe left to continue';
  }
  document.body.classList.add('js-carousel');controls.hidden=false;
  next.addEventListener('click', () => goTo(current+1));
  viewport.addEventListener('touchstart', e => {startX=e.touches[0].clientX;startY=e.touches[0].clientY;locked=null;},{passive:true});
  viewport.addEventListener('touchmove',e=>{const dx=Math.abs(e.touches[0].clientX-startX),dy=Math.abs(e.touches[0].clientY-startY);if(!locked && Math.max(dx,dy)>8)locked=dx>dy?'h':'v';if(locked==='h'&&e.cancelable)e.preventDefault();},{passive:false});
  viewport.addEventListener('touchend',e=>{if(locked!=='h')return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>=40)goTo(current+(dx<0?1:-1));},{passive:true});
  viewport.addEventListener('keydown', e => {if(e.key==='ArrowRight'){goTo(current+1);e.preventDefault();}else if(e.key==='ArrowLeft'){goTo(current-1);e.preventDefault();}});
  window.addEventListener('resize', () => goTo(current));
  goTo(0);
});
