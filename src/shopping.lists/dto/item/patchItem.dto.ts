import { IsOptional, IsString, IsBoolean, IsInt, Min, IsMongoId, IsNotEmpty } from "class-validator"

export class PatchItemBodyDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number

  @IsOptional()
  @IsBoolean()
  isResolved?: boolean
}

export class PatchItemParamsDto {
  @IsMongoId()
  @IsString()
  shoppingListId: string
  
  @IsMongoId()
  @IsString()
  itemId: string
}