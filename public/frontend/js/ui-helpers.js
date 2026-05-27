const Modal = (() => {

  function open(html, title = '') {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    const titleHtml = title
      ? `<h2 class="modal-title">${title}</h2>`
      : '';

    content.innerHTML = titleHtml + html;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');

    setTimeout(() => {
      const first = content.querySelector('input, select, textarea, button');
      if (first) first.focus();
    }, 50);
  }

  function close() {
    const overlay = document.getElementById('modal-overlay');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    setTimeout(() => {
      document.getElementById('modal-content').innerHTML = '';
    }, 250);
  }

  return { open, close };
})();

const Toast = (() => {
  const ICONS = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
    warning: '⚠',
  };

  const DURATION = 3500;
  function show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => _remove(toast), DURATION);
  }

  function _remove(toastEl) {
    if (!toastEl.parentNode) return;
    toastEl.classList.add('removing');
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 280);
  }

  return { show };
})();

function updateAuthStateUI() {
    const userContainer = document.getElementById('active-user-display'); 
    const loginLink = document.getElementById('nav-login');
    const logoutLink = document.getElementById('nav-logout');

    const currentUser = StorageService.getCurrentUser();

    if (currentUser) {
        const identityString = currentUser.sub || currentUser.email || 'Active User'; 
        
        if(userContainer) userContainer.innerHTML = `👤 <b>${identityString}</b>`;
        if(loginLink) loginLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'block';
    } else {
        if(userContainer) userContainer.innerHTML = '';
        if(loginLink) loginLink.style.display = 'block';
        if(logoutLink) logoutLink.style.display = 'none';
    }
}
