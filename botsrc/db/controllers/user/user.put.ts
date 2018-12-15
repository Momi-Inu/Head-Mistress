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

    /**
     * ensures that a mongo user is returned
     * 
     * @param user guild member
     */
    public static async ensuredGet(user: GuildMember) {
        let mongoUser = await UserGetController.user(user);
        if (mongoUser) return mongoUser;
        return await UserPostController.user(user);
    }

    /**
     * puts a collar on a user
     * 
     * @param collarer user that is collaring
     * @param collaree user this is getting collared
     */
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

    /**
     * remove a collar from a user
     * 
     * @param collarer user that is collaring
     * @param collaree user that is getting collared
     */
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

    /**
     * submits a user to another
     * 
     * @param dom yeet
     * @param sub yoot
     */
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

    /**
     * removes a user from another
     * 
     * @param dom yoot
     * @param sub yeet
     */
    public static async rejectUser(dom: GuildMember, sub: GuildMember) {
        const mongoDom = await this.ensuredGet(dom);
        const mongoSub = await this.ensuredGet(sub);

        const domsSubsList = mongoDom.usersSubs as string[];
        const subsDomsList = mongoSub.usersDoms as string[];

        domsSubsList.splice(domsSubsList.indexOf(mongoSub._id), 1);
        subsDomsList.splice(subsDomsList.indexOf(mongoDom._id), 1);

        mongoDom.markModified('usersSubs');
        mongoSub.markModified('usersDoms');

        return {
            dom: await mongoDom.save(),
            sub: await mongoSub.save()
        }
    }

    public static async setPronoun(user: GuildMember, pronoun: 'Female' | 'Male' | 'Neutral') {
        const mongoUser = await this.ensuredGet(user);

        mongoUser.pronoun = pronoun.toLowerCase() as 'female' | 'male' | 'neutral';

        return await mongoUser.save();
    }
}