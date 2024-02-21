import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export const configSwagger = new DocumentBuilder()
  .setTitle('🧑‍🏫 FILE MANAGER ✫ S E R V I C E 🚀')
  .setDescription('♗ FileManager Application')
  .setVersion('1.0')
  .addTag('Users')
  .build();
