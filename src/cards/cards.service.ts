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

  findAll() {
    return this.prisma.carta.findMany();
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
    return this.prisma.carta.create({
      data: receivedCardDto
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

}
