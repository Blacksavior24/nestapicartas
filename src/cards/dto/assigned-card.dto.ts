import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class AssignedCardDto {
  @ApiPropertyOptional({
    description: 'Estado de la carta (opcional)',
    example: 'Asignado',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Referencia de la carta (opcional)',
    example: 'REF-001',
  })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiProperty({
    description: 'Resumen del contenido recibido',
    example: 'Resumen de la carta...',
  })
  @IsString()
  resumenRecibido: string;

  @ApiPropertyOptional({
    description: 'Lista de correos en copia (opcional)',
    example: ['correo1@intersur.com.pe', 'correo2@intersur.com.pe'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correosCopia?: string[];

  @ApiProperty({
    description: 'ID del área responsable',
    example: 1,
  })
  @IsNumber()
  areaResponsableId: number;

  @ApiProperty({
    description: 'ID de la subárea',
    example: 2,
  })
  @IsNumber()
  subAreaId: number;

  @ApiProperty({
    description: 'ID de la empresa',
    example: 3,
  })
  @IsNumber()
  empresaId: number;

  @ApiProperty({
    description: 'Nivel de impacto de la carta',
    example: 'Alto',
  })
  
  @IsString()
  nivelImpacto: string;

  @ApiProperty({
    description: 'ID del tema relacionado',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  temaId: number;

  @ApiPropertyOptional({
    description: 'Indica si la carta tiene vencimiento (opcional)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  vencimiento?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento de la carta (opcional)',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsString()
  fechadevencimiento?: string;

  @ApiPropertyOptional({
    description: 'Indica si la carta es informativa (opcional)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  informativo?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si la carta es urgente (opcional)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  urgente?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si la carta ha sido devuelta (opcional)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  devuelto?: boolean;
}