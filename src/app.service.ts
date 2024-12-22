import { Injectable, OnModuleInit } from "@nestjs/common"
import * as bcrypt from "bcrypt"
import { UsersService } from "./users/users.service"
import { SignupDto } from "./auth/dto/signup.dto"

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || "admin"
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "123456"

    const superAdmin = await this.usersService.findOne(superAdminUsername)
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10)
      const signupDto: SignupDto = {
        username: superAdminUsername,
        password: hashedPassword,
      }
      const user = await this.usersService.create({
        ...signupDto
      })
      await this.usersService.addRole(user._id.toString(), "admin")
    }
  }
}