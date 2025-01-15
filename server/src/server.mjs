import express from 'express';
import path from 'path';

const app = express();

const PORT = process.env.PORT || parseInt(process.argv[2]) || 8080;
// get the directory name from the current file's URL
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Der Server läuft auf dem Port ${PORT}`);
});
