import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubAreaDto } from '../../dto/create-sub-area.dto';
import { UpdateSubAreaDto } from '../../dto/update-sub-area.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubAreasService {
  constructor(private prisma: PrismaService) {}

  async create(createSubAreaDto: CreateSubAreaDto) {
    
    const areaResponsable = await this.prisma.areaResponsable.findUnique({
      where: { id: createSubAreaDto.areaResponsableId}
    })

    if (!areaResponsable) {
      throw new NotFoundException('Area Responsable no encontrada')
    }

    return this.prisma.subArea.create({
      data: {
        ...createSubAreaDto
      }
    })
  }

  async findAll() {
    return this.prisma.subArea.findMany({
      include: {
        areaResponsable: true
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.subArea.findUnique({
      where: { id }
    })
  }

  async update(id: number, updateSubAreaDto: UpdateSubAreaDto) {
    
    const areaResponsable = await this.prisma.areaResponsable.findUnique({
      where: { id: updateSubAreaDto.areaResponsableId}
    })

    if (!areaResponsable) {
      throw new NotFoundException('Area responsable no encontrada')
    }

    return this.prisma.subArea.update({
      where: { id },
      data: {
        ...updateSubAreaDto
      }
    })
  }

  async remove(id: number) {
    const subArea = await this.prisma.subArea.findUnique({
      where: { id },
      include: { cartas: true, usuarios: true}
    })

    if (!subArea) {
      throw new NotFoundException('Sub Area no encontrada')
    }

    if (subArea.cartas.length>0 || subArea.usuarios.length > 0) {
      throw new ConflictException(
        'No se puede eliminar sub area porque tiene Cartas o Usuarios asociados'
      )
    }

    return this.prisma.subArea.delete({
      where: { id }
    })

  }
}
