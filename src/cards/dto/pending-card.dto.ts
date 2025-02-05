import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PendingCardDto {
  @ApiPropertyOptional({
    description: 'Borrador de la respuesta a la carta (opcional)',
    example: 'Respuesta a la carta...',
  })
  @IsOptional()
  @IsString()
  cartaborrador?: string;

  @ApiPropertyOptional({
    description: 'Comentario adicional (opcional)',
    example: 'Comentario sobre la respuesta...',
  })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiPropertyOptional({
    description: 'Indica si la carta ha sido devuelta (opcional)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  devuelto?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones si la carta se devuelve (opcional)',
    example: 'La carta se devuelve por falta de información...',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}