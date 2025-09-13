import sqlite3
import csv

DB_PATH = "db/umamusume_relation.db"
CSV_PATH = "csv/characters.csv"

roles = ["父", "父父", "父母", "母", "母父", "母母"]

# ------------------------
# CSV から全キャラ辞書を作成
# ------------------------
def load_char_dict():
    char_dict = {}
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            char_dict[row["name"]] = int(row["id"])
    return char_dict

CHAR_DICT = load_char_dict()

# ------------------------
# 固定キャラを名前指定で作成
# ------------------------
fixed_names = [
    "アグネスデジタル",
    "メジロラモーヌ",
    "ジェンティルドンナ",
    "ファインモーション",
    "アグネスデジタル",
    "シンボリルドルフ"
]

fixed_chars = [(CHAR_DICT[name], name) for name in fixed_names]

# ------------------------
# 候補から除外するキャラ（マイナスリスト）
# ------------------------
EXCLUDE_NAMES = [
    "テイエムオペラオー",
    "クロノジェネシス",
    # 必要なだけ追加
]
EXCLUDE_IDS = [CHAR_DICT[name] for name in EXCLUDE_NAMES if name in CHAR_DICT]

# ------------------------
# chars[0] 候補取得
# ------------------------
def get_candidate_chars0(current_fixed):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT chara_id FROM succession_relation_member")
    candidates = [row[0] for row in cursor.fetchall()]
    conn.close()

    # 固定キャラとマイナスリストを除外
    exclude_ids = [cid for cid, _ in current_fixed] + EXCLUDE_IDS
    candidates = [c for c in candidates if c not in exclude_ids]
    return candidates

# ------------------------
# 合計計算（同キャラは0にする）
# ------------------------
def calculate_total(chars0, current_fixed):
    chars = [chars0] + [cid for cid, _ in current_fixed]

    sql = f"""
    WITH chars AS (
        SELECT {chars[0]} AS id, 0 AS idx UNION ALL
        SELECT {chars[1]}, 1 UNION ALL
        SELECT {chars[2]}, 2 UNION ALL
        SELECT {chars[3]}, 3 UNION ALL
        SELECT {chars[4]}, 4 UNION ALL
        SELECT {chars[5]}, 5 UNION ALL
        SELECT {chars[6]}, 6
    ),
    combination_points AS (
        -- 1と2
        SELECT CASE WHEN (SELECT id FROM chars WHERE idx=0) = (SELECT id FROM chars WHERE idx=1) THEN 0
                    ELSE COALESCE(SUM(sr.relation_point),0) END AS total
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
              ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=0)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=1)
        )
        UNION ALL
        -- 1と5
        SELECT CASE WHEN (SELECT id FROM chars WHERE idx=0) = (SELECT id FROM chars WHERE idx=4) THEN 0
                    ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
              ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=0)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=4)
        )
        UNION ALL
        -- 2と5
        SELECT CASE WHEN (SELECT id FROM chars WHERE idx=1) = (SELECT id FROM chars WHERE idx=4) THEN 0
                    ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
              ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=1)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=4)
        )
        UNION ALL
        -- 1,2,3
        SELECT CASE WHEN (
            (SELECT COUNT(DISTINCT id) FROM chars WHERE idx IN (0,1,2)) < 3
        ) THEN 0 ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,2))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        -- 1,2,4
        SELECT CASE WHEN (
            (SELECT COUNT(DISTINCT id) FROM chars WHERE idx IN (0,1,3)) < 3
        ) THEN 0 ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,3))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        -- 1,5,6
        SELECT CASE WHEN (
            (SELECT COUNT(DISTINCT id) FROM chars WHERE idx IN (0,4,5)) < 3
        ) THEN 0 ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,4,5))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        -- 1,5,7
        SELECT CASE WHEN (
            (SELECT COUNT(DISTINCT id) FROM chars WHERE idx IN (0,4,6)) < 3
        ) THEN 0 ELSE COALESCE(SUM(sr.relation_point),0) END
        FROM succession_relation sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,4,6))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
    )
    SELECT SUM(total) FROM combination_points;
    """

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(sql)
    result = cursor.fetchone()[0]
    conn.close()
    return result

# ------------------------
# キャラ名取得
# ------------------------
def get_character_name(chara_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT `index`, text FROM text_data WHERE category=6 AND `index`=?",
        (chara_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return row
    else:
        return (None, None)

# ------------------------
# 探索ループ
# ------------------------
NUM_ITERATIONS = 10

def search_loop(iterations=NUM_ITERATIONS):
    current_fixed = fixed_chars.copy()
    best_history = []

    for i in range(iterations):
        print(f"\n==== {i+1} 回目の探索 ====")

        candidates = get_candidate_chars0(current_fixed)
        best_char = None
        best_total = -1

        print("固定キャラ情報:")
        for role, (cid, name) in zip(roles, current_fixed):
            print(f"{role}: {cid} ({name})")

        print("\n候補ごとの合計値:")
        for c in candidates:
            total = calculate_total(c, current_fixed)
            idx, name = get_character_name(c)
            #print(f"chars[0]={c} ({idx}, {name}) -> total={total}")
            if total > best_total:
                best_total = total
                best_char = c

        idx, name = get_character_name(best_char)
        print(f"\n最適なchars[0]={best_char} ({idx}, {name}), 最大合計={best_total}")
        best_history.append((best_char, idx, name, best_total))

        # --- 次回更新 ---
        if i < iterations - 1:
            prev_chara3 = current_fixed[3]
            current_fixed[3] = (best_char, name)
            current_fixed[5] = prev_chara3

            print("\n--- 更新後の固定キャラ ---")
            for role, (cid, nm) in zip(roles, current_fixed):
                print(f"{role}: {cid} ({nm})")

    return best_history


if __name__ == "__main__":
    results = search_loop(NUM_ITERATIONS)
    print("\n=== 全探索履歴 ===")
    for i, (cid, idx, name, total) in enumerate(results, 1):
        print(f"{i}回目: chars[0]={cid} ({idx}, {name}), total={total}")
