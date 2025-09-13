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
fixed_names = ["エルコンドルパサー",
               "シンボリルドルフ",
               "ナリタブライアン",
               "グラスワンダー",
               "エルコンドルパサー",
               "ナイスネイチャ",
               ]

fixed_chars = [(CHAR_DICT[name], name) for name in fixed_names]

# ------------------------
# chars[0] 候補取得
# ------------------------
def get_candidate_chars0():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT chara_id FROM succession_relation_member")
    candidates = [row[0] for row in cursor.fetchall()]
    conn.close()
    candidates = [c for c in candidates if c not in [cid for cid, _ in fixed_chars]]
    return candidates

# ------------------------
# 合計計算
# ------------------------
def calculate_total(chars0):
    chars = [chars0] + [cid for cid, _ in fixed_chars]
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
        SELECT COALESCE(SUM(sr.relation_point),0) AS total
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
            ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=0)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=1)
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
            ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=0)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=4)
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT srm1.relation_type
            FROM succession_relation_member srm1
            JOIN succession_relation_member srm2
            ON srm1.relation_type = srm2.relation_type
            WHERE srm1.chara_id = (SELECT id FROM chars WHERE idx=1)
              AND srm2.chara_id = (SELECT id FROM chars WHERE idx=4)
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,2))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,3))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
        WHERE sr.relation_type IN (
            SELECT relation_type
            FROM succession_relation_member
            WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,4,5))
            GROUP BY relation_type
            HAVING COUNT(DISTINCT chara_id) = 3
        )
        UNION ALL
        SELECT COALESCE(SUM(sr.relation_point),0)
        FROM succession_relation AS sr
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
# chars[0] の名前取得
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
# 固定キャラ表示
# ------------------------
def print_fixed_chars():
    for role, (cid, name) in zip(roles, fixed_chars):
        print(f"{role}: {cid} ({name})")

# ------------------------
# chars[0] 探索
# ------------------------
def find_best_char0():
    candidates = get_candidate_chars0()
    best_char = None
    best_total = -1
    print("固定キャラ情報:")
    print_fixed_chars()
    print("\n候補ごとの合計値:")
    for c in candidates:
        total = calculate_total(c)
        idx, name = get_character_name(c)
        print(f"chars[0]={c} ({idx}, {name}) -> total={total}")
        if total > best_total:
            best_total = total
            best_char = c
    idx, name = get_character_name(best_char)
    print(f"\n最適なchars[0]={best_char} ({idx}, {name}), 最大合計={best_total}")

if __name__ == "__main__":
    find_best_char0()
