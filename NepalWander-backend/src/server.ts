import "dotenv/config";
import app from "./app";
import connectDB from "./config/db";
import { ENV } from "./config/env";

async function startServer(): Promise<void> {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`Server  : http://localhost:${ENV.PORT}`);
    console.log(`API     : http://localhost:${ENV.PORT}/api/v1`);
    console.log(`Health  : http://localhost:${ENV.PORT}/health`);
    console.log(`Env     : ${ENV.NODE_ENV}`);
  });
}

startServer();