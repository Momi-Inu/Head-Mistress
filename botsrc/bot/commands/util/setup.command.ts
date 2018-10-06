import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember, Guild, Role, Collection } from "discord.js";
import { AppDispatcher } from "../../utils/application-dispatcher";
import { AppBuilder } from "../../utils/application-builder";
import { ApplicationController } from "../../../db/controllers/application/application.controller";
import { applicationResponse } from "../../formats/answers.format";

// type response = 

class SetupCommand extends Command {
    roleColor: number;
    constructor(client: CommandoClient) {
        const commandName = 'setup';
        super(client, {
            name: commandName,
            group: 'util',
            memberName: 'util:setup',
            description: 'Set yourself up in the server. Assign roles and everything!',
            examples: [
                `${client.commandPrefix}${commandName}`
            ]
        });

        this.roleColor = 0x99abb5;
    }

    private getRole(roleName: string, guild: Guild) {
        return guild.roles.find(role => role.name === roleName);
    }

    private async giveRoles(roleNames: string[], member: GuildMember) {
        let roles: Role[] = [];
        for (let roleName of roleNames) {
            const role = this.getRole(roleName, member.guild);
            if (!role) {
                roles.push(
                    await member.guild.createRole(
                        {
                            name: roleName,
                            color: this.roleColor
                        },
                        'Required role via setup application'
                    )
                );
            } else {
                roles.push(role);
            }
        }
        member.addRoles(roles);
    }

    private async removePreviouslyAssignedRoles(member: GuildMember) {
        const roles = member.roles.filter(role => role.color === this.roleColor);
        return await member.removeRoles(roles);
    }

    private async determineRoles(response: applicationResponse, member: GuildMember) {
        await this.removePreviouslyAssignedRoles(member);
        const answers = response.answers;
        const rolesToGive = [
            answers.AVAILABILITY.reactionPrompt,
            answers.AGEGROUP.reactionPrompt,
            answers.SEXUALITY.reactionPrompt,
            answers.GENDER.reactionPrompt,
            answers.TRAIT.reactionPrompt,
        ];
        answers.SUBMISSIVE && rolesToGive.push(answers.SUBMISSIVE.reactionPrompt);
        answers.DOMINANT && rolesToGive.push(answers.DOMINANT.reactionPrompt);
        answers.SWITCH && rolesToGive.push(answers.SWITCH.reactionPrompt);
        this.giveRoles(rolesToGive, member);
    }

    async run(message: CommandMessage): Promise<Message | Message[]> {
        const myApp = new AppBuilder(message.guild)
            .setTitle('Initial Role Setup')
            .setDescription('This will ask you a bunch of questions to get you setup into the server')
            .setQuestionTimeout(1)
            .createReactQuestion('AVAILABILITY',
                'Are you taken?',
                [
                    AppBuilder.createReaction('😘', 'Taken', 'AGEGROUP'),
                    AppBuilder.createReaction('😝', 'Not Taken', 'AGEGROUP'),
                    AppBuilder.createReaction('🤐', 'Complicated', 'AGEGROUP'),
                ]
            )
            .createReactQuestion(
                'AGEGROUP',
                'Whats your age group?',
                [
                    AppBuilder.createReaction('💙', '18 - 20', 'SEXUALITY'),
                    AppBuilder.createReaction('💚', '21 - 23', 'SEXUALITY'),
                    AppBuilder.createReaction('💛', '24 - 26', 'SEXUALITY'),
                    AppBuilder.createReaction('💜', '27 - 29', 'SEXUALITY'),
                    AppBuilder.createReaction('🖤', '29+', 'SEXUALITY')
                ]
            )
            .createReactQuestion('SEXUALITY',
                'What is your sexuality?',
                [
                    AppBuilder.createReaction('🤷', 'Non-Binary', 'GENDER'),
                    AppBuilder.createReaction('👩', 'Female', 'GENDER'),
                    AppBuilder.createReaction('🤵', 'Male', 'GENDER'),
                    AppBuilder.createReaction('👆', 'Trap', 'GENDER'),
                    AppBuilder.createReaction('👋', 'Trans', 'GENDER'),
                ]
            )
            .createReactQuestion('GENDER',
                'What is your gender?',
                [
                    AppBuilder.createReaction('🤷', 'Straight', 'TRAIT'),
                    AppBuilder.createReaction('👩', 'Gay', 'TRAIT'),
                    AppBuilder.createReaction('🤵', 'Pansexual', 'TRAIT'),
                    AppBuilder.createReaction('👆', 'Asexual', 'TRAIT'),
                    AppBuilder.createReaction('👋', 'Bisexual', 'TRAIT'),
                ]
            )
            .createReactQuestion('TRAIT',
                'What\'s your kink?',
                [
                    AppBuilder.createReaction('👅', 'Submissive', 'SUBMISSIVE'),
                    AppBuilder.createReaction('💄', 'Dominant', 'DOMINANT'),
                    AppBuilder.createReaction('💞', 'Switch', 'SWITCH')
                ]
            )
            .createReactQuestion('SUBMISSIVE',
                'What would you like to be?',
                [
                    AppBuilder.createReaction('👗', 'Maid', 'TEST'),
                    AppBuilder.createReaction('🤵', 'Butler', 'TEST'),
                ]
            )
            .createReactQuestion('DOMINANT',
                'What would you like to be?',
                [
                    AppBuilder.createReaction('🕵', 'Master', 'TEST'),
                    AppBuilder.createReaction('💄', 'Mistress', 'TEST'),
                ]
            )
            .createReactQuestion('SWITCH',
                'What would you like to be?',
                [
                    AppBuilder.createReaction('🕵', 'Master', 'TEST'),
                    AppBuilder.createReaction('💄', 'Mistress', 'TEST'),
                    AppBuilder.createReaction('👗', 'Maid', 'TEST'),
                    AppBuilder.createReaction('🤵', 'Butler', 'TEST'),
                ]
            )

        const myDispatcher = new AppDispatcher(myApp.generateApplication(), message.member, this.client);
        ApplicationController.Post.application(myApp.generateApplication());
        message.channel.send(`Sending application... ${message.author.username}, please check your DM\'s.`);

        myDispatcher.useGuild(message.guild).dispatchQuestions().then((response) => {
            this.determineRoles(response, message.member);
        }).catch((error) => {
            if (error.message !== 'TIMED OUT')
                message.channel.send('Please allow me to send you DM\'s to continue the application');
        });
        return;
    }
}

module.exports = SetupCommand;