/* ===============================
   2026 공휴일 (대체 포함)
================================ */
const holidays = {
  "2026-01-01": true,
  "2026-02-16": true,
  "2026-02-17": true,
  "2026-02-18": true,
  "2026-03-01": true,
  "2026-03-02": true,
  "2026-05-01": true,
  "2026-05-05": true,
  "2026-05-24": true,
  "2026-05-25": true,
  "2026-06-03": true,
  "2026-06-06": true,
  "2026-08-15": true,
  "2026-08-17": true,
  "2026-09-24": true,
  "2026-09-25": true,
  "2026-09-26": true,
  "2026-10-03": true,
  "2026-10-09": true,
  "2026-12-25": true
};

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/* ===============================
   달력 생성
================================ */
const calendar = document.getElementById("calendar");

for (let m = 0; m < 12; m++) {
  const monthDiv = document.createElement("div");
  monthDiv.className = "month";

  monthDiv.innerHTML = `
    <div class="photo-slot">
      <input type="file" accept="image/*">
      <img draggable="false">
    </div>
    <p class="month-name">${monthNames[m]}</p>
  `;

  const table = document.createElement("table");
  table.className = "mini-calendar";
  table.innerHTML = `
    <tr>
      <th class="sun">S</th><th>M</th><th>T</th><th>W</th>
      <th>T</th><th>F</th><th class="sat">S</th>
    </tr>
  `;

  const firstDay = new Date(2026, m, 1).getDay();
  const lastDate = new Date(2026, m + 1, 0).getDate();

  let tr = document.createElement("tr");
  for (let i = 0; i < firstDay; i++) tr.appendChild(document.createElement("td"));

  for (let d = 1; d <= lastDate; d++) {
    const td = document.createElement("td");
    const dateStr = `2026-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    td.textContent = d;

    const day = new Date(2026, m, d).getDay();
    if (day === 0) td.classList.add("sun");
    if (day === 6) td.classList.add("sat");
    if (holidays[dateStr]) td.classList.add("holiday");

    tr.appendChild(td);

    if ((firstDay + d) % 7 === 0 || d === lastDate) {
      table.appendChild(tr);
      tr = document.createElement("tr");
    }
  }

  monthDiv.appendChild(table);
  calendar.appendChild(monthDiv);
}

/* ===============================
   사진 업로드 + 정확한 드래그
================================ */
document.querySelectorAll(".photo-slot").forEach(slot => {
  const input = slot.querySelector("input");
  const img = slot.querySelector("img");

  let dragging = false;
  let sx, sy, startLeft, startTop;

  slot.onclick = () => input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;

      img.onload = () => {
        const slotW = slot.clientWidth;
        const slotH = slot.clientHeight;
        const imgW = img.clientWidth;
        const imgH = img.clientHeight;

        img.style.left = `${(slotW - imgW) / 2}px`;
        img.style.top  = `${(slotH - imgH) / 2}px`;
      };
    };
    reader.readAsDataURL(file);
  };

  img.onmousedown = e => {
    dragging = true;
    sx = e.clientX;
    sy = e.clientY;
    startLeft = img.offsetLeft;
    startTop = img.offsetTop;
    img.style.cursor = "grabbing";
  };

  window.onmousemove = e => {
    if (!dragging) return;

    let newLeft = startLeft + (e.clientX - sx);
    let newTop  = startTop + (e.clientY - sy);

    const minLeft = slot.clientWidth - img.clientWidth;
    const minTop  = slot.clientHeight - img.clientHeight;

    newLeft = Math.min(0, Math.max(minLeft, newLeft));
    newTop  = Math.min(0, Math.max(minTop, newTop));

    img.style.left = newLeft + "px";
    img.style.top  = newTop + "px";
  };

  window.onmouseup = () => {
    dragging = false;
    img.style.cursor = "grab";
  };
});

/* ===============================
   반응형 스케일 (확실히 작동)
================================ */
function resizeCalendar() {
  const wrapper = document.getElementById("calendar-wrapper");
  const cal = document.querySelector(".calendar");

  const screenW = window.innerWidth - 20;
  const calW = cal.offsetWidth;

  const scale = Math.min(screenW / calW, 1);
  wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener("load", resizeCalendar);
window.addEventListener("resize", resizeCalendar);

/* ===============================
   PNG / PDF 저장
================================ */
document.getElementById("saveImage").onclick = () => {
  html2canvas(document.getElementById("calendar-wrapper"), { scale: 2 })
    .then(canvas => {
      const a = document.createElement("a");
      a.download = "2026_calendar.png";
      a.href = canvas.toDataURL();
      a.click();
    });
};

document.getElementById("savePDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  html2canvas(document.getElementById("calendar-wrapper"), { scale: 2 })
    .then(canvas => {
      const pdf = new jsPDF("portrait", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = canvas.height * w / canvas.width;
      pdf.addImage(canvas, "PNG", 0, 0, w, h);
      pdf.save("2026_calendar.pdf");
    });
};
