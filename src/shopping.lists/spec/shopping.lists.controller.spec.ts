import { Test, TestingModule } from "@nestjs/testing"
import { ShoppingListsController } from "../shopping.lists.controller"
import { ShoppingListsService } from "../shopping.lists.service"
import { NotFoundException, UnauthorizedException } from "@nestjs/common"

describe("ShoppingListsController", function () {
  let controller: ShoppingListsController
  let service: ShoppingListsService

  // mock
  const mockUserId = "user1"
  const mockShoppingListId = "list1"
  const mockItemId = "item1"
  const mockMemberId = "member1"
  const mockShoppingList = {
    _id: mockShoppingListId,
    name: "Grocery List",
    ownerId: mockUserId,
    members: [mockUserId],
    items: [],
  }
  const mockItem = { _id: mockItemId, name: "Milk", quantity: 1 }
  const mockShoppingListsService = {
    getShoppingLists: jest.fn().mockResolvedValue([mockShoppingList]),
    getShoppingList: jest.fn().mockResolvedValue(mockShoppingList),
    createShoppingList: jest.fn().mockResolvedValue(mockShoppingList),
    patchShoppingList: jest.fn().mockResolvedValue(mockShoppingList),
    deleteShoppingList: jest.fn().mockResolvedValue(undefined),
    leaveShoppingList: jest.fn().mockResolvedValue(undefined),
    addItem: jest.fn().mockResolvedValue(mockItem),
    patchItem: jest.fn().mockResolvedValue(mockItem),
    deleteItem: jest.fn().mockResolvedValue(undefined),
    addMember: jest.fn().mockResolvedValue(mockShoppingList),
    removeMember: jest.fn().mockResolvedValue(mockShoppingList),
  }

  // setup and init
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingListsController],
      providers: [
        {
          provide: ShoppingListsService,
          useValue: mockShoppingListsService,
        },
      ],
    }).compile()
    controller = module.get<ShoppingListsController>(ShoppingListsController)
    service = module.get<ShoppingListsService>(ShoppingListsService)
  })

  // getShoppingLists
  describe("getShoppingLists", function () {
    it("should return a list of shopping lists", async function () {
      const req = { user: { id: mockUserId } }
      const result = await controller.getShoppingLists(req)
      expect(result).toEqual([mockShoppingList])
      expect(service.getShoppingLists).toHaveBeenCalledWith(mockUserId)
    })
  })

  // getShoppingList
  describe("getShoppingList", function () {
    it("should return a shopping list by ID", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const result = await controller.getShoppingList(req, params)
      expect(result).toEqual(mockShoppingList)
      expect(service.getShoppingList).toHaveBeenCalledWith(
        mockShoppingListId,
        mockUserId,
      )
    })
    it("should throw NotFoundException if shopping list is not found", async function () {
      (service.getShoppingList as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      )
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: "invalidId" }
      await expect(controller.getShoppingList(req, params)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // createShoppingList
  describe("createShoppingList", function () {
    it("should create a new shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const dto = { name: "New List" }
      const result = await controller.createShoppingList(dto, req)
      expect(result).toEqual(mockShoppingList)
      expect(service.createShoppingList).toHaveBeenCalledWith(dto, mockUserId)
    })
  })

  // patchShoppingList
  describe("patchShoppingList", function () {
    it("should update a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const dto = { name: "Updated List" }
      const result = await controller.patchShoppingList(params, dto, req)
      expect(result).toEqual(mockShoppingList)
      expect(service.patchShoppingList).toHaveBeenCalledWith(
        mockShoppingListId,
        dto,
        mockUserId,
      )
    })
    it("should throw UnauthorizedException if not the owner", async function () {
      (service.patchShoppingList as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      )
      const req = { user: { id: "otherUser" } }
      const params = { shoppingListId: mockShoppingListId }
      const dto = { name: "Updated List" }
      await expect(
        controller.patchShoppingList(params, dto, req),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  // deleteShoppingList
  describe("deleteShoppingList", function () {
    it("should delete a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const result = await controller.deleteShoppingList(params, req)
      expect(result).toBeUndefined()
      expect(service.deleteShoppingList).toHaveBeenCalledWith(
        mockShoppingListId,
        mockUserId,
      )
    })
    it("should throw NotFoundException if shopping list is not found", async function () {
      (service.deleteShoppingList as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      )
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: "invalidId" }
      await expect(controller.deleteShoppingList(params, req)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // leaveShoppingList
  describe("leaveShoppingList", function () {
    it("should allow a user to leave a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const result = await controller.leaveShoppingList(params, req)
      expect(result).toBeUndefined()
      expect(service.leaveShoppingList).toHaveBeenCalledWith(
        mockShoppingListId,
        mockUserId,
      )
    })
    it("should throw NotFoundException if shopping list is not found", async function () {
      (service.leaveShoppingList as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      )
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: "invalidId" }
      await expect(controller.leaveShoppingList(params, req)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // addItem
  describe("addItem", function () {
    it("should add an item to a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const dto = { name: "Milk", quantity: 1 }
      const result = await controller.addItem(params, dto, req)
      expect(result).toEqual(mockItem)
      expect(service.addItem).toHaveBeenCalledWith(
        mockShoppingListId,
        dto,
        mockUserId,
      )
    })
    it("should throw UnauthorizedException if user is not a member", async function () {
      (service.addItem as jest.Mock).mockRejectedValue(
        new UnauthorizedException(),
      )
      const req = { user: { id: "otherUser" } }
      const params = { shoppingListId: mockShoppingListId }
      const dto = { name: "Milk", quantity: 1 }
      await expect(controller.addItem(params, dto, req)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  // patchItem
  describe("patchItem", function () {
    it("should update an item in a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId, itemId: mockItemId }
      const dto = { name: "Eggs", quantity: 12 }
      const result = await controller.patchIitem(params, dto, req)
      expect(result).toEqual(mockItem)
      expect(service.patchItem).toHaveBeenCalledWith(
        mockShoppingListId,
        dto,
        mockItemId,
        mockUserId,
      )
    })
    it("should throw NotFoundException if item is not found", async function () {
      (service.patchItem as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      )
      const req = { user: { id: mockUserId } }
      const params = {
        shoppingListId: mockShoppingListId,
        itemId: "invalidItemId",
      }
      const dto = { name: "Eggs", quantity: 12 }
      await expect(controller.patchIitem(params, dto, req)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // deleteItem
  describe("deleteItem", function () {
    it("should delete an item from a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId, itemId: mockItemId }
      const result = await controller.deleteItem(params, req)
      expect(result).toBeUndefined()
      expect(service.deleteItem).toHaveBeenCalledWith(
        mockShoppingListId,
        mockItemId,
        mockUserId,
      )
    })
    it("should throw NotFoundException if item is not found", async function () {
      (service.deleteItem as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      )
      const req = { user: { id: mockUserId } }
      const params = {
        shoppingListId: mockShoppingListId,
        itemId: "invalidItemId",
      }
      await expect(controller.deleteItem(params, req)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  // addMember
  describe("addMember", function () {
    it("should add a member to a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = { shoppingListId: mockShoppingListId }
      const dto = { userId: mockMemberId }
      const result = await controller.addMember(params, dto, req)
      expect(result).toEqual(mockShoppingList)
      expect(service.addMember).toHaveBeenCalledWith(
        mockShoppingListId,
        dto,
        mockUserId,
      )
    })
  })

  // removeMember
  describe("removeMember", function () {
    it("should remove a member from a shopping list", async function () {
      const req = { user: { id: mockUserId } }
      const params = {
        shoppingListId: mockShoppingListId,
        memberId: mockMemberId,
      }
      const result = await controller.removeMember(params, req)
      expect(result).toEqual(mockShoppingList)
      expect(service.removeMember).toHaveBeenCalledWith(
        mockShoppingListId,
        mockMemberId,
        mockUserId,
      )
    })
  })
})