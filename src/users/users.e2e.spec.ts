import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

describe('', () => {
  let app: INestApplication;
  let usersService: UsersService;
  const usersControllerMock = {
    createUser: jest.fn(),
  };
  const userRepositoryMock = {
    findOne: jest.fn(),
    insert: jest.fn(),
  };

  const users: User[] = [
    {
      id: 1,
      screenName: 'test',
      // string "password" is encrypted;
      password:
        '491ad3c0b11425701aa3ecc62406c9108ea67b1655b56b9110e1a58cd7a35456',
    },
  ];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
      controllers: [UsersController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  it('POST /users/register', async () => {
    userRepositoryMock.findOne.mockImplementation(
      ({ where: { screenName } }) => {
        return users.find((user) => user.screenName == screenName);
      },
    );

    await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({ screenName: 'new', password: 'password' })
      .expect(HttpStatus.CREATED);
  });

  it('POST /users/register', async () => {
    userRepositoryMock.findOne.mockImplementation(
      ({ where: { screenName } }) => {
        return users.find((user) => user.screenName == screenName);
      },
    );
    await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({ screenName: 'test', password: 'password' })
      .expect(HttpStatus.CONFLICT);
  });

  it('POST /users/login', async () => {
    userRepositoryMock.findOne.mockImplementation(
      ({ where: { screenName, password } }) => {
        return users.find((user) => {
          return user.screenName === screenName && user.password === password;
        });
      },
    );
    const loginUser = {
      screenName: 'test',
      password: 'password',
    };
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send(loginUser);

    const sameNameUserInDatabase = users.find(
      (user) => user.screenName == loginUser.screenName,
    );

    expect(response.body).toStrictEqual(sameNameUserInDatabase);
  });
});
