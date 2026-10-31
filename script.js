const ORDER_EMAIL = "aquarpotero@gmail.com";
const prices = { adult: 30, kid: 25 };
const order = { adult: 0, kid: 0 };
let currentStep = 1;

function goTo(step) {
  if (step === 2 && !document.getElementById('customerName').value.trim()) {
    alert('กรุณากรอกชื่อลูกค้าก่อนค่ะ'); document.getElementById('customerName').focus(); return;
  }
  if (step === 3 && order.adult === 0 && order.kid === 0) {
    alert('กรุณาเลือกจำนวนโจ๊กอย่างน้อย 1 ถุงค่ะ'); return;
  }
  if (step === 5) updateSummary();
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById('step' + step).classList.add('active');
  currentStep = step;
  document.getElementById('progressBar').style.width = (step === 6 ? 100 : step * 20) + '%';
  document.getElementById('stepLabel').textContent = step === 6 ? 'เสร็จสิ้น' : `ขั้นตอนที่ ${step} จาก 5`;
  window.scrollTo({top:0, behavior:'smooth'});
}
function changeQty(type, amount) {
  order[type] = Math.max(0, Math.min(99, order[type] + amount));
  document.getElementById(type + 'Qty').textContent = order[type];
  if (order[type] > 0) {
    const notOrdered = document.getElementById(type + 'NotOrdered');
    notOrdered.checked = false;
  }
}
function setupExclusive(group, noneId, notOrderedId, type) {
  const checks = [...document.querySelectorAll('.' + group)];
  const none = document.getElementById(noneId);
  const notOrdered = document.getElementById(notOrderedId);
  checks.forEach(c => c.addEventListener('change', () => {
    if (c.checked) { none.checked = false; notOrdered.checked = false; }
  }));
  none.addEventListener('change', () => {
    if (none.checked) { checks.forEach(c => c.checked = false); notOrdered.checked = false; }
  });
  notOrdered.addEventListener('change', () => {
    if (notOrdered.checked) {
      checks.forEach(c => c.checked = false); none.checked = false;
      order[type] = 0;
      document.getElementById(type + 'Qty').textContent = '0';
    }
  });
}
setupExclusive('adult-exclude','adultNone','adultNotOrdered','adult');
setupExclusive('kid-exclude','kidNone','kidNotOrdered','kid');

