import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingService } from './common/loggin/logging.service';
import { AllExceptionsFilter } from './common/loggin/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LoggingService);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  
  
  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught exception: ${err.message}`, err.stack);
  });

  process.on('unhandledRejection', (reason: any) => {
    const msg =
      reason instanceof Error
        ? `${reason.message}`
        : JSON.stringify(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    logger.error(`Unhandled rejection: ${msg}`, stack);
  });

  logger.log('🚀 Application is starting');

  const config = new DocumentBuilder()
    .setTitle('Home Library Service')
    .setDescription('REST API for users, artists, tracks, albums and favorites')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  logger.log(`✅ Application has started on port ${port}`);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
}
bootstrap();
