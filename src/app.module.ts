import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration, { EnvironmentVariables } from './configuration';
import { UsersModule } from './users/users.module';

function getEnvFilePath() {
  switch (process.env.NODE_ENV) {
    case 'debug':
      return 'env/.debug.env';

    case 'dev':
      return 'env/.dev.env';

    default:
      return null;
  }
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: getEnvFilePath(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        const database = config.get<EnvironmentVariables['database']>(
          'database',
        );
        return {
          uri: database.uri,
          useFindAndModify: false,
          useNewUrlParser: true,
          useCreateIndex: true,
        };
      },
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        const isProd = config.get<string>('env') === 'production';
        return {
          debug: !isProd,
          playground: !isProd,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
