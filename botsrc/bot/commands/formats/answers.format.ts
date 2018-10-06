export type answers = {
    [questionName: string]: {
        questionPrompt: string,
        reactionPrompt?: string,
        answer: string
    }
};

export type applicationResponse = {
    answers: answers,
    status: string
};