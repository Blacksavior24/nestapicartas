import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReceivedCardDto } from './dto/received-card.dto';
import { AssignedCardDto } from './dto/assigned-card.dto';
import { PendingCardDto } from './dto/pending-card.dto';
import { AssignmentCardDto } from './dto/assignment-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  create(createCardDto: CreateCardDto) {
    return this.prisma.carta.create({
      data: createCardDto,
    });
  }

  async findAll() {
    const cartas = await this.prisma.carta.findMany();
    return cartas.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))
  }

  findOne(id: number) {
    return this.prisma.carta.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return this.prisma.carta.update({
      where: { id },
      data: updateCardDto,
    });
  }

  remove(id: number) {
    return this.prisma.carta.delete({
      where: { id },
    });
  }

  async createReceivedCard(receivedCardDto: ReceivedCardDto) {
    console.log('datos', receivedCardDto)
    return this.prisma.carta.create({
      data: {
        ...receivedCardDto,
        devuelto: false
      }
    });
  }

  async assignedCard(id: number, assignedCardDto: AssignedCardDto ){
    return this.prisma.carta.update({
      where: { id },
      data: assignedCardDto
    })
  }

  async pendingCard(id: number, pendingCardDto: PendingCardDto){
    return this.prisma.carta.update({
      where: { id },
      data: pendingCardDto
    })
  }

  async assignmentCard(id: number, assignmentCardDto: AssignmentCardDto){
    return this.prisma.carta.update({
      where: { id },
      data: assignmentCardDto
    })
  }


  async findAllEmision() {
    const cartas = await this.prisma.carta.findMany({
      where: {
        emision: true
      }
    });
    return cartas.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))
  }

  async findAllPendientes(subAreaId: number) {
    const cartas = await this.prisma.carta.findMany({
      where: {
        estado: 'Pendiente',
        subAreaId: subAreaId
      }
    });
    return cartas.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))
  }

}
