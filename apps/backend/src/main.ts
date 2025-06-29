import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Creating Nest application...');

    console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
    console.log(
      'JWT_SECRET value:',
      process.env.JWT_SECRET?.substring(0, 10) + '...',
    );

    const app = await NestFactory.create(AppModule);

    // Add global validation pipe
    app.useGlobalPipes(new ValidationPipe());

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    const port = process.env.PORT ?? 4000;

    logger.log(`Attempting to listen on port ${port}...`);
    await app.listen(port);

    logger.log(`✅ Application is running on: http://localhost:${port}`);
    logger.log('🚀 Server started successfully!');
  } catch (error) {
    logger.error('❌ Failed to start application:');
    logger.error(error.message);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
