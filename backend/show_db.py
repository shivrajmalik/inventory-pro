import sqlite3

conn = sqlite3.connect('inventory.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]

print("=" * 60)
print("  DATABASE: inventory.db")
print("=" * 60)
print(f"  Tables found: {tables}")

for table in tables:
    print(f"\n{'=' * 60}")
    print(f"  TABLE: {table.upper()}")
    print("=" * 60)
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    print(f"  Total rows: {count}")

    cur.execute(f"SELECT * FROM {table}")
    rows = cur.fetchall()
    if rows:
        cols = [d[0] for d in cur.description]
        # Print header
        header = " | ".join(f"{c:<20}" for c in cols)
        print(f"\n  {header}")
        print(f"  {'-' * len(header)}")
        for row in rows:
            line = " | ".join(f"{str(row[c]):<20}" for c in cols)
            print(f"  {line}")
    else:
        print("  (no records)")

conn.close()
print("\n" + "=" * 60)
