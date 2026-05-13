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
const sizeReadout = document.querySelector("#sizeReadout");
const roomWidthInput = document.querySelector("#roomWidthInput");
const roomDepthInput = document.querySelector("#roomDepthInput");
const roomHeightInput = document.querySelector("#roomHeightInput");
const gridToggle = document.querySelector("#gridToggle");
const perspectiveGrid = document.querySelector("#perspectiveGrid");
const gridWidthLabel = document.querySelector("#gridWidthLabel");
const gridDepthLabel = document.querySelector("#gridDepthLabel");
const gridHeightLabel = document.querySelector("#gridHeightLabel");
const stageDimensions = document.querySelector("#stageDimensions");
const cameraTiltRange = document.querySelector("#cameraTiltRange");
const cameraYawRange = document.querySelector("#cameraYawRange");
const cameraZoomRange = document.querySelector("#cameraZoomRange");
const frontViewBtn = document.querySelector("#frontViewBtn");
const leftViewBtn = document.querySelector("#leftViewBtn");
const rightViewBtn = document.querySelector("#rightViewBtn");
const topViewBtn = document.querySelector("#topViewBtn");
const resultPanel = document.querySelector("#resultPanel");
const resultImage = document.querySelector("#resultImage");
const materialsList = document.querySelector("#materialsList");
const downloadResultLink = document.querySelector("#downloadResultLink");
const duplicateBtn = document.querySelector("#duplicateBtn");
const deleteBtn = document.querySelector("#deleteBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearBtn = document.querySelector("#clearBtn");

const roomCatalogs = {
  living: {
    label: "Гостиная",
    room: { width: 3.2, depth: 4.0, height: 2.7 },
    furniture: [
      piece("sofa", "Диван", 210, 92, 34, 220, 95, 85),
      piece("table", "Журнальный стол", 128, 76, 18, 110, 60, 45),
      piece("rug", "Ковер", 240, 140, 6, 240, 160, 2),
      piece("shelf", "Стеллаж", 96, 180, 32, 90, 35, 190),
      piece("cabinet", "ТВ-тумба", 170, 70, 24, 160, 42, 55),
      piece("plant", "Растение", 72, 128, 18, 55, 55, 130),
    ],
  },
  bedroom: {
    label: "Спальня",
    room: { width: 3.0, depth: 3.6, height: 2.7 },
    furniture: [
      piece("bed", "Кровать", 230, 150, 30, 200, 160, 45),
      piece("cabinet", "Тумба", 78, 70, 24, 50, 40, 55),
      piece("wardrobe", "Шкаф", 130, 210, 44, 120, 60, 220),
      piece("rug", "Ковер", 210, 120, 6, 200, 140, 2),
      piece("lamp", "Торшер", 70, 150, 18, 45, 45, 160),
      piece("desk", "Столик", 120, 82, 28, 100, 50, 75),
    ],
  },
  kitchen: {
    label: "Кухня",
    room: { width: 2.8, depth: 3.2, height: 2.7 },
    furniture: [
      piece("table", "Обеденный стол", 150, 92, 28, 140, 80, 75),
      piece("chair", "Стул", 70, 88, 20, 45, 50, 85),
      piece("cabinet", "Кухонный модуль", 150, 96, 36, 120, 60, 90),
      piece("fridge", "Холодильник", 86, 210, 42, 60, 65, 200),
      piece("shelf", "Полка", 140, 56, 22, 120, 25, 35),
      piece("plant", "Зелень", 64, 86, 14, 35, 35, 55),
    ],
  },
  office: {
    label: "Кабинет",
    room: { width: 2.6, depth: 3.0, height: 2.7 },
    furniture: [
      piece("desk", "Рабочий стол", 170, 86, 30, 140, 70, 75),
      piece("chair", "Кресло", 88, 104, 24, 65, 65, 95),
      piece("shelf", "Стеллаж", 105, 190, 34, 90, 35, 200),
      piece("cabinet", "Комод", 135, 92, 30, 120, 45, 85),
      piece("lamp", "Лампа", 62, 140, 16, 40, 40, 145),
      piece("plant", "Растение", 72, 125, 18, 55, 55, 125),
    ],
  },
};

const palette = ["#314f52", "#9b6b43", "#4f5f3b", "#c65d3a", "#6f5d8f", "#202022"];

let currentRoom = "living";
let selectedItem = null;
let selectedColor = palette[0];
let roomImage = null;
let dragState = null;
let cameraDragState = null;

function piece(type, label, width, height, depth, realWidth, realDepth, realHeight) {
  return { type, label, width, height, depth, realWidth, realDepth, realHeight };
}

function renderRoomTypes() {
  roomTypes.innerHTML = "";
  Object.entries(roomCatalogs).forEach(([key, room]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = room.label;
    button.className = key === currentRoom ? "active" : "";
    button.addEventListener("click", () => {
      currentRoom = key;
      setRoomDefaults(room.room);
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
  roomCatalogs[currentRoom].furniture.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${item.label}</strong><small>${item.realWidth}x${item.realDepth}x${item.realHeight} см</small>`;
    button.addEventListener("click", () => addItem(item));
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

function setRoomDefaults(room) {
  roomWidthInput.value = room.width;
  roomDepthInput.value = room.depth;
  roomHeightInput.value = room.height;
  updateGridLabels();
}

function updateGridLabels() {
  const width = Number(roomWidthInput.value).toFixed(1);
  const depth = Number(roomDepthInput.value).toFixed(1);
  const height = Number(roomHeightInput.value).toFixed(1);

  gridWidthLabel.textContent = `ширина ${width} м`;
  gridDepthLabel.textContent = `глубина ${depth} м`;
  gridHeightLabel.textContent = `высота ${height} м`;
  stageDimensions.textContent = `Длина: ${depth} м · Ширина: ${width} м · Высота: ${height} м`;
}

function setCamera({ tilt, yaw, zoom }) {
  if (tilt !== undefined) cameraTiltRange.value = tilt;
  if (yaw !== undefined) cameraYawRange.value = yaw;
  if (zoom !== undefined) cameraZoomRange.value = zoom;
  updateCamera();
}

function updateCamera() {
  const tilt = Number(cameraTiltRange.value);
  const yaw = Number(cameraYawRange.value);
  const zoom = Number(cameraZoomRange.value) / 100;

  stage.style.setProperty("--camera-tilt", `${tilt}deg`);
  stage.style.setProperty("--camera-yaw", `${yaw}deg`);
  stage.style.setProperty("--camera-zoom", zoom);
}

function setSelected(item) {
  document.querySelectorAll(".item").forEach((node) => node.classList.remove("selected"));
  selectedItem = item;

  if (!item) {
    statusText.textContent = "Выберите объект, чтобы менять размер, глубину и перспективу.";
    sizeReadout.textContent = "Размеры появятся после выбора мебели.";
    return;
  }

  item.classList.add("selected");
  widthRange.value = item.dataset.width;
  heightRange.value = item.dataset.height;
  depthRange.value = item.dataset.depth;
  rotateRange.value = item.dataset.rotate;
  tiltRange.value = item.dataset.tilt;
  statusText.textContent = `Выбран объект: ${item.dataset.label}.`;
  updateSizeReadout(item);
}

function addItem(template, options = {}) {
  const item = document.createElement("div");
  item.className = `item ${template.type}`;
  item.dataset.type = template.type;
  item.dataset.label = template.label;
  item.dataset.width = options.width ?? template.width;
  item.dataset.height = options.height ?? template.height;
  item.dataset.depth = options.depth ?? template.depth;
  item.dataset.baseWidth = options.baseWidth ?? template.width;
  item.dataset.baseHeight = options.baseHeight ?? template.height;
  item.dataset.baseDepth = options.baseDepth ?? template.depth;
  item.dataset.realWidth = options.realWidth ?? template.realWidth;
  item.dataset.realDepth = options.realDepth ?? template.realDepth;
  item.dataset.realHeight = options.realHeight ?? template.realHeight;
  item.dataset.rotate = options.rotate ?? "0";
  item.dataset.tilt = options.tilt ?? "0";
  item.dataset.color = options.color ?? selectedColor;
  item.style.left = `${options.left ?? 90 + document.querySelectorAll(".item").length * 14}px`;
  item.style.top = `${options.top ?? 90 + document.querySelectorAll(".item").length * 12}px`;

  item.innerHTML = `
    <div class="item-top"></div>
    <div class="item-side"></div>
    <div class="item-face">
      <span class="item-label"></span>
      <span class="item-size"></span>
    </div>
  `;

  item.querySelector(".item-label").textContent = template.label;
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
  if (item === selectedItem) updateSizeReadout(item);
}

function estimatedSize(item) {
  const widthScale = Number(item.dataset.width) / Number(item.dataset.baseWidth);
  const heightScale = Number(item.dataset.height) / Number(item.dataset.baseHeight);
  const depthScale = Number(item.dataset.depth) / Math.max(1, Number(item.dataset.baseDepth));

  return {
    width: Math.round(Number(item.dataset.realWidth) * widthScale),
    depth: Math.round(Number(item.dataset.realDepth) * depthScale),
    height: Math.round(Number(item.dataset.realHeight) * heightScale),
  };
}

function compactSizeText(item) {
  const size = estimatedSize(item);
  return `${size.width}x${size.depth}x${size.height} см`;
}

function updateSizeReadout(item) {
  const size = estimatedSize(item);
  sizeReadout.textContent = `Примерно: ширина ${size.width} см, глубина ${size.depth} см, высота ${size.height} см.`;
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
      realWidth: Number(selectedItem.dataset.realWidth),
      realDepth: Number(selectedItem.dataset.realDepth),
      realHeight: Number(selectedItem.dataset.realHeight),
    },
    {
      left: parseInt(selectedItem.style.left, 10) + 24,
      top: parseInt(selectedItem.style.top, 10) + 24,
      color: selectedItem.dataset.color,
      rotate: selectedItem.dataset.rotate,
      tilt: selectedItem.dataset.tilt,
      baseWidth: selectedItem.dataset.baseWidth,
      baseHeight: selectedItem.dataset.baseHeight,
      baseDepth: selectedItem.dataset.baseDepth,
      realWidth: selectedItem.dataset.realWidth,
      realDepth: selectedItem.dataset.realDepth,
      realHeight: selectedItem.dataset.realHeight,
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

  drawRoomDimensions(ctx, rect);

  const imageUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "domix-ai-room.png";
  link.href = imageUrl;
  link.click();
  showResult(imageUrl);
}

function showResult(imageUrl) {
  resultImage.src = imageUrl;
  downloadResultLink.href = imageUrl;
  materialsList.innerHTML = buildMaterialsHtml();
  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildMaterialsHtml() {
  const items = [...document.querySelectorAll(".item")];
  if (!items.length) {
    return '<div class="material-card"><h3>Мебель не добавлена</h3><p>Добавьте предметы на фото, чтобы получить расчет материалов.</p></div>';
  }

  const totals = {
    sheet: 0,
    fabric: 0,
    filler: 0,
    carpet: 0,
    edging: 0,
  };

  const cards = items.map((item, index) => {
    const size = estimatedSize(item);
    const materials = estimateMaterials(item, size, totals);
    return `
      <article class="material-card">
        <h3>${index + 1}. ${item.dataset.label}</h3>
        <p><b>Размеры:</b> Длина: ${size.depth} см · Ширина: ${size.width} см · Высота: ${size.height} см</p>
        <p><b>Материалы:</b> ${materials}</p>
      </article>
    `;
  }).join("");

  return `
    <article class="material-card material-summary">
      <h3>Итого по проекту</h3>
      <p><b>Предметов мебели:</b> ${items.length}</p>
      <p><b>Плитный материал:</b> ${formatNumber(totals.sheet)} м² · <b>Ткань:</b> ${formatNumber(totals.fabric)} м² · <b>Наполнитель:</b> ${formatNumber(totals.filler)} м³</p>
      <p><b>Ковровое покрытие:</b> ${formatNumber(totals.carpet)} м² · <b>Кромка/окантовка:</b> ${formatNumber(totals.edging)} м</p>
    </article>
    ${cards}
  `;
}

function estimateMaterials(item, size, totals) {
  const type = item.dataset.type;
  const w = size.width / 100;
  const d = size.depth / 100;
  const h = size.height / 100;
  const surfaceArea = 2 * (w * d + w * h + d * h);
  const footprint = w * d;

  if (type === "rug") {
    totals.carpet += footprint;
    totals.edging += 2 * (w + d);
    return `ковровое покрытие ${formatNumber(footprint)} м², окантовка ${formatNumber(2 * (w + d))} м`;
  }

  if (["sofa", "chair", "bed"].includes(type)) {
    const fabric = surfaceArea * 0.75;
    const filler = w * d * Math.max(h, 0.35);
    const sheet = surfaceArea * 0.32;
    totals.fabric += fabric;
    totals.filler += filler;
    totals.sheet += sheet;
    return `обивочная ткань ${formatNumber(fabric)} м², наполнитель ${formatNumber(filler)} м³, каркас ${formatNumber(sheet)} м²`;
  }

  if (["cabinet", "shelf", "wardrobe", "desk", "table"].includes(type)) {
    const sheet = surfaceArea * 0.82;
    const edging = 4 * (w + d + h);
    totals.sheet += sheet;
    totals.edging += edging;
    return `плитный материал ${formatNumber(sheet)} м², кромка ${formatNumber(edging)} м, фурнитура 1 комплект`;
  }

  if (type === "lamp") {
    return `корпус/стойка ${formatNumber(h)} м, основание ${formatNumber(footprint)} м², электрика 1 комплект`;
  }

  if (type === "plant") {
    return `кашпо ${formatNumber(w * d * h)} м³, декоративный наполнитель ${formatNumber(footprint)} м²`;
  }

  if (type === "fridge") {
    return `габаритный корпус ${formatNumber(w * d * h)} м³, фасадная площадь ${formatNumber(w * h)} м²`;
  }

  totals.sheet += surfaceArea * 0.7;
  return `основной материал ${formatNumber(surfaceArea * 0.7)} м², объем ${formatNumber(w * d * h)} м³`;
}

function formatNumber(value) {
  return value.toFixed(2).replace(".", ",");
}

function drawRoomDimensions(ctx, rect) {
  const width = Number(roomWidthInput.value).toFixed(1);
  const depth = Number(roomDepthInput.value).toFixed(1);
  const height = Number(roomHeightInput.value).toFixed(1);
  const text = `Длина: ${depth} м · Ширина: ${width} м · Высота: ${height} м`;

  ctx.save();
  ctx.font = "700 14px Arial";
  const textWidth = ctx.measureText(text).width;
  const boxWidth = Math.min(rect.width - 24, textWidth + 24);
  const boxHeight = 34;
  const x = (rect.width - boxWidth) / 2;
  const y = rect.height - boxHeight - 12;

  ctx.fillStyle = "rgba(255,253,248,0.92)";
  roundRect(ctx, x, y, boxWidth, boxHeight, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(47,111,115,0.28)";
  ctx.stroke();
  ctx.fillStyle = "#20565a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, rect.width / 2, y + boxHeight / 2, boxWidth - 18);
  ctx.restore();
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
  ctx.fillText(label, 0, -7, width - 12);
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
    statusText.textContent = "Фото загружено. Используйте 3D-сетку как ориентир пола, стен и глубины комнаты.";
  };
  reader.readAsDataURL(file);
});

stage.addEventListener("click", () => setSelected(null));
stage.addEventListener("pointerdown", startCameraDrag);
widthRange.addEventListener("input", updateSelectedDimensions);
heightRange.addEventListener("input", updateSelectedDimensions);
depthRange.addEventListener("input", updateSelectedDimensions);
rotateRange.addEventListener("input", updateSelectedRotation);
tiltRange.addEventListener("input", updateSelectedRotation);
roomWidthInput.addEventListener("input", updateGridLabels);
roomDepthInput.addEventListener("input", updateGridLabels);
roomHeightInput.addEventListener("input", updateGridLabels);
gridToggle.addEventListener("change", () => {
  perspectiveGrid.classList.toggle("hidden", !gridToggle.checked);
});
cameraTiltRange.addEventListener("input", updateCamera);
cameraYawRange.addEventListener("input", updateCamera);
cameraZoomRange.addEventListener("input", updateCamera);
frontViewBtn.addEventListener("click", () => setCamera({ tilt: 0, yaw: 0, zoom: 100 }));
leftViewBtn.addEventListener("click", () => setCamera({ tilt: 8, yaw: -24, zoom: 96 }));
rightViewBtn.addEventListener("click", () => setCamera({ tilt: 8, yaw: 24, zoom: 96 }));
topViewBtn.addEventListener("click", () => setCamera({ tilt: 30, yaw: 0, zoom: 92 }));
duplicateBtn.addEventListener("click", duplicateSelected);
deleteBtn.addEventListener("click", deleteSelected);
clearBtn.addEventListener("click", clearRoom);
exportBtn.addEventListener("click", exportPng);

setRoomDefaults(roomCatalogs[currentRoom].room);
renderRoomTypes();
renderCatalog();
renderSwatches();
updateCamera();

function startCameraDrag(event) {
  if (event.target.closest(".item")) return;

  stage.setPointerCapture(event.pointerId);
  stage.classList.add("dragging-camera");
  cameraDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startTilt: Number(cameraTiltRange.value),
    startYaw: Number(cameraYawRange.value),
  };

  stage.addEventListener("pointermove", dragCamera);
  stage.addEventListener("pointerup", stopCameraDrag);
  stage.addEventListener("pointercancel", stopCameraDrag);
}

function dragCamera(event) {
  if (!cameraDragState) return;

  const dx = event.clientX - cameraDragState.startX;
  const dy = event.clientY - cameraDragState.startY;
  const yaw = clamp(cameraDragState.startYaw + dx * 0.16, -35, 35);
  const tilt = clamp(cameraDragState.startTilt - dy * 0.16, -35, 35);

  cameraYawRange.value = yaw;
  cameraTiltRange.value = tilt;
  updateCamera();
}

function stopCameraDrag(event) {
  if (cameraDragState) {
    stage.releasePointerCapture(cameraDragState.pointerId);
  }
  stage.classList.remove("dragging-camera");
  stage.removeEventListener("pointermove", dragCamera);
  stage.removeEventListener("pointerup", stopCameraDrag);
  stage.removeEventListener("pointercancel", stopCameraDrag);
  cameraDragState = null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
