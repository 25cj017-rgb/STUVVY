// server.js - Production server entry point for GoDaddy Hosting (cPanel Node.js / VPS)
const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV === 'development';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> STUVVY production server ready on http://${hostname}:${port} for stuvvy.in`);
  });
}).catch((err) => {
  console.error('Failed to start STUVVY production server:', err);
  process.exit(1);
});
