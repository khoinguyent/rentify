import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService, private readonly cache: CacheService) {}

  async findById(id: string) {
    // Cache user profile
    const key = this.cache.userKey(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const user = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        landlordProfile: true,
        tenantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cache.set(key, user, 300);
    return user;
  }

  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }
}

