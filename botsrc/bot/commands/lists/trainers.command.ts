import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, Guild, GuildMember } from "discord.js";
import { UserController } from "../../../db/controllers/user/user.controller";
import { IUser } from "../../../db/formats/user.fomat";
import { BotEmbedResponse } from "../../utils/bot-response.util";

class TrainersCommand extends Command {
    constructor(client: CommandoClient) {
        const commandName = 'trainers';
        super(client, {
            name: commandName,
            group: 'lists',
            memberName: 'lists:trainers',
            description: 'Get a list of people that are your trainers!',
            examples: [
                `${client.commandPrefix}${commandName}`
            ],
            guildOnly: true
        });
    }

    /**
     * retrieves from discord an array of members that are specified
     * in that guild
     * 
     * @param members mongo user documents
     * @param guild guild that the member is from
     */
    private collectMembers(members: IUser[], guild: Guild) {
        return members.map(member => {
            return guild.members.get(member.discordId);
        });
    }

    /**
     * formats the owners into a readable name
     * 
     ```json
     const myOwners = 'owner1\nowner2\nowner3';
     ```
     * 
     * @param trainers array of guildMembers
     */
    private trainers(trainers: GuildMember[]) {
        let format = '';
        trainers.forEach(owner => {
            format += owner.displayName + '\n';
        });
        return format;
    }

    async run(message: CommandMessage): Promise<Message | Message[]> {

        // get all the owners
        const mongoTrainers = await UserController.Get.collarers(message.member);

        // validation check
        if (mongoTrainers.length === 0) return message.channel.send(
            `Aww looks like you have no owners ~ You must feel really lost. Don't worry <3 I'll be your mistress, but I hope you know I'm a rough one ~`
        );

        // get all the memberObjects from the owners
        const trainers = this.collectMembers(mongoTrainers as IUser[], message.guild);

        // build an embed response
        const response = new BotEmbedResponse(this.client)
            .setThumbnail(message.author.avatarURL)
            .setDescription(`Here\'s all the people who own you! Make sure you worship them and tell them how lucky you are <3`)
            .addField('Trainers', this.trainers(trainers));
        return message.channel.send(response);
    }
}

// module.exports = TrainersCommand;