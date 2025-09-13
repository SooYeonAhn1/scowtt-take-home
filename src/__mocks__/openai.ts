const mockCreate = jest.fn();

const mockOpenAI = jest.fn(() => ({
    chat: {
        completions: {
            create: mockCreate,
        },
    },
}));

module.exports = {
    OpenAI: mockOpenAI,
    mockCreate,
};