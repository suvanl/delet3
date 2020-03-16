const loadCommand = require("../functions/loadCommand");

test("loadCommand returns the client", () => {
    const lc = loadCommand("../../commands/info", "ping.js");
    expect( lc ).toBe(this.client);
});