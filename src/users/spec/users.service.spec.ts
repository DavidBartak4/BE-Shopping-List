import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "../users.service"
import { getModelToken } from "@nestjs/mongoose"
import { NotFoundException } from "@nestjs/common"

describe("UsersService", function () {
  let service: UsersService
  let userModel

  // mock
  const mockUser = {
    _id: "1",
    username: "testuser",
    roles: ["user"],
    save: jest.fn(),
  }
  const userModelMock = {
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockImplementation(function ({ username }) {
      return username === "testuser"
        ? { exec: function () { return Promise.resolve(mockUser) } }
        : { exec: function () { return Promise.resolve(null) } }
    }),
    findById: jest.fn().mockImplementation(function (id) {
      return {
        select: function () { return this },
        exec: function () { return Promise.resolve(id === "1" ? mockUser : null) },
      }
    }),
    findByIdAndDelete: jest.fn().mockImplementation(function () {
      return {
        exec: function () { return Promise.resolve(true) },
      }
    }),
  }

  // setup and init
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken("User"),
          useValue: userModelMock,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    userModel = module.get(getModelToken("User"))
  })

  // createUser
  describe("create", function () {
    it("should create a new user", async function () {
      const dto = { username: "testuser", password: "password123" }
      const result = await service.create(dto)
      expect(result).toEqual(mockUser)
      expect(userModel.create).toHaveBeenCalledWith(dto)
    })
  })

  // findOneUser
  describe("findOne", function () {
    it("should return a user by username", async function () {
      const result = await service.findOne("testuser")
      expect(result).toEqual(mockUser)
      expect(userModel.findOne).toHaveBeenCalledWith({ username: "testuser" })
    })
    it("should return null if user is not found", async function () {
      const result = await service.findOne("unknown")
      expect(result).toBeNull()
    })
  })

  // deleteUser
  describe("deleteUser", function () {
    it("should delete a user by ID", async function () {
      await expect(service.deleteUser("1")).resolves.toBeUndefined()
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith("1")
    })
  })

  // addRole
  describe("addRole", function () {
    it("should add a role to the user", async function () {
      mockUser.roles = ["user"]
      await service.addRole("1", "admin")
      expect(mockUser.roles).toContain("admin")
      expect(mockUser.save).toHaveBeenCalled()
    })
    it("should throw NotFoundException if user does not exist", async function () {
      await expect(service.addRole("999", "admin")).rejects.toThrow(
        NotFoundException
      )
    })
  })

  // removeRole
  describe("removeRole", function () {
    it("should remove a role from the user", async function () {
      mockUser.roles = ["user", "admin"]
      await service.removeRole("1", "admin")
      expect(mockUser.roles).not.toContain("admin")
      expect(mockUser.save).toHaveBeenCalled()
    })
    it("should throw NotFoundException if user does not exist", async function () {
      await expect(service.removeRole("999", "admin")).rejects.toThrow(
        NotFoundException
      )
    })
  })

  // findRoles
  describe("findRoles", function () {
    it("should return the roles of a user", async function () {
      const result = await service.findRoles("1")
      expect(result).toEqual(mockUser.roles)
    })
    it("should return an empty array if user does not exist", async function () {
      const result = await service.findRoles("999")
      expect(result).toEqual([])
    })
  })

  // getUser
  describe("getUser", function () {
    it("should return a user by ID", async function () {
      const result = await service.getUser("1")
      expect(result).toEqual(mockUser)
    })
    it("should throw NotFoundException if user is not found", async function () {
      await expect(service.getUser("999")).rejects.toThrow(NotFoundException)
    })
  })
})