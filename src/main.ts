import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService<EnvironmentVariables> = app.get(
    ConfigService,
  );
  const port = configService.get<number>('port');
  const broker = configService.get<EnvironmentVariables['broker']>('broker');

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [broker.uri],
      queue: 'posts',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservicesAsync();
  await app.listen(port);
}
bootstrap();
