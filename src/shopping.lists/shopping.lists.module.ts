import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ShoppingListsController } from "./shopping.lists.controller"
import { ShoppingListsService } from "./shopping.lists.service"
import { ShoppingList, ShoppingListSchema } from "./schemas/shopping.list.schema"
import { UsersModule } from "src/users/users.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
    ]),
    UsersModule
  ],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}