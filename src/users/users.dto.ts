import { IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  screenName: string;
  @IsNotEmpty()
  password: string;
}

export class LoginUserDTO {
  @IsNotEmpty()
  screenName: string;
  @IsNotEmpty()
  password: string;
}
