if ('scrollRestoration' in history) history.scrollRestoration = 'manual';


// Story Carousel Engine Configurations
const slides = [
  { eyebrow: "Chapter 1 · The Beginning", title: "Being happy is the greatest form of success", body: "It started in 2016, inside a small room, with nothing but a phone, a nickname, and a stubborn love for making things. There was no plan, no investor, no roadmap — just a person who loved making people laugh on Instagram and couldn't stop. Nobody knew it then. Not even the person doing it.", img: "https://i.ibb.co/cMHQgKw/2c6c0893-a9df-44a0-ba1d-6c982ebe3f41.png" },
  { eyebrow: "Chapter 2 · The First Attempt", title: "The expert in anything was once a beginner", body: "The first real test came when a college department needed a farewell banner. The hand went up without thinking. Photoshop was opened for the very first time — buttons clicked randomly, tutorials skipped, confidence sky high. The design was submitted. And rejected. Flat. No soft landing, no encouragement. Just a no.", img: "https://i.ibb.co/cXJBmjrr/69923cbe-85cc-4b65-b0b7-fc027c18543a.png" },
  { eyebrow: "Chapter 3 · The Shift", title: "Sometimes rejection is really redirection", body: "But something strange happened in that moment of rejection. Instead of walking away, the question changed — from \"why did I fail\" to \"what do I not know yet.\" That one shift changed everything. While the world moved on, a quiet decision was made to stay and figure it out.", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80" },
  { eyebrow: "Chapter 4 · The Silent Years", title: "Quietly dangerous", body: "Years were spent learning in silence. Illustrator at midnight. CorelDRAW between lectures. After Effects on weekends. No course, no certificate, no one watching. Certificates were designed for national-level college events — held proudly by winners who never knew a student made them. Just one belief kept it going — that if you keep getting better, the world will eventually notice.", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80" },
  { eyebrow: "Chapter 5 · The First Client", title: "The moment that changed everything", body: "Then came a small shop. A faded photograph. A family deity on a crumpled piece of paper — handed over with one simple request: make this mean something. That was the first real client. Not a corporation. Not a startup. A family, trusting a stranger with the face of their faith.", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80" },
  { eyebrow: "Chapter 6 · The Moment Everything Changed", title: "Design ready", body: "When the logo was delivered, the client didn't review it. They prayed to it. That single moment became the foundation of everything that followed — because it proved that design is not decoration. It is the difference between a business that is forgotten and a brand that is felt.", img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=900&q=80" },
  { eyebrow: "Chapter 7 · The Philosophy", title: "Upgraded", body: "Every project after that was built on that understanding. Not just making things look good — making them mean something. The same discipline used to study engineering was now used to build brands. Strong foundations. Clean lines. A purpose behind every choice. Not just art. Engineering.", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80" },
  { eyebrow: "Chapter 8 · Today", title: "The dual-threat", body: "Today, ManO CreationS works with businesses that are tired of being invisible — small shops, growing brands, first-time founders — people who have something real to offer the world but don't yet have the identity to match it. The story that started with a laugh on Instagram is now the reason someone's shop gets noticed, someone's brand gets remembered, and somewhere — someone is proud to hand over their business card.\n\nThat is the brand ManO CreationS was always meant to be — not built in a boardroom, but in a small room, by someone who simply couldn't stop making things.", img: "https://images.unsplash.com/photo-1524749292158-7540c2494485?w=900&q=80", btn: { text: "Meet Founder", url: "https://www.manocreations.com/about-founder" } }
];

let currentIndex = 0;

function buildThumbs() {
  const strip = document.getElementById('thumbStrip');
  slides.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'c-thumb' + (i === 0 ? ' active' : '');
    el.id = 'thumb-' + i;
    el.onclick = () => goToSlide(i);
    el.innerHTML = `<img src="${s.img}" alt="Ch.${i+1}" loading="lazy">`;
    strip.appendChild(el);
  });
}

function updateCarousel(animate) {
  const s = slides[currentIndex];
  const img = document.getElementById('carouselImg');
  img.style.opacity = '0'; img.style.transform = 'scale(1.04)';
  setTimeout(() => {
    img.src = s.img; img.alt = s.title;
    img.onload = () => { img.style.transition = 'opacity .4s ease, transform .6s ease'; img.style.opacity = '1'; img.style.transform = 'scale(1)'; };
    if (img.complete) { img.style.opacity='1'; img.style.transform='scale(1)'; }
  }, 80);
  ['carouselEyebrow','carouselTitle','carouselText'].forEach(id => { const el = document.getElementById(id); el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
  document.getElementById('carouselEyebrow').textContent = s.eyebrow;
  document.getElementById('carouselTitle').textContent = s.title;
  document.getElementById('carouselText').textContent = s.body;
  const actionWrap = document.getElementById('carouselActionWrap');
  actionWrap.innerHTML = s.btn ? `<a href="${s.btn.url}" class="carousel-action-btn">${s.btn.text}</a>` : '';
  const pct = ((currentIndex + 1) / slides.length) * 100;
  document.getElementById('carouselProgress').style.width = pct + '%';
  document.getElementById('carouselPageLabel').textContent = `${currentIndex + 1} / ${slides.length}`;
  document.getElementById('cPrev').disabled = currentIndex === 0;
  document.getElementById('cNext').disabled = currentIndex === slides.length - 1;
  document.querySelectorAll('.c-thumb').forEach((t, i) => t.classList.toggle('active', i === currentIndex));
  const activeThumb = document.getElementById(`thumb-${currentIndex}`);
  if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  document.getElementById('carouselContent').scrollTop = 0;
}

function goToSlide(i) { currentIndex = i; updateCarousel(true); }
document.getElementById('cPrev').onclick = () => { if (currentIndex > 0) { currentIndex--; updateCarousel(true); } };
document.getElementById('cNext').onclick = () => { if (currentIndex < slides.length - 1) { currentIndex++; updateCarousel(true); } };

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { if (currentIndex < slides.length - 1) { currentIndex++; updateCarousel(true); } }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { if (currentIndex > 0) { currentIndex--; updateCarousel(true); } }
});

(function() {
  let sx = 0, sy = 0, locked = false;
  const book = document.querySelector('.carousel-book');
  book.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; locked = false; }, { passive: true });
  book.addEventListener('touchmove', e => {
    if (locked) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) locked = true;
  }, { passive: true });
  book.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && currentIndex < slides.length - 1) { currentIndex++; updateCarousel(true); }
      if (dx > 0 && currentIndex > 0) { currentIndex--; updateCarousel(true); }
    }
  }, { passive: true });
})();

function observeFade() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade').forEach(el => obs.observe(el));
}

function revealStory() {
  ['story-section','services-section','footer-section'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = ''; setTimeout(() => el.classList.add('show'), 50); }
  });
  setTimeout(() => { document.getElementById('story-section').scrollIntoView({ behavior: 'smooth' }); }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  buildThumbs();
  updateCarousel(false);
  observeFade();
});

