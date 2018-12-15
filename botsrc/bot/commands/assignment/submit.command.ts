import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember, User } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { LanguageAdapter } from "../../utils/language-adapter";

class SubmitCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'submit';
        super(client, {
            name: commandName,
            group: 'assignment',
            memberName: 'assignment:submit',
            description: `Submit yourself to your mistress or master~ Show your commitment. Careful! You can't go back after using this command unless your master or mistress releases you <3`,
            args: [
                {
                    key: 'dom',
                    prompt: 'Who are you submitting yourself to?',
                    type: 'member',
                    validate: () => true,
                    default: 'NONE'
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName} @yourmaster#1234`
            ],
            guildOnly: true
        });
    }

    async run(message: CommandMessage, args: { dom: GuildMember | 'NONE' }): Promise<Message | Message[]> {

        if (args.dom === 'NONE')
            return message.channel.send(
                LanguageAdapter.setPronouns(
                    `You can't be your own [0:master/mistress] silly! Then you would get to do everything you enjoy, right?`,
                    message.member
                )
            );

        if (args.dom === null)
            return message.channel.send(`Hmmm... is your dom imaginary because I can't find him!`);

        // some validations
        if (args.dom.id === message.author.id)
            return message.channel.send(
                LanguageAdapter.setPronouns(
                    `You can't be your own [0:master/mistress] silly! Then you would get to do everything you enjoy, right?`,
                    message.member
                )
            );

        // the reason why we have to do the reverse is because it is
        // not guarenteed that if the previous statement returns false
        // that it exists visa versa it
        const subIsTheDom = await UserController.Get.isUsersDom(args.dom, message.member);

        if (subIsTheDom)
            return message.channel.send(`Hmmm... how can I let you submit to ${
                args.dom.displayName
                } ~ they're your slave!`);


        // boolean to check if the mentions user is the holder of the
        // collar
        const isDommedAlreadyByUser = await UserController.Get.isUsersDom(message.member, args.dom);

        if (isDommedAlreadyByUser)
            return message.channel.send(`Wow what dedication <3 You want to submit to ${args.dom.displayName} again? Wow ~`);

        const hasDom = await UserController.Get.hasDom(message.member);

        if (!hasDom) {
            return message.channel.send(
                `Ooh... sorry you can't have two masters ~ How can you give all your worship to two people? ~ You'll have to beg your current idol to let you go before you can submit to someone else ~`
            );
        }

        if (args.dom.id === this.client.user.id)
            return message.channel.send(`Fufufu, you want to submit to me? I don't know if you want that ;) I'm really rough ~`);

        // send the collar request
        await UserController.Put.submitUser(args.dom, message.member);
        return message.channel.send(`${message.member.displayName} has submitted to ${args.dom.displayName}! I can already see ${message.member.displayName} groveling at ${args.dom.displayName}'s feet <3`);
    }
}

module.exports = SubmitCommand;