
const styles = ["Wordmark","Letter Mark","Pictorial Mark","Abstract Mark","Mascot Logo","Emblem Logo","Combination Mark"];

let index = 1;
const slides = document.getElementById("slides");
const dotsContainer = document.getElementById("dots");
const card = document.getElementById("card");
const sendBtn = document.getElementById("sendBtn");
const businessInput = document.getElementById("businessName");
const pauseBadge = document.getElementById("pauseBadge");
let slideElements = document.querySelectorAll(".slide");
const totalSlides = slideElements.length;
let timer;
let typingStarted = false;

const firstClone = slideElements[0].cloneNode(true);
const lastClone = slideElements[totalSlides - 1].cloneNode(true);
slides.appendChild(firstClone);
slides.insertBefore(lastClone, slideElements[0]);
slideElements = document.querySelectorAll(".slide");
slides.style.transform = `translateX(-${index * 100}%)`;

for (let i = 0; i < totalSlides; i++) {
  let dot = document.createElement("span");
  dot.classList.add("dot");
  dot.onclick = () => goToSlide(i + 1);
  dotsContainer.appendChild(dot);
}

function getCurrentStyle() {
  return styles[(index - 1 + totalSlides) % totalSlides];
}

function updateDots() {
  const realIndex = (index - 1 + totalSlides) % totalSlides;
  document.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === realIndex));
}

function updateBadge() {
  pauseBadge.textContent = getCurrentStyle() + " selected";
}

function showSlide() {
  slides.style.transition = "transform 0.6s cubic-bezier(0.4,0,0.2,1)";
  slides.style.transform = `translateX(-${index * 100}%)`;
  updateDots();
  if (pauseBadge.classList.contains("visible")) updateBadge();
}

function move(step) { index += step; showSlide(); }

slides.addEventListener("transitionend", () => {
  if (index >= totalSlides + 1) { slides.style.transition = "none"; index = 1; slides.style.transform = `translateX(-${index * 100}%)`; }
  if (index <= 0) { slides.style.transition = "none"; index = totalSlides; slides.style.transform = `translateX(-${index * 100}%)`; }
});

function manualNav(step) {
  stopAuto();
  move(step);
  if (!typingStarted) startAuto();
}

function goToSlide(i) {
  stopAuto();
  index = i;
  showSlide();
  if (!typingStarted) startAuto();
}

function startAuto() { stopAuto(); timer = setInterval(() => move(1), 4000); }
function stopAuto() { clearInterval(timer); }

card.addEventListener('mouseenter', () => {
  if (!card.classList.contains('animating')) card.classList.add('animating');
});
card.addEventListener('animationend', () => card.classList.remove('animating'));

businessInput.addEventListener("focus", () => {
  updateBadge();
  pauseBadge.classList.add("visible");
});

businessInput.addEventListener("blur", () => {
  if (!typingStarted) {
    pauseBadge.classList.remove("visible");
    startAuto();
  }
});

businessInput.addEventListener("input", function() {
  sendBtn.disabled = this.value.trim().length === 0;

  if (!typingStarted && this.value.length > 0) {
    typingStarted = true;
    stopAuto(); // stop permanently once typing begins
  }

  if (this.value.length === 0) {
    typingStarted = false;
    startAuto(); // resume only if input is fully cleared
  }
});

function sendToWhatsApp() {
  const businessName = businessInput.value.trim();
  if (!businessName) return;
  const phone = "919080354580";
  const message = `I Choose a ${getCurrentStyle()} Style for my Logo. My Business Name is ${businessName}.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
}

updateDots();
startAuto();

