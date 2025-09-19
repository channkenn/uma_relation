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

let activeTarget = null; // 選択中の丸

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
// 手動送信
// -------------------
async function sendFixedNames_20250919() {
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
    const parts = ['<div class="all-results">'];
    for (const item of combined) {
      parts.push(renderCharacter({ ...item, regex: spaceRegex }));
    }
    parts.push("</div>");

    resultDiv.innerHTML = parts.join("");

    // 結果にクリックイベントを追加
    attachResultClickEvents();
  } catch (err) {
    console.error("fixed_names送信エラー:", err);
    alert("送信エラーが発生しました");
  }
}
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
    // all-resultsを外して、直接resultDivに追加
    const parts = combined.map((item) =>
      renderCharacter({ ...item, regex: spaceRegex })
    );

    resultDiv.innerHTML = parts.join("");

    // 結果にクリックイベントを追加
    attachResultClickEvents();
  } catch (err) {
    console.error("fixed_names送信エラー:", err);
    alert("送信エラーが発生しました");
  }
}

function renderCharacter_20250919({ name, score, regex }) {
  const imgName = name.replace(regex, "");
  return `
    <div class="character-result">
      <img src="images/${imgName}.png" alt="${name}" loading="lazy">
      <strong>${name}</strong>
      <strong>${score}</strong>pt
    </div>
  `;
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

// -------------------
// 生まれ関係ボタン
// -------------------
document.getElementById("umarelationfather").addEventListener("click", () => {
  const leftCharImage = leftChar.style.backgroundImage;
  leftGrandfather.style.backgroundImage = leftCharImage;
  selection.leftGrandfather = selection.left;
  leftChar.style.backgroundImage = "";
  selection.left = null;

  const rightCharImage = rightChar.style.backgroundImage;
  leftGrandmother.style.backgroundImage = rightCharImage;
  selection.leftGrandmother = selection.right;

  updateSelectedBorder();
  setActiveChar(leftChar);
});

document.getElementById("umarelationmother").addEventListener("click", () => {
  const rightCharImage = rightChar.style.backgroundImage;
  rightGrandmother.style.backgroundImage = rightCharImage;
  selection.rightGrandmother = selection.right;
  rightChar.style.backgroundImage = "";
  selection.right = null;

  const leftCharImage = leftChar.style.backgroundImage;
  rightGrandfather.style.backgroundImage = leftCharImage;
  selection.rightGrandfather = selection.left;

  updateSelectedBorder();
  setActiveChar(rightChar);
});

// -------------------
// 初期化
// -------------------
init();
