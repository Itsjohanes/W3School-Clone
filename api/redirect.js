import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: requestedPath } = req.query;

  // Validasi jika parameter path tidak ada
  if (!requestedPath) {
    res.status(400).send("Path parameter is missing.");
    return;
  }

  // Base directory adalah root project
  const baseDir = process.cwd();

  // Fungsi untuk mencocokkan path dengan case-insensitive
  const findPathInsensitive = (baseDir, segments) => {
    if (!segments.length) return '';

    const [currentSegment, ...remainingSegments] = segments;
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    const match = entries.find(
      (entry) => entry.name.toLowerCase() === currentSegment.toLowerCase()
    );

    if (!match) return null;

    const subPath = findPathInsensitive(
      path.join(baseDir, match.name),
      remainingSegments
    );

    return subPath !== null ? path.join(match.name, subPath) : match.name;
  };

  const segments = requestedPath.split('/');
  const normalizedPath = findPathInsensitive(baseDir, segments);

  if (normalizedPath) {
    res.writeHead(302, { Location: `/${normalizedPath}` });
    res.end();
  } else {
    res.status(404).send("File Not Found");
  }
}
