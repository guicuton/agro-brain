import { Module } from '@nestjs/common';
import { FarmOwnerService } from './services/farm_owner/farm_owner.service';
import { FarmPropertyService } from './services/farm_property/farm_property.service';
import { FarmHarvestService } from './services/farm_harvest/farm_harvest.service';
import { FarmCropsService } from './services/farm_crops/farm_crops.service';

@Module({
  providers: [
    FarmOwnerService,
    FarmPropertyService,
    FarmHarvestService,
    FarmCropsService,
  ],
  exports: [
    FarmOwnerService,
    FarmPropertyService,
    FarmHarvestService,
    FarmCropsService,
  ],
})
export class FarmModule {}
