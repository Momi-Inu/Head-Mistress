import { Document } from "mongoose";
import { IApplicationModel } from "./application.format";

export interface IUser {
    discordId: string,
    discordGuild: string,

    usersSubs: IUser[] | string[],
    usersDoms: IUser[] | string[],
    collarees: IUser[] | string[],
    collarers: IUser[] | string[]
};

export interface IUserModel extends IUser, Document { };