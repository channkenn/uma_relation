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
function renderCharList_20250917() {
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
// キャラクター一覧レンダリング
// -------------------
function renderCharList() {
  // コンテナクリア
  charList.innerHTML = "";

  // ソート（名前順）＋元データ index を保持
  const sortedChars = characters
    .map((ch, idx) => ({ ...ch, origIndex: idx }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const fragment = document.createDocumentFragment();

  sortedChars.forEach((ch) => {
    const div = document.createElement("div");
    div.classList.add("char-icon");

    // 画像設定（遅延読み込み用に data-src にしてもOK）
    const imgName = ch.name.replace(/\s/g, "");
    div.style.backgroundImage = `url(images/${imgName}.png)`;

    // 元データ index
    div.dataset.index = ch.origIndex;

    // クリックイベント
    div.addEventListener("click", () => selectCharForTarget(div.dataset.index));

    fragment.appendChild(div);
  });

  // 一括追加で描画回数を削減
  charList.appendChild(fragment);
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
function setActiveChar(el) {
  document
    .querySelectorAll(".selected-char.active")
    .forEach((e) => e.classList.remove("active"));
  el.classList.add("active");
  activeTarget = el;
}

// クリック時
leftChar.addEventListener("click", () => setActiveChar(leftChar));
rightChar.addEventListener("click", () => setActiveChar(rightChar));
leftGrandfather.addEventListener("click", () => setActiveChar(leftGrandfather));
leftGrandmother.addEventListener("click", () => setActiveChar(leftGrandmother));
rightGrandfather.addEventListener("click", () =>
  setActiveChar(rightGrandfather)
);
rightGrandmother.addEventListener("click", () =>
  setActiveChar(rightGrandmother)
);
// ... 他の枠も同様

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
//ベストウマのみ版20250917
async function sendFixedNames_20250917() {
  const names = [
    selection.left?.name,
    selection.leftGrandfather?.name,
    selection.leftGrandmother?.name,
    selection.right?.name,
    selection.rightGrandfather?.name,
    selection.rightGrandmother?.name,
  ];
  const resultDiv = document.getElementById("result");
  if (names.every(Boolean)) {
    // null除外ではなく、全選択チェック
    try {
      const result = await window.postFixedNames(names);
      //console.log("fixed_names送信結果:", result);
      //alert(
      //  `送信成功！最適キャラ: ${result.best_character}, スコア: ${result.score}`
      //);
      // ここでalertではなくHTMLに表示
      const imgName = result.best_character.replace(/\s/g, "");
      resultDiv.innerHTML = `
        <img src="images/${imgName}.png" alt="${result.best_character}">
        <div>
          最適キャラクター: <strong>${result.best_character}</strong><br>
          スコア: <strong>${result.score}</strong>
        </div>
      `;
    } catch (err) {
      console.error("fixed_names送信エラー:", err);
      alert("送信エラーが発生しました");
    }
  } else {
    alert("まだ全キャラが選択されていません");
  }
}

async function sendFixedNames_20250918() {
  const names = [
    selection.left?.name,
    selection.leftGrandfather?.name,
    selection.leftGrandmother?.name,
    selection.right?.name,
    selection.rightGrandfather?.name,
    selection.rightGrandmother?.name,
  ];
  const resultDiv = document.getElementById("result");

  if (names.every(Boolean)) {
    try {
      const result = await window.postFixedNames(names);
      const characters = result.characters; // ["Alice", "Bob", "Charlie"]
      const scores = result.scores; // [80, 75, 60]

      // characters と scores をまとめてオブジェクトにする
      const combined = characters.map((name, i) => ({
        name,
        score: scores[i],
      }));

      // スコア順（降順）にソート
      combined.sort((a, b) => b.score - a.score);

      // HTML生成
      let html = "<div class='all-results'>";
      for (const item of combined) {
        const imgName = item.name.replace(/\s/g, "");
        html += `
          <div class="character-result">
            <img src="images/${imgName}.png" alt="${item.name}">
              キャラクター: <strong>${item.name}</strong>
              スコア: <strong>${item.score}</strong>
          </div>
        `;
      }
      html += "</div>";
      resultDiv.innerHTML = html;
    } catch (err) {
      console.error("fixed_names送信エラー:", err);
      alert("送信エラーが発生しました");
    }
  } else {
    alert("まだ全キャラが選択されていません");
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
  const resultDiv = document.getElementById("result");

  if (names.every(Boolean)) {
    try {
      const result = await window.postFixedNames(names);
      const { characters, scores } = result;

      // characters と scores をまとめてソート済みオブジェクト化
      const combined = characters
        .map((name, i) => ({
          name,
          score: scores[i],
        }))
        .sort((a, b) => b.score - a.score);

      const spaceRegex = /\s/g;

      // HTML組み立て
      const parts = ['<div class="all-results">'];
      for (const item of combined) {
        parts.push(renderCharacter({ ...item, regex: spaceRegex }));
      }
      parts.push("</div>");

      // 一括DOM反映
      resultDiv.innerHTML = parts.join("");
    } catch (err) {
      console.error("fixed_names送信エラー:", err);
      alert("送信エラーが発生しました");
    }
  } else {
    alert("まだ全キャラが選択されていません");
  }
}

function renderCharacter({ name, score, regex }) {
  const imgName = name.replace(regex, "");
  return `
    <div class="character-result">
      <img src="images/${imgName}.png" alt="${name}" loading="lazy">
      キャラクター: <strong>${name}</strong>
      スコア: <strong>${score}</strong>
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
  // 1. 6キャラを重複なしランダム選択
  const indicesSet = new Set();
  while (indicesSet.size < 6) {
    const idx = Math.floor(Math.random() * characters.length);
    indicesSet.add(idx);
  }
  const indices = Array.from(indicesSet);

  // 2. UI要素と selection オブジェクトの対応マップ
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

  // 3. 選択キャラを UI と selection に反映
  elements.forEach((el, i) => {
    const ch = characters[indices[i]];
    el.style.backgroundImage = `url(images/${ch.name.replace(/\s/g, "")}.png)`;
    selection[selectionMap[el.id]] = ch;
  });

  // 4. 選択枠の更新
  updateSelectedBorder();
  // 自動送信は削除済み
});
document.getElementById("umarelationfather").addEventListener("click", () => {
  // --- left-char → left-grandmother ---
  const leftCharImage = leftChar.style.backgroundImage;
  leftGrandfather.style.backgroundImage = leftCharImage;
  selection.leftGrandfather = selection.left;
  leftChar.style.backgroundImage = "";
  selection.left = null;

  // --- right-char → left-grandfather ---
  const rightCharImage = rightChar.style.backgroundImage;
  leftGrandmother.style.backgroundImage = rightCharImage;
  selection.leftGrandmother = selection.right;

  // 選択枠の更新
  updateSelectedBorder();
  // left-char をアクティブにする
  document
    .querySelectorAll(".selected-char.active")
    .forEach((e) => e.classList.remove("active"));
  leftChar.classList.add("active");
  activeTarget = leftChar;
});
document.getElementById("umarelationmother").addEventListener("click", () => {
  // --- righ-char → right-grandmother ---
  const rightCharImage = rightChar.style.backgroundImage;
  rightGrandmother.style.backgroundImage = rightCharImage;
  selection.rightGrandmother = selection.right;
  rightChar.style.backgroundImage = "";
  selection.right = null;

  // --- left-char → right-grandfather ---
  const leftCharImage = leftChar.style.backgroundImage;
  rightGrandfather.style.backgroundImage = leftCharImage;
  selection.rightGrandfather = selection.left;

  // 選択枠の更新
  updateSelectedBorder();
  // right-char をアクティブにする
  document
    .querySelectorAll(".selected-char.active")
    .forEach((e) => e.classList.remove("active"));
  rightChar.classList.add("active");
  activeTarget = rightChar;
});
// -------------------
// 初期化
// -------------------
init();
