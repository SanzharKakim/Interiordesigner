const stage = document.querySelector("#stage");
const roomInput = document.querySelector("#roomInput");
const emptyState = document.querySelector("#emptyState");
const catalog = document.querySelector("#catalog");
const swatches = document.querySelector("#swatches");
const statusText = document.querySelector("#statusText");
const widthRange = document.querySelector("#widthRange");
const heightRange = document.querySelector("#heightRange");
const rotateRange = document.querySelector("#rotateRange");
const duplicateBtn = document.querySelector("#duplicateBtn");
const deleteBtn = document.querySelector("#deleteBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");

const furniture = [
  { type: "sofa", label: "Диван", width: 190, height: 84 },
  { type: "table", label: "Стол", width: 120, height: 78 },
  { type: "rug", label: "Ковер", width: 220, height: 130 },
  { type: "shelf", label: "Стеллаж", width: 94, height: 180 },
  { type: "cabinet", label: "Тумба", width: 150, height: 72 },
  { type: "lamp", label: "Лампа", width: 70, height: 150 },
];

const palette = ["#314f52", "#9b6b43", "#4f5f3b", "#c65d3a", "#6f5d8f", "#202022"];

let selectedItem = null;
let selectedColor = palette[0];
let roomImage = null;
let dragState = null;

function renderCatalog() {
  furniture.forEach((piece) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = piece.label;
    button.addEventListener("click", () => addItem(piece));
    catalog.append(button);
  });
}

function renderSwatches() {
  palette.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `swatch${index === 0 ? " active" : ""}`;
    button.style.background = color;
    button.setAttribute("aria-label", `Цвет ${index + 1}`);
    button.addEventListener("click", () => {
      selectedColor = color;
      document.querySelectorAll(".swatch").forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      if (selectedItem) {
        selectedItem.style.background = color;
      }
    });
    swatches.append(button);
  });
}

function setSelected(item) {
  document.querySelectorAll(".item").forEach((node) => node.classList.remove("selected"));
  selectedItem = item;

  if (!item) {
    statusText.textContent = "Выберите мебель, чтобы менять размер и цвет.";
    return;
  }

  item.classList.add("selected");
  widthRange.value = parseInt(item.style.width, 10);
  heightRange.value = parseInt(item.style.height, 10);
  rotateRange.value = item.dataset.rotate || "0";
  statusText.textContent = `Выбран объект: ${item.dataset.label}.`;
}

function addItem(piece, options = {}) {
  const item = document.createElement("div");
  item.className = `item ${piece.type}`;
  item.dataset.type = piece.type;
  item.dataset.label = piece.label;
  item.dataset.rotate = options.rotate ?? "0";
  item.textContent = piece.label;
  item.style.width = `${options.width ?? piece.width}px`;
  item.style.height = `${options.height ?? piece.height}px`;
  item.style.left = `${options.left ?? 90 + stage.children.length * 12}px`;
  item.style.top = `${options.top ?? 90 + stage.children.length * 10}px`;
  item.style.background = options.color ?? selectedColor;
  item.style.transform = `rotate(${item.dataset.rotate}deg)`;

  item.addEventListener("pointerdown", startDrag);
  item.addEventListener("click", (event) => {
    event.stopPropagation();
    setSelected(item);
  });

  stage.append(item);
  setSelected(item);
}

function startDrag(event) {
  const item = event.currentTarget;
  setSelected(item);
  item.setPointerCapture(event.pointerId);

  const stageRect = stage.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  dragState = {
    item,
    offsetX: event.clientX - itemRect.left,
    offsetY: event.clientY - itemRect.top,
    stageLeft: stageRect.left,
    stageTop: stageRect.top,
  };

  item.addEventListener("pointermove", dragItem);
  item.addEventListener("pointerup", stopDrag);
}

