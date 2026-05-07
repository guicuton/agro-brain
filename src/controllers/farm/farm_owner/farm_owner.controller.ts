import type { IAuthenticatedUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth';
import {
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerUpdatePromise,
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
  IFarmIdDto,
  IFarmOwnerBulkCreateDTO,
  IFarmOwnerCreateResponseDTO,
  IFarmOwnerGetOneResponseDTO,
  IFarmOwnerGetRelationsResponseDTO,
  IFarmOwnerUpdateDTO,
  IFarmOwnerUpdateResponseDTO,
} from '../farm.dto';
import { FarmOwnerControllerService } from './farm_owner.service';

@ApiTags('Farm Owner')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('farm')
export class FarmOwnerController {
  constructor(private readonly controllerService: FarmOwnerControllerService) {}

  @ApiOperation({
    summary: 'Bulk create farm owners',
    description: 'Creates up to 10 owners in a single request.',
  })
  @ApiBody({ type: IFarmOwnerBulkCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'Owners created.',
    type: IFarmOwnerCreateResponseDTO,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('owner')
  async createMany(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IFarmOwnerBulkCreateDTO,
  ): Promise<IFarmOwnerCreatePromise[]> {
    return await this.controllerService.createMany({ user, body, ip });
  }

  @ApiOperation({
    summary: 'Get a farm owner by id',
    description:
      'Returns the owner with nested properties, harvests and crops.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Owner UUID' })
  @ApiResponse({
    status: 200,
    description: 'Owner found.',
    type: IFarmOwnerGetOneResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  @Get('owner/:id')
  async getOne(@Param() param: IFarmIdDto): Promise<IFarmOwnerGetOnePromise> {
    return await this.controllerService.getOneById({ param });
  }

  @ApiOperation({
    summary: 'Get aggregated counts of related entities for an owner',
    description:
      'Returns the number of properties, harvests and crops linked to the owner.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Owner UUID' })
  @ApiResponse({
    status: 200,
    description: 'Counts returned.',
    type: IFarmOwnerGetRelationsResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  @Get('owner/:id/relations')
  async getRelations(
    @Param() param: IFarmIdDto,
  ): Promise<IFarmOwnerGetRelationsPromise> {
    return await this.controllerService.getRelationsById({ param });
  }

  @ApiOperation({
    summary: 'Update an owner by id',
    description: 'Partially updates an owner. All fields are optional.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Owner UUID' })
  @ApiBody({ type: IFarmOwnerUpdateDTO })
  @ApiResponse({
    status: 200,
    description: 'Owner updated.',
    type: IFarmOwnerUpdateResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  @Put('owner/:id')
  async updateOne(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Param() param: IFarmIdDto,
    @Body() body: IFarmOwnerUpdateDTO,
  ): Promise<IFarmOwnerUpdatePromise> {
    return await this.controllerService.updateOneById({
      user,
      body,
      param,
      ip,
    });
  }

  @ApiOperation({
    summary: 'Soft delete an owner by id',
    description: 'Marks the owner as deleted without removing the record.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Owner UUID' })
  @ApiResponse({ status: 200, description: 'Owner soft-deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Owner not found.' })
  @Delete('owner/:id')
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
