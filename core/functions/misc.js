String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

String.prototype.decodeEntities = function() {
    const translateRe = /&(nbsp|amp|quot|lt|gt);/g;
    const translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return this.replace(translateRe, (match, entity) => {
        return translate[entity];
    }).replace(/&#(\d+);/gi, (match, numStr) => {
        const num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
};