
// Highly saturated modern 3D brand gradient maps and matching aura colors
const buttons = [
  { href:"tel:+918124799703", label:"Call", glow:"rgba(0,184,148,0.6)", gradient:"linear-gradient(135deg, #00b894 0%, #00cec9 100%)", icon:"https://unpkg.com/lucide-static@latest/icons/phone.svg" },
  { href:"sms:+918124799703", label:"SMS", glow:"rgba(9,132,227,0.6)", gradient:"linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)", icon:"https://unpkg.com/lucide-static@latest/icons/message-square.svg" },
  { href:"https://wa.me/919080354580", label:"WhatsApp", glow:"rgba(37,211,102,0.6)", gradient:"linear-gradient(135deg, #25D366 0%, #11998e 100%)", icon:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg" },
  { href:"http://www.instagram.com/manocreations.in", label:"Instagram", glow:"rgba(225,48,108,0.6)", gradient:"linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", icon:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" },
  { href:"https://www.facebook.com/manoze13/", label:"Facebook", glow:"rgba(24,119,242,0.6)", gradient:"linear-gradient(135deg, #1877F2 0%, #0052D4 100%)", icon:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" },
  { href:"https://www.youtube.com/@ManO_CreationS", label:"YouTube", glow:"rgba(255,0,0,0.6)", gradient:"linear-gradient(135deg, #FF0000 0%, #b21f1f 100%)", icon:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg" },
  { href:"mailto:ceo@manocreations.com", label:"Email", glow:"rgba(234,67,53,0.6)", gradient:"linear-gradient(135deg, #EA4335 0%, #fbbc05 100%)", icon:"https://unpkg.com/lucide-static@latest/icons/mail.svg" },
  { href:"https://share.google/pQgkzyVIKSjJNRXF0", label:"Maps", glow:"rgba(52,168,83,0.6)", gradient:"linear-gradient(135deg, #34A853 0%, #11998e 100%)", icon:"https://unpkg.com/lucide-static@latest/icons/map-pin.svg" },
];

const grid = document.getElementById('btn-grid');
buttons.forEach(b => {
  const a = document.createElement('a');
  a.href = b.href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'contact-btn';
  
  // Apply the saturated gradient and shiny light shadow dynamic profiles
  a.style.setProperty('--brand-gradient', b.gradient);
  a.style.setProperty('--glow-color', b.glow);
  
  a.innerHTML = `
    <div class="btn-circle">
      <img src="${b.icon}" alt="${b.label}">
    </div>
    <span class="btn-label">${b.label}</span>
  `;
  grid.appendChild(a);
});

const root = document.getElementById('mc-root');

const bgIcons = [
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg",    size:50 },
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg",   size:44 },
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg",     size:48 },
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg",    size:42 },
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg",       size:40 },
  { src:"https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg", size:46 },
];

const rows = 4;
const cols = 4;
const totalCells = rows * cols;

for (let i = 0; i < totalCells; i++) {
  const ic = bgIcons[i % bgIcons.length];
  const el = document.createElement('img');
  el.src = ic.src;
  el.className = 'bg-icon';
  
  const row = Math.floor(i / cols);
  const col = i % cols;
  
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;
  
  const leftPos = (col * cellWidth) + 5 + (Math.random() * (cellWidth - 20));
  const topPos = (row * cellHeight) + 5 + (Math.random() * (cellHeight - 20));
  
  el.style.cssText = `
    width: ${ic.size}px;
    left: ${leftPos}%;
    top: ${topPos}%;
    animation-duration: ${12 + Math.random() * 8}s;
    animation-delay: -${Math.random() * 10}s;
  `;
  root.appendChild(el);
}

for (let i = 0; i < 4; i++) {
  const ring = document.createElement('div');
  ring.className = 'pulse-ring';
  ring.style.cssText = `
    width:80px; height:80px;
    left:${10 + Math.random()*80}%;
    top:${10 + Math.random()*80}%;
    animation-delay:${Math.random()*4}s;
  `;
  root.appendChild(ring);
}

const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
if (isTouchDevice) {
  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const link = btn.getAttribute('href');
      setTimeout(() => window.open(link, '_blank', 'noopener,noreferrer'), 300);
    });
  });
}

