# Nothing To Abstract

A classic yet simple Discord eval bot using discord.js

## Setup

Ensure you have your Discord bot token and a bot owner user ID (plus an optional custom prefix) in an `.env` file like this:

```
DISCORD_TOKEN="your_token_here"
BOT_OWNER="your_user_id_here"
PREFIX="void " # optional
```

Then run the bot with:

```sh
yarn start
```

## Usage

In any Discord channel, type `void eval <code>` to evaluate the code.

You'll have access to `client`, `message`, `Discord`, and `package` (package.json import) in your eval. Anything else can be imported like this: `require("node:fs")`.

Optionally, you can wrap your code in code brackets (triple backticks) for your convenience. You can only use `js` as the language or no language in this case.

Anything executed in the code will be in a function and in JS strict mode. This means that simply inputting `1` will not return `1`, but rather `undefined`. You'll have to do `return 1` instead.
