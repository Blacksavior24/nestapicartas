import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService
  ) {}

  @Post('send')
  async sendEmail(@Body() sendMailDto: SendMailDto ){
    await this.mailService.sendUserConfirmation(sendMailDto);
  }

  
  
} 

