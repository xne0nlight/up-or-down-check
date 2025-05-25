// src/frontend/app.js

// Grab DOM elements
const targetEl    = document.getElementById('target');
const checkBtn    = document.getElementById('check');
const spinnerEl   = document.getElementById('spinner');
const resultEl    = document.getElementById('result');
const permalinkEl = document.getElementById('permalink');

// In dev we hit the Worker proxy on 8787; in prod we hit /api/check on same origin
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8787'
  : '';

// ALWAYS call /api/check
function buildEndpoint(rawUrl) {
  const encoded = encodeURIComponent(rawUrl);
  return API_BASE
    ? `${API_BASE}/api/check?url=${encoded}`
    : `/api/check?url=${encoded}`;
}

// Normalize input (prepend https:// if missing)
function normalizeUrl(input) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

checkBtn.addEventListener('click', async () => {
  // Clear previous UI state
  resultEl.textContent = '';
  permalinkEl.innerHTML = '';

  let raw = targetEl.value;
  if (!raw) {
    resultEl.textContent = '👉 Please enter a URL';
    return;
  }

  const url = normalizeUrl(raw);
  spinnerEl.classList.remove('hidden');

  try {
    const endpoint = buildEndpoint(url);
    console.log('📡 Calling endpoint:', endpoint);

    const res = await fetch(endpoint);
    const data = await res.json();
    spinnerEl.classList.add('hidden');

    if (data.status === 'up') {
      resultEl.textContent = '✅ UP';
      resultEl.className = 'text-green-600';
    } else {
      resultEl.textContent = '❌ DOWN';
      resultEl.className = 'text-red-600';
    }

    // Create a shareable permalink
    const slug = encodeURIComponent(url);
    const shareUrl = API_BASE
      ? `${API_BASE}/${slug}`
      : `${window.location.origin}/${slug}`;
    permalinkEl.innerHTML = `Share: <a href="${shareUrl}">${shareUrl}</a>`;
  } catch (err) {
    spinnerEl.classList.add('hidden');
    resultEl.textContent = '⚠️ Error checking URL';
    console.error('Fetch error:', err);
  }
});
