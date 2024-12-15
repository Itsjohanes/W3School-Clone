import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { path: requestedPath } = req.query;

  // Folder publik root
  const publicDir = path.join(process.cwd(), "public");

  // Fungsi untuk mencocokkan path dengan case-insensitive
  const findPathInsensitive = (baseDir, segments) => {
    if (!segments.length) return "";

    const [currentSegment, ...remainingSegments] = segments;
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    // Cari kecocokan tanpa memperhatikan huruf besar/kecil
    const match = entries.find(
      (entry) => entry.name.toLowerCase() === currentSegment.toLowerCase()
    );

    if (!match) return null;

    // Rekursif untuk path berikutnya
    const subPath = findPathInsensitive(
      path.join(baseDir, match.name),
      remainingSegments
    );

    return subPath !== null ? path.join(match.name, subPath) : match.name;
  };

  // Pisahkan path berdasarkan segment folder/file
  const segments = requestedPath.split("/");

  // Cari path normal berdasarkan case-insensitive
  const normalizedPath = findPathInsensitive(publicDir, segments);

  if (normalizedPath) {
    // Redirect ke path yang sesuai
    res.writeHead(302, { Location: `/${normalizedPath}` });
    res.end();
  } else {
    // Jika tidak ditemukan, beri respons 404
    res.status(404).send("File Not Found");
  }
}
