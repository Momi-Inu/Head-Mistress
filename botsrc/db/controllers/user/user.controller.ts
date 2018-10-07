import { UserGetController } from "./user.get";
import { UserPostController } from "./user.post";
import { UserPutController } from "./user.put";

export const UserController = {
    Get: UserGetController,
    Post: UserPostController,
    Put: UserPutController
}