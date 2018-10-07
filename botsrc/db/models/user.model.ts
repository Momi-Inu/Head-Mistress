import { Schema, model, models } from "mongoose";

export const UserSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    discordGuild: {
        type: String,
        ref: 'guild'
    },
    userSubs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    userDoms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    collarees: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    collarers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
});

model('user', UserSchema);