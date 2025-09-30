const injected = document.createElement('script');
injected.textContent = `
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === 'PILOT_CHECK') {
      console.log('[Pilot Enhancer] handshake received');
      window.postMessage({ type: 'PILOT_EXTENSION_PRESENT' }, '*');
    }
  });
`;
(document.head || document.documentElement).appendChild(injected);
injected.remove();

const pilotVersion = window.PILOT_CONFIG?.version || 'unknown';
const pilotURL = window.location.href;

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === 'PILOT_INFO') {
    const { version, url } = event.data;
    console.log(`[Pilot Enhancer] Pilot (v${version}) on ${url}`);
    console.log('[Pilot Enhancer] content script loaded');
  }
});