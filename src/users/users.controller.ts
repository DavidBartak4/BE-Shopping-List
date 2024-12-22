import { Controller, Get, Param, UseGuards, Req, ValidationPipe } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt.guard"
import { UsersService } from "./users.service"
import { UserDto } from "./dto/user.dto"

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("user/profile")
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.usersService.getUser(req.user.id)
  }

  @Get()
  async getUsers() {
    return await this.usersService.getUsers()
  }
  
  @Get(":userId")
  @UseGuards(JwtAuthGuard)
  getUser(@Param(new ValidationPipe()) params: UserDto) {
    return this.usersService.getUser(params.userId)
  }
}