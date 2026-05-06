import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../libs/database/src';
import { LoggerService } from '../../libs/logger/src';
import { config } from './config';

(async (): Promise<void> => {
  const database = new DatabaseService(
    new ConfigService(config()),
    new LoggerService(),
  );
  const currentDate = new Date();
  const defaultPassword = bcrypt.hashSync('admin', 10);

  await database.login.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: defaultPassword,
      email: 'test@test.com',
      created_at: currentDate,
    },
  });

  await database.$transaction(async (db) => {
    const farmOwner = await db.farm_owner.upsert({
      where: { doc: '12345678989' },
      update: { deleted: false },
      create: {
        fullname: 'João da Silva',
        doc: '12345678989',
        city: 'goiania',
        state: 'go',
        country: 'br',
        created_at: currentDate,
      },
      select: {
        id: true,
      },
    });

    const farmProperty = await db.farm_property.upsert({
      where: {
        owner_id_alias: {
          owner_id: farmOwner.id,
          alias: 'fazenda do joão',
        },
      },
      update: { deleted: false },
      create: {
        alias: 'fazenda do joão',
        area_total: 100,
        area_arable: 70,
        area_vegetation: 30,
        area_type: 'HECTAR',
        city: 'goiania',
        state: 'go',
        country: 'brasil',
        owner_id: farmOwner.id,
        created_at: currentDate,
      },
      select: {
        id: true,
      },
    });

    const farmHarvest = await db.farm_harvest.create({
      data: {
        crop: 2026,
        created_at: currentDate,
        owner_id: farmOwner.id,
        property_id: farmProperty.id,
      },
      select: {
        id: true,
      },
    });

    await db.farm_crops.createMany({
      data: [
        {
          alias: 'pepino',
          area_arable: 40,
          metadata: {
            details: 'Produto sem agrotóxicos',
          },
          created_at: currentDate,
          owner_id: farmOwner.id,
          property_id: farmProperty.id,
          harvest_id: farmHarvest.id,
        },
        {
          alias: 'batata',
          area_arable: 30,
          metadata: {
            details: 'Plantação subsidiada por BNDES',
          },
          created_at: currentDate,
          owner_id: farmOwner.id,
          property_id: farmProperty.id,
          harvest_id: farmHarvest.id,
        },
      ],
    });
  });

  await database.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
