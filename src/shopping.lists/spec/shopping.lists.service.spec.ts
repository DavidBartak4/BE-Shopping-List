import { Test, TestingModule } from "@nestjs/testing"
import { ShoppingListsService } from "../shopping.lists.service"
import { getModelToken } from "@nestjs/mongoose"
import { UsersService } from "../../users/users.service"
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { Model } from "mongoose"
import { ShoppingList, ShoppingListDocument } from "../schemas/shopping.list.schema"
import { Types } from "mongoose"

describe("ShoppingListsService", function () {
  let service: ShoppingListsService
  let model: Model<ShoppingListDocument>

  // mock
  const mockItemId = new Types.ObjectId().toString()
  const mockShoppingListId = new Types.ObjectId().toString()
  const mockUserId = new Types.ObjectId().toString()
  const mockShoppingList = {
    _id: "list1",
    name: "Grocery List",
    ownerId: mockUserId,
    members: [mockUserId],
    items: [],
  }
  const shoppingListModelMock = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn(),
  }
  const usersServiceMock = {
    getUser: jest.fn()
  }

  // setup and init
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingListsService,
        {
          provide: getModelToken(ShoppingList.name),
          useValue: shoppingListModelMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile()
    service = module.get<ShoppingListsService>(ShoppingListsService)
    model = module.get<Model<ShoppingListDocument>>(
      getModelToken(ShoppingList.name),
    )
  })

  // getShoppingLists
  describe("getShoppingLists", function () {
    it("should return a list of shopping lists for a valid user", async function () {
      shoppingListModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockShoppingList]),
      })
      const result = await service.getShoppingLists(mockUserId)
      expect(result).toEqual([mockShoppingList])
      expect(model.find).toHaveBeenCalledWith({ members: mockUserId })
    })
    it("should return an empty array if no shopping lists are found", async function () {
      shoppingListModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      })
      const result = await service.getShoppingLists(mockUserId)
      expect(result).toEqual([])
      expect(model.find).toHaveBeenCalledWith({ members: mockUserId })
    })
  })

  // createShoppingList
  describe("createShoppingList", function () {
    const mockDto = {
      name: "New Shopping List",
    }
    const mockSavedShoppingList = {
      ...mockDto,
      _id: "new_list_id",
      ownerId: mockUserId,
      members: [mockUserId],
    }
    it("should create and return a new shopping list", async function () {
      shoppingListModelMock.create.mockResolvedValue(mockSavedShoppingList)
      const result = await service.createShoppingList(mockDto, mockUserId)
      expect(result).toEqual(mockSavedShoppingList)
      expect(shoppingListModelMock.create).toHaveBeenCalledWith({
        ...mockDto,
        ownerId: mockUserId,
        members: [mockUserId],
      })
    })
    it("should throw an error if saving the shopping list fails", async function () {
      shoppingListModelMock.create.mockRejectedValue(new Error("Save failed"))
      await expect(
        service.createShoppingList(mockDto, mockUserId),
      ).rejects.toThrow("Save failed")
      expect(shoppingListModelMock.create).toHaveBeenCalledWith({
        ...mockDto,
        ownerId: mockUserId,
        members: [mockUserId],
      })
    })
  })

  // patchShoppingList
  describe("patchShoppingList", function () {
    const mockDto = {
      name: "Updated Shopping List",
      isArchived: true,
    }

    const mockShoppingList: ShoppingListDocument = {
      _id: mockShoppingListId,
      ownerId: mockUserId,
      name: "Test Shopping List",
      isArchived: false,
      members: [new Types.ObjectId(mockUserId)],
      items: [],
      save: jest.fn().mockResolvedValue({
        ...mockDto,
        _id: mockShoppingListId,
        ownerId: mockUserId,
      }),
    } as unknown as ShoppingListDocument

    it("should update and return the shopping list when the user is the owner", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      const result = await service.patchShoppingList(
        mockShoppingListId,
        mockDto,
        mockUserId,
      )
      expect(result).toEqual({
        ...mockDto,
        _id: mockShoppingListId,
        ownerId: mockUserId,
      })
      expect(mockShoppingList.save).toHaveBeenCalled()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(
        service.patchShoppingList(mockShoppingListId, mockDto, mockUserId),
      ).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw UnauthorizedException if the user is not the owner of the list", async function () {
      const mockShoppingListNotOwned = {
        ...mockShoppingList,
        ownerId: "anotherUser",
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListNotOwned),
      })
      await expect(
        service.deleteShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should update only the provided fields", async function () {
      const partialDto = { name: "Partially Updated Shopping List" }
      const updatedShoppingList = {
        ...mockShoppingList,
        name: partialDto.name,
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      mockShoppingList.save = jest.fn().mockResolvedValue(updatedShoppingList)
      const result = await service.patchShoppingList(
        mockShoppingListId,
        partialDto,
        mockUserId,
      )
      expect(result).toEqual(updatedShoppingList)
      expect(mockShoppingList.name).toBe(partialDto.name)
      expect(mockShoppingList.save).toHaveBeenCalled()
    })
  })

  // deleteShoppingList
  describe("deleteShoppingList", function () {
    it("should delete the shopping list when the user is the owner", async function () {
      const mockShoppingList: ShoppingListDocument = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        name: "Test Shopping List",
        isArchived: false,
        members: [mockUserId],
        items: [],
      } as unknown as ShoppingListDocument
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      shoppingListModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 })
      await expect(
        service.deleteShoppingList(mockShoppingListId, mockUserId),
      ).resolves.toBeUndefined()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
      expect(shoppingListModelMock.deleteOne).toHaveBeenCalledWith({
        _id: mockShoppingListId,
      })
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(
        service.deleteShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw UnauthorizedException if the user is not the owner", async function () {
      const mockShoppingListNotOwned = {
        _id: mockShoppingListId,
        ownerId: new Types.ObjectId().toString(),
        name: "Test Shopping List",
        members: [mockUserId],
        items: [],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListNotOwned),
      })
      await expect(
        service.deleteShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw NotFoundException if delete operation fails", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        name: "Test Shopping List",
        members: [mockUserId],
        items: [],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      shoppingListModelMock.deleteOne.mockRejectedValue(
        new NotFoundException(
          `Failed to delete shopping list with ID ${mockShoppingListId}`,
        ),
      )
      await expect(
        service.deleteShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
      expect(shoppingListModelMock.deleteOne).toHaveBeenCalledWith({
        _id: mockShoppingListId,
      })
    })
  })

  // leaveShoppingList()
  describe("leaveShoppingList", function () {
    it("should allow a member to leave the shopping list", async function () {
      const mockShoppingListWithMember = {
        _id: mockShoppingListId,
        name: "Test Shopping List",
        ownerId: mockUserId,
        members: [mockUserId],
        save: jest.fn().mockResolvedValue({}),
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListWithMember),
      })
      await expect(
        service.leaveShoppingList(mockShoppingListId, mockUserId),
      ).resolves.toBeUndefined()
      expect(mockShoppingListWithMember.members).not.toContain(mockUserId)
      expect(mockShoppingListWithMember.save).toHaveBeenCalled()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(
        service.leaveShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(NotFoundException)

      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw UnauthorizedException if the user is not a member of the list", async function () {
      const mockShoppingListWithoutMember = {
        _id: mockShoppingListId,
        name: "Test Shopping List",
        ownerId: new Types.ObjectId().toString(),
        members: [new Types.ObjectId().toString()],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListWithoutMember),
      })
      await expect(
        service.leaveShoppingList(mockShoppingListId, mockUserId),
      ).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
  })

  // addItem()
  describe("addItem", function () {
    const mockItemDto = {
      _id: new Types.ObjectId(),
      name: "Milk",
      quantity: 2,
      isResolved: false,
    }
    const mockShoppingListWithItems = {
      _id: mockShoppingListId,
      name: "Test Shopping List",
      ownerId: mockUserId,
      members: [mockUserId],
      items: [],
      save: jest.fn().mockResolvedValue({}),
    } as unknown as ShoppingListDocument
    it("should add an item to the shopping list and return the added item", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListWithItems),
      })
      const result = await service.addItem(
        mockShoppingListId,
        mockItemDto,
        mockUserId,
      )
      expect(result).toEqual(mockItemDto)
      expect(mockShoppingListWithItems.items).toContainEqual(mockItemDto)
      expect(mockShoppingListWithItems.save).toHaveBeenCalled()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(
        service.addItem(mockShoppingListId, mockItemDto, mockUserId),
      ).rejects.toThrow(NotFoundException)

      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
    it("should throw UnauthorizedException if the user is not a member of the shopping list", async function () {
      const mockShoppingListWithoutMember = {
        ...mockShoppingListWithItems,
        members: [new Types.ObjectId().toString()],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingListWithoutMember),
      })
      await expect(
        service.addItem(mockShoppingListId, mockItemDto, mockUserId),
      ).rejects.toThrow(UnauthorizedException)

      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(
        mockShoppingListId,
      )
    })
  })

  // patchItem()
  describe("patchItem", function () {
    it("should update and return the item when the user is a member and the item exists", async function () {
      const mockDto = { name: "Updated Milk", quantity: 2, isResolved: true }
      const mockItem = { _id: new Types.ObjectId(), name: "Milk", quantity: 1, isResolved: false }
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [mockUserId],
        items: [mockItem],
        save: jest.fn().mockResolvedValue(this),
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      const result = await service.patchItem(mockShoppingListId, mockDto, mockItem._id.toString(), mockUserId)
      expect(result).toEqual({ ...mockItem, ...mockDto })
      expect(mockShoppingList.save).toHaveBeenCalled()
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(
        service.patchItem(mockShoppingListId, {}, mockItemId, mockUserId),
      ).rejects.toThrow(NotFoundException)
    })
    it("should throw NotFoundException if the item does not exist in the shopping list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [mockUserId],
        items: [],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(
        service.patchItem(mockShoppingListId, {}, mockItemId, mockUserId),
      ).rejects.toThrow(NotFoundException)
    })
    it("should throw UnauthorizedException if the user is not a member of the shopping list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [new Types.ObjectId().toString()],
        items: [{ _id: mockItemId }],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(
        service.patchItem(mockShoppingListId, {}, mockItemId, mockUserId),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  // deleteItem()
  describe("deleteItem", function () {
    it("should delete the item when the user is a member and the item exists", async function () {
      const mockItem = { _id: new Types.ObjectId(mockItemId), name: "Milk" }
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [mockUserId],
        items: [mockItem],
        save: jest.fn().mockResolvedValue(undefined),
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.deleteItem(mockShoppingListId, mockItemId, mockUserId)).resolves.toBeUndefined()
      expect(mockShoppingList.items).toHaveLength(0)
      expect(mockShoppingList.save).toHaveBeenCalled()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.deleteItem(mockShoppingListId, mockItemId, mockUserId)).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw NotFoundException if the item does not exist in the shopping list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [mockUserId],
        items: [],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.deleteItem(mockShoppingListId, mockItemId, mockUserId)).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw UnauthorizedException if the user is not a member of the shopping list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        members: [new Types.ObjectId().toString()],
        items: [{ _id: mockItemId }],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.deleteItem(mockShoppingListId, mockItemId, mockUserId)).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
  })

  // addMember()
  describe("addMember", function () {
    const mockNewMemberId = new Types.ObjectId().toString()
    const mockDto = { userId: mockNewMemberId }
    it("should add a new member when the user is the owner", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        members: [mockUserId],
        save: jest.fn().mockResolvedValue({
          _id: mockShoppingListId,
          ownerId: mockUserId,
          members: [mockUserId, mockNewMemberId],
        }),
      }
      usersServiceMock.getUser = jest.fn().mockResolvedValue({ _id: mockNewMemberId })
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      const result = await service.addMember(mockShoppingListId, mockDto, mockUserId)
      expect(result.members).toContain(mockNewMemberId)
      expect(mockShoppingList.save).toHaveBeenCalled()
      expect(usersServiceMock.getUser).toHaveBeenCalledWith(mockNewMemberId)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      usersServiceMock.getUser = jest.fn().mockResolvedValue({ _id: mockNewMemberId })
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.addMember(mockShoppingListId, mockDto, mockUserId)).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw BadRequestException if the user is already a member of the list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        members: [mockUserId, mockNewMemberId],
        save: jest.fn(),
      }
      usersServiceMock.getUser = jest.fn().mockResolvedValue({ _id: mockNewMemberId })
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.addMember(mockShoppingListId, mockDto, mockUserId)).rejects.toThrow(
        new BadRequestException(`User ${mockNewMemberId} is already a member of this list`),
      )
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw UnauthorizedException if the user is not the owner of the shopping list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: new Types.ObjectId().toString(),
        members: [mockUserId],
        save: jest.fn(),
      }
      usersServiceMock.getUser = jest.fn().mockResolvedValue({ _id: mockNewMemberId })
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.addMember(mockShoppingListId, mockDto, mockUserId)).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
  })

  // removeMember()
  describe("removeMember", function () {
    const mockMemberId = new Types.ObjectId().toString()
    const mockDto = { userId: mockMemberId }
    it("should remove a member when the user is the owner", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        members: [mockUserId, mockMemberId],
        save: jest.fn().mockResolvedValue({
          _id: mockShoppingListId,
          ownerId: mockUserId,
          members: [mockUserId],
        }),
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      const result = await service.removeMember(mockShoppingListId, mockMemberId, mockUserId)
      expect(result.members).not.toContain(mockMemberId)
      expect(mockShoppingList.save).toHaveBeenCalled()
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw NotFoundException if the shopping list does not exist", async function () {
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })
      await expect(service.removeMember(mockShoppingListId, mockMemberId, mockUserId)).rejects.toThrow(NotFoundException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw UnauthorizedException if the user is not the owner of the list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: new Types.ObjectId().toString(),
        members: [mockUserId, mockMemberId],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.removeMember(mockShoppingListId, mockMemberId, mockUserId)).rejects.toThrow(UnauthorizedException)
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
    it("should throw BadRequestException if the member is not part of the list", async function () {
      const mockShoppingList = {
        _id: mockShoppingListId,
        ownerId: mockUserId,
        members: [mockUserId],
      }
      shoppingListModelMock.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockShoppingList),
      })
      await expect(service.removeMember(mockShoppingListId, mockMemberId, mockUserId)).rejects.toThrow(
        new BadRequestException(`User ${mockMemberId} is not a member of this list`)
      )
      expect(shoppingListModelMock.findById).toHaveBeenCalledWith(mockShoppingListId)
    })
  })
})