import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { ShoppingList, ShoppingListDocument } from "./schemas/shopping.list.schema"
import { PostShoppingListBodyDto } from "./dto/shopping-list/postShoppingList.dto"
import { PostItemBodyDto } from "./dto/item/postItem.dto"
import { PostMemberBodyDto } from "./dto/member/postMember.dto"
import { PatchItemBodyDto } from "./dto/item/patchItem.dto"
import { PatchShoppingListBodyDto } from "./dto/shopping-list/patchShoppingList.dto"
import { UsersService } from "../users/users.service"

@Injectable()
export class ShoppingListsService {
  constructor(@InjectModel(ShoppingList.name) private readonly shoppingListModel: Model<ShoppingListDocument>, private readonly usersService: UsersService) {}

  async getShoppingLists(userId: string) {
    return await this.shoppingListModel.find({ members: userId }).exec()
  }

  async getShoppingList(shoppingListId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isMemberOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not a member of this list")
    }
    return shoppingList
  }
  
  async createShoppingList(dto: PostShoppingListBodyDto, userId: string) {
    return await this.shoppingListModel.create({
      ...dto,
      ownerId: userId,
      members: [userId],
    })
  }

  async patchShoppingList(shoppingListId: string, dto: PatchShoppingListBodyDto, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isOwnerOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not the owner of this list")
    }
    if (dto.name !== undefined) {
      shoppingList.name = dto.name
    }
    if (dto.isArchived !== undefined) {
      shoppingList.isArchived = dto.isArchived
    }
    return await shoppingList.save()
  }

  async deleteShoppingList(shoppingListId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isOwnerOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not the owner of this list")
    }
    await this.shoppingListModel.deleteOne({ _id: shoppingListId })
  }

  async leaveShoppingList(shoppingListId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isMemberOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not a member of this list")
    }
    shoppingList.members = shoppingList.members.filter(function(id) {
      return id !== userId
    })
    await shoppingList.save()
    return
  }

  async addItem(shoppingListId: string, dto: PostItemBodyDto, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isMemberOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not a member of this list")
    }
    shoppingList.items.push(dto)
    await shoppingList.save()
    const addedItem = shoppingList.items[shoppingList.items.length - 1]
    return addedItem
  }

  async patchItem(shoppingListId: string, dto: PatchItemBodyDto, itemId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isMemberOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not a member of this list")
    }
    const item = shoppingList.items.find(function(i) {
      return i._id.toString() === itemId
    })
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`)
    }
    if (dto.name !== undefined) {
      item.name = dto.name
    }
    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity
    }
    if (dto.isResolved !== undefined) {
      item.isResolved = dto.isResolved
    }
    await shoppingList.save()
    return item
  }

  async deleteItem(shoppingListId: string, itemId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isMemberOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not a member of this list")
    }
    const itemIndex = shoppingList.items.findIndex(function(item) {
      return item._id.toString() === itemId
    })
    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${itemId} not found`)
    }
    shoppingList.items.splice(itemIndex, 1)
    await shoppingList.save()
    return
  }

  async addMember(shoppingListId: string, dto: PostMemberBodyDto, userId: string) {
    await this.usersService.getUser(dto.userId)
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isOwnerOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not the owner of this list")
    }
    if (this.isMemberOfShoppingList(shoppingList, dto.userId)) {
      throw new BadRequestException(`User ${dto.userId} is already a member of this list`)
    }
    shoppingList.members.push(dto.userId)
    return await shoppingList.save()
  }

  async removeMember(shoppingListId: string, memberId: string, userId: string) {
    const shoppingList = await this.shoppingListModel.findById(shoppingListId).exec()
    if (!shoppingList) {
      throw new NotFoundException(`Shopping list with ID ${shoppingListId} not found`)
    }
    if (!this.isOwnerOfShoppingList(shoppingList, userId)) {
      throw new UnauthorizedException("You are not the owner of this list")
    }
    if (!this.isMemberOfShoppingList(shoppingList, memberId)) {
      throw new BadRequestException(`User ${memberId} is not a member of this list`)
    }
    shoppingList.members = shoppingList.members.filter(function(id) {
      return id !== memberId
    })
    return await shoppingList.save()
  }

  isMemberOfShoppingList(shoppingList: ShoppingListDocument, memberId: string) {
    return shoppingList.members.includes(memberId)
  }  

  isOwnerOfShoppingList(shoppingList: ShoppingListDocument, userId: string) {
    return shoppingList.ownerId.toString() === userId
  }  
}