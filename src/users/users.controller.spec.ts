import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { CreateUserDTO } from './users.dto';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const userServiceMock = {
    findUserByScreenName: jest.fn(),
    loginUser: jest.fn(),
    register: jest.fn(),
  };

  const user: CreateUserDTO = {
    screenName: 'testuser',
    password: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('/ ', () => {
    describe('/register ', () => {
      it('should return HttpException.CONFLICT if user already exists', async () => {
        userServiceMock.findUserByScreenName.mockResolvedValue(true);

        let statusCode: number;
        try {
          await controller.createUser(user);
        } catch (e: unknown) {
          if (e instanceof HttpException) {
            statusCode = e.getStatus();
          }
        }

        expect(statusCode).toBe(HttpStatus.CONFLICT);
      });

      it('should return HttpException.INTERNAL_SERVER_ERROR, if user is found but register failed', async () => {
        userServiceMock.findUserByScreenName.mockResolvedValue(false);
        userServiceMock.register.mockImplementation(() => {
          throw Error();
          // return;
        });

        let statusCode: number;
        try {
          await controller.createUser(user);
        } catch (e: unknown) {
          if (e instanceof HttpException) {
            statusCode = e.getStatus();
          }
        }

        expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

        // await expect(result).rejects.toThrow(HttpException);
      });
    });

    describe('/login ', () => {
      it('should return INTERNAL_SERVER_ERROR, if throw Error when finding login user', async () => {
        userServiceMock.loginUser.mockImplementation(() => {
          throw Error();
        });

        let statusCode: number;
        try {
          await controller.login(user);
        } catch (e: unknown) {
          if (e instanceof HttpException) {
            statusCode = e.getStatus();
          }
        }

        expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it('should return NOT_FOUND, if login usr is not found', async () => {
        userServiceMock.loginUser.mockImplementation(() => false);

        let statusCode: number;
        try {
          await controller.login(user);
        } catch (e: unknown) {
          if (e instanceof HttpException) {
            statusCode = e.getStatus();
          }
        }

        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
      });
    });
  });
});
