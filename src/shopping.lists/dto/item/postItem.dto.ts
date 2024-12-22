import { IsString, IsInt, Min, IsMongoId, IsNotEmpty } from "class-validator"

export class PostItemBodyDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsInt()
  @Min(1)
  quantity: number
}

export class PostItemParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
}