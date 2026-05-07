import type { IAuthenticatedUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth';
import {
  IFarmPropertyCreatePromise,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertySearchPromise,
  IFarmPropertyStatsPromise,
  IFarmPropertyUpdatePromise,
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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../../../decorators/user.decorator';
import {
  IFarmIdDto,
  IFarmPropertyBulkCreateDTO,
  IFarmPropertyCreateResponseDTO,
  IFarmPropertyGetOneResponseDTO,
  IFarmPropertyGetRelationsResponseDTO,
  IFarmPropertySearchDTO,
  IFarmPropertySearchResponseDTO,
  IFarmPropertyStatsResponseDTO,
  IFarmPropertyUpdateDTO,
  IFarmPropertyUpdateResponseDTO,
} from '../farm.dto';
import { FarmPropertyControllerService } from './farm_property.service';

@ApiTags('Farm Property')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('farm')
export class FarmPropertyController {
  constructor(
    private readonly controllerService: FarmPropertyControllerService,
  ) {}

  @ApiOperation({
    summary: 'Bulk create farm properties',
    description: 'Creates up to 10 properties in a single request.',
  })
  @ApiBody({ type: IFarmPropertyBulkCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'Properties created.',
    type: IFarmPropertyCreateResponseDTO,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('property')
  async createMany(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IFarmPropertyBulkCreateDTO,
  ): Promise<IFarmPropertyCreatePromise[]> {
    return await this.controllerService.createMany({ user, body, ip });
  }

  @ApiOperation({
    summary: 'Search farm properties',
    description:
      'Performs a partial, case-insensitive search by alias, owner_id, city and/or state and areas. Only the provided query parameters are used as filters.',
  })
  @ApiQuery({
    name: 'alias',
    required: false,
    type: String,
    example: 'fazenda joao',
  })
  @ApiQuery({
    name: 'owner_id',
    format: 'uuid',
    required: false,
  })
  @ApiQuery({
    name: 'area_total',
    required: false,
    type: Number,
    example: 100,
  })
  @ApiQuery({
    name: 'area_arable',
    required: false,
    type: Number,
    example: 100,
  })
  @ApiQuery({
    name: 'area_vegetation',
    required: false,
    type: Number,
    example: 100,
  })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'sao' })
  @ApiQuery({ name: 'state', required: false, type: String, example: 'sp' })
  @ApiResponse({
    status: 200,
    description: 'Matching properties.',
    type: IFarmPropertySearchResponseDTO,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('property/search')
  async search(
    @Query() query: IFarmPropertySearchDTO,
  ): Promise<IFarmPropertySearchPromise[]> {
    return await this.controllerService.search({ query });
  }

  @ApiOperation({
    summary: 'Get aggregated property stats',
    description:
      'Returns the consolidated count of properties and the consolidated sum of area_total, both grouped by state.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stats returned.',
    type: IFarmPropertyStatsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('property/stats')
  async getStats(): Promise<IFarmPropertyStatsPromise> {
    return await this.controllerService.getStats();
  }

  @ApiOperation({
    summary: 'Get a property by id',
    description:
      'Returns the property with its owner summary and nested harvests and crops.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Property found.',
    type: IFarmPropertyGetOneResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Property not found.' })
  @Get('property/:id')
  async getOne(
    @Param() param: IFarmIdDto,
  ): Promise<IFarmPropertyGetOnePromise> {
    return await this.controllerService.getOneById({ param });
  }

  @ApiOperation({
    summary: 'Get aggregated counts of related entities for a property',
    description:
      'Returns the number of harvests and crops linked to the property.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Property UUID' })
  @ApiResponse({
    status: 200,
    description: 'Counts returned.',
    type: IFarmPropertyGetRelationsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Property not found.' })
  @Get('property/:id/relations')
  async getRelations(
    @Param() param: IFarmIdDto,
  ): Promise<IFarmPropertyGetRelationsPromise> {
    return await this.controllerService.getRelationsById({ param });
  }

  @ApiOperation({
    summary: 'Update a property by id',
    description: 'Partially updates a property. All fields are optional.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Property UUID' })
  @ApiBody({ type: IFarmPropertyUpdateDTO })
  @ApiResponse({
    status: 200,
    description: 'Property updated.',
    type: IFarmPropertyUpdateResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Property not found.' })
  @Put('property/:id')
  async updateOne(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Param() param: IFarmIdDto,
    @Body() body: IFarmPropertyUpdateDTO,
  ): Promise<IFarmPropertyUpdatePromise> {
    return await this.controllerService.updateOneById({
      user,
      body,
      param,
      ip,
    });
  }

  @ApiOperation({
    summary: 'Soft delete a property by id',
    description: 'Marks the property as deleted without removing the record.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Property UUID' })
  @ApiResponse({ status: 200, description: 'Property soft-deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Property not found.' })
  @Delete('property/:id')
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
