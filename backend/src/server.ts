import { connectDB } from './config/db';
import { env } from './config/env';
import app from './app';

const start = async (): Promise<void> => {
  await connectDB();

  const PORT = parseInt(env.PORT, 10);

  app.listen(PORT, () => {
    console.log(`\n🚌  Bus Management API`);
    console.log(`🌍  Environment : ${env.NODE_ENV}`);
    console.log(`🚀  Server      : http://localhost:${PORT}`);
    console.log(`❤️   Health      : http://localhost:${PORT}/api/health\n`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
