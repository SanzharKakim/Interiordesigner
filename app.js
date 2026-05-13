const stage = document.querySelector("#stage");
const roomInput = document.querySelector("#roomInput");
const emptyState = document.querySelector("#emptyState");
const roomTypes = document.querySelector("#roomTypes");
const catalog = document.querySelector("#catalog");
const swatches = document.querySelector("#swatches");
const statusText = document.querySelector("#statusText");
const widthRange = document.querySelector("#widthRange");
const heightRange = document.querySelector("#heightRange");
const depthRange = document.querySelector("#depthRange");
const rotateRange = document.querySelector("#rotateRange");
const tiltRange = document.querySelector("#tiltRange");
const duplicateBtn = document.querySelector("#duplicateBtn");
const deleteBtn = document.querySelector("#deleteBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");

const roomCatalogs = {
  living: {
    label: "Гостиная",
    furniture: [
      { type: "sofa", label: "Диван", width: 210, height: 92, depth: 34 },
      { type: "table", label: "Журнальный стол", width: 128, height: 76, depth: 18 },
      { type: "rug", label: "Ковер", width: 240, height: 140, depth: 6 },
      { type: "shelf", label: "Стеллаж", width: 96, height: 180, depth: 32 },
      { type: "cabinet", label: "ТВ-тумба", width: 170, height: 70, depth: 24 },
      { type: "plant", label: "Растение", width: 72, height: 128, depth: 18 },
    ],
  },
  bedroom: {
    label: "Спальня",
    furniture: [
      { type: "bed", label: "Кровать", width: 230, height: 150, depth: 30 },
      { type: "cabinet", label: "Тумба", width: 78, height: 70, depth: 24 },
      { type: "wardrobe", label: "Шкаф", width: 130, height: 210, depth: 44 },
      { type: "rug", label: "Ковер", width: 210, height: 120, depth: 6 },
      { type: "lamp", label: "Торшер", width: 70, height: 150, depth: 18 },
      { type: "desk", label: "Столик", width: 120, height: 82, depth: 28 },
    ],
  },
  kitchen: {
    label: "Кухня",
    furniture: [
      { type: "table", label: "Обеденный стол", width: 150, height: 92, depth: 28 },
      { type: "chair", label: "Стул", width: 70, height: 88, depth: 20 },
      { type: "cabinet", label: "Кухонный модуль", width: 150, height: 96, depth: 36 },
      { type: "fridge", label: "Холодильник", width: 86, height: 210, depth: 42 },
      { type: "shelf", label: "Полка", width: 140, height: 56, depth: 22 },
      { type: "plant", label: "Зелень", width: 64, height: 86, depth: 14 },
    ],
  },
  office: {
    label: "Кабинет",
    furniture: [
      { type: "desk", label: "Рабочий стол", width: 170, height: 86, depth: 30 },
      { type: "chair", label: "Кресло", width: 88, height: 104, depth: 24 },
      { type: "shelf", label: "Стеллаж", width: 105, height: 190, depth: 34 },
      { type: "cabinet", label: "Комод", width: 135, height: 92, depth: 30 },
      { type: "lamp", label: "Лампа", width: 62, height: 140, depth: 16 },
      { type: "plant", label: "Растение", width: 72, height: 125, depth: 18 },
    ],
  },
};

const palette = ["#314f52", "#9b6b43", "#4f5f3b", "#c65d3a", "#6f5d8f", "#202022"];

let currentRoom = "living";
let selectedItem = null;
let selectedColor = palette[0];
let roomImage = null;
let dragState = null;

function renderRoomTypes() {
  roomTypes.innerHTML = "";
  Object.entries(roomCatalogs).forEach(([key, room]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = room.label;
    button.className = key === currentRoom ? "active" : "";
    button.addEventListener("click", () => {
      currentRoom = key;
      renderRoomTypes();
      renderCatalog();
      setSelected(null);
      statusText.textContent = `Выбрана комната: ${room.label}. Каталог мебели обновлен.`;
    });
    roomTypes.append(button);
  });
}

function renderCatalog() {
  catalog.innerHTML = "";
  roomCatalogs[currentRoom].furniture.forEach((piece) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = piece.label;
    button.addEventListener("click", () => addItem(piece));
    catalog.append(button);
  });
}

function renderSwatches() {
  swatches.innerHTML = "";
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
        selectedItem.dataset.color = color;
        apply3DTransform(selectedItem);
      }
    });
    swatches.append(button);
  });
}

function setSelected(item) {
  document.querySelectorAll(".item").forEach((node) => node.classList.remove("selected"));
  selectedItem = item;

  if (!item) {
    statusText.textContent = "Выберите объект, чтобы менять размер, глубину и перспективу.";
    return;
  }

  item.classList.add("selected");
  widthRange.value = item.dataset.width;
  heightRange.value = item.dataset.height;
  depthRange.value = item.dataset.depth;
  rotateRange.value = item.dataset.rotate;
  tiltRange.value = item.dataset.tilt;
  statusText.textContent = `Выбран объект: ${item.dataset.label}.`;
}

