import PgBoss from 'pg-boss';
import fs from 'fs';
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
  const connectionString = `postgres://${
    env.POSTGRES_USER
  }:${encodeURIComponent(env.POSTGRES_PASSWORD)}@${env.POSTGRES_HOST}:${
    env.POSTGRES_PORT
  }/${env.POSTGRES_DB}?sslmode=require`;

  const newBoss = new PgBoss(connectionString);
  newBoss.on('error', logger.exceptionLogger('pgboss error'));
  await newBoss.start();
  logger.info('pg-boss is ready', { schema });
  boss = newBoss;
  return boss;
}
