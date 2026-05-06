import type { IAuthenticatedUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth';
import {
  IFarmCropsCreatePromise,
  IFarmCropsGetOnePromise,
  IFarmCropsUpdatePromise,
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
import { User } from '../../../decorators/user.decorator';
import {
  IFarmCropsBulkCreateDTO,
  IFarmCropsCreateResponseDTO,
  IFarmCropsGetOneResponseDTO,
  IFarmCropsUpdateDTO,
  IFarmCropsUpdateResponseDTO,
  IFarmIdDto,
} from './farm.dto';
import { FarmCropsControllerService } from './farm_crops.service';

@ApiTags('Farm Crops')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('farm')
export class FarmCropsController {
  constructor(private readonly controllerService: FarmCropsControllerService) {}

  @ApiOperation({
    summary: 'Bulk create farm crops',
    description: 'Creates up to 10 crops in a single request.',
  })
  @ApiBody({ type: IFarmCropsBulkCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'Crops created.',
    type: IFarmCropsCreateResponseDTO,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('crops')
  async createMany(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Body() body: IFarmCropsBulkCreateDTO,
  ): Promise<IFarmCropsCreatePromise[]> {
    return await this.controllerService.createMany({ user, body, ip });
  }

  @ApiOperation({
    summary: 'Get a crop by id',
    description: 'Returns the crop with owner, property and harvest summaries.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Crop UUID' })
  @ApiResponse({
    status: 200,
    description: 'Crop found.',
    type: IFarmCropsGetOneResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Crop not found.' })
  @Get('crops/:id')
  async getOne(@Param() param: IFarmIdDto): Promise<IFarmCropsGetOnePromise> {
    return await this.controllerService.getOneById({ param });
  }

  @ApiOperation({
    summary: 'Update a crop by id',
    description: 'Partially updates a crop. All fields are optional.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Crop UUID' })
  @ApiBody({ type: IFarmCropsUpdateDTO })
  @ApiResponse({
    status: 200,
    description: 'Crop updated.',
    type: IFarmCropsUpdateResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Crop not found.' })
  @Put('crops/:id')
  async updateOne(
    @User() user: IAuthenticatedUser,
    @Ip() ip: string,
    @Param() param: IFarmIdDto,
    @Body() body: IFarmCropsUpdateDTO,
  ): Promise<IFarmCropsUpdatePromise> {
    return await this.controllerService.updateOneById({
      user,
      body,
      param,
      ip,
    });
  }

  @ApiOperation({
    summary: 'Soft delete a crop by id',
    description: 'Marks the crop as deleted without removing the record.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Crop UUID' })
  @ApiResponse({ status: 200, description: 'Crop soft-deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Crop not found.' })
  @Delete('crops/:id')
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
