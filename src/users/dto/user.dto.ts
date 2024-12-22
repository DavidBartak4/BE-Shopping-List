import { IsString, IsMongoId } from "class-validator"

export class UserDto {
  @IsMongoId()
  @IsString()
  userId: string
}