import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './../../dto/create-user.dto';
import { UpdateUserDto } from './../../dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {

    const hashedPassword = await bcrypt.hash(createUserDto.contraseña, 10);

    const user = await this.prisma.usuario.create({
      data: {
        ...createUserDto,
        contraseña: hashedPassword
      },
    });

    return user;
  }

  async findAll(paginationDto: PaginationDto) {

    const { page = 1, limit = 100, search, searchBy } = paginationDto;
    const skip = (page - 1) * Number(limit);

    const where = search
      ? {
          OR: searchBy.map((column) => ({
            [column]: {
              contains: search,
              mode: "insensitive",
            },
          })),
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        take: Number(limit),
        skip,
        orderBy: { id: 'asc' },
        include: {rol: true, area: true, subArea: true}
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      }
    }
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...updateUserDto
      },
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
