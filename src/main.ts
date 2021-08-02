import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Easy Ticket')
    .setDescription('The Easy Ticket API description')
    .setVersion('1.0')
    .addTag('APIS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
