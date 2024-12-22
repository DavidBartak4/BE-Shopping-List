import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { AppService } from "./app.service"
import { ShoppingListsModule } from "./shopping.lists/shopping.lists.module"

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost/database"),
    AuthModule,
    UsersModule,
    ShoppingListsModule
  ],
  providers: [AppService],
})
export class AppModule {}