import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReceivedCardDto } from './dto/received-card.dto';
import { AssignedCardDto } from './dto/assigned-card.dto';
import { PendingCardDto } from './dto/pending-card.dto';
import { AssignmentCardDto } from './dto/assignment-card.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name)

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron(){
    this.logger.debug('Enviando correos cada 10 minutos')

    const today = new Date()
    const todayDateString =  new Date(today.setHours(23, 59, 59, 999));

    const data = await this.prisma.carta.findMany({
      where: {
        estado: "Ingresado",
        fechaEnvio: null,
        fechaIngreso: {
          lte: todayDateString
        }
      },
      include: { subArea: true }
    })
    console.log("se muestra")    
    // Iterar sobre cada carta encontrada
    for (const carta of data) {
      // Buscar los usuarios que pertenecen a la subárea de la carta
      const usuarios = await this.prisma.usuario.findMany({
        where: {
          subAreaId: carta.subAreaId,
        },
      });
      console.log("entramos")
      // Enviar un correo a cada usuario de la subárea
      for (const usuario of usuarios) {
        let email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: carta.correosCopia || []
        };
        try {
          this.mail.sendNotification(email); // No usamos await para no bloquear el flujo
          this.logger.log(`Correo enviado a ${usuario.email} sobre la carta ${carta.id}`);
        } catch (error) {
          this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
        }
      }
      
      // Actualizar la carta para marcar que ha sido enviada
      await this.prisma.carta.update({
        where: { id: carta.id },
        data: { 
          fechaEnvio: new Date(),
          estado: "PendienteArea" 
        },
      });

      this.logger.log(`Carta ${carta.id} marcada como enviada.`);
    }
  }
  


  //Create a card 
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
  //Get all Card with Paginations and Filters
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
      include: {cartaAnterior: true, respuestas: true, areaResponsable: true, subArea: true, temaRelacion: true, empresa: true}
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
  //Get One Card
  async findOne(id: number) {
    const carta = await this.prisma.carta.findUnique({
      where: { id },
      include: { subArea: true, areaResponsable: true, cartaAnterior: true, temaRelacion: true, empresa: true, respuestas: true }
    });
  
    if (!carta) {
      throw new Error(`Carta con ID ${id} no encontrada`);
    }
  
    return {
      ...carta,
      correosCopia: carta.correosCopia,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
      createdAt: carta.createdAt.toISOString().split('T')[0],
      updatedAt: carta.updatedAt.toISOString().split('T')[0],
    };
  }
  //Patch One Card
  async update(id: number, updateCardDto: UpdateCardDto) {
    console.log(updateCardDto)
    return this.prisma.carta.update({
      where: { id },
      data: updateCardDto,
    });
  }
  //Delete One Card
  remove(id: number) {
    return this.prisma.carta.delete({
      where: { id },
    });
  }

  async sendMail(id: number){
    const carta = await this.findOne(id);

    const {subAreaId, correosCopia, nivelImpacto, ...rest} = carta

      if (subAreaId) {
            const subArea = await this.prisma.subArea.findUnique({
              where: {id: subAreaId},
              include: { usuarios: true }
            });

            if (!subArea) {
              throw new NotFoundException('La subárea no existe');
            }

            for (const usuario of subArea.usuarios) {
              let email = {
                email: usuario.email,
                nombre: usuario.nombre,
                cc: correosCopia || [],
                priority: nivelImpacto
              };
              try {
                this.mail.sendUrgentNotificaciont(email); // No usamos await para no bloquear el flujo
                this.logger.log(`Correo enviado a ${usuario.email} sobre la carta Urgente`);
              } catch (error) {
                this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
              }
            }

          }

  }

  //Get One Card for Trazability
  async reportsCards(id: bigint) {
    const getTrazabilidad = async (cartaId: bigint): Promise<any> => {
      const carta = await this.prisma.carta.findUnique({
        where: { id: cartaId },
        include: { cartaAnterior: true, respuestas: true }, // Incluir la carta anterior
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
  //Create card for Assing Form
  async createReceivedCard(receivedCardDto: ReceivedCardDto) {
    const {referencia,  subAreaId,urgente,correosCopia, nivelImpacto , ...rest} = receivedCardDto
    if (referencia) {
      const cartaAnterior = await this.prisma.carta.findUnique({
        where: { id: referencia}
      });
      if (!cartaAnterior) {
        throw new NotFoundException('La carta anterior no existe')
      }
      if (cartaAnterior.estado === 'Cerrado') {
        throw new BadRequestException('La carta anterior ya está cerrada');
      }
      await this.prisma.carta.update({
        where: { id: referencia},
        data: {
          estado: 'Cerrado'
        }
      })
    }
    if (subAreaId && urgente) {
       const subArea = await this.prisma.subArea.findUnique({
        where: {id: subAreaId},
        include: { usuarios: true }
       });

       if (!subArea) {
        throw new NotFoundException('La subárea no existe');
      }

       for (const usuario of subArea.usuarios) {
        let email = {
          email: usuario.email,
          nombre: usuario.nombre,
          cc: correosCopia || [],
          priority: nivelImpacto
        };
        try {
          this.mail.sendUrgentNotificaciont(email); // No usamos await para no bloquear el flujo
          this.logger.log(`Correo enviado a ${usuario.email} sobre la carta Urgente`);
        } catch (error) {
          this.logger.error(`Error al enviar correo a ${usuario.email}: ${error.message}`);
        }
      }

    }
    //if else, al llegar referencia con valor 0, uso para que no exista error en referenca
    if (referencia) {
      return this.prisma.carta.create({
        data: {
          ...rest,
          subAreaId,
          referencia,
          urgente,
          nivelImpacto
        },
      });      
    } else {
    return this.prisma.carta.create({
      data: {
        ...rest,
        subAreaId,
        urgente,
        nivelImpacto
      },
    });
    }

  }

  async assignedCard(id: number, assignedCardDto: AssignedCardDto ){
    return this.prisma.carta.update({
      where: { id },
      data: assignedCardDto
    })
  }

  //AnswerPendingCard, Answer a Card of Pendings
  async pendingCard(id: number, pendingCardDto: PendingCardDto){
    const {devuelto, ...rest} = pendingCardDto

    let estado = "Pendiente";

    return this.prisma.carta.update({
      where: { id },
      data: {
        ...rest,
        estado,
        devuelto
      }
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

  //Get all Pendings Cards
  async findAllPendientes(subAreaId: number, paginationDto: PaginationDto) {
    const { page, limit, search, searchBy, filters } = paginationDto;
    console.log("subarea", subAreaId);
    
    // Definir el where inicial con el filtro de subAreaId y estado 'Pendiente'
      // Definir el where inicial
    let where: any = {}
    
    if (subAreaId === 0) {
      where ={
        AND: [
          { estado: { not: "PendienteArea" } },
          { estado: { not: "Cerrado"}},
          { estado: { not: "Ingresado"}},
        ],
      }; 
    }else{
      where = {
        subAreaId: subAreaId,
        AND: [
          { estado: { not: "Pendiente" } },
          { estado: { not: "Cerrado"}},
          { estado: { not: "Ingresado"}},
          {
            AND: [
              { comentario: null},
              { cartaborrador: null}
            ]
          }
        ]
      }
    }
    // Búsqueda (search)
    if (search && searchBy) {
      where = {
        ...where,
        OR: searchBy.map((column) => ({
          [column]: {
            contains: search,
            mode: 'insensitive', // Búsqueda insensible a mayúsculas/minúsculas
          },
        })),
      };
    }
  
    // Filtros adicionales (filters)
    if (filters) {
      const filterConditions = Object.keys(filters)
        .filter((key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) // Ignorar filtros vacíos
        .map((key) => {
          // Convertir fechas a objetos Date si es necesario
          if ((key === 'fechaIngreso' || key === 'fechadevencimiento') && filters[key]) {
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
    console.log("where final", where);
    
    // Obtener el total de cartas pendientes para la subárea con los filtros aplicados
    const total = await this.prisma.carta.count({ where });
  
    // Obtener las cartas paginadas
    const cartas = await this.prisma.carta.findMany({
      where,
      skip: (page - 1) * Number(limit),
      take: Number(limit),
      orderBy: { id: 'desc' },
      include: {
        areaResponsable: true,
        subArea: true,
        temaRelacion: true,
        empresa: true,
      },
    });
  
    // Formatear las fechas
    const datesFormated = cartas.map((carta) => ({
      ...carta,
      fechaIngreso: carta.fechaIngreso?.toISOString().split('T')[0],
      fechaEnvio: carta.fechaEnvio?.toISOString().split('T')[0],
      fechadevencimiento: carta.fechadevencimiento?.toISOString().split('T')[0],
    }));
  
    // Retornar los datos paginados y la metadata
    return {
      data: datesFormated,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }



}
