const emoji = require('@miq4d/canvas-with-discord-content');

module.exports = async (ctx, message, x, y) => {
    return await emoji.fillTextWithTwemoji(ctx, message, x, y);
};
