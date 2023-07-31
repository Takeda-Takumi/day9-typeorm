import { Module } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

type Where = {
  where: { screenName: string };
};

const users = [
  {
    id: 1,
    screenName: 'potato4d',
    password:
      '6c614c4e12595a345079b78df3f5e702c6e7ecacae2e4a0430880666ccc55bb3', // "test"
  },
];

const UserDatabaseMock = {
  provide: getRepositoryToken(User),
  useValue: {
    findOne: ({ where: { screenName } }: Where) =>
      users.find((user) => user.screenName === screenName),
    insert: (entity) => users.push(entity),
  },
};

@Module({
  providers: [UserDatabaseMock],
})
export class UserDatabaseMockModule {}
