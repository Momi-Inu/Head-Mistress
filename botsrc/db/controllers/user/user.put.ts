import { GuildMember } from "discord.js";
import { Controller } from "../base";
import { model } from "mongoose";
import { IUserModel } from "../../formats/user.fomat";
import { UserGetController } from "./user.get";
import { UserPostController } from "./user.post";

export class UserPutController extends Controller {

    private static models = {
        User: model<IUserModel>('user')
    }

    public static async ensuredGet(user: GuildMember) {
        let mongoUser = await UserGetController.user(user);
        if (mongoUser) return mongoUser;
        return await UserPostController.user(user);
    }

    public static async collarUser(collarer: GuildMember, collaree: GuildMember) {
        const mongoCollarer = await this.ensuredGet(collarer);
        const monogCollaree = await this.ensuredGet(collaree);

        (mongoCollarer.collarees as string[]).push(monogCollaree._id);
        (monogCollaree.collarers as string[]).push(mongoCollarer._id);

        return {
            collarer: await mongoCollarer.save(),
            collaree: await monogCollaree.save()
        }
    }

    public static async decollarUser(collarer: GuildMember, collaree: GuildMember) {
        const mongoCollarer = await this.ensuredGet(collarer);
        const mongoCollaree = await this.ensuredGet(collaree);

        const collarees = mongoCollarer.collarees as string[];
        const collarers = mongoCollaree.collarers as string[];

        collarees.splice(collarees.indexOf(mongoCollaree._id), 1);
        collarers.splice(collarers.indexOf(mongoCollarer._id), 1);

        mongoCollarer.markModified('collarees');
        mongoCollaree.markModified('collerers');
        return {
            collarer: await mongoCollarer.save(),
            collaree: await mongoCollaree.save()
        }
    }

    public static async submitUser(dom: GuildMember, sub: GuildMember) {
        const mongoDom = await this.ensuredGet(dom);
        const mongoSub = await this.ensuredGet(sub);

        (mongoDom.usersSubs as string[]).push(mongoSub._id);
        (mongoSub.usersDoms as string[]).push(mongoDom._id);

        return {
            dom: await mongoDom.save(),
            sub: await mongoSub.save()
        }
    }
}