const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`AgroPulse API running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

