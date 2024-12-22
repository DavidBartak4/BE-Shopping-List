import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}