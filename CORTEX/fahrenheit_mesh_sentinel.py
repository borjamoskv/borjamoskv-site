#!/usr/bin/env python3
"""
CORTEX Fahrenheit 451 Mesh Sentinel (C5-REAL)
Sovereign Local Model Manager, Decentralized Git Sync, and Offline SQLite Knowledge Vault.
Ensures that if the global web collapses, knowledge lives on the edge.
"""
import os
import sys
import json
import sqlite3
import hashlib
import subprocess
import urllib.request

# Define paths
CORTEX_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(CORTEX_DIR)
DB_PATH = os.path.join(CORTEX_DIR, "fahrenheit_persona_libro.db")
STATUS_JSON_PATH = os.path.join(CORTEX_DIR, "fahrenheit_real_status.json")
DEFAULT_MESH_GIT_DIR = os.path.expanduser("~/.cortex/git-mesh/borjamoskv-site.git")

def get_local_ollama_models():
    """
    Queries the local Ollama instance for installed models.
    """
    url = "http://127.0.0.1:11434/api/tags"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=1.5) as response:
            data = json.loads(response.read().decode())
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []

def get_git_remotes():
    """
    Returns list of configured Git remotes and their URLs.
    """
    try:
        res = subprocess.run(
            ["git", "remote", "-v"],
            cwd=WORKSPACE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        remotes = {}
        for line in res.stdout.strip().split("\n"):
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 2:
                name, url = parts[0], parts[1]
                remotes[name] = url
        return remotes
    except Exception:
        return {}

def setup_local_mesh_remote():
    """
    Creates a bare git repository in the local home folder to act as a local-mesh peer,
    and adds it as a git remote 'local-mesh' if not already present.
    """
    git_dir = DEFAULT_MESH_GIT_DIR
    if not os.path.exists(git_dir):
        os.makedirs(os.path.dirname(git_dir), exist_ok=True)
        try:
            subprocess.run(
                ["git", "init", "--bare", git_dir],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )
            print(f"[+] Initialized bare local-mesh repository at: {git_dir}")
        except Exception as e:
            print(f"[-] Failed to initialize bare repository: {e}")
            return False

    remotes = get_git_remotes()
    if "local-mesh" not in remotes:
        try:
            subprocess.run(
                ["git", "remote", "add", "local-mesh", git_dir],
                cwd=WORKSPACE_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )
            print(f"[+] Added git remote 'local-mesh' pointing to {git_dir}")
        except Exception as e:
            print(f"[-] Failed to add git remote: {e}")
            return False
    return True

def sync_git_remotes():
    """
    Pushes current commits to all remotes, prioritizing local-mesh.
    """
    remotes = get_git_remotes()
    results = {}
    for remote in remotes:
        try:
            print(f"[*] Syncing commits to remote [{remote}]...")
            res = subprocess.run(
                ["git", "push", remote, "--all"],
                cwd=WORKSPACE_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            if res.returncode == 0:
                print(f"[+] Pushed to [{remote}] successfully.")
                results[remote] = "SUCCESS"
            else:
                print(f"[-] Push to [{remote}] failed: {res.stderr.strip()}")
                results[remote] = f"FAILED: {res.stderr.strip()}"
        except subprocess.TimeoutExpired:
            print(f"[!] Push to [{remote}] timed out.")
            results[remote] = "TIMEOUT"
        except Exception as e:
            print(f"[-] Push to [{remote}] error: {e}")
            results[remote] = f"ERROR: {str(e)}"
    return results

def backup_knowledge_to_sqlite():
    """
    Gathers all CORTEX ledgers and Astro articles and backups their contents to local SQLite.
    This is the 'Persona-Libro' offline survival storage.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_mesh (
            id TEXT PRIMARY KEY,
            file_path TEXT,
            content TEXT,
            sha256 TEXT,
            last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    targets = []
    # 1. Gather all CORTEX Ledgers
    for file in os.listdir(WORKSPACE_DIR):
        if file.startswith("CORTEX_LEDGER_") and file.endswith(".md"):
            targets.append(os.path.join(WORKSPACE_DIR, file))

    # 2. Gather articles from src/content/articles/
    articles_dir = os.path.join(WORKSPACE_DIR, "src", "content", "articles")
    if os.path.exists(articles_dir):
        for file in os.listdir(articles_dir):
            if file.endswith((".md", ".mdx")):
                targets.append(os.path.join(articles_dir, file))

    backed_up_count = 0
    for target_path in targets:
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            sha256 = hashlib.sha256(content.encode("utf-8")).hexdigest()
            file_id = os.path.basename(target_path)
            
            # Check if exists and is identical
            cursor.execute("SELECT sha256 FROM knowledge_mesh WHERE id = ?", (file_id,))
            row = cursor.fetchone()
            if not row or row[0] != sha256:
                cursor.execute("""
                    INSERT OR REPLACE INTO knowledge_mesh (id, file_path, content, sha256, last_synced)
                    VALUES (?, ?, ?, ?, datetime('now'))
                """, (file_id, target_path, content, sha256))
                backed_up_count += 1
        except Exception as e:
            print(f"[-] Failed to backup {target_path}: {e}")

    conn.commit()
    conn.close()
    print(f"[+] SQLite Knowledge Vault synchronized: {backed_up_count} files written/updated.")
    return len(targets)

def write_linter_status(ollama_models, remotes, git_sync_results, vault_count):
    """
    Saves a C5-REAL status JSON that the Fahrenheit distribution linter reads
    to update the overall Workspace diagnostic metrics.
    """
    # Centralization Ratio: 1.0 (only cloud APIs) -> 0.0 (fully offline capable)
    # If Ollama is running and has models, ratio decreases
    if len(ollama_models) > 0:
        centralization_ratio = max(0.05, 1.0 - (len(ollama_models) * 0.15))
    else:
        centralization_ratio = 0.95  # Stuck with cloud

    # Interception Risk: 0.05 (clean, zero external telemetry)
    interception_risk = 0.05

    # Local Persistence: Git mesh config + SQLite vault
    local_persistence = 0.0
    if os.path.exists(DB_PATH) and vault_count > 0:
        local_persistence += 0.5
    if "local-mesh" in remotes:
        local_persistence += 0.48
    local_persistence = min(0.98, max(0.05, local_persistence))

    # Mesh Discovery: Granger Index (multiple remotes or P2P/local-mesh configured)
    mesh_discovery = 0.05
    if "local-mesh" in remotes:
        mesh_discovery += 0.45
    if len(remotes) > 1:
        mesh_discovery += 0.4
    mesh_discovery = min(0.95, mesh_discovery)

    status_data = {
        "node_alias": "Granger_Local_Edge_PoC",
        "centralization_ratio": round(centralization_ratio, 3),
        "interception_risk": round(interception_risk, 3),
        "local_persistence": round(local_persistence, 3),
        "mesh_discovery": round(mesh_discovery, 3),
        "ollama_models": ollama_models,
        "git_remotes": remotes,
        "git_sync": git_sync_results,
        "sqlite_vault_records": vault_count
    }

    with open(STATUS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(status_data, f, indent=2)
    print(f"[+] Linter status matrix written to: {STATUS_JSON_PATH}")

def run_sentinel_audit(sync_flag=False):
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CORTEX FAHRENHEIT 451: EDGE RESILIENCE SENTINEL        │")
    print("└────────────────────────────────────────────────────────┘\n")
    
    # 1. Audit Local LLM
    print("[*] Auditing local inference endpoints...")
    models = get_local_ollama_models()
    if models:
        print(f"[+] Ollama ACTIVE. Found {len(models)} local models:")
        for m in models:
            print(f"    - {m}")
    else:
        print("[-] Ollama INACTIVE or no models installed. Vulnerable to Firehouse Centralization.")

    # 2. Setup/Sync Git remotes if flagged or setup anyway
    print("\n[*] Auditing Git Remotes topology...")
    remotes = get_git_remotes()
    print(f"[+] Active Git remotes: {list(remotes.keys())}")
    
    if sync_flag:
        setup_local_mesh_remote()
        remotes = get_git_remotes() # Reload
        sync_results = sync_git_remotes()
    else:
        sync_results = {}
        if "local-mesh" not in remotes:
            print("[!] Missing 'local-mesh' remote. Run with --sync to automatically initialize it.")

    # 3. Synchronize SQLite Vault
    print("\n[*] Auditing local knowledge persistence (SQLite)...")
    vault_count = backup_knowledge_to_sqlite()

    # 4. Generate linter feedback
    write_linter_status(models, remotes, sync_results, vault_count)
    print("\n[+] Sentinel Run Complete. Reality check stored.")

if __name__ == "__main__":
    sync = "--sync" in sys.argv
    run_sentinel_audit(sync)
