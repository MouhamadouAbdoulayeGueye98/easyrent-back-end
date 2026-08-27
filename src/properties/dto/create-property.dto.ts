import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

import { PropertyType, ListingType } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  // Localisation
  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  // Type
  @IsEnum(PropertyType)
  type!: PropertyType;

  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  // Prix
  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  charges?: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsString()
  availability?: string;

  // Équipements
  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsBoolean()
  waterIncluded?: boolean;

  @IsOptional()
  @IsBoolean()
  electricityIncluded?: boolean;

  @IsOptional()
  @IsBoolean()
  wifiAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  airConditioning?: boolean;

  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;
}