function getExcluded(type) {
  return [...document.querySelectorAll('.' + type + '-exclude:checked')].map(x => x.value);
}
function updateSummary() {
  const adultEgg = order.adult > 0 && !getExcluded('adult').includes('ไข่') ? 0 : 0;
  const kidEgg = order.kid > 0 && !getExcluded('kid').includes('ไข่') ? 0 : 0;
  // ไข่เป็นตัวเลือกเพิ่ม (+5 บาท) แยกตามจำนวนถุงที่เลือกเพิ่มในรายละเอียด
  const adultInput = document.getElementById('adultEggQty');
  const kidInput = document.getElementById('kidEggQty');
  if (adultInput) adultInput.max = String(order.adult);
  if (kidInput) kidInput.max = String(order.kid);
  let adultExtra = Math.min(order.adult, Math.max(0, Number(adultInput?.value || 0)));
  let kidExtra = Math.min(order.kid, Math.max(0, Number(kidInput?.value || 0)));
  if (getExcluded('adult').includes('ไข่')) adultExtra = 0;
  if (getExcluded('kid').includes('ไข่')) kidExtra = 0;
  if (adultInput && getExcluded('adult').includes('ไข่')) adultInput.value = '0';
  if (kidInput && getExcluded('kid').includes('ไข่')) kidInput.value = '0';
  const total = order.adult * prices.adult + order.kid * prices.kid + (adultExtra + kidExtra) * 5;
  const rows = [];
  if(order.adult) rows.push(`<div class="summary-row"><span>โจ๊กผู้ใหญ่ ${order.adult} ถุง</span><span>${order.adult*30} บาท</span></div>`);
  if(order.kid) rows.push(`<div class="summary-row"><span>โจ๊กเด็ก ${order.kid} ถุง</span><span>${order.kid*25} บาท</span></div>`);
  if(adultExtra) rows.push(`<div class="summary-row"><span>เพิ่มไข่โจ๊กผู้ใหญ่ ${adultExtra} ฟอง</span><span>${adultExtra*5} บาท</span></div>`);
  if(kidExtra) rows.push(`<div class="summary-row"><span>เพิ่มไข่โจ๊กเด็ก ${kidExtra} ฟอง</span><span>${kidExtra*5} บาท</span></div>`);
  if(!rows.length) rows.push('<div class="summary-row"><span>ยังไม่ได้เลือกเมนู</span><span>0 บาท</span></div>');
  document.getElementById('orderSummary').innerHTML = rows.join('');
  document.getElementById('totalPrice').textContent = total + ' บาท';
  return {total, adultExtra, kidExtra};
}
function orderText() {
  const name = document.getElementById('customerName').value.trim();
  const details = document.getElementById('extraDetails').value.trim() || '-';
  const {total, adultExtra, kidExtra} = updateSummary();
  const adultExcluded = getExcluded('adult');
  const kidExcluded = getExcluded('kid');
  return `ออเดอร์ร้านโจ๊กนายตั้ม\nชื่อลูกค้า: ${name}\n\nโจ๊กผู้ใหญ่: ${order.adult} ถุง\nไม่ใส่: ${order.adult ? (adultExcluded.join(', ') || 'ไม่มี') : 'ไม่ได้สั่ง'}\nเพิ่มไข่: ${adultExtra} ฟอง\n\nโจ๊กเด็ก: ${order.kid} ถุง\nไม่ใส่: ${order.kid ? (kidExcluded.join(', ') || 'ไม่มี') : 'ไม่ได้สั่ง'}\nเพิ่มไข่: ${kidExtra} ฟอง\n\nรายละเอียดแยกถุง: ${details}\n\nยอดรวม: ${total} บาท`;
}
function confirmOrder() {
  if(order.adult === 0 && order.kid === 0) {
    alert('ออเดอร์นี้ยังไม่มีรายการอาหารค่ะ กรุณากดย้อนกลับไปเลือกเมนู'); return;
  }
  const text = orderText();
  document.getElementById('finalSummary').innerHTML =
    `<h2>📩 รายละเอียดออเดอร์</h2><pre style="white-space:pre-wrap;font:16px/1.7 Prompt,sans-serif;margin:0"></pre>`;
  document.querySelector('#finalSummary pre').textContent = text;
  goTo(6);
  const subject = encodeURIComponent('ออเดอร์ใหม่ - ร้านโจ๊กนายตั้ม');
  const body = encodeURIComponent(text);
  window.location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`;
}

// เพิ่มตัวเลือกจำนวนไข่ (+5 บาท/ฟอง) ในแต่ละเมนูอย่างชัดเจน
function addEggControls() {
  const cards = document.querySelectorAll('.menu-card');
  const configs = [
    {id:'adult', label:'เพิ่มไข่ (+5 บาท/ถุง)'},
    {id:'kid', label:'เพิ่มไข่ (+5 บาท/ถุง)'}
  ];
  configs.forEach((cfg, i) => {
    const host = cards[i].querySelector('.menu-info');
    const wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:9px;margin:0 0 12px;font-size:16px;font-weight:600';
    wrap.innerHTML = `<input id="${cfg.id}EggQty" type="number" min="0" max="99" value="0" style="width:76px;padding:8px;border:2px solid #f3cda7;border-radius:10px;font:inherit"> ${cfg.label}`;
    host.insertBefore(wrap, host.querySelector('.qty-control'));
  });
}
addEggControls();
