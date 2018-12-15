import { model, mongo, Mongoose } from "mongoose";
import { IUserModel } from "../../formats/user.fomat";
import { GuildMember, Guild, User } from "discord.js";
import { Controller } from "../base";
import { UserPutController } from "./user.put";

export class UserGetController extends Controller {
    private static models = {
        User: model<IUserModel>('user')
    }

    public static async user(user: GuildMember) {
        return await this.models.User.findOne({ discordId: user.id, discordGuild: user.guild.id });
    }

    public static async populatedUserCollarData(user: GuildMember) {
        let mongoUser = await UserPutController.ensuredGet(user);
        mongoUser = await mongoUser.populate('collarees').populate('collarers').execPopulate();
        return mongoUser;
    }

    public static async populateUserDomData(user: GuildMember) {
        let mongoUser = await UserPutController.ensuredGet(user);
        mongoUser = await mongoUser.populate('usersDoms').populate('usersSubs').execPopulate();
        return mongoUser;
    }

    public static async populateAllUseData(user: GuildMember) {
        let mongoUser = await UserPutController.ensuredGet(user);
        mongoUser = await mongoUser
            .populate('usersDoms')
            .populate('usersSubs')
            .populate('collarees')
            .populate('collarers')
            .execPopulate();
        return mongoUser;
    }

    public static async collarees(user: GuildMember) {
        let monogUser = await UserPutController.ensuredGet(user);
        monogUser = await monogUser.populate('collarees').execPopulate();
        return monogUser.collarees;
    }

    public static async collarers(user: GuildMember) {
        let monogUser = await UserPutController.ensuredGet(user);
        monogUser = await monogUser.populate('collarers').execPopulate();
        return monogUser.collarers;
    }

    public static async hasDom(sub: GuildMember) {
        const mongoSub = await UserPutController.ensuredGet(sub);
        console.log(mongoSub.usersSubs.length);
        return mongoSub.usersDoms.length === 0;
    }

    public static async isUsersDom(sub: GuildMember, potentialDom: GuildMember) {
        const mongoSub = await UserPutController.ensuredGet(sub);
        const mongoDom = await UserPutController.ensuredGet(potentialDom);

        const domFromList = (mongoSub.usersDoms as string[]).find(dom => dom.toString() == mongoDom._id);

        if (domFromList) return true;
        return false;
    }

    /**
     * checks if the potential collarer actually collared the collaree
     * 
     * @param collaree the welder of the collar
     * @param potentialCollarer the one who gave the collar
     */
    public static async isCollaredBy(collaree: GuildMember, potentialCollarer: GuildMember) {
        const mongoCollaree = await UserPutController.ensuredGet(collaree);
        const mongoCollarer = await UserPutController.ensuredGet(potentialCollarer);

        // i have absolutely no clue what javascript decided that the collarer was 
        // an object when its clearly a string so i have to string it again
        const collarerFromList = (mongoCollaree.collarers as string[]).find(collarer => collarer.toString() == mongoCollarer._id);

        if (collarerFromList) return true;
        return false;
    }
}