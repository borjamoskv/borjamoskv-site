import * as fs from 'fs';
import { execFileSync } from 'child_process';

const scriptContent = fs.readFileSync('data.js', 'utf8');
// Evaluate DATA safely
const dataObjStr = scriptContent.replace('const DATA = {', 'global.DATA = {');
eval(dataObjStr);

const ytDlpBin = process.env.YT_DLP_BIN || 'yt-dlp';

try {
  execFileSync(ytDlpBin, ['--version'], { stdio: 'ignore' });
} catch {
  console.error('yt-dlp not found. Install it or set YT_DLP_BIN.');
  process.exit(1);
}

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
            execFileSync(
              ytDlpBin,
              ['-f', '251', '-o', 'audio/%(id)s.%(ext)s', `https://www.youtube.com/watch?v=${id}`],
              { stdio: 'inherit' },
            );
        } catch(e) { 
            console.error(`Failed ${id}`); 
        }
    } else {
        console.log(`${id} already exists, skipping.`);
    }
}
