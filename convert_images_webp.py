from PIL import Image
import os

# 入力・出力ディレクトリ
input_dir = "images"
output_dir = "images_webp"
os.makedirs(output_dir, exist_ok=True)

# リサイズ設定（用途ごと）
sizes = {
    "icon": 70,   # 一覧・結果表示
    "select": 100 # 選択中キャラ
}

for filename in os.listdir(input_dir):
    if not filename.lower().endswith(".png"):
        continue

    name_base = os.path.splitext(filename)[0]
    img_path = os.path.join(input_dir, filename)
    img = Image.open(img_path).convert("RGBA")

    for key, size in sizes.items():
        # Pillow 10+ 対応: Image.Resampling.LANCZOS を使用
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
        out_path = os.path.join(output_dir, f"{name_base}_{size}.webp")
        img_resized.save(out_path, "WEBP", quality=80)

print("全画像のWebP変換・リサイズ完了！")
