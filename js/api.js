// -------------------------
// APIのベースURL設定
// -------------------------
// 開発環境（localhost）ならローカルサーバを使用
// 本番は Koyeb の URL を使用
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://192.168.10.108:5000"
    : "https://linguistic-sherilyn-animanimage-50068fef.koyeb.app";

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

  const payload = { names: namesArray };

  const res = await fetch(`${API_BASE}/api/fixed_names`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${text}`);
  }

  return await res.json();
};
