import { CommandoClient } from "discord.js-commando";

const bootstrapBot = (client: CommandoClient) => {
    client.user.setActivity(`cutey christmasy movies | ${client.commandPrefix}help`, { type: 'PLAYING' })
    console.log(`${client.user.tag} is now online!`);
};

export const readyEvents = (client: CommandoClient) => {
    client.on('ready', () => {

        // add all events happening here
        bootstrapBot(client);
    });
};