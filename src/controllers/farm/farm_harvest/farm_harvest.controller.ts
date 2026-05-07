import type { IAuthenticatedUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth';
import {
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestUpdatePromise,
} from '@app/farm';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../../../decorators/user.decorator';
import {
  IFarmHarvestBulkCreateDTO,
  IFarmHarvestCreateResponseDTO,
  IFarmHarvestGetOneResponseDTO,
  IFarmHarvestGetRelationsResponseDTO,
  IFarmHarvestUpdateDTO,
  IFarmHarvestUpdateResponseDTO,
  IFarmIdDto,
} from '../farm.dto';
import { FarmHarvestControllerService } from './farm_harvest.service';

@ApiTags('Farm Harvest')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('farm')
export class FarmHarvestController {
  constructor(
    private readonly controllerService: FarmHarvestControllerService,
  ) {}

  @ApiOperation({
    summary: 'Bulk create farm harvests',
    description: 'Creates up to 10 harvests in a single request.',
  })
  @ApiBody({ type: IFarmHarvestBulkCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'Harvests created.',
    type: IFarmHarvestCreateResponseDTO,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('harvest')
  async createMany(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IFarmHarvestBulkCreateDTO,
  ): Promise<IFarmHarvestCreatePromise[]> {
    return await this.controllerService.createMany({ user, body, ip });
  }

  @ApiOperation({
    summary: 'Get a harvest by id',
    description:
      'Returns the harvest with owner, property and crops summaries.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Harvest UUID' })
  @ApiResponse({
    status: 200,
    description: 'Harvest found.',
    type: IFarmHarvestGetOneResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Harvest not found.' })
  @Get('harvest/:id')
  async getOne(@Param() param: IFarmIdDto): Promise<IFarmHarvestGetOnePromise> {
    return await this.controllerService.getOneById({ param });
  }

  @ApiOperation({
    summary: 'Get aggregated counts of related entities for a harvest',
    description: 'Returns the number of crops linked to the harvest.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Harvest UUID' })
  @ApiResponse({
    status: 200,
    description: 'Counts returned.',
    type: IFarmHarvestGetRelationsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Harvest not found.' })
  @Get('harvest/:id/relations')
  async getRelations(
    @Param() param: IFarmIdDto,
  ): Promise<IFarmHarvestGetRelationsPromise> {
    return await this.controllerService.getRelationsById({ param });
  }

  @ApiOperation({
    summary: 'Update a harvest by id',
    description: 'Partially updates a harvest. All fields are optional.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Harvest UUID' })
  @ApiBody({ type: IFarmHarvestUpdateDTO })
  @ApiResponse({
    status: 200,
    description: 'Harvest updated.',
    type: IFarmHarvestUpdateResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Harvest not found.' })
  @Put('harvest/:id')
  async updateOne(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Param() param: IFarmIdDto,
    @Body() body: IFarmHarvestUpdateDTO,
  ): Promise<IFarmHarvestUpdatePromise> {
    return await this.controllerService.updateOneById({
      user,
      body,
      param,
      ip,
    });
  }

  @ApiOperation({
    summary: 'Soft delete a harvest by id',
    description: 'Marks the harvest as deleted without removing the record.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Harvest UUID' })
  @ApiResponse({ status: 200, description: 'Harvest soft-deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Harvest not found.' })
  @Delete('harvest/:id')
  async softDelete(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Param() param: IFarmIdDto,
  ): Promise<void> {
    await this.controllerService.softDeleteById({
      user,
      param,
      ip,
    });
  }
}
