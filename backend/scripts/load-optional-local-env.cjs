const fs = require('node:fs');
const path = require('node:path');

const localEnvironmentPath = path.join(__dirname, '..', '.env');

// Les variables deja injectees par la CI ou le systeme restent prioritaires.
if (fs.existsSync(localEnvironmentPath)) {
  process.loadEnvFile(localEnvironmentPath);
}
