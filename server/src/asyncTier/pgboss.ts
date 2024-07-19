import fs from 'fs';
import PgBoss from 'pg-boss';
import env from 'server/src/config/Env.ts';
import { anonymousLogger } from 'server/src/logging/Logger.ts';

let boss: PgBoss | undefined;

export function getBoss(): PgBoss {
  if (boss === undefined) {
    throw new Error('PgBoss has not been initialised');
  }
  return boss;
}

export async function initBoss() {
  if (boss !== undefined) {
    throw new Error('PgBoss has been already initialised');
  }

  const logger = anonymousLogger();
  const schema = `pgboss_${env.CORD_TIER}`;
  let ssl: any = false;
  if (env.CORD_TIER === 'prod' || env.CORD_TIER === 'staging') {
    ssl = {
      ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt').toString(),
      rejectUnauthorized: false,
    };
  }

  const newBoss = new PgBoss({
    host: env.POSTGRES_HOST,
    port: Number(env.POSTGRES_PORT),
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    schema,
    ssl: ssl,
  });
  newBoss.on('error', logger.exceptionLogger('pgboss error'));
  await newBoss.start();
  logger.info('pg-boss is ready', { schema });
  boss = newBoss;
  return boss;
}
