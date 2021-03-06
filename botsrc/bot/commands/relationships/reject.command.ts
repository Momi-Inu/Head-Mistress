import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember, User } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { LanguageAdapter } from "../../utils/language-adapter";

class RejectCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'reject';
        super(client, {
            name: commandName,
            group: 'relationships',
            memberName: 'relationships:reject',
            description: `Reject your slaves very existance! Through them away like the toy they are ~`,
            args: [
                {
                    key: 'sub',
                    prompt: 'Who are you rejecting?',
                    type: 'member',
                    validate: () => true,
                    default: 'NONE'
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName} @yourpet#1234`
            ],
            guildOnly: true
        });
    }

    async run(message: CommandMessage, args: { sub: GuildMember | 'NONE' }): Promise<Message | Message[]> {

        if (args.sub === 'NONE')
            return message.channel.send(
                LanguageAdapter.setPronouns(
                    `Well then. Rejecting yourself isn't a very [0:master/mistress/master] thing to do is it!`, message.member
                )
            );

        if (args.sub === null)
            return message.channel.send(`Hmmm... tried rejecting the person you mentioned. But turns out I can't find them!`);

        // some validations
        if (args.sub.id === message.author.id)
            return message.channel.send(
                LanguageAdapter.setPronouns(
                    `Well then. Rejecting yourself isn't a very [0:master/mistress/master] thing to do is it!`, message.member
                )
            );

        // the reason why we have to do the reverse is because it is
        // not guarenteed that if the previous statement returns false
        // that it exists visa versa it
        const subIsTheDom = await UserController.Get.isUsersDom(message.member, args.sub);

        if (subIsTheDom)
            return message.channel.send(
                LanguageAdapter.setPronouns(
                    `Haha nice try slave ~ You can't run away from your [0:master/mistress/master]. This is what you wanted though isn't it? <3`,
                    args.sub
                )
            );

        const hasDom = await UserController.Get.hasDom(message.member);

        if (!hasDom)
            return message.channel.send(`I can't remove any slaves you have if you didn't have any to being with!`);

        if (args.sub.id === this.client.user.id)
            return message.channel.send(`Fufufu, I think you made a mistake there babe. I don't remember ever submitting to you ;). You can try to get me but I promise it won't happen ~`);

        // send the collar request
        await UserController.Put.rejectUser(message.member, args.sub);
        return message.channel.send(
            LanguageAdapter.setPronouns(
                `${args.sub.displayName} is free to go! ${message.member.displayName} is such a good [0:master/mistress/master] for letting this happen ~`,
                message.member
            )
        );
    }
}

module.exports = RejectCommand;