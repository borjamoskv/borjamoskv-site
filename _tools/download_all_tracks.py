import os
import re
import shutil
import subprocess

with open('data.js', 'r') as f:
    content = f.read()

ids_to_download = set()

vid_thumbs_match = re.search(r'videoThumbnails:\s*\[(.*?)\]', content, re.DOTALL)
if vid_thumbs_match:
    thumbs = re.findall(r"'([^']+)'", vid_thumbs_match.group(1))
    for t in thumbs:
        ids_to_download.add(t)

bg_vids_match = re.search(r'bgVideos:\s*\[(.*?)\]', content, re.DOTALL)
if bg_vids_match:
    bgs = re.findall(r"'([^']+)'", bg_vids_match.group(1))
    for b in bgs:
        ids_to_download.add(b)

# Extract objects in `works` array
lines = content.split('\n')
for line in lines:
    if 'id:' in line and 'categories:' in line:
        if '"original"' in line or "'original'" in line:
            id_match = re.search(r'id:\s*"([^"]+)"', line)
            if id_match:
                ids_to_download.add(id_match.group(1))

print(f"Total unique tracks to ensure downloaded: {len(ids_to_download)}")

yt_dlp_bin = os.environ.get("YT_DLP_BIN") or shutil.which("yt-dlp")
if not yt_dlp_bin:
    raise SystemExit("yt-dlp not found. Install it or set YT_DLP_BIN.")

for yt_id in ids_to_download:
    file_path = f"audio/{yt_id}.webm"
    if not os.path.exists(file_path):
        print(f"Downloading {yt_id}...")
        try:
            subprocess.run([
                yt_dlp_bin,
                '-f', '251',
                '-o', f"audio/{yt_id}.%(ext)s",
                f"https://www.youtube.com/watch?v={yt_id}"
            ], check=True)
        except subprocess.CalledProcessError:
            print(f"Failed {yt_id}")
    else:
        print(f"{yt_id} already exists, skipping.")
