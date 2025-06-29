import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RecordingModule } from './recording/recording.module';
import { ConfigModule } from '@nestjs/config';
// import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    RecordingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
