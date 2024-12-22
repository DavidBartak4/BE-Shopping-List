import { IsOptional, IsString, IsBoolean, IsNotEmpty, IsMongoId } from "class-validator"

export class PatchShoppingListBodyDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean
}

export class PatchShoppingListParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
}