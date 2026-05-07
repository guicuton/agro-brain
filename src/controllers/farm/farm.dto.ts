import {
  IFarmCropsCreatePromise,
  IFarmCropsGetOnePromise,
  IFarmCropsUpdatePromise,
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestUpdatePromise,
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerSearchPromise,
  IFarmOwnerUpdatePromise,
  IFarmPropertyCreatePromise,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertySearchPromise,
  IFarmPropertyUpdatePromise,
} from '@app/farm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AREA_TYPE } from '../../../libs/database/prisma/generated/enums';
import { ValidateAreaSum } from '../../../decorators/validate-area-sum.decorator';
import { ValidateDoc } from '../../../decorators/validate-doc.decorator';

export class IFarmIdDto {
  @ApiProperty({
    description: 'Resource UUID',
    format: 'uuid',
    example: 'b6e1f5a0-4f53-4b34-9f3f-9d5c5a5f3a01',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class IFarmOwnerDTO {
  @ApiProperty({
    description: 'Owner document (CPF or CNPJ, only digits)',
    example: '12345678909',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateDoc()
  doc: string;

  @ApiProperty({ description: 'Owner full name', example: 'john doe' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  fullname: string;

  @ApiProperty({ description: 'City', example: 'sao paulo' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city: string;

  @ApiProperty({ description: 'State', example: 'sp' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state: string;

  @ApiProperty({ description: 'Country', example: 'brazil' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  country: string;
}

export class IFarmOwnerUpdateDTO {
  @ApiPropertyOptional({
    description: 'Owner document (CPF or CNPJ, only digits)',
    example: '12345678909',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ValidateDoc()
  doc?: string;

  @ApiPropertyOptional({ description: 'Owner full name', example: 'john doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  fullname?: string;

  @ApiPropertyOptional({ description: 'City', example: 'sao paulo' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'sp' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'brazil' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  country?: string;
}

export class IFarmOwnerBulkCreateDTO {
  @ApiProperty({
    description: 'Up to 10 farm owners to create in bulk',
    type: () => IFarmOwnerDTO,
    isArray: true,
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IFarmOwnerDTO)
  @ArrayMaxSize(10)
  data: IFarmOwnerDTO[];
}

export class IFarmOwnerSearchDTO {
  @ApiPropertyOptional({
    description: 'Partial owner full name (case-insensitive)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  fullname?: string;

  @ApiPropertyOptional({
    description: 'Partial owner document (CPF or CNPJ, only digits)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  doc?: string;

  @ApiPropertyOptional({
    description: 'Partial city (case-insensitive)',
    example: 'sao',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city?: string;

  @ApiPropertyOptional({
    description: 'Partial state (case-insensitive)',
    example: 'sp',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state?: string;
}

export class IFarmPropertySearchDTO {
  @ApiPropertyOptional({
    description: 'Partial alias of farm (case-insensitive)',
    example: 'fazenda do joao',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  alias?: string;

  @ApiPropertyOptional({
    description: 'Id from owner',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  owner_id?: string;

  @ApiPropertyOptional({
    description: 'Greater or equal total area size',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  area_total?: number;

  @ApiPropertyOptional({
    description: 'Greater or equal arable area',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  area_arable?: number;

  @ApiPropertyOptional({
    description: 'Greater or equal vegetation area',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  area_vegetation?: number;

  @ApiPropertyOptional({
    description: 'Partial city (case-insensitive)',
    example: 'sao',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city?: string;

  @ApiPropertyOptional({
    description: 'Partial state (case-insensitive)',
    example: 'sp',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state?: string;
}

export class IFarmPropertyDTO {
  @ApiProperty({
    description: 'Owner UUID this property belongs to',
    format: 'uuid',
    example: 'b6e1f5a0-4f53-4b34-9f3f-9d5c5a5f3a01',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id: string;

  @ApiProperty({
    description: 'Property alias/name',
    example: 'fazenda boa vista',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  alias: string;

  @ApiProperty({
    description: 'Total area; must be equal to area_arable + area_vegetation',
    example: 1000,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @ValidateAreaSum(['area_arable', 'area_vegetation'])
  area_total: number;

  @ApiProperty({ description: 'Arable area', example: 700, minimum: 1 })
  @IsInt()
  @IsPositive()
  area_arable: number;

  @ApiProperty({ description: 'Vegetation area', example: 300, minimum: 1 })
  @IsInt()
  @IsPositive()
  area_vegetation: number;

  @ApiProperty({
    description: 'Area unit',
    enum: AREA_TYPE,
    example: AREA_TYPE.HECTAR,
  })
  @IsEnum(AREA_TYPE)
  area_type: AREA_TYPE;

  @ApiProperty({ description: 'City', example: 'sao paulo' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city: string;

  @ApiProperty({ description: 'State', example: 'sp' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state: string;

  @ApiProperty({ description: 'Country', example: 'brazil' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  country: string;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: { soil: 'clay', irrigation: 'pivot' },
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmPropertyUpdateDTO {
  @ApiPropertyOptional({
    description: 'Owner UUID this property belongs to',
    format: 'uuid',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;

  @ApiPropertyOptional({ description: 'Property alias/name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  alias?: string;

  @ApiPropertyOptional({
    description: 'Total area; must be equal to area_arable + area_vegetation',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @ValidateAreaSum(['area_arable', 'area_vegetation'])
  area_total?: number;

  @ApiPropertyOptional({ description: 'Arable area' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  area_arable?: number;

  @ApiPropertyOptional({ description: 'Vegetation area' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  area_vegetation?: number;

  @ApiPropertyOptional({ description: 'Area unit', enum: AREA_TYPE })
  @IsOptional()
  @IsEnum(AREA_TYPE)
  area_type?: AREA_TYPE;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  country?: string;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmPropertyBulkCreateDTO {
  @ApiProperty({
    description: 'Up to 10 farm properties to create in bulk',
    type: () => IFarmPropertyDTO,
    isArray: true,
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IFarmPropertyDTO)
  @ArrayMaxSize(10)
  data: IFarmPropertyDTO[];
}

export class IFarmHarvestDTO {
  @ApiProperty({
    description: 'Owner UUID this harvest belongs to',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id: string;

  @ApiProperty({
    description: 'Property UUID this harvest belongs to',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  property_id: string;

  @ApiProperty({
    description: 'Crop year (e.g., 2025)',
    example: 2025,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  crop: number;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmHarvestUpdateDTO {
  @ApiPropertyOptional({ description: 'Owner UUID', format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;

  @ApiPropertyOptional({ description: 'Property UUID', format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  property_id?: string;

  @ApiPropertyOptional({ description: 'Crop year', example: 2025 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  crop?: number;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmHarvestBulkCreateDTO {
  @ApiProperty({
    description: 'Up to 10 harvests to create in bulk',
    type: () => IFarmHarvestDTO,
    isArray: true,
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IFarmHarvestDTO)
  @ArrayMaxSize(10)
  data: IFarmHarvestDTO[];
}

export class IFarmCropsDTO {
  @ApiProperty({ description: 'Owner UUID', format: 'uuid' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id: string;

  @ApiProperty({ description: 'Property UUID', format: 'uuid' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  property_id: string;

  @ApiProperty({ description: 'Harvest UUID', format: 'uuid' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  harvest_id: string;

  @ApiProperty({ description: 'Crop alias/name', example: 'soja' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  alias: string;

  @ApiProperty({
    description: 'Arable area allocated to this crop',
    example: 250,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  area_arable: number;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmCropsUpdateDTO {
  @ApiPropertyOptional({ description: 'Owner UUID', format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  owner_id?: string;

  @ApiPropertyOptional({ description: 'Property UUID', format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  property_id?: string;

  @ApiPropertyOptional({ description: 'Harvest UUID', format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  harvest_id?: string;

  @ApiPropertyOptional({ description: 'Crop alias/name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase())
  alias?: string;

  @ApiPropertyOptional({ description: 'Arable area allocated to this crop' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  area_arable?: number;

  @ApiPropertyOptional({
    description: 'Free-form metadata',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: object | null;
}

export class IFarmCropsBulkCreateDTO {
  @ApiProperty({
    description: 'Up to 10 crops to create in bulk',
    type: () => IFarmCropsDTO,
    isArray: true,
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IFarmCropsDTO)
  @ArrayMaxSize(10)
  data: IFarmCropsDTO[];
}

class IFarmOwnerSummaryDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john doe' })
  fullname: string;
}

class IFarmHarvestSummaryDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 2025 })
  crop: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

class IFarmCropSummaryDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'soja' })
  alias: string;

  @ApiProperty({ example: 250 })
  area_arable: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

class IFarmPropertySummaryDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'fazenda boa vista' })
  alias: string;

  @ApiProperty({ example: 1000 })
  area_total: number;

  @ApiProperty({ example: 700 })
  area_arable: number;

  @ApiProperty({ example: 300 })
  area_vegetation: number;

  @ApiProperty({ enum: AREA_TYPE, example: AREA_TYPE.HECTAR })
  area_type: string;

  @ApiProperty({ example: 'sao paulo' })
  city: string;

  @ApiProperty({ example: 'sp' })
  state: string;

  @ApiProperty({ example: 'brazil' })
  country: string;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

class IFarmOwnerPropertyDeepDTO extends IFarmPropertySummaryDTO {
  @ApiProperty({
    type: () => IFarmOwnerHarvestDeepDTO,
    isArray: true,
  })
  harvests: IFarmOwnerHarvestDeepDTO[];
}

class IFarmOwnerHarvestDeepDTO extends IFarmHarvestSummaryDTO {
  @ApiProperty({
    type: () => IFarmCropSummaryDTO,
    isArray: true,
  })
  crops: IFarmCropSummaryDTO[];
}

export class IFarmOwnerCreateResponseDTO implements IFarmOwnerCreatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john doe' })
  fullname: string;
}

export class IFarmOwnerUpdateResponseDTO implements IFarmOwnerUpdatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;
}

export class IFarmOwnerGetOneResponseDTO implements IFarmOwnerGetOnePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john doe' })
  fullname: string;

  @ApiProperty({ example: '12345678909' })
  doc: string;

  @ApiProperty({ example: 'sao paulo' })
  city: string;

  @ApiProperty({ example: 'sp' })
  state: string;

  @ApiProperty({ example: 'brazil' })
  country: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;

  @ApiProperty({ type: () => IFarmOwnerPropertyDeepDTO, isArray: true })
  properties: IFarmOwnerPropertyDeepDTO[];
}

export class IFarmOwnerGetRelationsResponseDTO implements IFarmOwnerGetRelationsPromise {
  @ApiProperty({ description: 'Number of properties owned', example: 3 })
  properties: number;

  @ApiProperty({
    description: 'Number of harvests across properties',
    example: 7,
  })
  harvests: number;

  @ApiProperty({ description: 'Number of crops across harvests', example: 12 })
  crops: number;
}

export class IFarmOwnerSearchResponseDTO implements IFarmOwnerSearchPromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'john doe' })
  fullname: string;

  @ApiProperty({ example: '12345678909' })
  doc: string;

  @ApiProperty({ example: 'sao paulo' })
  city: string;

  @ApiProperty({ example: 'sp' })
  state: string;

  @ApiProperty({ example: 'brazil' })
  country: string;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

export class IFarmPropertyCreateResponseDTO implements IFarmPropertyCreatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'fazenda boa vista' })
  alias: string;
}

export class IFarmPropertyUpdateResponseDTO implements IFarmPropertyUpdatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;
}

export class IFarmPropertySearchResponseDTO implements IFarmPropertySearchPromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ type: () => IFarmOwnerSummaryDTO })
  owner: IFarmOwnerSummaryDTO;

  @ApiProperty({ example: 'fazenda do joao' })
  alias: string;

  @ApiProperty({ example: 100 })
  area_total: number;

  @ApiProperty({ example: 100 })
  area_arable: number;

  @ApiProperty({ example: 100 })
  area_vegetation: number;

  @ApiProperty({ enum: AREA_TYPE, example: AREA_TYPE.HECTAR })
  area_type: string;

  @ApiProperty({ example: 'sao paulo' })
  city: string;

  @ApiProperty({ example: 'sp' })
  state: string;

  @ApiProperty({ example: 'brazil' })
  country: string;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

class IFarmPropertyHarvestDeepDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 2025 })
  crop: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({
    type: () => IFarmPropertyCropDeepDTO,
    isArray: true,
  })
  crops: IFarmPropertyCropDeepDTO[];
}

class IFarmPropertyCropDeepDTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'soja' })
  alias: string;

  @ApiProperty({ example: 250 })
  area_arable: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;
}

export class IFarmPropertyGetOneResponseDTO implements IFarmPropertyGetOnePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'fazenda boa vista' })
  alias: string;

  @ApiProperty({ example: 1000 })
  area_total: number;

  @ApiProperty({ example: 700 })
  area_arable: number;

  @ApiProperty({ example: 300 })
  area_vegetation: number;

  @ApiProperty({ enum: AREA_TYPE, example: AREA_TYPE.HECTAR })
  area_type: string;

  @ApiProperty({ example: 'sao paulo' })
  city: string;

  @ApiProperty({ example: 'sp' })
  state: string;

  @ApiProperty({ example: 'brazil' })
  country: string;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: () => IFarmOwnerSummaryDTO })
  owner: IFarmOwnerSummaryDTO;

  @ApiProperty({ type: () => IFarmPropertyHarvestDeepDTO, isArray: true })
  harvests: IFarmPropertyHarvestDeepDTO[];

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}

export class IFarmPropertyGetRelationsResponseDTO implements IFarmPropertyGetRelationsPromise {
  @ApiProperty({ example: 5 })
  harvests: number;

  @ApiProperty({ example: 9 })
  crops: number;
}

export class IFarmHarvestCreateResponseDTO implements IFarmHarvestCreatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 2025 })
  crop: number;
}

export class IFarmHarvestUpdateResponseDTO implements IFarmHarvestUpdatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;
}

export class IFarmHarvestGetOneResponseDTO implements IFarmHarvestGetOnePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 2025 })
  crop: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;

  @ApiProperty({ type: () => IFarmOwnerSummaryDTO })
  owner: IFarmOwnerSummaryDTO;

  @ApiProperty({ type: () => IFarmPropertySummaryDTO })
  property: IFarmPropertySummaryDTO;

  @ApiProperty({ type: () => IFarmCropSummaryDTO, isArray: true })
  crops: IFarmCropSummaryDTO[];
}

export class IFarmHarvestGetRelationsResponseDTO implements IFarmHarvestGetRelationsPromise {
  @ApiProperty({ example: 4 })
  crops: number;
}

export class IFarmCropsCreateResponseDTO implements IFarmCropsCreatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'soja' })
  alias: string;
}

export class IFarmCropsUpdateResponseDTO implements IFarmCropsUpdatePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;
}

export class IFarmCropsGetOneResponseDTO implements IFarmCropsGetOnePromise {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'soja' })
  alias: string;

  @ApiProperty({ example: 250 })
  area_arable: number;

  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  metadata: any;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;

  @ApiProperty({ type: () => IFarmOwnerSummaryDTO })
  owner: IFarmOwnerSummaryDTO;

  @ApiProperty({ type: () => IFarmPropertySummaryDTO })
  property: IFarmPropertySummaryDTO;

  @ApiProperty({ type: () => IFarmHarvestSummaryDTO })
  harvest: IFarmHarvestSummaryDTO;
}
