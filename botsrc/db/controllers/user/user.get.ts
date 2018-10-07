import { model } from "mongoose";
import { IUserModel } from "../../formats/user.fomat";
import { GuildMember } from "discord.js";
import { Controller } from "../base";
import { UserPutController } from "./user.put";

export class UserGetController extends Controller {
    private static models = {
        User: model<IUserModel>('user')
    }

    public static async user(user: GuildMember) {
        return await this.models.User.findOne({ discordId: user.id, discordGuild: user.guild.id });
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