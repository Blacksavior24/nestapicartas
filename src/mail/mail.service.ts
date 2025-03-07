import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendMailDto } from './dto/send-mail.dto';
import { NotiMailDto } from './dto/noti-mail.dto';
import { UrgentMailDto } from './dto/urgent-mail.dto';

@Injectable()
export class MailService {
   
  constructor(
    private mailerService: MailerService
  ) {}


  async sendUserConfirmation(user: SendMailDto ) {
    const url = `https://www.youtube.com/channel/UCvXekawNgmVfd615D52nNow`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App!',
      template: './welcome',
      context: {
        name: user.nombre,
        url,
      },
    });
  }

  async sendNotification(email: NotiMailDto){
    await this.mailerService.sendMail({
      to: email.email,
      subject: 'PENDIENTES DE CARTAS',
      cc: email.cc
    })
  }

  async sendUrgentNotificaciont(email: UrgentMailDto){
    console.log('que datos llegan', email)
    this.mailerService.sendMail({
      to: email.email,
      subject: 'Urgente portal de Cartas',
      template: './urgent',
      context: {
        message: `Hola ${email.nombre}, tienes una carta urgente que atender`,
        link: 'http://localhost:3000'
      }
    })
  }

}
