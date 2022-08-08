String.prototype.toTitleCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

String.prototype.truncate = function(n) {
    return (this.length > n) ? this.substring(0, n - 1) + "..." : this;
};

Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};