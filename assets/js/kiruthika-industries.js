
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setNav(el) {
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }

  function setFilterTab(cat) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('tab-' + cat);
    if (tab) tab.classList.add('active');
  }

  function filterCategory(cat) {
    const cards = document.querySelectorAll('#productGrid .card');
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-cat');
      if (cat === 'all') {
        if (card.id === 'steel-card') {
          card.classList.add('hidden');
        } else {
          card.classList.remove('hidden');
        }
      } else if (cardCat === cat) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function callUs() {
    window.location.href = 'tel:+919994956517';
  }

  function openImg(src) {
    document.getElementById('modalImg').src = src;
    document.getElementById('modal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }

