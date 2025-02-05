import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number =1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
  
    @IsOptional()
    @IsString()
    search?: string; // Campo de búsqueda
  
    @IsOptional()
    @IsString({ each: true }) // Permite un array de strings
    searchBy?: string[]; // Columnas por las que se puede buscar

}