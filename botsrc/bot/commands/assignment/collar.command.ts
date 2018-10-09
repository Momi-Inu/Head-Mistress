import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";

class CollarCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'collar';
        super(client, {
            name: commandName,
            group: 'assignment',
            memberName: 'assignment:setup',
            description: 'Put a collar on you little pet!',
            args: [
                {
                    key: 'collaree',
                    prompt: 'Who are you collaring?',
                    type: 'member',
                    validate: () => true,
                    default: 'NONE'
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName} @yourpet#1234`
            ]
        });
    }

    async run(message: CommandMessage, args: { collaree: GuildMember | 'NONE' }): Promise<Message | Message[]> {

        if (args.collaree === 'NONE')
            return message.channel.send('Hun who were you thinking of collaring? Yourself? :P');

        if (args.collaree === null)
            return message.channel.send(`Hmmm... doesn't look like that pet exists! Sure you spelled it right? :P`);

        // boolean to check if the mentions user is the holder of the
        // collar
        const isCollaredAlreadyByUser = await UserController.Get.isCollaredBy(args.collaree, message.member);
        
        // the reason why we have to do the reverse is because it is
        // not guarenteed that if the previous statement returns false
        // that it exists visa versa it
        const collareeHasCollaredUser = await UserController.Get.isCollaredBy(message.member, args.collaree);

        // some validations
        if (args.collaree.id === message.author.id)
            return message.channel.send(`A pet can't own itself you know!`);

        if (isCollaredAlreadyByUser)
            return message.channel.send(`Look's like you have already collared ${args.collaree.displayName}!`);

        if (collareeHasCollaredUser)
            return message.channel.send(`Hmmm... how can I let you collar ${
                args.collaree.displayName
                }~ ${args.collaree.displayName} is the one who owns you pet!`);

        if (args.collaree.id === this.client.user.id)
            return message.channel.send(`Fufufu, you want me to be your little pet? Well too bad, I like to be on the other side ;)`);

        // send the collar request
        await UserController.Put.collarUser(message.member, args.collaree);
        return message.channel.send(`${message.member.displayName} has put a collar around his / hers new pet, ${args.collaree.displayName}!`);
    }
}

module.exports = CollarCommand;