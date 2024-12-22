import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ type: [String], enum: ["user", "admin"], default: ["user"] })
  roles: string[]
}

export const UserSchema = SchemaFactory.createForClass(User)