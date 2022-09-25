module.exports = {
    settings: {
        "repl-secret": {
            title: "Secret key",
            type: "string",
            required: true,
            tooltip: 'This key need for connect to REPL server',
            description: "For security reason not share it"
        }
    }
}
