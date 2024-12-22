import { IsString, IsNotEmpty } from "class-validator"

export class PostShoppingListBodyDto {
  @IsNotEmpty()
  @IsString()
  name: string
}