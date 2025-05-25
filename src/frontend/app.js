const targetEl   = document.getElementById('target');
const checkBtn   = document.getElementById('check');
const spinnerEl  = document.getElementById('spinner');
const resultEl   = document.getElementById('result');
const permalinkEl= document.getElementById('permalink');

// At the top of app.js
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8787"
    : "";  // empty means “same origin” in prod

checkBtn.addEventListener("click", async () => {
  // 1. Normalize the URL
  let raw = targetEl.value.trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  // 2. Build the full endpoint
  const endpoint = `${API_BASE}/?url=${encodeURIComponent(raw)}`;

  // 3. Perform the fetch
  spinnerEl.classList.remove("hidden");
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    spinnerEl.classList.add("hidden");
    // …your existing result‐rendering logic…
  } catch (err) {
    spinnerEl.classList.add("hidden");
    resultEl.textContent = "⚠️ Error checking URL";
    console.error(err);
  }
});


checkBtn.addEventListener('click', async () => {
  const url = targetEl.value.trim();
  if (!url) {
    resultEl.textContent = '👉 Please enter a URL';
    return;
  }

  // Reset UI
  resultEl.textContent = '';
  permalinkEl.innerHTML = '';
  spinnerEl.classList.remove('hidden');

  try {
    // In prod this will be /api/check, in dev it's /?url=
    const endpoint = window.location.pathname.startsWith('/api')
      ? `/api/check?url=${encodeURIComponent(url)}`
      : `/?url=${encodeURIComponent(url)}`;

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

    // Build a tiny shareable permalink
    const slug = encodeURIComponent(url);
    const link = `${window.location.origin}/${slug}`;
    permalinkEl.innerHTML = `Share: <a href="${link}">${link}</a>`;
  } catch (err) {
    spinnerEl.classList.add('hidden');
    resultEl.textContent = '⚠️ Error checking URL';
    console.error(err);
  }
});




