import { Injectable, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { TokenExpiredError } from "jsonwebtoken"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException("JWT expired")
    } else if (err || !user) {
      throw new UnauthorizedException("Unauthorized")
    }
    return user
  }
}