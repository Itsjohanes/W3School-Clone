import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: requestedPath } = req.query;

  // Validasi jika parameter path tidak ada
  if (!requestedPath) {
    res.status(400).send("Path parameter is missing.");
    return;
  }

  // Base directory menunjuk ke root project
  const baseDir = process.cwd();

  // Fungsi untuk mencocokkan path case-insensitive
  const findPathInsensitive = (dir, segments) => {
    if (!segments.length) return '';

    const [currentSegment, ...remainingSegments] = segments;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Cari folder/file yang cocok (case-insensitive)
    const match = entries.find(
      (entry) => entry.name.toLowerCase() === currentSegment.toLowerCase()
    );

    if (!match) return null;

    const nextDir = path.join(dir, match.name);

    if (remainingSegments.length === 0) {
      return match.isDirectory() ? null : match.name; // Pastikan file, bukan folder
    }

    return findPathInsensitive(nextDir, remainingSegments);
  };

  // Pecah path menjadi segmen berdasarkan "/"
  const segments = requestedPath.split('/');
  const normalizedPath = findPathInsensitive(baseDir, segments);

  if (normalizedPath) {
    // Jika ditemukan, redirect ke path yang benar
    const redirectPath = `/${segments.slice(0, -1).join('/')}/${normalizedPath}`;
    res.writeHead(302, { Location: redirectPath });
    res.end();
  } else {
    // Jika file tidak ditemukan
    res.status(404).send("File Not Found");
  }
}
