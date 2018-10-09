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
    usersSubs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    usersDoms: [
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