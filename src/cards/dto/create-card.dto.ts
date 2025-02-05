import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ description: 'Información del PDF de la carta' })
  @IsNotEmpty()
  @IsString()
  pdfInfo: string;

  @ApiProperty({ description: 'Código recibido de la carta' })
  @IsNotEmpty()
  @IsString()
  codigoRecibido: string;

  @ApiProperty({ description: 'Fecha de ingreso de la carta', type: String, format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  fechaIngreso: Date;

  @ApiProperty({ description: 'Destinatario de la carta' })
  @IsNotEmpty()
  @IsString()
  destinatario: string;

  @ApiProperty({ description: 'Asunto de la carta' })
  @IsNotEmpty()
  @IsString()
  asunto: string;

  @ApiProperty({ description: 'Indica si la carta es confidencial', default: false })
  @IsBoolean()
  esConfidencial: boolean;

  @ApiProperty({ description: 'Indica si la carta ha sido devuelta', default: false })
  @IsBoolean()
  devuelto: boolean;

  @ApiProperty({ description: 'Estado de la carta', default: 'Ingresado' })
  @IsString()
  estado: string;

  @ApiProperty({ description: 'Referencia de la carta', required: false })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiProperty({ description: 'Resumen recibido de la carta', required: false })
  @IsOptional()
  @IsString()
  resumenRecibido?: string;

  @ApiProperty({ description: 'Tema de la carta', required: false })
  @IsOptional()
  @IsString()
  tema?: string;

  @ApiProperty({ description: 'Nivel de impacto de la carta', required: false })
  @IsOptional()
  @IsString()
  nivelImpacto?: string;

  @ApiProperty({ description: 'Correos en copia de la carta', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  correosCopia: string[];

  @ApiProperty({ description: 'ID del área responsable de la carta', required: false })
  @IsOptional()
  areaResponsableId?: bigint;

  @ApiProperty({ description: 'ID de la subárea de la carta', required: false })
  @IsOptional()
  subAreaId?: bigint;

  @ApiProperty({ description: 'ID de la empresa de la carta', required: false })
  @IsOptional()
  empresaId?: bigint;

  @ApiProperty({ description: 'ID del tema relacionado con la carta', required: false })
  @IsOptional()
  temaId?: bigint;

  @ApiProperty({ description: 'Indica si la carta tiene vencimiento', default: false })
  @IsBoolean()
  vencimiento: boolean;

  @ApiProperty({ description: 'Fecha de vencimiento de la carta', required: false })
  @IsOptional()
  @IsDateString()
  fechadevencimiento?: Date;

  @ApiProperty({ description: 'Indica si la carta es informativa', default: false })
  @IsBoolean()
  informativo: boolean;

  @ApiProperty({ description: 'Indica si la carta es urgente', default: false })
  @IsBoolean()
  urgente: boolean;

  @ApiProperty({ description: 'Borrador de la respuesta de la carta', required: false })
  @IsOptional()
  @IsString()
  cartaborrador?: string;

  @ApiProperty({ description: 'Comentario adicional de la carta', required: false })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiProperty({ description: 'Observaciones si la carta se devuelve', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}