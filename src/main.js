const courseInfo = {
  'creative-code': { title: 'Creative Code', category: 'CODE / 01', description: 'Learn enough HTML, CSS and JavaScript to turn an idea into an interactive digital experience. Each week adds a new layer, and the final week is for polishing and publishing your own small project.', duration: '6 weeks', format: 'Live online', level: 'Beginner friendly', price: 'EGP 4,800', outcome: 'A responsive, interactive website you can share, tweak and proudly call yours.' },
  'product-design': { title: 'Product Design', category: 'DESIGN / 02', description: 'Understand the people you are designing for, map a useful flow, and prototype an experience that can be tested before it is built.', duration: '5 weeks', format: 'Hybrid', level: 'Foundations', price: 'EGP 5,200', outcome: 'A clickable prototype and a short case study explaining your decisions.' },
  'everyday-ai': { title: 'Everyday AI', category: 'AI + TOOLS / 03', description: 'Go beyond prompts. Learn how to combine AI tools with practical workflows, check outputs, and design small systems that remove repetitive work.', duration: '3 weeks', format: 'Live online', level: 'No experience needed', price: 'EGP 3,200', outcome: 'A repeatable AI workflow for a real task in your work or daily life.' },
  'python-practice': { title: 'Python in Practice', category: 'CODE / 04', description: 'Learn Python by building useful scripts: working with files, making requests to APIs, cleaning data and automating repetitive tasks.', duration: '4 weeks', format: 'Hybrid', level: 'Beginner friendly', price: 'EGP 3,900', outcome: 'A small automation tool with a README and instructions someone else can use.' }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let activeFilter = 'All';
let lastFocused = null;
let currentCourse = null;
let toastTimer;

// Mobile navigation
const menuToggle = $('#menu-toggle');
const navLinks = $('#nav-links');
function closeMenu() {
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navLinks.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  menuToggle.classList.toggle('is-open', !isOpen);
  navLinks.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});
$$('#nav-links a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

// Course catalog filters + search
const cards = $$('.course-card');
const searchInput = $('#course-search');
function filterCourses() {
  const q = searchInput.value.trim().toLowerCase();
  let shown = 0;
  cards.forEach(card => {
    const categoryMatch = activeFilter === 'All' || card.dataset.category === activeFilter;
    const searchMatch = !q || (card.dataset.search + ' ' + $('.course-title', card).textContent).toLowerCase().includes(q);
    const visible = categoryMatch && searchMatch;
    card.hidden = !visible;
    if (visible) shown++;
  });
  $('#no-results').hidden = shown !== 0;
  $('.course-grid').classList.toggle('is-filtered-empty', shown === 0);
}
$$('.filter-tab').forEach(tab => tab.addEventListener('click', () => {
  activeFilter = tab.dataset.filter;
  $$('.filter-tab').forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  filterCourses();
}));
searchInput.addEventListener('input', filterCourses);
$('#reset-courses').addEventListener('click', () => {
  activeFilter = 'All'; searchInput.value = '';
  $$('.filter-tab').forEach(tab => { const active = tab.dataset.filter === 'All'; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', String(active)); });
  filterCourses(); searchInput.focus();
});

// Modal helpers with focus handling
function openModal(modal) {
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => $('.modal-close', modal)?.focus());
}
function closeModal(modal) {
  modal.hidden = true;
  if ($$('.modal-backdrop:not([hidden])').length === 0) document.body.classList.remove('modal-open');
  if (lastFocused?.focus) lastFocused.focus();
}
$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
$$('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(backdrop); });
  backdrop.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal(backdrop);
    if (event.key === 'Tab') {
      const focusable = $$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]', backdrop).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});

const courseModal = $('#course-modal');
function openCourse(key) {
  const item = courseInfo[key];
  if (!item) return;
  currentCourse = key;
  $('#modal-kicker').textContent = item.category;
  $('#modal-title').textContent = item.title;
  $('#modal-description').textContent = item.description;
  $('#modal-facts').innerHTML = `<span><small>DURATION</small><strong>${item.duration}</strong></span><span><small>FORMAT</small><strong>${item.format}</strong></span><span><small>LEVEL</small><strong>${item.level}</strong></span><span><small>FEE</small><strong>${item.price}</strong></span>`;
  $('#modal-outcome').textContent = item.outcome;
  openModal(courseModal);
}
$$('[data-course]').forEach(button => button.addEventListener('click', () => openCourse(button.dataset.course)));
$('#modal-apply').addEventListener('click', () => {
  closeModal(courseModal);
  const courseName = courseInfo[currentCourse]?.title || '';
  $('#application-course').value = courseName;
  $('#application-success').hidden = true;
  $('#application-form').hidden = false;
  openModal($('#application-modal'));
});

// Application modal
const applicationModal = $('#application-modal');
$$('.open-application').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  $('#application-success').hidden = true;
  $('#application-form').hidden = false;
  $('#application-course').value = '';
  openModal(applicationModal);
}));
$('#application-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form).entries());
  // Local-only demo: do not transmit or persist personal data.
  form.reset();
  form.hidden = true;
  $('#application-success').hidden = false;
  const msg = `Thanks, ${payload.name.trim()} — your demo interest is recorded locally for this session.`;
  showToast(msg);
});

// FAQ accordion: only one answer open at a time
$$('.faq-question').forEach(button => button.addEventListener('click', () => {
  const item = button.closest('.faq-item');
  const open = button.getAttribute('aria-expanded') === 'true';
  $$('.faq-question').forEach(other => {
    other.setAttribute('aria-expanded', 'false');
    other.closest('.faq-item').classList.remove('is-open');
  });
  if (!open) { button.setAttribute('aria-expanded', 'true'); item.classList.add('is-open'); }
}));

// Testimonial slider
let storyIndex = 0;
const storyTrack = $('#story-track');
const storyCards = $$('.story-card');
function moveStory(index) {
  storyIndex = (index + storyCards.length) % storyCards.length;
  // Track is three viewports wide; one third of the track equals one full slide.
  storyTrack.style.transform = `translateX(-${storyIndex * (100 / storyCards.length)}%)`;
  storyCards.forEach((card, i) => card.setAttribute('aria-hidden', String(i !== storyIndex)));
}
$('#story-prev').addEventListener('click', () => moveStory(storyIndex - 1));
$('#story-next').addEventListener('click', () => moveStory(storyIndex + 1));
window.addEventListener('resize', () => moveStory(storyIndex));

// Toast + reveal animations
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => observer.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('is-visible'));
}

// Hide animation loading state on image failure and prevent broken-image icon from dominating.
$$('.course-image img').forEach(img => img.addEventListener('error', () => img.classList.add('image-unavailable')));
