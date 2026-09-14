#!/bin/bash
set -e

# EXERGY AUTO SYNC & AUDIT DAEMON
echo "=== INITIATING EXERGY SYNC SYSTEM ==="
cd /Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site

# 1. Run audit post script
echo "[*] Running audit_all_posts.py..."
python3 substack_archive/audit_all_posts.py

# 2. Run formatting compiler script
echo "[*] Running convert_audit_report.py..."
python3 /Users/borjafernandezangulo/.gemini/antigravity/brain/040db5f6-efad-4263-8fcd-79242ede071b/scratch/convert_audit_report.py

# 3. Stage changes
echo "[*] Staging audit files in Git..."
git add substack_archive/exergy_audit_report.md \
        substack_archive/posts_html_cache.json \
        src/content/articles/exergy-audit-omega-autopsia-jarana-dor.md \
        src/content/articles/exergy-audit-omega-autopsia-jarana-dor.mdx

# 4. Commit if there are modifications
if ! git diff-index --quiet HEAD --; then
    echo "[*] Committing changes..."
    git commit -m "chore(content): automated daily execution of EXERGY-AUDIT-Ω report"
    echo "[✓] Git commit created successfully."
else
    echo "[✓] Working tree clean. No new changes to commit."
fi

echo "=== EXERGY SYNC COMPLETED SUCCESSFULLY ==="
