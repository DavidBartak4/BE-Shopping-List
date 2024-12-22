import { IsString, IsMongoId } from "class-validator"

export class DeleteMemberParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
  
  @IsMongoId()
  @IsString()
  memberId: string
}