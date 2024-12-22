import { IsString, IsMongoId } from "class-validator"

export class GetShoppingListParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
}