function v2Message(container) {
    return {
        flags: 32768,
        components: [container]
    };
}

function ephemeralReply(content) {
    return {
        content,
        flags: 64
    };
}

module.exports = { v2Message, ephemeralReply };
