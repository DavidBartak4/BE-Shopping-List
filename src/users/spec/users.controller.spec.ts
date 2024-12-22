import { Test, TestingModule } from "@nestjs/testing"
import { UsersController } from "../users.controller"
import { UsersService } from "../users.service"
import { NotFoundException } from "@nestjs/common"

describe("UsersController", function () {
  let controller: UsersController
  let service: UsersService

  // mock
  const mockUser = { _id: "1", username: "testuser" }
  const mockRequest = { user: { id: "1" } }
  const mockUsersService = {
    getUser: jest.fn().mockImplementation(async function (id) {
      if (id === "1") return mockUser
      throw new NotFoundException(`User with ID ${id} not found`)
    }),
  }

  // setup and init
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile()
    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)
  })

  // getProfile
  describe("getProfile", function () {
    it("should return the profile of the logged-in user", async function () {
      const result = await controller.getProfile(mockRequest)
      expect(result).toEqual(mockUser)
      expect(service.getUser).toHaveBeenCalledWith("1")
    })
    it("should throw NotFoundException if user does not exist", async function () {
      await expect(
        controller.getProfile({ user: { id: "999" } })
      ).rejects.toThrow(new NotFoundException("User with ID 999 not found"))
    })
  })

  // getUser
  describe("getUser", function () {
    it("should return the user by ID", async function () {
      const result = await controller.getUser({ userId: "1" })
      expect(result).toEqual(mockUser)
      expect(service.getUser).toHaveBeenCalledWith("1")
    })
    it("should throw NotFoundException if user is not found", async function () {
      await expect(controller.getUser({ userId: "999" })).rejects.toThrow(
        NotFoundException
      )
    })
  })
})