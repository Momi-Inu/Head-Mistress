import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, GuildMember, Guild, Role, Collection, UserConnection } from "discord.js";
import { AppDispatcher } from "../../utils/application-dispatcher";
import { AppBuilder } from "../../utils/application-builder";
import { ApplicationController } from "../../../db/controllers/application/application.controller";
import { applicationResponse } from "../../formats/answers.format";
import { UserController } from "../../../db/controllers/user/user.controller";


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
            ],
            guildOnly: true
        });

        this.roleColor = 0x99abb5;
    }

    private getRole(roleName: string, guild: Guild) {
        return guild.roles.find(role => role.name === roleName);
    }

    private async giveRoles(roleNames: string[], member: GuildMember) {
        console.log(roleNames)
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
        const roles = member.roles.filter(role => role.color == this.roleColor);
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
            .setQuestionTimeout(30)
            // .createReactQuestion('AVAILABILITY',
            //     'Are you taken?',
            //     [
            //         AppBuilder.createReaction('😘', 'Taken', 'AGEGROUP'),
            //         AppBuilder.createReaction('😝', 'Not Taken', 'AGEGROUP'),
            //         AppBuilder.createReaction('🤐', 'Complicated', 'AGEGROUP'),
            //     ]
            // )
            .createFreetextQuestion('AGEGROUP', `What's your age group?`, 'SEXUALITY', (value) => {
                const possibleNumber = Number.parseInt(value);
                return !isNaN(possibleNumber);
            })
            // .createReactQuestion(
            //     'AGEGROUP',
            //     'Whats your age group?',
            //     [
            //         AppBuilder.createReaction('💙', '18 - 20', 'SEXUALITY'),
            //         AppBuilder.createReaction('💚', '21 - 23', 'SEXUALITY'),
            //         AppBuilder.createReaction('💛', '24 - 26', 'SEXUALITY'),
            //         AppBuilder.createReaction('💜', '27 - 29', 'SEXUALITY'),
            //         AppBuilder.createReaction('🖤', '29+', 'SEXUALITY')
            //     ]
            // )

            // .createReactQuestion('SEXUALITY',
            //     'What is your sexuality?',
            //     [
            //         AppBuilder.createReaction('🤷', 'Non-Binary', 'PRONOUN'),
            //         AppBuilder.createReaction('👩', 'Female', 'PRONOUN'),
            //         AppBuilder.createReaction('🤵', 'Male', 'PRONOUN'),
            //         AppBuilder.createReaction('👆', 'Trap', 'PRONOUN'),
            //         AppBuilder.createReaction('👋', 'Trans', 'PRONOUN'),
            //     ]
            // )
            // .createReactQuestion('PRONOUN',
            //     `What's your preferred pronoun?`,
            //     [
            //         AppBuilder.createReaction('👨', 'Male', 'GENDER'),
            //         AppBuilder.createReaction('👩', 'Female', 'GENDER'),
            //         AppBuilder.createReaction('🤷', 'Neutral', 'GENDER')
            //     ]
            // )
            // .createReactQuestion('GENDER',
            //     'What is your gender?',
            //     [
            //         AppBuilder.createReaction('🤷', 'Straight', 'TRAIT'),
            //         AppBuilder.createReaction('👩', 'Gay', 'TRAIT'),
            //         AppBuilder.createReaction('🤵', 'Pansexual', 'TRAIT'),
            //         AppBuilder.createReaction('👆', 'Asexual', 'TRAIT'),
            //         AppBuilder.createReaction('👋', 'Bisexual', 'TRAIT'),
            //     ]
            // )
            // .createReactQuestion('TRAIT',
            //     'What\'s your kink?',
            //     [
            //         AppBuilder.createReaction('👅', 'Submissive', 'SUBMISSIVE'),
            //         AppBuilder.createReaction('💄', 'Dominant', 'DOMINANT'),
            //         AppBuilder.createReaction('💞', 'Switch', 'SWITCH')
            //     ]
            // )
            // .createReactQuestion('SUBMISSIVE',
            //     'What would you like to be?',
            //     [
            //         AppBuilder.createReaction('👗', 'Maid', 'TEST'),
            //         AppBuilder.createReaction('🤵', 'Butler', 'TEST'),
            //     ]
            // )
            // .createReactQuestion('DOMINANT',
            //     'What would you like to be?',
            //     [
            //         AppBuilder.createReaction('🕵', 'Master', 'TEST'),
            //         AppBuilder.createReaction('💄', 'Mistress', 'TEST'),
            //     ]
            // )
            // .createReactQuestion('SWITCH',
            //     'What would you like to be?',
            //     [
            //         AppBuilder.createReaction('🕵', 'Master', 'TEST'),
            //         AppBuilder.createReaction('💄', 'Mistress', 'TEST'),
            //         AppBuilder.createReaction('👗', 'Maid', 'TEST'),
            //         AppBuilder.createReaction('🤵', 'Butler', 'TEST'),
            //     ]
            // )

        // the dispatcher will be the thing that sends the application over to the
        // users dms
        const myDispatcher = new AppDispatcher(myApp.generateApplication(), message.member, this.client);

        // message telling them they should go to their dms
        message.channel.send(`Sending application... ${message.author.username}, please check your DM\'s.`);

        // set the guild to be used with the dispatcher
        // if the guild is NOT set then there will just be no picture
        myDispatcher.useGuild(message.guild).dispatchQuestions().then((applicationResponse) => {
            // processing to be done with the response
            message.channel.send(JSON.stringify(applicationResponse, null, 4), { code: 'JSON' });
            // this.determineRoles(applicationResponse, message.member);
            // UserController.Put.setPronoun(message.member, applicationResponse.answers.PRONOUN.reactionPrompt as "Female" | "Male" | "Neutral");
        }).catch((error) => {
            console.log(error);
            // ¯\_(ツ)_/¯ yeah i give a shit about conditions
            if (error.message !== 'TIMED OUT')
                message.channel.send('Please allow me to send you DM\'s to continue the application');
        });
        return;
    }
}

module.exports = SetupCommand;