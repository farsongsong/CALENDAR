const holidays = {
  "2026-01-01": true, "2026-02-16": true, "2026-02-17": true, "2026-02-18": true,
  "2026-03-01": true, "2026-03-02": true, "2026-05-01": true, "2026-05-05": true,
  "2026-05-24": true, "2026-05-25": true, "2026-06-03": true, "2026-06-06": true,
  "2026-08-15": true, "2026-08-17": true, "2026-09-24": true, "2026-09-25": true,
  "2026-09-26": true, "2026-10-03": true, "2026-10-09": true, "2026-12-25": true
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendarGrid = document.getElementById("calendar");

// 1. 달력 날짜 생성 (12달 전체)
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

// 2. 사진 편집(Cropper) 기능
let cropper;
let currentImg;
const modal = document.getElementById("cropper-modal");
const cropperImg = document.getElementById("cropper-image");

document.querySelectorAll(".photo-slot").forEach(slot => {
  const input = slot.querySelector("input");
  const img = slot.querySelector("img");

  slot.onclick = () => input.click();

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    currentImg = img;
    const reader = new FileReader();
    reader.onload = (ev) => {
      cropperImg.src = ev.target.result;
      modal.style.display = "flex";
      if (cropper) cropper.destroy();
      cropper = new Cropper(cropperImg, { aspectRatio: 1, viewMode: 1 });
    };
    reader.readAsDataURL(file);
    input.value = ""; // 파일 선택 초기화
  };
});

document.getElementById("crop-confirm").onclick = () => {
  const canvas = cropper.getCroppedCanvas({ width: 500, height: 500 });
  currentImg.src = canvas.toDataURL();
  currentImg.style.display = "block";
  modal.style.display = "none";
};

document.getElementById("crop-cancel").onclick = () => modal.style.display = "none";

// 3. 저장 기능
const canvasArea = document.getElementById("calendar-canvas");
document.getElementById("saveImage").onclick = () => {
  canvasArea.classList.add("wallpaper-mode");
  html2canvas(canvasArea, { scale: 3 }).then(canvas => {
    const a = document.createElement("a");
    a.download = "2026_Wallpaper.png";
    a.href = canvas.toDataURL();
    a.click();
    canvasArea.classList.remove("wallpaper-mode");
  });
};

document.getElementById("savePDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  html2canvas(canvasArea, { scale: 3 }).then(canvas => {
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, (canvas.height * w) / canvas.width);
    pdf.save("2026_Print.pdf");
  });
};
