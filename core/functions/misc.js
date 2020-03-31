String.prototype.toTitleCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};