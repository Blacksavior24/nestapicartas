import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';
import { NotiMailDto } from './dto/noti-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
   
  constructor(
    private mailerService: MailerService
  ) {}


  async sendUserConfirmation(user: SendMailDto ) {
    console.log("data serivces", user);
    
    const url = `https://www.youtube.com/channel/UCvXekawNgmVfd615D52nNow`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App!',
      template: './welcome',
      context: {
        nombre: user.nombre,
        url,
      },
    });
  }

  async sendNotification(email: NotiMailDto) {
    const mailOptions = {
      to: email.email,
      subject: 'PENDIENTES DE CARTAS',
      template: './notification_email',
      context: {
        message: `Hola ${email.nombre}, tienes una carta que atender`,
        link: `http://192.168.120.139:${process.env.PORT}/api/v1`
      },
    };
  
    // Solo incluir "cc" si hay correos en el arreglo
    if (email.cc && email.cc.length > 0) {
      mailOptions['cc'] = email.cc;
    }
  
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Correo enviado correctamente a ${email.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email.email}: ${error.message}`);
      //throw error; // Opcional: relanzar el error si es necesario
    }
  }

  async sendUrgentNotificaciont(email: UrgentMailDto){
    console.log('que datos llegan', email)
    const mailOptions = {
      to: email.email,
      subject: 'Urgente portal de Cartas',
      template: './urgent',
      context: {
        message: `Hola ${email.nombre}, tienes una carta urgente que atender`,
        link: `http://192.168.120.139:${process.env.PORT}/api/v1`
      },
      headers: {
        // Marcar como urgente (Outlook y Gmail)
        'X-Priority': `${email.priority==='ALTO'?'1':'2'}`, // 1 = Alta prioridad, 2 = Normal, 3 = Baja
        'Importance': `${email.priority==='ALTO'?'high':'normal'}`, // high = Alta prioridad
        'X-MSMail-Priority': `${email.priority==='ALTO'?'High':''}`, // Para clientes de correo antiguos de Microsoft
      },
    };
    // Solo incluir "cc" si hay correos en el arreglo
    if (email.cc && email.cc.length > 0) {
      mailOptions['cc'] = email.cc;
    }
    try {
      await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Correo enviado correctamente a ${email.email}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${email.email}: ${error.message}`);
      //throw error; // Opcional: relanzar el error si es necesario
    }
  }

}
