document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  const output = document.getElementById("output");
  const recordList = document.getElementById("recordList");

  let records = JSON.parse(localStorage.getItem("records")) || [];

  // Helper function
  function saveRecords() {
    localStorage.setItem("records", JSON.stringify(records));
  }

  function renderRecords() {
    recordList.innerHTML = "";
    records.forEach((rec, index) => {
      const div = document.createElement("div");
      div.className = "record";
      div.innerHTML = `
        <p><strong>${rec.name}</strong> - وزن: ${rec.weight}kg - بل: ${rec.total}Rs - تاریخ: ${rec.date}</p>
        <button onclick="deleteRecord(${index})">ڈیلٹ</button>
      `;
      recordList.appendChild(div);
    });
  }

  window.deleteRecord = function(index) {
    records.splice(index, 1);
    saveRecords();
    renderRecords();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const advAtta = parseFloat(document.getElementById("advAtta").value) || 0;
    const price = parseFloat(document.getElementById("price").value) || 0;

    // --- Calculation ---
    let safai = document.getElementById("safai").checked ? 2 : 0; // مثال کے طور پر 2 روپے فی کلو
    let pisai = 5; // لازمی فی کلو پسائی
    let katoti = document.getElementById("katoti").checked ? 0.05 * weight : 0;

    let totalSafai = safai * weight;
    let totalPisai = pisai * weight;
    let total = totalSafai + totalPisai;

    let netWeight = weight - katoti;
    let netPrice = netWeight * price;

    if (advAtta > 0) {
      total += advAtta * price;
    }

    output.innerHTML = `
      <p>نام: ${name}</p>
      <p>وزن: ${weight} kg</p>
      <p>صفائی: ${totalSafai} Rs</p>
      <p>پسائی: ${totalPisai} Rs</p>
      <p>کٹوتی وزن: ${katoti.toFixed(2)} kg</p>
      <p>کل بل: ${total} Rs</p>
      <p>کل آٹا: ${netWeight.toFixed(2)} kg (${netPrice.toFixed(2)} Rs)</p>
      <button id="confirmBtn">تصدیق</button>
    `;

    document.getElementById("confirmBtn").onclick = function() {
      let record = {
        name,
        weight,
        advAtta,
        price,
        safai: totalSafai,
        pisai: totalPisai,
        katoti,
        total,
        date: new Date().toLocaleDateString("ur-PK")
      };
      records.push(record);
      saveRecords();
      renderRecords();
      alert("ریکارڈ محفوظ ہو گیا ✅");
    };
  });

  renderRecords();
});
