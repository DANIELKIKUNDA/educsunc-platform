import net from 'node:net';

const services = [
  {
    name: 'PostgreSQL',
    host: process.env.DB_HOST ?? 'postgres',
    port: Number(process.env.DB_PORT ?? 5432),
  },
  {
    name: 'Redis',
    host: process.env.EDUCSYN_REDIS_HOST ?? 'redis',
    port: Number(process.env.EDUCSYN_REDIS_PORT ?? 6379),
  },
];

const timeoutMs = 60_000;
const retryDelayMs = 1_000;

function checkPort(service) {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: service.host,
      port: service.port,
    });

    const finish = (available) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(available);
    };

    socket.setTimeout(2_000);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
}

async function waitForService(service) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await checkPort(service)) {
      console.log(`[codespaces] ${service.name} disponible sur ${service.host}:${service.port}.`);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }

  throw new Error(
    `${service.name} indisponible apres ${Math.round(timeoutMs / 1_000)} secondes.`,
  );
}

for (const service of services) {
  await waitForService(service);
}
