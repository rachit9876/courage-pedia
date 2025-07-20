// Notification Module
(function() {
  // Add styles to document
  const style = document.createElement('style');
  style.textContent = `
    #toast-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      width: calc(100% - 40px);
      max-width: 380px;
    }
    .toast {
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background-color: #0d0d0d;
      border: 1px solid #ffeb3b;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      will-change: transform, opacity;
      animation: toast-in 0.6s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
    }
    @keyframes toast-in {
      0% { transform: translateY(-120%) scale(0.9); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes toast-out {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-120%) scale(0.9); opacity: 0; }
    }
    .toast.fade-out {
      animation: toast-out 0.6s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
    }
    .toast-content {
      display: flex;
      flex-direction: column;
    }
    .toast-title {
      font-weight: 600;
      color: #fdc3ed;
      font-size: 14px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toast-description {
      font-size: 14px;
      color: #fdc3ed;
      margin-top: 2px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toast-action {
      margin-left: 16px;
      flex-shrink: 0;
    }
    .toast-action-button {
      padding: 6px 12px;
      font-size: 14px;
      font-weight: 500;
      color: #0d0d0d;
      background-color: #fdc3ed;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toast-action-button:hover {
      background-color: #374151;
    }
  `;
  document.head.appendChild(style);

  // Create container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Constants
  const MAX_VISIBLE_TOASTS = 3;
  const TOAST_LIFETIME = 10000;

  // Functions
  function createToast({ title, description, action }) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const content = document.createElement('div');
    content.className = 'toast-content';
    const toastTitle = document.createElement('div');
    toastTitle.className = 'toast-title';
    toastTitle.textContent = title;
    const toastDescription = document.createElement('div');
    toastDescription.className = 'toast-description';
    toastDescription.textContent = description;
    content.appendChild(toastTitle);
    content.appendChild(toastDescription);
    toast.appendChild(content);

    if (action && action.label && typeof action.onClick === 'function') {
      const actionContainer = document.createElement('div');
      actionContainer.className = 'toast-action';
      const actionButton = document.createElement('button');
      actionButton.className = 'toast-action-button';
      actionButton.textContent = action.label;
      actionButton.addEventListener('click', (e) => {
        e.stopPropagation();
        action.onClick();
        removeToast(toast);
      });
      actionContainer.appendChild(actionButton);
      toast.appendChild(actionContainer);
    }
    
    toastContainer.prepend(toast);
    updateToastPositions();
    
    const removeTimeout = setTimeout(() => removeToast(toast), TOAST_LIFETIME);
    toast.addEventListener('click', () => {
      clearTimeout(removeTimeout);
      removeToast(toast);
    });
  }

  function removeToast(toast) {
    toast.classList.add('fade-out');
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      updateToastPositions();
    }, { once: true });
  }

  function updateToastPositions() {
    const toasts = Array.from(toastContainer.children)
      .filter(child => !child.classList.contains('fade-out'));
    
    toasts.forEach((toast, index) => {
      toast.style.zIndex = toasts.length - index;
      if (index < MAX_VISIBLE_TOASTS) {
        const scale = 1 - (index * 0.05);
        const translateY = index * 14;
        toast.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        toast.style.opacity = '1';
      } else {
        toast.style.transform = `scale(0.85) translateY(${MAX_VISIBLE_TOASTS * 14}px)`;
        toast.style.opacity = '0';
      }
    });
  }

  // Export to global scope
  window.showNotification = createToast;
  
  // Show default notification on load
  setTimeout(() => {
    createToast({
      title: "Sorry !",
      description: "We Found The Bug, It will be fixed in the next update.",
      action: {
        label: "Ok",
        onClick: () => console.log("Ok button clicked")
      }
    });
  }, 1500);
})();