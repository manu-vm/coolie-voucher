const form = document.querySelector('#receiptForm');
const saved = JSON.parse(localStorage.getItem('idukki-receipt') || '{}');
for (const input of form.elements) if (input.name && saved[input.name] !== undefined) input.value = saved[input.name];
const dateInput = form.elements.date;
if (!dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
function today() {
  const d = new Date();
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}
function render() {
  const values = Object.fromEntries([...form.elements].filter(el => el.name).map(el => [el.name, el.value.trim()]));
  document.querySelectorAll('[data-value]').forEach(el => {
    const key = el.dataset.value;
    const value = key === 'date' ? (values.date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${values.date}T00:00:00`)) : today()) : values[key];
    if (value) el.textContent = key === 'shift' ? `(${value})` : value;
    else if (key === 'date') el.textContent = today();
  });
  localStorage.setItem('idukki-receipt', JSON.stringify(values));
}
form.addEventListener('input', render);
document.querySelector('#printButton').addEventListener('click', () => window.print());
document.querySelector('#clearButton').addEventListener('click', () => {
  form.reset(); localStorage.removeItem('idukki-receipt'); render();
});
render();
