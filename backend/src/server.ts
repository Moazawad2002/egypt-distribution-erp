import app from './app.js';
import { config } from './config/index.js';
import { checkDatabaseHealth } from './db/prisma.js';

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(` Egypt Distribution ERP Backend API Running on :${PORT}`);
  console.log(` Environment : ${config.nodeEnv}`);
  console.log(` Timezone    : ${config.defaultTimezone}`);
  console.log(`=======================================================`);

  const dbHealth = await checkDatabaseHealth();
  console.log(`Database Status: ${dbHealth.connected ? 'CONNECTED (PostgreSQL)' : 'OFFLINE (Operating in Local Development Mode)'}`);
});
