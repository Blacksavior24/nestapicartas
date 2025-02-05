import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class ReceivedCardDto {
  @ApiProperty({
    description: 'Información del PDF subido',
    example: 'ruta/al/archivo.pdf',
  })
  @IsString()
  pdfInfo: string;

  @ApiProperty({
    description: 'Código recibido de la carta',
    example: 'ABC123',
  })
  @IsString()
  codigoRecibido: string;

  @ApiProperty({
    description: 'Destinatario de la carta',
    example: 'Juan Pérez',
  })
  @IsString()
  destinatario: string;

  @ApiProperty({
    description: 'Asunto de la carta',
    example: 'Solicitud de información',
  })
  @IsString()
  asunto: string;

  @ApiProperty({
    description: 'Indica si la carta es confidencial',
    example: true,
  })
  @IsBoolean()
  esConfidencial: boolean;

  @ApiProperty({
    description: 'Fecha de ingreso de la carta',
    example: '03-02-2024'
  })
  @IsDate()
  @Type(()=>Date)
  fechaIngreso: string;
}