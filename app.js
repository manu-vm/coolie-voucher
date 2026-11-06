const form = document.querySelector('#receiptForm');
const STORE_KEY = 'idukki-receipts-v2';
const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
const ones = ['', 'ഒന്ന്', 'രണ്ട്', 'മൂന്ന്', 'നാല്', 'അഞ്ച്', 'ആറ്', 'ഏഴ്', 'എട്ട്', 'ഒൻപത്'];
const teens = ['', 'പതിനൊന്ന്', 'പന്ത്രണ്ട്', 'പതിമൂന്ന്', 'പതിനാല്', 'പതിനഞ്ച്', 'പതിനാറ്', 'പതിനേഴ്', 'പതിനെട്ട്', 'പത്തൊമ്പത്'];
const tens = ['', '', 'ഇരുപത്', 'മുപ്പത്', 'നാൽപ്പത്', 'അമ്പത്', 'അറുപത്', 'എഴുപത്', 'എൺപത്', 'തൊണ്ണൂറ്'];
const endings = ['', 'ത്തൊന്ന്', 'ത്തിരണ്ട്', 'ത്തിമൂന്ന്', 'ത്തിനാല്', 'ത്തഞ്ച്', 'ത്താറ്', 'ത്തിയേഴ്', 'ത്തെട്ട്', 'ത്തൊമ്പത്'];
const hundreds = ['', 'നൂറ്', 'ഇരുന്നൂറ്', 'മുന്നൂറ്', 'നാനൂറ്', 'അഞ്ഞൂറ്', 'അറുനൂറ്', 'എഴുന്നൂറ്', 'എണ്ണൂറ്', 'തൊള്ളായിരം'];
const hundredPrefixes = ['', 'നൂറ്റി', 'ഇരുന്നൂറ്റി', 'മുന്നൂറ്റി', 'നാനൂറ്റി', 'അഞ്ഞൂറ്റി', 'അറുനൂറ്റി', 'എഴുന്നൂറ്റി', 'എണ്ണൂറ്റി', 'തൊള്ളായിരത്തി'];

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function setDate(container, value) {
  for (const input of container.querySelectorAll('[name="date"]')) input.value = value;
}
for (const group of form.querySelectorAll('[data-voucher]')) {
  const index = group.dataset.voucher;
  const values = saved[index] || {};
  for (const input of group.querySelectorAll('[name]')) if (values[input.name] !== undefined) input.value = values[input.name];
  if (!group.querySelector('[name="date"]').value) setDate(group, localDate());
}

function underHundred(n) {
  if (n < 10) return ones[n] || 'പൂജ്യം';
  if (n === 10) return 'പത്ത്';
  if (n < 20) return teens[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (!u) return tens[t];
  if (t === 9) return `തൊണ്ണൂ${['', 'റ്റൊന്ന്', 'റ്റിരണ്ട്', 'റ്റിമൂന്ന്', 'റ്റിനാല്', 'റ്റഞ്ച്', 'റ്റാറ്', 'റ്റിയേഴ്', 'റ്റെട്ട്', 'റ്റൊമ്പത്'][u]}`;
  return `${tens[t].replace(/ത്$/, '')}${endings[u]}`;
}
function underThousand(n) {
  if (n < 100) return underHundred(n);
  const h = Math.floor(n / 100);
  const r = n % 100;
  const prefix = hundredPrefixes[h];
  return r ? `${prefix} ${underHundred(r)}` : (h === 1 ? 'നൂറ്' : hundreds[h]);
}
function numberWords(n) {
  if (!Number.isFinite(n) || n < 0 || n > 99999999) return '';
  n = Math.floor(n);
  if (n === 0) return 'പൂജ്യം രൂപ മാത്രം';
  const chunks = [];
  const lakh = Math.floor(n / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  if (lakh) chunks.push(`${underThousand(lakh)} ലക്ഷം`);
  if (thousand) chunks.push(`${underThousand(thousand)} ആയിരം`);
  if (rest) chunks.push(underThousand(rest));
  return `${chunks.join(' ')} രൂപ മാത്രം`;
}
function dateLabel(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}
function renderGroup(group) {
  const index = group.dataset.voucher;
  const values = Object.fromEntries([...group.querySelectorAll('[name]')].map(input => [input.name, input.value.trim()]));
  const count = Number(values.bundles) || 0;
  const perBundle = Number(values.bundleCharge) || 0;
  const total = count * perBundle;
  const words = numberWords(total);
  const preview = document.querySelector(`[data-copy="${index}"]`);
  preview.querySelectorAll('[data-field]').forEach(el => {
    const field = el.dataset.field;
    const value = field === 'date' ? dateLabel(values.date) : values[field];
    if (value) el.textContent = value;
  });
  preview.querySelectorAll('[data-total]').forEach(el => el.textContent = total ? total.toLocaleString('en-IN') : '________');
  preview.querySelectorAll('[data-words]').forEach(el => el.textContent = total ? words : '____________________________________');
  group.querySelector('[data-total]').textContent = `₹ ${total.toLocaleString('en-IN')}`;
  group.querySelector('[data-words]').textContent = words;
  saved[index] = values;
}
function render() {
  form.querySelectorAll('[data-voucher]').forEach(renderGroup);
  localStorage.setItem(STORE_KEY, JSON.stringify(saved));
}
form.addEventListener('input', render);
document.querySelector('#printButton').addEventListener('click', () => window.print());
const justifyButton = document.querySelector('#justifyButton');
const paper = document.querySelector('#paper');
justifyButton.addEventListener('click', () => {
  const justified = paper.classList.toggle('justified');
  justifyButton.setAttribute('aria-pressed', String(justified));
});
document.querySelector('#previewPrintButton').addEventListener('click', () => window.print());
const diversionCopy = document.querySelector('.diversion-copy');
const diversionJustifyButton = document.querySelector('#diversionJustifyButton');
diversionJustifyButton.addEventListener('click', () => {
  const justified = diversionCopy.classList.toggle('justified');
  diversionJustifyButton.setAttribute('aria-pressed', String(justified));
});
const orientationStyle = document.querySelector('#pageOrientation');
document.querySelector('#diversionPrintButton').addEventListener('click', () => {
  document.body.classList.add('print-diversion');
  orientationStyle.textContent = '@page{size:210mm 297mm;margin:8mm}';
  window.print();
});
window.addEventListener('afterprint', () => {
  document.body.classList.remove('print-diversion');
  orientationStyle.textContent = '@page{size:297mm 210mm;margin:8mm}';
});
const FONT_SCALE_KEY = 'idukki-receipt-font-scale';
let fontScale = Number(localStorage.getItem(FONT_SCALE_KEY)) || 1;
const fontSizeLabel = document.querySelector('#fontSizeLabel');
function updateFontScale() {
  fontScale = Math.min(1.5, Math.max(0.8, fontScale));
  document.querySelectorAll('.print-paper').forEach(element => element.style.setProperty('--receipt-font-scale', fontScale));
  fontSizeLabel.textContent = `${Math.round(fontScale * 100)}%`;
  localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
}
document.querySelector('#fontDown').addEventListener('click', () => {
  fontScale -= 0.1;
  updateFontScale();
});
document.querySelector('#fontUp').addEventListener('click', () => {
  fontScale += 0.1;
  updateFontScale();
});
updateFontScale();
document.querySelector('#clearButton').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('[data-voucher]').forEach(group => setDate(group, localDate()));
  for (const key of Object.keys(saved)) delete saved[key];
  render();
});
render();
