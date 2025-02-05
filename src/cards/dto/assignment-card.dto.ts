import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString } from "class-validator";

export class AssignmentCardDto {
    @ApiPropertyOptional({
        description: 'Borrador de la respuesta a la carta (opcional)',
        example: 'FileName del archivo',
    })
    @IsOptional()
    @IsString()
    cartaborrador?: string;

    @ApiProperty({
        description: 'Código de Enviado',
        example: 'TORIBIO-1'
    })
    @IsString()
    codigoEnviado: string;

    @ApiProperty({
        description: 'Fecha de ingreso de la carta',
        example: '03-02-2024'
    })
    @IsDate()
    @Type(() => Date)
    fechaEnvio: string;

    @ApiPropertyOptional({
        description: 'Asunto del cargo',
        example: 'Se envia el nuevo cargo'
    })
    @IsString()
    asuntoEnviado: string;

    @ApiPropertyOptional({
        description: 'Resumen del cargo',
        example: 'Se envia el nuevo cargo'
    })
    @IsString()
    resumenEnviado: string;

    @ApiPropertyOptional({
        description: 'Carta enviada del cargo',
        example: 'Se envia el nuevo cargo'
    })
    @IsString()
    cartaEnviada?: string;

    @ApiPropertyOptional({
        description: 'Comentario del cargo',
        example: 'Se envia el nuevo cargo'
    })
    @IsString()
    comentarioCargo?: string;


}