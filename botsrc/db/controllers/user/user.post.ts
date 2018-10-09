import { Controller } from "../base";
import { model } from "mongoose";
import { IUserModel } from "../../formats/user.fomat";
import { User, GuildMember } from "discord.js";

export class UserPostController extends Controller {
    private static models = {
        User: model<IUserModel>('user')
    }

    public static async user(user: GuildMember) {
        const mongoUser = new this.models.User({
            discordId: user.id,
            discordGuild: user.guild.id,
            userSubs: [],
            userDoms: [],
            collarees: [],
            collarers: []
        });

        return await mongoUser.save();
    }
}