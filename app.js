let currentTreeId = "";
let isScanning = false;
const html5QrCode = new Html5Qrcode("reader");

async function toggleScan() {
  const scanBtn = document.getElementById("scanBtn");

  if (!isScanning) {
    document.getElementById("reader").style.display = 'block';
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
      isScanning = true;
      scanBtn.textContent = "🛑 หยุดสแกน";
    } catch (err) {
      alert("ไม่สามารถเปิดกล้องได้: " + err);
    }
  } else {
    await html5QrCode.stop();
    document.getElementById("reader").style.display = 'none';
    isScanning = false;
    scanBtn.textContent = "📷 เริ่มสแกน QR";
  }
}

async function onScanSuccess(decodedText) {
  if (!isScanning) return;
  isScanning = false;

  currentTreeId = decodedText;

  try {
    await html5QrCode.stop();
    document.getElementById("reader").style.display = 'none';
    document.getElementById("scanBtn").textContent = "📷 เริ่มสแกน QR";
  } catch (err) {
    console.error("❌ Failed to stop camera:", err);
  }

  const trees = JSON.parse(localStorage.getItem('trees') || '{}');
  if (!trees[currentTreeId]) {
    trees[currentTreeId] = { logs: [] };
    localStorage.setItem('trees', JSON.stringify(trees));
  }

  document.getElementById("treeInfo").innerHTML = `<h3>📌 ต้นไม้ ID: ${currentTreeId}</h3>`;
  document.getElementById("logForm").style.display = 'block';
  renderLogs();
}

function saveLog() {
  const text = document.getElementById("logText").value.trim();
  if (!text) return alert("กรุณาใส่ข้อความ");

  const date = new Date().toISOString().split('T')[0];
  const trees = JSON.parse(localStorage.getItem('trees') || '{}');
  trees[currentTreeId].logs.push({ date, action: text });
  localStorage.setItem('trees', JSON.stringify(trees));

  document.getElementById("logText").value = "";
  alert("✅ บันทึกเรียบร้อย");
  renderLogs();
}

function renderLogs() {
  const trees = JSON.parse(localStorage.getItem('trees') || '{}');
  const logs = trees[currentTreeId]?.logs || [];

  const logList = document.createElement('ul');
  logs.forEach(log => {
    const li = document.createElement('li');
    li.textContent = `${log.date}: ${log.action}`;
    logList.appendChild(li);
  });

  const treeInfo = document.getElementById("treeInfo");
  const existingList = treeInfo.querySelector("ul");
  if (existingList) existingList.remove();
  treeInfo.appendChild(logList);
}

function exportLogs() {
  const trees = JSON.parse(localStorage.getItem('trees') || '{}');
  let csv = "tree_id,date,action\n";
  for (const [id, tree] of Object.entries(trees)) {
    tree.logs.forEach(log => {
      csv += `${id},${log.date},${log.action}\n`;
    });
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "tree_logs.csv";
  a.click();
}
