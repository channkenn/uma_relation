import sqlite3

DB_PATH = "db/umamusume_relation.db"

# 固定の6キャラ
fixed_chars = [1002, 1003, 1004, 1005, 1006, 1007]
roles = ["父", "父父", "父母", "母", "母父", "母母"]

def get_candidate_chars0():
    """succession_relation_member から chars[0] の候補を取得（固定キャラを除く）"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT chara_id FROM succession_relation_member")
    candidates = [row[0] for row in cursor.fetchall()]
    conn.close()
    # 固定キャラは除外
    candidates = [c for c in candidates if c not in fixed_chars]
    return candidates

def calculate_total(chars0):
    """chars0 を先頭にして小計合計を計算"""
    chars = [chars0] + fixed_chars
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

def get_character_name(chara_id):
    """chara_id に対応する text_data の index と text を取得"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT `index`, text FROM text_data WHERE category=6 AND `index`=?",
        (chara_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return row  # (index, text)
    else:
        return (None, None)

def print_fixed_chars():
    """固定キャラ6人の役割と名前を表示"""
    for role, cid in zip(roles, fixed_chars):
        idx, name = get_character_name(cid)
        print(f"{role}: {cid} ({idx}, {name})")

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
