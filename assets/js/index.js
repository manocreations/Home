
const items=document.querySelectorAll('[data-reveal]');
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
  });
},{threshold:0.12});
items.forEach(el=>io.observe(el));


// Responsive homepage menu (kept separate from the original reveal script)
const homeMenuButton = document.querySelector('.site-menu-toggle');
const homeNav = document.querySelector('.site-nav');
if (homeMenuButton && homeNav) {
  homeMenuButton.addEventListener('click', () => {
    const open = homeNav.classList.toggle('is-open');
    homeMenuButton.setAttribute('aria-expanded', String(open));
    homeMenuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });
  homeNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    homeNav.classList.remove('is-open');
    homeMenuButton.setAttribute('aria-expanded', 'false');
  }));
}

// Navigation convenience and keyboard accessibility
if (homeMenuButton && homeNav) {
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { homeNav.classList.remove('is-open');homeMenuButton.setAttribute('aria-expanded','false');homeMenuButton.focus(); }
 });
 document.addEventListener('click', event => {
  if (!homeNav.contains(event.target) && !homeMenuButton.contains(event.target)) {homeNav.classList.remove('is-open');homeMenuButton.setAttribute('aria-expanded','false');}
 });
}
