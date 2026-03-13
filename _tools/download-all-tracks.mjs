import * as fs from 'fs';
import { execSync } from 'child_process';

const scriptContent = fs.readFileSync('data.js', 'utf8');
// Evaluate DATA safely
const dataObjStr = scriptContent.replace('const DATA = {', 'global.DATA = {');
eval(dataObjStr);

const idsToDownload = new Set();

DATA.works.forEach(w => {
  if (w.categories && w.categories.includes('original')) {
    idsToDownload.add(w.id);
  }
});
if (DATA.bgVideos) DATA.bgVideos.forEach(id => idsToDownload.add(id));
if (DATA.videoThumbnails) DATA.videoThumbnails.forEach(id => idsToDownload.add(id));

const ids = Array.from(idsToDownload);
console.log(`Total unique tracks to ensure downloaded: ${ids.length}`);

for (const id of ids) {
    if (!fs.existsSync(`audio/${id}.webm`)) {
        console.log(`Downloading ${id}...`);
        try {
            execSync(`/Users/borjafernandezangulo/30_CORTEX/.venv/bin/yt-dlp -f 251 -o "audio/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=${id}"`, {stdio: 'inherit'});
        } catch(e) { 
            console.error(`Failed ${id}`); 
        }
    } else {
        console.log(`${id} already exists, skipping.`);
    }
}
