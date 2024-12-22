import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Patch, ValidationPipe } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt.guard"
import { ShoppingListsService } from "./shopping.lists.service"
import { PostShoppingListBodyDto } from "./dto/shopping-list/postShoppingList.dto"
import { PostItemBodyDto, PostItemParamsDto } from "./dto/item/postItem.dto"
import { PostMemberBodyDto, PostMemberParamsDto } from "./dto/member/postMember.dto"
import { PatchItemBodyDto, PatchItemParamsDto } from "./dto/item/patchItem.dto"
import { PatchShoppingListBodyDto, PatchShoppingListParamsDto } from "./dto/shopping-list/patchShoppingList.dto"
import { GetShoppingListParamsDto } from "./dto/shopping-list/getShoppingList.dto"
import { DeleteItemParamsDto } from "./dto/item/deleteItem.dto"
import { DeleteMemberParamsDto } from "./dto/member/deleteMember.dto"
import { DeleteShoppingListParamsDto } from "./dto/shopping-list/deleteShoppingList.dto"
  
@Controller("shopping-lists")
@UseGuards(JwtAuthGuard)
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get()
  getShoppingLists(@Req() req) {
    return this.shoppingListsService.getShoppingLists(req.user.id)
  }

  @Get(":shoppingListId")
  getShoppingList(@Req() req, @Param(new ValidationPipe()) params: GetShoppingListParamsDto) {
    return this.shoppingListsService.getShoppingList(params.shoppingListId, req.user.id)
  }

  @Post()
  createShoppingList(@Body() dto: PostShoppingListBodyDto, @Req() req) {
    return this.shoppingListsService.createShoppingList(dto, req.user.id)
  }

  @Patch(":shoppingListId")
  patchShoppingList(@Param(new ValidationPipe()) params: PatchShoppingListParamsDto, @Body() dto: PatchShoppingListBodyDto, @Req() req) {
    return this.shoppingListsService.patchShoppingList(params.shoppingListId, dto, req.user.id)
  }

  @Delete(":shoppingListId")
  deleteShoppingList(@Param(new ValidationPipe()) params: DeleteShoppingListParamsDto, @Req() req) {
    return this.shoppingListsService.deleteShoppingList(params.shoppingListId, req.user.id)
  }

  @Post(":shoppingListId")
  leaveShoppingList(@Param(new ValidationPipe()) params: GetShoppingListParamsDto, @Req() req) {
    return this.shoppingListsService.leaveShoppingList(params.shoppingListId, req.user.id)
  }

  @Post(":shoppingListId/items")
  addItem(@Param(new ValidationPipe()) params: PostItemParamsDto, @Body() dto: PostItemBodyDto, @Req() req) {
    return this.shoppingListsService.addItem(params.shoppingListId, dto, req.user.id)
  }

  @Patch(":shoppingListId/items/:itemId")
  patchIitem(@Param(new ValidationPipe()) params: PatchItemParamsDto, @Body() dto: PatchItemBodyDto, @Req() req) {
    return this.shoppingListsService.patchItem(params.shoppingListId, dto, params.itemId, req.user.id)
  }

  @Delete(":shoppingListId/items/:itemId")
  deleteItem(@Param(new ValidationPipe()) params: DeleteItemParamsDto, @Req() req) {
    return this.shoppingListsService.deleteItem(params.shoppingListId, params.itemId, req.user.id)
  }

  @Post(":shoppingListId/members") 
  addMember(@Param(new ValidationPipe()) params: PostMemberParamsDto, @Body() dto: PostMemberBodyDto, @Req() req) {
    return this.shoppingListsService.addMember(params.shoppingListId, dto, req.user.id)
  }

  @Delete(":shoppingListId/members/:memberId")
  removeMember(@Param(new ValidationPipe()) params: DeleteMemberParamsDto, @Req() req) {
    return this.shoppingListsService.removeMember(params.shoppingListId, params.memberId, req.user.id)
  }
}