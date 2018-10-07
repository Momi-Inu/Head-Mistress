import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, Guild, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { IUser } from "../../../db/formats/user.fomat";
import { BotEmbedResponse } from "../../utils/bot-response.util";

class OwnersCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'owners';
        super(client, {
            name: commandName,
            group: 'lists',
            memberName: 'lists:owners',
            description: 'Get a list of people that are your owners!',
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

    private formatOwners(owners: GuildMember[]) {
        let format = '';
        owners.forEach(owner => {
            format += owner.displayName + '\n';
        });
        return format;
    }

    async run(message: CommandMessage): Promise<Message | Message[]> {
        const mongoOwners = await UserController.Get.collarers(message.member);
        if (mongoOwners.length === 0) return message.channel.send(
            `Aww looks like you have no owners ~ You must feel really lost. Don't worry <3 I'll be your mistress, but I hope you know I'm a rough one ~`
        );
        const owners = this.collectMembers(mongoOwners as IUser[], message.guild);
        const response = new BotEmbedResponse(this.client)
            .setThumbnail(this.client.user.avatarURL)
            .setDescription(`Here\'s all the people who own you! Make sure you worship them and tell them how lucky you are <3`)
            .addField('Owners', this.formatOwners(owners));
        return message.channel.send(response);
    }
}

module.exports = OwnersCommand;