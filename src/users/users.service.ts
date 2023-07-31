import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as crypto from 'crypto';

const SALT = '12345';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private createPasswordDigest(password: string) {
    return crypto
      .createHash('sha256')
      .update(SALT + '/' + password)
      .digest('hex');
  }

  async findUserByScreenName(screenName: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { screenName } });
    return !!user;
  }

  async register(userData: Partial<User>): Promise<void> {
    const result = await this.findUserByScreenName(userData.screenName);
    if (result) {
      return Promise.reject(new Error('User is already taken.'));
    }
    await this.userRepository.insert({
      ...userData,
      password: this.createPasswordDigest(userData.password),
    });
  }

  async loginUser(screenName: string, password: string) {
    return await this.userRepository.findOne({
      where: {
        screenName,
        password: this.createPasswordDigest(password),
      },
    });
  }
}
