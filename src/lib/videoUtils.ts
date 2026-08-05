import { getFFmpeg, fetchFile } from './ffmpeg';

export const splitVideo = async (file: File | Blob, segmentTime: number = 15): Promise<Blob[]> => {
  const ffmpeg = await getFFmpeg();
  
  // Clean up previous files just in case
  try {
    const files = await ffmpeg.listDir('/');
    for (const f of files) {
      if (f.name.endsWith('.mp4') || f.name.endsWith('.txt')) {
        await ffmpeg.deleteFile(f.name);
      }
    }
  } catch(e) {}

  await ffmpeg.writeFile('input.mp4', await fetchFile(file));
  
  // Split into segments without re-encoding
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-c', 'copy',
    '-map', '0',
    '-segment_time', segmentTime.toString(),
    '-f', 'segment',
    '-reset_timestamps', '1',
    'part%03d.mp4'
  ]);

  const chunks: Blob[] = [];
  for (let i = 0; i < 999; i++) {
    const name = `part${i.toString().padStart(3, '0')}.mp4`;
    try {
      const data = await ffmpeg.readFile(name);
      chunks.push(new Blob([data], { type: 'video/mp4' }));
    } catch (e) {
      break; // Reached end of segments
    }
  }

  // If for some reason segmentation failed, fallback to original file
  if (chunks.length === 0) {
     chunks.push(file as Blob);
  }

  return chunks;
};

export const mergeVideos = async (blobs: Blob[]): Promise<Blob> => {
  if (blobs.length === 1) return blobs[0];
  
  const ffmpeg = await getFFmpeg();
  
  let listContent = '';
  for (let i = 0; i < blobs.length; i++) {
    const name = `out${i.toString().padStart(3, '0')}.mp4`;
    await ffmpeg.writeFile(name, await fetchFile(blobs[i]));
    listContent += `file '${name}'\n`;
  }
  
  await ffmpeg.writeFile('list.txt', listContent);
  
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'list.txt',
    '-c', 'copy',
    'final_output.mp4'
  ]);
  
  const data = await ffmpeg.readFile('final_output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};
