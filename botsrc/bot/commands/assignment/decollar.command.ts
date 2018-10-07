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
            args: [
                {
                    key: 'collar',
                    prompt: 'Whos collar are you removing?',
                    type: 'member'
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName} @someone#1234`
            ]
        });
    }

    async run(message: CommandMessage, args: { collar: GuildMember }): Promise<Message | Message[]> {

        // checks if the mentioned user was the one
        // who actually had the collar
        const collarOnOtherPerson = await UserController.Get.isCollaredBy(args.collar, message.member);
        
        // validations
        if (args.collar.id === message.author.id)
            return message.channel.send(`Hey! How did you put a collar on yourself?`);

        if (args.collar.id === this.client.user.id)
            return message.channel.send(`Hmmm.. like I'd ever let you do that to me in the first place~`);

        if (collarOnOtherPerson) {
            await UserController.Put.decollarUser(message.member, args.collar);
            return message.channel.send(`${message.member.displayName} let his / hers pet ${args.collar.displayName} go!`);
        } else {

            // this is done because we need to make sure that it exists visa versa
            const makesSureCollarExists = await UserController.Get.isCollaredBy(message.member, args.collar);
            if (makesSureCollarExists) {
                await UserController.Put.decollarUser(args.collar, message.member);
                return message.channel.send(`${message.member.displayName} removed ${args.collar.displayName}'s collar and ran away!`);
            } else {
                message.channel.send(`Hmm.. You 100% sure there's supposed to be a collar here hun?`);
            }
        }
    }
}

module.exports = DecollarCommand;