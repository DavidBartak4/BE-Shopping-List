import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"
import { Item, ItemSchema } from "./shopping.list.item.schema"

export type ShoppingListDocument = ShoppingList & Document

@Schema()
export class ShoppingList {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  ownerId: string

  @Prop({ default: false })
  isArchived: boolean

  @Prop({ type: [ItemSchema], default: [] })
  items: Types.DocumentArray<Item>

  @Prop({ type: [String], default: [] })
  members: string[]
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList)