let deferredPrompt;

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.textContent = 'Install App';
  installBtn.className = 'fixed bottom-4 right-4 text-black px-4 py-2 rounded-lg shadow-lg';
  installBtn.style.cssText = `
    background-color: #f6b0ea;
    z-index: 9999;
    position: fixed;
    bottom: 16px;
    right: 16px;
  `;
  installBtn.onclick = installApp;
  document.body.appendChild(installBtn);
}

async function installApp() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('PWA installed');
  }
  
  deferredPrompt = null;
  document.querySelector('button[onclick="installApp()"]')?.remove();
}