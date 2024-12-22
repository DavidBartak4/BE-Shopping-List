import { IsString, IsMongoId } from "class-validator"

export class DeleteShoppingListParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
}