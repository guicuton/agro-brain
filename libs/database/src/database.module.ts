import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { LoginRepository } from './repositories/login/repository.service';
import { FarmOwnerRepository } from './repositories/farm_owner/repository.service';
import { FarmPropertyRepository } from './repositories/farm_property/repository.service';
import { FarmHarvestRepository } from './repositories/farm_harvest/repository.service';
import { FarmCropsRepository } from './repositories/farm_crops/repository.service';

@Global()
@Module({
  providers: [
    DatabaseService,
    LoginRepository,
    FarmOwnerRepository,
    FarmPropertyRepository,
    FarmHarvestRepository,
    FarmCropsRepository,
  ],
  exports: [
    DatabaseService,
    LoginRepository,
    FarmOwnerRepository,
    FarmPropertyRepository,
    FarmHarvestRepository,
    FarmCropsRepository,
  ],
})
export class GlobalDatabaseModule {}
