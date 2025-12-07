import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super(); // ничего не передаем, всё берётся из schema.prisma + .env
  }
}
