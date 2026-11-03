import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PropertyType } from '@prisma/client';

export class SearchPropertyDto {
  // Recherche texte libre : titre, ville ou quartier
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  wifiAvailable?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  parking?: boolean;

  // Ne garde que les annonces créées il y a 7 jours ou moins
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  recent?: boolean;

  // Pagination
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
