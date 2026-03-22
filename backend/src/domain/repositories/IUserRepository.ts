import type { User } from '@prisma/client';

export interface IUserRepository {
    findById(id: number): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
}
