let characters = [];
let selection = {
  left: null,
  right: null,
  leftGrandfather: null,
  leftGrandmother: null,
  rightGrandfather: null,
  rightGrandmother: null,
};

const leftChar = document.getElementById("left-char");
const rightChar = document.getElementById("right-char");
const leftGrandfather = document.getElementById("left-grandfather");
const leftGrandmother = document.getElementById("left-grandmother");
const rightGrandfather = document.getElementById("right-grandfather");
const rightGrandmother = document.getElementById("right-grandmother");
const charList = document.getElementById("char-list");
const resultDiv = document.getElementById("result");

let activeTarget = null;

// -------------------
// 初期化
// -------------------
async function init() {
  characters = await window.getCharacters();
  renderCharList();
}

// -------------------
// キャラクター一覧レンダリング
// -------------------
function renderCharList() {
  charList.innerHTML = "";

  const sortedChars = characters
    .map((ch, idx) => ({ ...ch, origIndex: idx }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const fragment = document.createDocumentFragment();

  sortedChars.forEach((ch) => {
    const div = document.createElement("div");
    div.classList.add("char-icon");
    const imgName = ch.name.replace(/\s/g, "");
    div.style.backgroundImage = `url(images/${imgName}.png)`;
    div.dataset.index = ch.origIndex;
    div.addEventListener("click", () => selectCharForTarget(div.dataset.index));
    fragment.appendChild(div);
  });

  charList.appendChild(fragment);
}

// -------------------
// 選択対象の丸をクリック
// -------------------
function setActiveChar(el) {
  document
    .querySelectorAll(".selected-char.active")
    .forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
  activeTarget = el;
}

[
  leftChar,
  rightChar,
  leftGrandfather,
  leftGrandmother,
  rightGrandfather,
  rightGrandmother,
].forEach((el) => el.addEventListener("click", () => setActiveChar(el)));

// -------------------
// キャラクター選択
// -------------------
function selectCharForTarget(index) {
  if (!activeTarget) return;
  const ch = characters[index];
  const imgName = ch.name.replace(/\s/g, "");
  activeTarget.style.backgroundImage = `url(images/${imgName}.png)`;

  switch (activeTarget.id) {
    case "left-char":
      selection.left = ch;
      break;
    case "right-char":
      selection.right = ch;
      break;
    case "left-grandfather":
      selection.leftGrandfather = ch;
      break;
    case "left-grandmother":
      selection.leftGrandmother = ch;
      break;
    case "right-grandfather":
      selection.rightGrandfather = ch;
      break;
    case "right-grandmother":
      selection.rightGrandmother = ch;
      break;
  }

  updateSelectedBorder();
}

// -------------------
// 選択済み枠の更新
// -------------------
function updateSelectedBorder() {
  document
    .querySelectorAll(".char-icon")
    .forEach((el) => el.classList.remove("selected"));
  if (selection.left) leftChar.classList.add("selected");
  if (selection.right) rightChar.classList.add("selected");
  if (selection.leftGrandfather) leftGrandfather.classList.add("selected");
  if (selection.leftGrandmother) leftGrandmother.classList.add("selected");
  if (selection.rightGrandfather) rightGrandfather.classList.add("selected");
  if (selection.rightGrandmother) rightGrandmother.classList.add("selected");
}

// -------------------
// 結果一覧クリックでアクティブ枠に反映
// -------------------
function attachResultClickEvents() {
  document.querySelectorAll(".character-result img").forEach((img) => {
    img.addEventListener("click", () => {
      if (!activeTarget) setActiveChar(leftChar);
      const name = img.alt;
      const ch = characters.find((c) => c.name === name);
      if (!ch) return;
      activeTarget.style.backgroundImage = `url(images/${name.replace(
        /\s/g,
        ""
      )}.png)`;

      switch (activeTarget.id) {
        case "left-char":
          selection.left = ch;
          break;
        case "right-char":
          selection.right = ch;
          break;
        case "left-grandfather":
          selection.leftGrandfather = ch;
          break;
        case "left-grandmother":
          selection.leftGrandmother = ch;
          break;
        case "right-grandfather":
          selection.rightGrandfather = ch;
          break;
        case "right-grandmother":
          selection.rightGrandmother = ch;
          break;
      }
      updateSelectedBorder();
    });
  });
}

// -------------------
// モーダル生成関数
// -------------------
function showModal(title, content, onSelect) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2>${title}</h2>
      <div class="modal-body">${content}</div>
    </div>
  `;
  document.body.appendChild(modal);

  modal
    .querySelector(".modal-close")
    .addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  if (onSelect) {
    modal.querySelectorAll(".history-item").forEach((el, idx) => {
      el.addEventListener("click", () => {
        onSelect(idx);
        modal.remove();
      });
    });
  }
}

// -------------------
// 履歴管理
// -------------------
function saveHistory() {
  const record = {
    timestamp: Date.now(),
    names: [
      selection.left?.name,
      selection.leftGrandfather?.name,
      selection.leftGrandmother?.name,
      selection.right?.name,
      selection.rightGrandfather?.name,
      selection.rightGrandmother?.name,
    ],
  };
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  history.unshift(record);
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem("history", JSON.stringify(history));
}

function showHistoryModal() {
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  if (!history.length) {
    alert("履歴がありません");
    return;
  }
  const content = history
    .map((item, idx) => {
      return `<div class="history-item">${idx + 1}: ${item.names.join(
        " / "
      )}</div>`;
    })
    .join("");
  showModal("履歴から選択", content, (idx) => {
    loadHistory(history[idx].names);
  });
}

function loadHistory(names) {
  const map = {
    0: { el: leftChar, key: "left" },
    1: { el: leftGrandfather, key: "leftGrandfather" },
    2: { el: leftGrandmother, key: "leftGrandmother" },
    3: { el: rightChar, key: "right" },
    4: { el: rightGrandfather, key: "rightGrandfather" },
    5: { el: rightGrandmother, key: "rightGrandmother" },
  };
  names.forEach((name, i) => {
    if (!name) return;
    const ch = characters.find((c) => c.name === name);
    if (!ch) return;
    map[i].el.style.backgroundImage = `url(images/${name.replace(
      /\s/g,
      ""
    )}.png)`;
    selection[map[i].key] = ch;
  });
  updateSelectedBorder();
}

// -------------------
// 手動送信
// -------------------
async function sendFixedNames() {
  const names = [
    selection.left?.name,
    selection.leftGrandfather?.name,
    selection.leftGrandmother?.name,
    selection.right?.name,
    selection.rightGrandfather?.name,
    selection.rightGrandmother?.name,
  ];
  if (!names.every(Boolean)) {
    alert("まだ全キャラが選択されていません");
    return;
  }

  try {
    const result = await window.postFixedNames(names);
    const { characters: resChars, scores } = result;
    const combined = resChars
      .map((name, i) => ({ name, score: scores[i] }))
      .sort((a, b) => b.score - a.score);
    const spaceRegex = /\s/g;
    const parts = combined.map((item) =>
      renderCharacter({ ...item, regex: spaceRegex })
    );
    resultDiv.innerHTML = parts.join("");

    // 履歴保存
    saveHistory();

    attachResultClickEvents();
  } catch (err) {
    console.error("fixed_names送信エラー:", err);
    alert("送信エラーが発生しました");
  }
}

function renderCharacter({ name, score, regex }) {
  const imgName = name.replace(regex, "");
  return `
    <div class="character-result">
      <img src="images/${imgName}.png" alt="${name}" loading="lazy">
      ${score}pt
    </div>
  `;
}

// -------------------
// ボタンイベント
// -------------------
document.getElementById("send").addEventListener("click", sendFixedNames);
document.getElementById("reset").addEventListener("click", () => {
  selection = {
    left: null,
    right: null,
    leftGrandfather: null,
    leftGrandmother: null,
    rightGrandfather: null,
    rightGrandmother: null,
  };
  [
    leftChar,
    rightChar,
    leftGrandfather,
    leftGrandmother,
    rightGrandfather,
    rightGrandmother,
  ].forEach((el) => (el.style.backgroundImage = ""));
  activeTarget = null;
  updateSelectedBorder();
  // ここを追加：結果表示を消す
  resultDiv.innerHTML = "";
});
document.getElementById("autoselect").addEventListener("click", () => {
  const indicesSet = new Set();
  while (indicesSet.size < 6)
    indicesSet.add(Math.floor(Math.random() * characters.length));
  const indices = Array.from(indicesSet);
  const elements = [
    leftChar,
    leftGrandfather,
    leftGrandmother,
    rightChar,
    rightGrandfather,
    rightGrandmother,
  ];
  const selectionMap = {
    "left-char": "left",
    "right-char": "right",
    "left-grandfather": "leftGrandfather",
    "left-grandmother": "leftGrandmother",
    "right-grandfather": "rightGrandfather",
    "right-grandmother": "rightGrandmother",
  };
  elements.forEach((el, i) => {
    const ch = characters[indices[i]];
    el.style.backgroundImage = `url(images/${ch.name.replace(/\s/g, "")}.png)`;
    selection[selectionMap[el.id]] = ch;
  });
  updateSelectedBorder();
});
document.getElementById("umarelationfather").addEventListener("click", () => {
  // 左祖父に左キャラを継承
  leftGrandfather.style.backgroundImage = leftChar.style.backgroundImage;
  selection.leftGrandfather = selection.left;

  // 左母に右キャラを継承
  leftGrandmother.style.backgroundImage = rightChar.style.backgroundImage;
  selection.leftGrandmother = selection.right;

  // 左キャラを結果の一番スコアが高いキャラクターに置き換え
  const resultItems = resultDiv.querySelectorAll(".character-result img");
  if (resultItems.length > 0) {
    const topCharName = resultItems[0].alt;
    const ch = characters.find((c) => c.name === topCharName);
    if (ch) {
      leftChar.style.backgroundImage = `url(images/${topCharName.replace(
        /\s/g,
        ""
      )}.png)`;
      selection.left = ch;
    }
  }

  // 枠更新
  updateSelectedBorder();
  setActiveChar(leftChar);
});

document.getElementById("umarelationmother").addEventListener("click", () => {
  // 右祖母に右キャラを継承
  rightGrandmother.style.backgroundImage = rightChar.style.backgroundImage;
  selection.rightGrandmother = selection.right;

  // 右祖父に左キャラを継承
  rightGrandfather.style.backgroundImage = leftChar.style.backgroundImage;
  selection.rightGrandfather = selection.left;

  // 右キャラを結果の一番スコアが高いキャラクターに置き換え
  const resultItems = resultDiv.querySelectorAll(".character-result img");
  if (resultItems.length > 0) {
    const topCharName = resultItems[0].alt;
    const ch = characters.find((c) => c.name === topCharName);
    if (ch) {
      rightChar.style.backgroundImage = `url(images/${topCharName.replace(
        /\s/g,
        ""
      )}.png)`;
      selection.right = ch;
    }
  }

  // 枠更新
  updateSelectedBorder();
  setActiveChar(rightChar);
});

// 履歴モーダルボタン
const historyButton = document.createElement("button");
historyButton.textContent = "履歴";
historyButton.addEventListener("click", showHistoryModal);
document.querySelector(".controls").appendChild(historyButton);

// -------------------
// 初期化
// -------------------
init();