function dragItem(event) {
  if (!dragState) return;

  const { item, offsetX, offsetY, stageLeft, stageTop } = dragState;
  const maxLeft = stage.clientWidth - item.offsetWidth;
  const maxTop = stage.clientHeight - item.offsetHeight;
  const left = Math.min(Math.max(event.clientX - stageLeft - offsetX, 0), maxLeft);
  const top = Math.min(Math.max(event.clientY - stageTop - offsetY, 0), maxTop);

  item.style.left = `${left}px`;
  item.style.top = `${top}px`;
}

function stopDrag(event) {
  const item = event.currentTarget;
  item.releasePointerCapture(event.pointerId);
  item.removeEventListener("pointermove", dragItem);
  item.removeEventListener("pointerup", stopDrag);
  dragState = null;
}

function updateSelectedSize() {
  if (!selectedItem) return;
  selectedItem.style.width = `${widthRange.value}px`;
  selectedItem.style.height = `${heightRange.value}px`;
}

function updateSelectedRotation() {
  if (!selectedItem) return;
  selectedItem.dataset.rotate = rotateRange.value;
  selectedItem.style.transform = `rotate(${rotateRange.value}deg)`;
}

function duplicateSelected() {
  if (!selectedItem) return;
  addItem(
    {
      type: selectedItem.dataset.type,
      label: selectedItem.dataset.label,
      width: parseInt(selectedItem.style.width, 10),
      height: parseInt(selectedItem.style.height, 10),
    },
    {
      left: parseInt(selectedItem.style.left, 10) + 24,
      top: parseInt(selectedItem.style.top, 10) + 24,
      color: selectedItem.style.background,
      rotate: selectedItem.dataset.rotate,
    },
  );
}

function deleteSelected() {
  if (!selectedItem) return;
  selectedItem.remove();
  setSelected(null);
}

function clearRoom() {
  document.querySelectorAll(".item").forEach((item) => item.remove());
  setSelected(null);
}

function exportPng() {
  const rect = stage.getBoundingClientRect();
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, rect.width, rect.height);

  if (roomImage) {
    const imageRatio = roomImage.width / roomImage.height;
    const stageRatio = rect.width / rect.height;
    let drawWidth = rect.width;
    let drawHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > stageRatio) {
      drawHeight = rect.width / imageRatio;
      offsetY = (rect.height - drawHeight) / 2;
    } else {
      drawWidth = rect.height * imageRatio;
      offsetX = (rect.width - drawWidth) / 2;
    }

    ctx.drawImage(roomImage, offsetX, offsetY, drawWidth, drawHeight);
  }

  document.querySelectorAll(".item").forEach((item) => {
    const left = parseFloat(item.style.left);
    const top = parseFloat(item.style.top);
    const width = parseFloat(item.style.width);
    const height = parseFloat(item.style.height);
    const rotate = parseFloat(item.dataset.rotate || "0") * Math.PI / 180;

    ctx.save();
    ctx.translate(left + width / 2, top + height / 2);
    ctx.rotate(rotate);
    ctx.fillStyle = item.style.background;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
    ctx.lineWidth = 2;
    roundRect(ctx, -width / 2, -height / 2, width, height, item.classList.contains("table") ? height / 2 : 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.dataset.label, 0, 0);
    ctx.restore();
  });

  const link = document.createElement("a");
  link.download = "roomdraft.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

roomInput.addEventListener("change", () => {
  const file = roomInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    stage.style.backgroundImage = `url("${reader.result}")`;
    emptyState.style.display = "none";

    roomImage = new Image();
    roomImage.src = reader.result;
    statusText.textContent = "Фото загружено. Теперь добавьте мебель и расставьте ее.";
  };
  reader.readAsDataURL(file);
});

stage.addEventListener("click", () => setSelected(null));
widthRange.addEventListener("input", updateSelectedSize);
heightRange.addEventListener("input", updateSelectedSize);
rotateRange.addEventListener("input", updateSelectedRotation);
duplicateBtn.addEventListener("click", duplicateSelected);
deleteBtn.addEventListener("click", deleteSelected);
clearBtn.addEventListener("click", clearRoom);
exportBtn.addEventListener("click", exportPng);

renderCatalog();
renderSwatches();
