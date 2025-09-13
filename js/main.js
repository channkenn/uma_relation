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
  characters.forEach((ch, index) => {
    const div = document.createElement("div");
    div.classList.add("char-icon");
    const imgName = ch.name.replace(/\s/g, "");
    div.style.backgroundImage = `url(images/${imgName}.png)`;
    div.dataset.index = index;
    div.addEventListener("click", () => selectCharForTarget(index));
    charList.appendChild(div);
  });
}

// -------------------
// 選択対象の丸をクリック
// -------------------
[
  leftChar,
  rightChar,
  leftGrandfather,
  leftGrandmother,
  rightGrandfather,
  rightGrandmother,
].forEach((el) => {
  el.addEventListener("click", () => {
    activeTarget = el;
  });
});

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
  // 自動送信は削除
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

  if (names.every(Boolean)) {
    // null除外ではなく、全選択チェック
    try {
      const result = await window.postFixedNames(names);
      console.log("fixed_names送信結果:", result);
      alert(
        `送信成功！最適キャラ: ${result.best_character}, スコア: ${result.score}`
      );
    } catch (err) {
      console.error("fixed_names送信エラー:", err);
      alert("送信エラーが発生しました");
    }
  } else {
    alert("まだ全キャラが選択されていません");
  }
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
  const indices = [];
  while (indices.length < 6) {
    let idx = Math.floor(Math.random() * characters.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  const elements = [
    leftChar,
    leftGrandfather,
    leftGrandmother,
    rightChar,
    rightGrandfather,
    rightGrandmother,
  ];

  elements.forEach((el, i) => {
    const ch = characters[indices[i]];
    el.style.backgroundImage = `url(images/${ch.name.replace(/\s/g, "")}.png)`;
    switch (el.id) {
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
  });

  updateSelectedBorder();
  // 自動送信は削除
});

// -------------------
// 初期化
// -------------------
init();
