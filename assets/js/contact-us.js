/* Contact information is intentionally present in HTML so search engines and AI tools
   can read it without executing JavaScript. This script only adds copy convenience. */
(() => {
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
  const toast = document.getElementById('copy-toast');
  let timeout;
  function announce(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timeout);
    timeout = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        announce('Copied to clipboard');
      } catch (_) {
        announce('Select and copy the contact detail above');
      }
    });
  });
})();
