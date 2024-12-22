import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UsersService } from "../users/users.service"
import { SignupDto } from "./dto/signup.dto"
import { LoginDto } from "./dto/login.dto"
import * as bcrypt from "bcryptjs"

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async signup(dto: SignupDto) {
    const { username, password } = dto
    const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await this.usersService.findOne(username)
    if (existingUser) {
      throw new ConflictException("Username is already taken")
    }
    const user = await this.usersService.create({ username, password: hashedPassword })
    return this.generateToken(user)
  }

  async login(dto: LoginDto) {
    const { username, password } = dto
    const user = await this.usersService.findOne(username)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Invalid credentials")
    }
    return this.generateToken(user)
  }

  generateToken(user: any) {
    const payload = { sub: user._id, username: user.username, roles: user.roles }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}