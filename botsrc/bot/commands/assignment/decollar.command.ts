import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";

class DecollarCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'decollar';
        super(client, {
            name: commandName,
            group: 'assignment',
            memberName: 'assignment:decollar',
            description: 'Remove the collar from your pet or yourself!',
            aliases: ['uncollar'],
            args: [
                {
                    key: 'collar',
                    prompt: 'Whos collar are you removing?',
                    type: 'member',
                    default: 'NONE'
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName} @someone#1234`
            ],
            guildOnly: true
        });
    }

    async run(message: CommandMessage, args: { collar: GuildMember | 'NONE' }): Promise<Message | Message[]> {

        // custom validations
        if (args.collar === 'NONE')
            return message.channel.send('I think you forgot to tell me which collar to remove!');

        // checks if the mentioned user was the one
        // who actually had the collar
        const collarOnOtherPerson = await UserController.Get.isCollaredBy(args.collar, message.member);

        // validations
        if (args.collar.id === message.author.id)
            return message.channel.send(`Hey! How did you put a collar on yourself?`);

        if (args.collar.id === this.client.user.id)
            return message.channel.send(`Hmmm.. like I'd ever let you do that to me in the first place~`);

        // if the user is the one with the collar then remove the collar off
        // themselves
        if (collarOnOtherPerson) {
            await UserController.Put.decollarUser(message.member, args.collar);
            return message.channel.send(`${message.member.displayName} let his / hers pet ${args.collar.displayName} go!`);
        } else {

            // this is done because we need to make sure that it exists visa versa
            const makesSureCollarExists = await UserController.Get.isCollaredBy(message.member, args.collar);
            if (makesSureCollarExists) {

                // if the user is NOT the one holding the collar than have the collarer
                // remove the collar off the collaree
                await UserController.Put.decollarUser(args.collar, message.member);
                return message.channel.send(`${message.member.displayName} removed ${args.collar.displayName}'s collar and ran away!`);
            } else {
                message.channel.send(`Hmm.. You 100% sure there's supposed to be a collar here hun?`);
            }
        }
    }
}

module.exports = DecollarCommand;