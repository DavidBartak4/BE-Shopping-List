import { IsString, IsMongoId } from "class-validator"

export class DeleteItemParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
  
  @IsMongoId()
  @IsString()
  itemId: string
}