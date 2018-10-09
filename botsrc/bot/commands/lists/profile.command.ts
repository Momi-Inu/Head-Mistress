import { Command, CommandoClient, CommandMessage, CommandFormatError } from "discord.js-commando";
import { Message, Guild, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { IUser } from "../../../db/formats/user.fomat";
import { BotEmbedResponse } from "../../utils/bot-response.util";

class PetsCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'profile';
        super(client, {
            name: commandName,
            group: 'lists',
            memberName: 'lists:profile',
            description: 'Get yours or someone elses list of pets and owners!',
            args: [
                {
                    key: 'guildMember',
                    prompt: 'Whos profile do you want to see?',
                    type: 'member',
                    default: 'NONE',
                    validate: () => true
                }
            ],
            examples: [
                `${client.commandPrefix}${commandName}`
            ]
        });
    }

    private collectMembers(members: IUser[], guild: Guild) {
        return members.map(member => {
            return guild.members.get(member.discordId);
        });
    }

    private formatPets(pets: GuildMember[]) {
        let format = '';
        pets.forEach(pet => {
            format += pet.displayName + '\n';
        });
        return format;
    }

    async run(message: CommandMessage, args: { guildMember: GuildMember | 'NONE' }): Promise<Message | Message[]> {
        // refer to owners.command.ts for documentation explaination
        if (args.guildMember === null)
            return message.channel.send(`Looks like you entered someones name wrong! Try again~`);
        let user = (args.guildMember === 'NONE') ? message.member : args.guildMember;

        const mongoUser = await UserController.Get.populatedCollars(user as GuildMember);
        const pets = this.collectMembers(mongoUser.collarees as IUser[], message.guild);
        const owners = this.collectMembers(mongoUser.collarers as IUser[], message.guild);
        const response = new BotEmbedResponse(this.client)
            .setThumbnail(this.client.user.avatarURL)
            .setDescription(`Here\'s all ${
                (args.guildMember === 'NONE') ? 'your' : args.guildMember.displayName
                } pets! Make sure you give them lots of "love"~`
            );
        if (pets.length === 0) response.addField('Pets', 'No Pets!');
        else response.addField('Pets', this.formatPets(pets));
        if (owners.length === 0) response.addField('Owners', 'No Owners!');
        else response.addField('Owners', this.formatPets(owners));
        return message.channel.send(response);
    }
}

module.exports = PetsCommand;