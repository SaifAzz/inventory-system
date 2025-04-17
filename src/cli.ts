import { NestFactory } from '@nestjs/core';
import { CommandService } from 'nestjs-command';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    // Get the CommandService and run the command using process.argv
    const commandService = app.get(CommandService);
    await commandService.exec();
  } catch (error) {
    console.error('Error executing command:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
