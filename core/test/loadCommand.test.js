const loadCommand = require("../functions/loadCommand");

test("loads a command on the client", () => {
    const lc = loadCommand("../../commands/info", "ping.js");
    expect( lc ).toBe(this.client);
});