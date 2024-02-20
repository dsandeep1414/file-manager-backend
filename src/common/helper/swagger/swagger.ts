import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export const configSwagger = new DocumentBuilder()
  .setTitle('🧑‍🏫 U S E R ✫ S E R V I C E 🚀')
  .setDescription('♗ ChronCept Application')
  .setVersion('1.0')
  .addTag('Users')
  .build();