function addItem(piece, options = {}) {
  const item = document.createElement("div");
  item.className = `item ${piece.type}`;
  item.dataset.type = piece.type;
  item.dataset.label = piece.label;
  item.dataset.width = options.width ?? piece.width;
  item.dataset.height = options.height ?? piece.height;
  item.dataset.depth = options.depth ?? piece.depth;
  item.dataset.rotate = options.rotate ?? "0";
  item.dataset.tilt = options.tilt ?? "0";
  item.dataset.color = options.color ?? selectedColor;
  item.style.left = `${options.left ?? 90 + document.querySelectorAll(".item").length * 14}px`;
  item.style.top = `${options.top ?? 90 + document.querySelectorAll(".item").length * 12}px`;

  item.innerHTML = `
    <div class="item-top"></div>
    <div class="item-side"></div>
    <div class="item-face"><span class="item-label"></span></div>
  `;
  item.querySelector(".item-label").textContent = piece.label;

  item.addEventListener("pointerdown", startDrag);
  item.addEventListener("click", (event) => {
    event.stopPropagation();
    setSelected(item);
  });

  stage.append(item);
  apply3DTransform(item);
  setSelected(item);
}

function apply3DTransform(item) {
  const width = Number(item.dataset.width);
  const height = Number(item.dataset.height);
  const depth = Number(item.dataset.depth);
  const rotate = Number(item.dataset.rotate);
  const tilt = Number(item.dataset.tilt);
  const color = item.dataset.color;

  item.style.width = `${width}px`;
  item.style.height = `${height}px`;
  item.style.setProperty("--depth", `${depth}px`);
  item.style.setProperty("--item-color", color);
  item.style.transform = `perspective(720px) rotateZ(${rotate}deg) rotateX(${tilt}deg)`;
  item.style.zIndex = String(Math.round(parseFloat(item.style.top || "0") + height));
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
  apply3DTransform(item);
}

function stopDrag(event) {
  const item = event.currentTarget;
  item.releasePointerCapture(event.pointerId);
  item.removeEventListener("pointermove", dragItem);
  item.removeEventListener("pointerup", stopDrag);
  dragState = null;
}

function updateSelectedDimensions() {
  if (!selectedItem) return;
  selectedItem.dataset.width = widthRange.value;
  selectedItem.dataset.height = heightRange.value;
  selectedItem.dataset.depth = depthRange.value;
  apply3DTransform(selectedItem);
}

function updateSelectedRotation() {
  if (!selectedItem) return;
  selectedItem.dataset.rotate = rotateRange.value;
  selectedItem.dataset.tilt = tiltRange.value;
  apply3DTransform(selectedItem);
}

function duplicateSelected() {
  if (!selectedItem) return;
  addItem(
    {
      type: selectedItem.dataset.type,
      label: selectedItem.dataset.label,
      width: Number(selectedItem.dataset.width),
      height: Number(selectedItem.dataset.height),
      depth: Number(selectedItem.dataset.depth),
    },
    {
      left: parseInt(selectedItem.style.left, 10) + 24,
      top: parseInt(selectedItem.style.top, 10) + 24,
      color: selectedItem.dataset.color,
      rotate: selectedItem.dataset.rotate,
      tilt: selectedItem.dataset.tilt,
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

  drawRoomImage(ctx, rect);

  [...document.querySelectorAll(".item")]
    .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
    .forEach((item) => draw3DItem(ctx, item));

  const link = document.createElement("a");
  link.download = "roomdraft.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawRoomImage(ctx, rect) {
  if (!roomImage) return;

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

function draw3DItem(ctx, item) {
  const left = parseFloat(item.style.left);
  const top = parseFloat(item.style.top);
  const width = Number(item.dataset.width);
  const height = Number(item.dataset.height);
  const depth = Number(item.dataset.depth);
  const rotate = Number(item.dataset.rotate) * Math.PI / 180;
  const tilt = Number(item.dataset.tilt);
  const color = item.dataset.color;
  const label = item.dataset.label;

  ctx.save();
  ctx.translate(left + width / 2, top + height / 2);
  ctx.rotate(rotate);
  ctx.transform(1, tilt / 120, 0, 1, 0, 0);

  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 14;

  ctx.fillStyle = shadeColor(color, -24);
  drawParallelogram(ctx, width / 2, -height / 2 - depth, depth, height, "side");
  ctx.fill();

  ctx.fillStyle = shadeColor(color, 18);
  drawParallelogram(ctx, -width / 2 + depth, -height / 2 - depth, width - depth, depth, "top");
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,0.26)";
  ctx.lineWidth = 2;
  roundRect(ctx, -width / 2, -height / 2, width, height, item.dataset.type === "table" ? height / 2 : 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 0, width - 12);
  ctx.restore();
}

function drawParallelogram(ctx, x, y, width, height, variant) {
  ctx.beginPath();
  if (variant === "top") {
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + height, y);
    ctx.lineTo(x + width + height, y);
    ctx.lineTo(x + width, y + height);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + height, y + height);
    ctx.lineTo(x + height, y + height * 2);
    ctx.lineTo(x, y + height);
  }
  ctx.closePath();
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

function shadeColor(color, amount) {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `rgb(${r}, ${g}, ${b})`;
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
    statusText.textContent = "Фото загружено. Добавьте мебель и подгоните ее под перспективу комнаты.";
  };
  reader.readAsDataURL(file);
});

stage.addEventListener("click", () => setSelected(null));
widthRange.addEventListener("input", updateSelectedDimensions);
heightRange.addEventListener("input", updateSelectedDimensions);
depthRange.addEventListener("input", updateSelectedDimensions);
rotateRange.addEventListener("input", updateSelectedRotation);
tiltRange.addEventListener("input", updateSelectedRotation);
duplicateBtn.addEventListener("click", duplicateSelected);
deleteBtn.addEventListener("click", deleteSelected);
clearBtn.addEventListener("click", clearRoom);
exportBtn.addEventListener("click", exportPng);

renderRoomTypes();
renderCatalog();
renderSwatches();
