import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { Message, ChannelLogsQueryOptions, TextChannel, User } from "discord.js";
import * as thesaurus from 'thesaurus';

class ThesaurusCommand extends Command {

    commonDict: { [word: string]: boolean };
    punctDict: { [puntuation: string]: boolean };

    constructor(client: CommandoClient) {
        const commandName = 'thesaurus';
        super(client, {
            name: commandName,
            group: 'memes',
            memberName: 'memes:thesaurus',
            description: 'thesaurusize the last sentence from chat!',
            examples: [
                `${client.commandPrefix}${commandName}`
            ],
            guildOnly: true
        });

        this.commonDict = {
            "the": true,
            "of": true,
            "and": true,
            "a": true,
            "to": true,
            "in": true,
            "is": true,
            "you": true,
            "that": true,
            "it": true,
            "he": true,
            "was": true,
            "for": true,
            "on": true,
            "are": true,
            "as": true,
            "with": true,
            "his": true,
            "they": true,
            "I": true,
            "at": true,
            "be": true,
            "this": true,
            "have": true,
            "from": true,
            "or": true,
            "one": true,
            "had": true,
            "by": true,
            "word": true,
            "but": true,
            "not": true,
            "what": true,
            "all": true,
            "were": true,
            "we": true,
            "when": true,
            "your": true,
            "can": true,
            "said": true,
            "there": true,
            "use": true,
            "an": true,
            "each": true,
            "which": true,
            "she": true,
            "do": true,
            "how": true,
            "their": true,
            "if": true,
            "will": true,
            "up": true,
            "about": true,
            "out": true,
            "many": true,
            "then": true,
            "them": true,
            "these": true,
            "so": true,
            "some": true,
            "her": true,
            "would": true,
            "make": true,
            "like": true,
            "him": true,
            "into": true,
            "time": true,
            "has": true,
            "look": true,
            "two": true,
            "more": true,
            "go": true,
            "see": true,
            "no": true,
            "way": true,
            "could": true,
            "my": true,
            "than": true,
            "been": true,
            "call": true,
            "who": true,
            "its": true,
            "now": true,
            "did": true,
            "get": true,
            "come": true,
            "made": true,
            "may": true,
            "part": true,
            "i": true,
            "me": true,
        };

        this.punctDict = {
            '!': true,
            '.': true,
            ',': true,
            ':': true,
            '`': true,
            '\'': true,
            '"': true,
        }
    }

    async getLastContentMessage(channelContext: TextChannel, author: User) {
        let foundTextMessage = true;
        let lastMessage: Message;
        do {
            const query: ChannelLogsQueryOptions = {
                before: (lastMessage) ? lastMessage.id : undefined
            };
            const messages = await channelContext.fetchMessages(query);
            const messagesArray = messages.array();
            for (const previousMessage of messagesArray) {
                lastMessage = previousMessage;
                if (
                    !previousMessage.content.startsWith(`${this.client.commandPrefix}${this.name}`) &&
                    previousMessage.author.id !== this.client.user.id
                    // previousMessage.author.id !== author.id
                ) {
                    foundTextMessage = false;
                    break;
                }

            }
        } while (foundTextMessage);

        return lastMessage;

    }

    thesaurizeThis(sentence: string) {
        const words = sentence.split(' ');

        let newSentence = '';
        words.forEach((word) => {
            const punctWord = this.objectifyPunctuation(word);
            const wordOptions: string[] = thesaurus.find(punctWord.word.toLocaleLowerCase());
            if(this.commonDict[word]) newSentence += word + ' ';
            else if(wordOptions.length > 0) newSentence += `${wordOptions[Math.floor(Math.random()*wordOptions.length)]}${punctWord.punctuation} `;
            else newSentence += word + ' ';
        });

        return newSentence;
    }

    objectifyPunctuation(word: string) {
        const splitWord = word.split('');
        let punctuationArray = [];
        for (var letterIdx = splitWord.length - 1; letterIdx > 0; letterIdx--) {
            const letter = splitWord[letterIdx];
            if (this.punctDict[letter]) punctuationArray.push(letter);
            else break;
        }

        const punctuation = punctuationArray.reverse().join('');
        return {
            word: word.slice(0, letterIdx + 1),
            punctuation: punctuation
        }
    }


    async run(message: CommandMessage): Promise<Message | Message[]> {
        const channelContext = message.channel as TextChannel;
        const lastContentMessage = await this.getLastContentMessage(channelContext, message.author);
        const newSentence = this.thesaurizeThis(lastContentMessage.content);
        return channelContext.send(newSentence);
    }
}

module.exports = ThesaurusCommand;