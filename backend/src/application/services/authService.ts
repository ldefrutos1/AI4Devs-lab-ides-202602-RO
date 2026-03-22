import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface PublicUser {
    id: number;
    username: string;
}

export class AuthService {
    constructor(private readonly users: IUserRepository) {}

    async getPublicUserById(id: number): Promise<PublicUser | null> {
        const user = await this.users.findById(id);
        if (!user) {
            return null;
        }
        return { id: user.id, username: user.username };
    }

    async validateCredentials(username: string, password: string): Promise<PublicUser | null> {
        const user = await this.users.findByUsername(username);
        if (!user) {
            return null;
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return null;
        }
        return { id: user.id, username: user.username };
    }
}
