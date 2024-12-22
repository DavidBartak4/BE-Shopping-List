import { IsString, IsMongoId } from "class-validator"

export class PostMemberBodyDto {
  @IsMongoId()
  @IsString()
  userId: string
}

export class PostMemberParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
}