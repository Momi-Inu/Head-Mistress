import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, Guild, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { IUser } from "../../../db/formats/user.fomat";
import { BotEmbedResponse } from "../../utils/bot-response.util";

class PetsCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'pets';
        super(client, {
            name: commandName,
            group: 'lists',
            memberName: 'lists:pets',
            description: 'Get a list of people you have collared!',
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

    async run(message: CommandMessage): Promise<Message | Message[]> {
        // refer to owners.command.ts for documentation explaination
        const mongoPets = await UserController.Get.collarees(message.member);
        if (mongoPets.length === 0) return message.channel.send(`Aww looks like you have no pets ~ Don't worry I'm sure it's because you really are one <3`);
        const pets = this.collectMembers(mongoPets as IUser[], message.guild);
        const response = new BotEmbedResponse(this.client)
            .setThumbnail(this.client.user.avatarURL)
            .setDescription(`Here\'s all your pets! Make sure you give them lots of "love"~`)
            .addField('Pets', this.formatPets(pets));
        return message.channel.send(response);
    }
}

module.exports = PetsCommand;