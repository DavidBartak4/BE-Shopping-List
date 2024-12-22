import { NotFoundException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UserDocument } from "./schemas/user.schema"
import { PostUserDto } from "./dto/postUser.dto"

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: PostUserDto) {
    return await this.userModel.create(dto)
  }

  async findOne(username: string) {
    return await this.userModel.findOne({ username }).exec()
  }
 
  async deleteUser(userId: string) {
    await this.userModel.findByIdAndDelete(userId).exec()
    return
  }

  async addRole(userId: string, role: string) {
    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }
    if (!user.roles.includes(role)) {
      user.roles.push(role)
      await user.save()
    }
    return user
  }

  async removeRole(userId: string, role: string) {
    const user = await this.userModel.findById(userId).exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }
    const roleIndex = user.roles.indexOf(role)
    if (roleIndex !== -1) {
      user.roles.splice(roleIndex, 1)
      await user.save()
    }
    return user
  }

  async findRoles(userId: string) {
    const user = await this.userModel.findById(userId).exec()
    return user ? user.roles : []
  }

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId).select("_id username").exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }
    return user
  }

  async getUsers() {
    return await this.userModel.find().select("_id username roles").exec();
  }
}