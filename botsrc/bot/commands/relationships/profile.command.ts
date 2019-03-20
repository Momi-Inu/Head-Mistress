import { Command, CommandoClient, CommandMessage, CommandFormatError } from "discord.js-commando";
import { Message, Guild, GuildMember, User } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { IUser } from "../../../db/formats/user.fomat";
import { BotEmbedResponse } from "../../utils/bot-response.util";

class PetsCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'profile';
        super(client, {
            name: commandName,
            group: 'relationships',
            memberName: 'relationships:profile',
            autoAliases: true,
            aliases: ['relationships'],
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
            ],
            guildOnly: true
        });
    }

    private collectMembers(members: IUser[], guild: Guild) {
        return members.map(member => {
            return guild.members.get(member.discordId);
        });
    }

    private formatMembers(member: GuildMember[]) {
        let format = '';
        member.forEach(pet => {
            format += pet.displayName + '\n';
        });
        return format;
    }

    async run(message: CommandMessage, args: { guildMember: GuildMember | 'NONE' }): Promise<Message | Message[]> {

        let guildMemberAsUser: User;
        if (args.guildMember === null)
            return message.channel.send(`Looks like you entered someones name wrong! Try again~`);
        else if (args.guildMember !== 'NONE') guildMemberAsUser = await this.client.fetchUser((args.guildMember as GuildMember).id);

        let user = (args.guildMember === 'NONE') ? message.member : args.guildMember;

        const mongoUser = await UserController.Get.populateAllUseData(user as GuildMember);

        const pets = this.collectMembers(mongoUser.collarees as IUser[], message.guild);
        const trainers = this.collectMembers(mongoUser.collarers as IUser[], message.guild);
        const masters = this.collectMembers(mongoUser.usersDoms as IUser[], message.guild);
        const slaves = this.collectMembers(mongoUser.usersSubs as IUser[], message.guild);
        const response = new BotEmbedResponse(this.client)
            .setThumbnail(
                (args.guildMember === 'NONE') ? message.author.avatarURL : guildMemberAsUser.avatarURL
            )
            .setDescription(
                `Here\'s all ${
                (args.guildMember === 'NONE') ? 'your' : args.guildMember.displayName + '\'s'
                } relationships!`
            );

        if (trainers.length === 0) response.addField('Trainers', 'No trainers!', true);
        else response.addField('Trainers', this.formatMembers(trainers), true);

        if (masters.length === 0) response.addField('Master', 'You don\'t have one!', true);
        else response.addField('Masters', this.formatMembers(masters), true);

        if (pets.length === 0) response.addField('Pets', 'No Pets!', true);
        else response.addField('Pets', this.formatMembers(pets), true);

        if (slaves.length === 0) response.addField('Slaves', 'No Slaves!', true);
        else response.addField('Slaves', this.formatMembers(slaves), true);

        return message.channel.send(response);
    }
}

module.exports = PetsCommand;