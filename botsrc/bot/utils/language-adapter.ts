import { User, GuildMember } from "discord.js";
import { UserController } from "../../db/controllers/user/user.controller";

interface IPronounData {
    user: number,
    choices?: string[]
}

export class LanguageAdapter {
    private static async getUsersGenders(members: GuildMember[]) {
        const userGenderMap = new Map<string, "male" | "female" | "neutral">();

        // if we are expecting > 3 - 5 we should rewrite this
        // to get ALL users first
        for (const user of members) {
            const mongoUser = await UserController.Put.ensuredGet(user);
            userGenderMap.set(user.id, mongoUser.pronoun);
        }

        return userGenderMap;
    }

    private static parsePronounFromSyntax(bracketSyntax: string): IPronounData {
        const userSplitter = bracketSyntax.indexOf(':');
        return {
            user: Number.parseInt(bracketSyntax.slice(1, userSplitter)),
            choices: bracketSyntax.slice(userSplitter + 1, bracketSyntax.length - 1).split('/')
        };
    }

    private static generateSentenceData(sentence: string, generator: (currentSegment: IPronounData) => void) {

        let generatedString = '';
        let currentSentence = sentence;
        let openBracked = currentSentence.indexOf('[');
        let closedBracket = currentSentence.indexOf(']')
        do {
            generatedString += currentSentence.slice(0, openBracked);
            generatedString += generator(
                LanguageAdapter.parsePronounFromSyntax(
                    currentSentence.slice(openBracked, closedBracket + 1)
                )
            );

            currentSentence = currentSentence.slice(closedBracket + 1);

            openBracked = currentSentence.indexOf('[');
            closedBracket = currentSentence.indexOf(']');

        } while (~openBracked && ~closedBracket)

        generatedString += currentSentence;

        return generatedString;
    }

    public static async setPronouns(template: string, ...members: GuildMember[]) {
        const genderMap = await LanguageAdapter.getUsersGenders(members);
        return LanguageAdapter.generateSentenceData(template, (segment) => {
            const member = members[segment.user];
            const userPronoun = genderMap.get(member.id);
            if (userPronoun === 'male') return segment.choices[0];
            if (userPronoun === 'female') return segment.choices[1];
            if (userPronoun === 'neutral') return segment.choices[2] || 'they';
        });
    }
}