import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BigIntInterceptor } from './intercerptors/bigint.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
//import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.enableCors()
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
    })
  );
  app.useGlobalInterceptors(new BigIntInterceptor())
  //app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Cartas')
    .setDescription('API de Cartas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      defaultModelRendering: 'model'
    }
  })


  await app.listen(process.env.PORT ?? 3003);
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap();
