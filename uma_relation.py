import sqlite3

# 任意の7キャラIDをリストで指定（0～6に対応）
chars = [1024, 1044, 1051, 1060, 1075, 1080, 1090]

# SQLite データベースパス
DB_PATH = "db/umamusume_relation.db"

# SQLクエリを組み立て
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
    SELECT '0,1' AS combo,
           COALESCE(SUM(sr.relation_point),0) AS total
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
    SELECT '0,4', COALESCE(SUM(sr.relation_point),0)
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
    SELECT '1,4', COALESCE(SUM(sr.relation_point),0)
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
    SELECT '0,1,2', COALESCE(SUM(sr.relation_point),0)
    FROM succession_relation AS sr
    WHERE sr.relation_type IN (
        SELECT relation_type
        FROM succession_relation_member
        WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,2))
        GROUP BY relation_type
        HAVING COUNT(DISTINCT chara_id) = 3
    )
    
    UNION ALL
    SELECT '0,1,3', COALESCE(SUM(sr.relation_point),0)
    FROM succession_relation AS sr
    WHERE sr.relation_type IN (
        SELECT relation_type
        FROM succession_relation_member
        WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,1,3))
        GROUP BY relation_type
        HAVING COUNT(DISTINCT chara_id) = 3
    )
    
    UNION ALL
    SELECT '0,4,5', COALESCE(SUM(sr.relation_point),0)
    FROM succession_relation AS sr
    WHERE sr.relation_type IN (
        SELECT relation_type
        FROM succession_relation_member
        WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,4,5))
        GROUP BY relation_type
        HAVING COUNT(DISTINCT chara_id) = 3
    )
    
    UNION ALL
    SELECT '0,4,6', COALESCE(SUM(sr.relation_point),0)
    FROM succession_relation AS sr
    WHERE sr.relation_type IN (
        SELECT relation_type
        FROM succession_relation_member
        WHERE chara_id IN (SELECT id FROM chars WHERE idx IN (0,4,6))
        GROUP BY relation_type
        HAVING COUNT(DISTINCT chara_id) = 3
    )
)

SELECT * FROM combination_points
UNION ALL
SELECT 'all_total', SUM(total) FROM combination_points;
"""

# SQLiteに接続して実行
def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(sql)
    
    rows = cursor.fetchall()
    
    # 結果表示
    for combo, total in rows:
        print(f"{combo}: {total}")
    
    conn.close()

if __name__ == "__main__":
    main()
