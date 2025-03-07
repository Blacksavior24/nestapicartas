import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReceivedCardDto } from './dto/received-card.dto';
import { AssignedCardDto } from './dto/assigned-card.dto';
import { PendingCardDto } from './dto/pending-card.dto';
import { AssignmentCardDto } from './dto/assignment-card.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService
  ) {}

  async create(createCardDto: CreateCardDto) {

    const { referencia, ...rest} =  createCardDto;


    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia}
      });

      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe')
      }
    }


    return this.prisma.carta.create({
      data: {
        ...rest,
        referencia
      },
    });
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit, search, searchBy, filters} = paginationDto

    console.log("que recibimos", paginationDto);
    let where = {}

    if (search && searchBy) {
      where = {
        OR: searchBy.map((column)=>({
          [column]: {
            contains: search,
            mode: 'insensitive'
          }
        }))
      }
    }
  // Filtros adicionales (filters)
  if (filters) {
    const filterConditions = Object.keys(filters)
      .filter((key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) // Ignorar filtros vacíos
      .map((key) => {
        // Convertir fechaIngreso a un objeto Date si es necesario
        if (key === 'fechaIngreso' && filters[key]) {
          return {
            [key]: new Date(filters[key]), // Convertir a DateTime
          };
        }
        return {
          [key]: filters[key],
        };
      });

    // Solo agregar AND si hay condiciones de filtro válidas
    if (filterConditions.length > 0) {
      where = {
        ...where,
        AND: filterConditions,
      };
    }
  }
    console.log("where>>", where)

    const total = await this.prisma.carta.count({where})

    const data = await this.prisma.carta.findMany({
      where,
      skip: (page-1) * Number(limit),
      take: Number(limit),
      orderBy: {id: 'desc'},
      include: {cartaAnterior: true, respuestas: true, areaResponsable: true, subArea: true, temaRelacion: true}
    })

    
    
    const datesFormated = data.map(carta=> ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0]
    }))

    return {
      data: datesFormated,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total/limit)
      }
    }

  }

  async findOne(id: number) {
    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: { subArea: true, areaResponsable: true, cartaAnterior: true, temaRelacion: true, empresa: true }
    });
  
    if (!carta) {
      throw new Error(`Carta con ID ${id} no encontrada`);
    }
  
    return {
      ...carta,
      correosCopia: carta.correosCopia.join(','),
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
      createdAt: carta.createdAt.toISOString().split('T')[0],
      updatedAt: carta.updatedAt.toISOString().split('T')[0],
    };
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

  async reportsCards(id: bigint) {
    const getTrazabilidad = async (cartaId: bigint): Promise<any> => {
      const carta = await this.prisma.carta.findUnique({
        where: { id: cartaId },
        include: { cartaAnterior: true }, // Incluir la carta anterior
      });
  
      if (!carta) {
        return null; // Si no existe la carta, retornar null
      }
  
      // Si existe una carta anterior, obtener su trazabilidad recursivamente
      if (carta.cartaAnterior) {
        carta.cartaAnterior = await getTrazabilidad(carta.cartaAnterior.id);
      }
  
      return carta;
    };
  
    // Obtener la trazabilidad de la carta solicitada
    const trazabilidad = await getTrazabilidad(id);
  
    // Formatear las fechas
    const formatDates = (carta) => {
      return {
        ...carta,
        fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
        fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
        fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
        cartaAnterior: carta.cartaAnterior ? formatDates(carta.cartaAnterior) : null, // Formatear recursivamente
      };
    };
    return formatDates(trazabilidad);
    
  }

  async createReceivedCard(receivedCardDto: ReceivedCardDto) {
    const {referencia,  subAreaId,...rest} = receivedCardDto
    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia}
      });

      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe')
      }
      await this.prisma.carta.update({
        where: { id: referencia},
        data: {
          estado: 'Cerrado'
        }
      })
    }

    let usersMailto = {}
    if (subAreaId) {
       const subArea = await this.prisma.subArea.findUnique({
        where: {id: subAreaId},
        include: { usuarios: true }
       });
       usersMailto = subArea.usuarios.map((user) => {
        user.email,
        user.nombre
       })
    }



    return this.prisma.carta.create({
      data: {
        ...rest,
        subAreaId,
        referencia
      },
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
