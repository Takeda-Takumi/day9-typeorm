import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateUserDTO, LoginUserDTO } from './users.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    const result = await this.UsersService.findUserByScreenName(
      createUserDTO.screenName,
    );
    if (result) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: `Screen name '${createUserDTO.screenName}' is already taken.`,
        },
        409,
      );
    }
    try {
      await this.UsersService.register(createUserDTO);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error',
        },
        500,
      );
    }
    return;
  }

  @Post('login')
  async login(@Body() LoginUserDTO: LoginUserDTO): Promise<User> {
    let user: User;
    try {
      user = await this.UsersService.loginUser(
        LoginUserDTO.screenName,
        LoginUserDTO.password,
      );
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error.',
        },
        500,
      );
    }
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User Not found.',
        },
        404,
      );
    }
    return user;
  }
}
