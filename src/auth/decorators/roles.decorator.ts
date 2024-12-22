import { SetMetadata } from "@nestjs/common"

export const Roles = function(...roles: string[]) {
    return SetMetadata("roles", roles)
}