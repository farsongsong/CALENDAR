/* 공휴일 데이터 */
const holidays = {
  "2026-01-01": true, "2026-02-16": true, "2026-02-17": true, "2026-02-18": true,
  "2026-03-01": true, "2026-03-02": true, "2026-05-01": true, "2026-05-05": true,
  "2026-05-24": true, "2026-05-25": true, "2026-06-03": true, "2026-06-06": true,
  "2026-08-15": true, "2026-08-17": true, "2026-09-24": true, "2026-09-25": true,
  "2026-09-26": true, "2026-10-03": true, "2026-10-09": true, "2026-12-25": true
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const calendarGrid = document.getElementById("calendar");

/* 1. 달력 생성 */
for (let m = 0; m < 12; m++) {
  const monthDiv = document.createElement("div");
  monthDiv.className = "month";
  
  monthDiv.innerHTML = `
    <div class="photo-slot">
      <input type="file" accept="image/*" style="display:none">
      <img>
    </div>
    <div class="month-name">${monthNames[m]}</div>
    <table class="mini-calendar">
      <tr><th class="sun">S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th class="sat">S</th></tr>
    </table>
  `;

  const table = monthDiv.querySelector(".mini-calendar");
  const firstDay = new Date(2026, m, 1).getDay();
  const lastDate = new Date(2026, m + 1, 0).getDate();
  
  let tr = document.createElement("tr");
  for (let i = 0; i < firstDay; i++) tr.appendChild(document.createElement("td"));

  for (let d = 1; d <= lastDate; d++) {
    const td = document.createElement("td");
    const dateStr = `2026-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    td.textContent = d;
    
    const day = (firstDay + d - 1) % 7;
    if (day === 0) td.className = "sun";
    if (day === 6) td.className = "sat";
    if (holidays[dateStr]) td.classList.add("sun");

    tr.appendChild(td);
    if ((firstDay + d) % 7 === 0 || d === lastDate) {
      table.appendChild(tr);
      tr = document.createElement("tr");
    }
  }
  calendarGrid.appendChild(monthDiv);
}

/* 2. 사진 업로드 (자동 꽉참) */
document.querySelectorAll(".photo-slot").forEach(slot => {
  const input = slot.querySelector("input");
  const img = slot.querySelector("img");

  slot.onclick = () => input.click();

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  };
});

/* 3. 저장 로직 */
const canvasArea = document.getElementById("calendar-canvas");

// [배경화면 저장]: 상단 여백 추가 후 저장
document.getElementById("saveImage").onclick = () => {
  // 1. 배경화면 모드 클래스 추가 (상단 여백 생성)
  canvasArea.classList.add("wallpaper-mode");

  // 2. 캡처
  html2canvas(canvasArea, { scale: 3 }).then(canvas => {
    const a = document.createElement("a");
    a.download = "2026_Wallpaper.png";
    a.href = canvas.toDataURL("image/png");
    a.click();

    // 3. 클래스 제거 (원상복구)
    canvasArea.classList.remove("wallpaper-mode");
  });
};

// [인쇄용 저장]: 보이는 그대로 저장
document.getElementById("savePDF").onclick = () => {
  // 여백 클래스 확실히 제거 상태 확인
  canvasArea.classList.remove("wallpaper-mode");

  const { jsPDF } = window.jspdf;
  html2canvas(canvasArea, { scale: 3 }).then(canvas => {
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
    pdf.save("2026_Print.pdf");
  });
};
