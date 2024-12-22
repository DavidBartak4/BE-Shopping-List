import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "../auth.controller"
import { AuthService } from "../auth.service"
import { SignupDto } from "../dto/signup.dto"
import { LoginDto } from "../dto/login.dto"
import { ConflictException, UnauthorizedException } from "@nestjs/common"

describe("AuthController", function () {
  let controller: AuthController
  let service: AuthService

  // mock
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  }

  // setup and init
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
  })

  // signup
  describe("signup", function () {
    const signupDto: SignupDto = { username: "testuser", password: "password123" }
    it("should register a new user successfully", async function () {
      const token = { access_token: "mockToken" }
      mockAuthService.signup.mockResolvedValue(token)
      const result = await controller.signup(signupDto)
      expect(result).toEqual(token)
      expect(service.signup).toHaveBeenCalledWith(signupDto)
    })
    it("should throw ConflictException if username is taken", async function () {
      mockAuthService.signup.mockRejectedValue(new ConflictException("Username is already taken"))
      await expect(controller.signup(signupDto)).rejects.toThrow(ConflictException)
    })
  })

  // login
  describe("login", function () {
    const loginDto: LoginDto = { username: "testuser", password: "password123" }
    it("should log in a user successfully", async function () {
      const token = { access_token: "mockToken" }
      mockAuthService.login.mockResolvedValue(token)
      const result = await controller.login(loginDto)
      expect(result).toEqual(token)
      expect(service.login).toHaveBeenCalledWith(loginDto)
    })
    it("should throw UnauthorizedException if credentials are invalid", async function () {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException("Invalid credentials"))
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })
  })
})