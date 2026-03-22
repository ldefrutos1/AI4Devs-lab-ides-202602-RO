import type { User } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
        });
    }
}
