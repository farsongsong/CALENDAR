const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const calendarGrid = document.getElementById("calendar");

// 1. 달력 생성
for (let m = 0; m < 12; m++) {
  const monthDiv = document.createElement("div");
  monthDiv.className = "month";
  monthDiv.innerHTML = `
    <div class="photo-slot" data-month="${m}">
      <input type="file" accept="image/*" style="display:none">
      <img src="" style="display:none">
    </div>
    <div class="month-name">${monthNames[m]}</div>
    <table class="mini-calendar">
      <tr><th class="sun">S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th class="sat">S</th></tr>
    </table>
  `;
  // 날짜 생성 로직 (이전과 동일) 생략...
  calendarGrid.appendChild(monthDiv);
}

// 2. Cropper 기능 구현
let cropper;
let currentSlotImg;
const modal = document.getElementById("cropper-modal");
const cropperImg = document.getElementById("cropper-image");

document.querySelectorAll(".photo-slot").forEach(slot => {
  const input = slot.querySelector("input");
  const img = slot.querySelector("img");

  slot.onclick = () => input.click();

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentSlotImg = img;
    const reader = new FileReader();
    reader.onload = (ev) => {
      cropperImg.src = ev.target.result;
      modal.style.display = "flex";
      
      if(cropper) cropper.destroy();
      cropper = new Cropper(cropperImg, {
        aspectRatio: 1, // 1:1 고정
        viewMode: 1,
      });
    };
    reader.readAsDataURL(file);
    input.value = ""; // 초기화
  };
});

// 자르기 확인 버튼
document.getElementById("crop-confirm").onclick = () => {
  const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
  currentSlotImg.src = canvas.toDataURL();
  currentSlotImg.style.display = "block";
  modal.style.display = "none";
};

// 취소 버튼
document.getElementById("crop-cancel").onclick = () => {
  modal.style.display = "none";
};

// 3. 저장 로직 (이전과 동일)
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
