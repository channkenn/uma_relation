const API_BASE = "https://linguistic-sherilyn-animanimage-50068fef.koyeb.app";

// -------------------------
// キャラクター取得
// -------------------------
async function getCharacters() {
  const res = await fetch(`${API_BASE}/api/characters`);
  if (!res.ok) throw new Error(`Failed to fetch characters: ${res.status}`);
  return await res.json();
}

// 単体キャラクター取得
async function getCharacter(id) {
  const res = await fetch(`${API_BASE}/api/character/${id}`);
  if (!res.ok)
    throw new Error(`Failed to fetch character ${id}: ${res.status}`);
  return await res.json();
}

// 相性計算取得
async function getRelation(c1, c2) {
  const res = await fetch(`${API_BASE}/api/relation?c1=${c1}&c2=${c2}`);
  if (!res.ok) throw new Error(`Failed to fetch relation: ${res.status}`);
  return await res.json();
}

// -------------------------
// 選択キャラ固定送信
// -------------------------
window.postFixedNames = async function (namesArray) {
  if (!Array.isArray(namesArray) || namesArray.length !== 6) {
    throw new Error("namesArray must be an array of 6 names");
  }

  // サーバが期待する payload は { names: [...] } の形式
  const payload = {
    names: namesArray,
  };

  const res = await fetch(`${API_BASE}/api/fixed_names`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }

  return await res.json();
};
