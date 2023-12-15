# Nothing To Abstract

A simple sandbox server creation and eval Discord bot. No bloat.

# Features

- Evaluate JavaScript code as a function or directly, using prefixed, slash, modal, or context menu commands
- Utility functions like `get()` to fetch HTTP data, `cp()` to execute shell commands, and `button()` to create quick
  components.
- Add guest users with durations to use the bot
- Create sandboxed servers owned by the bot
- Smart error logging

# Installing

To begin using and self-hosting the bot, follow these steps:

## Prerequisites

- Node.js 16.11.0 or later
- Yarn classic (1.22.19)
- A Discord application and bot

## Setup

Once you've cloned the repository from GitHub, install the required Node dependencies.

```sh
yarn
```

Copy the `.env.example` file to a new `.env` file and fill out the environment variables listed inside.

```sh
cp .env.example .env
```

Compile the bot with tsc. Leave this terminal tab open while developing the bot. In production, you can use `yarn build`
instead.

```sh
# Development (watch mode)
yarn build:dev

# Production
yarn build
```

Finally, you can run the bot using nodemon in development or pm2 in production.

```sh
# Development
yarn dev

# Production
pm2 start dist/src/index.js

# Or, just using node
yarn start
```

# Commands

Most slash commands have a `hide` option. If this is set to true, the reply will be ephemeral.

<!-- import d, {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MentionableSelectMenuBuilder,
  type Message,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  type ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputStyle,
} from "discord.js";

import pkg from "../../package.json" assert { type: "json" };
import { botGuests, client, env, logger } from "../index.js";
import { cp, scp } from "./evalUtils/cp.js";
import { prepareInteractions } from "./evalUtils/createInteractions.js";
import { prepareHttp } from "./evalUtils/http.js"; -->

## Eval

> [!WARNING]  
> This command is dangerous and can be used to execute malicious code by bad actors. Ensure that you only give bot
> access (through bot owners and guests) to trusted individuals.
>
> Nothing To Abstract **does not** attempt to hide tokens/secrets or prevent malicious code from being executed.
>
> If running in a privileged environment, please note that your entire system can be wiped in one command. Nothing To
> Abstract is not liable for any damages caused.

> [!NOTE]  
> All eval commands include helpful variables you can access directly.
>
> - Imported from `discord.js` - `d` (default export), `ActionRowBuilder`, `AttachmentBuilder`, `ButtonBuilder`,
>   `ButtonStyle`, `ChannelSelectMenuBuilder`, `EmbedBuilder`, `MentionableSelectMenuBuilder`,
>   `MessageContextMenuCommandInteraction`, `ModalBuilder`, `RoleSelectMenuBuilder`, `StringSelectMenuBuilder`,
>   `TextInputStyle`
> - `package.json` - `pkg`
> - Imported from index file - `botGuests`, `client`, `env`, `logger`
> - Utility functions - `cp`, `scp`, `button`, `menu`, `connect`, `get`, `del`, `head`, `options`, `patch`, `post`,
>   `put`, `trace`

### `/eval script [type] [ansi]`

Evaluates JavaScript code.

- `type?: string` - Whether to wrap the code in a function or not, and if it should automatically return in the
  function. Defaults to "Default".
- `ansi?: boolean` - Whether to format the reply codeblock with `ansi` (true) or `js` (false). Defaults to false.

### `/eval modal [type] [ansi]`

Evaluates JavaScript code that's been given in a modal.

- `type?: string` - Whether to wrap the code in a function or not, and if it should automatically return in the
  function. Defaults to "Default".
- `ansi?: boolean` - Whether to format the reply codeblock with `ansi` (true) or `js` (false). Defaults to false.

### `Evaluate` (context menu)

Evaluates JavaScript code that's been given in a message.

All of the message content, except for the start of a command, will be included in the code.

### `>eval` (`>ev`)

Evaluates JavaScript code directly without any wrapping.

Use `>eval -a` if you want to format the reply codeblock with `ansi` instead of `js`.

### `>feval` (`>fev`)

Evaluates JavaScript code wrapped in an async function.

Use `>eval -a` if you want to format the reply codeblock with `ansi` instead of `js`.

### `>freval` (`>frev`)

Evaluates JavaScript code wrapped in an async function and automatically return.

Use `>eval -a` if you want to format the reply codeblock with `ansi` instead of `js`.

## Guests

> [!WARNING]  
> Guest users are treated as bot owners and have access to all commands, including eval commands. Ensure that you only
> give guest access to individuals you trust and to set a sensible duration. Nothing To Abstract is not liable for any
> damages caused.

> [!NOTE]  
> All guests are reset upon session end, which is when the bot's process exits (including restarts).

### `/guest add <user> [expires]`

Adds a guest user to the bot and treats the user as a bot owner for the duration specified.

- `user: user` - The user to add as a guest.
- `expires: string` - How long the user should be a guest for. Can be formatted like "1d12h" Defaults to session end.

### `/guest remove <user>`

Removes a guest user to the bot and immediately revoke their access to all commands.

- `user: user` - The user to remove as a guest.

### `/guest list`

Lists all active guest users and their remaining duration.

### `/guest clear`

Clears all active guest users and immediately revokes their access to all commands.

## Sandbox

### `/sandbox [name] [template]`

Creates a sandbox server owned by the bot.

- `name?: string` - What the server should be named. Defaults to a randomly-generated phrase.
- `template?: string` - A template url or code to use when creating the server. Defaults to
  https://discord.new/WjsDtfwPsxbU.

## Utility

### `/ping`

Returns the bot's latency and uptime.

### `/invite`

Returns an invite link for the bot.

### `/restart`

Exits the process of the bot. If the bot is running in a process manager like pm2, it should automatically restart.

### `/stats`

Returns general statistics and information about the bot, such as server, member, and channel count plus cache sizes.

# Utility functions in eval

You can use these utility functions in all eval commands.

## `get|head|post|put|del|connect|options|trace|patch(path: string, body?: BodyInit, headers?: HeadersInit)`

Fetches data from a URL. If only a path without URL is given, a request will be made to the Discord API with the bot's
token. In this case, `:guild`, `:channel`, `:message`, `:interaction`, `:me`, `:bot` will be auto-filled with their
corresponding IDs. Returns a JSON body, otherwise the body text, otherwise the `Response`.

- `path: string` - The URL or path (for Discord API) to fetch data from.
- `body?: BodyInit` - The body to send with the request.
- `headers?: HeadersInit` - The headers to send with the request.

## `cp(...args: string[])`

Spawns a child process and executes the command. Returns values from stdout and stderr. For coloured output (like
`neofetch`), the `-a` flag is useful to format the reply codeblock with `ansi` instead of `js`.

- `...args: string[]` - The command to execute (1st arg) and its arguments (2nd+ args).

## `scp(args: string)`

Identical to `cp()`, but splits the arguments by spaces.

- `args: string` - The command to execute and its arguments, like how you would normally type it in a shell.

## `button|menu()`

Creates a test button or string select menu and sends it to the channel. Returns the `Message`.

# Contributing & Support

If you need support with the bot, feel free to [join our Discord server](https://bsr.gg/).

If you'd like to contribute to the bot, please review our [code of conduct](CODE_OF_CONDUCT.md) first. If you have a bug
report, feature request, please [open an issue](https://github.com/GodderE2D/Nothing-To-Abstract/issues). If you're
interested in fixing a bug or adding a new feature, please
[open a pull request](https://github.com/GodderE2D/Nothing-To-Abstract/pulls).

If you'd like to report a security vulnerability or otherwise want to contact me, please email me at
[goddere2d@bsr.gg](mailto:goddere2d@bsr.gg) or [godderseesyou@gmail.com](mailto:godderseesyou@gmail.com).

## PR Guidelines

- Please follow the [conventional commits specification](https://www.conventionalcommits.org/en/v1.0.0/) where possible
  (you may also use `docs`, `chore` or other headers).
- Please use `yarn test` to ensure TypeScript, ESLint, and Prettier checks pass.
- Please do not include out-of-scope changes in a PR, instead open a separate PR for those changes.

# License

Nothing To Abstract is licensed under the
[Apache License 2.0](https://github.com/GodderE2D/Nothing-To-Abstract/blob/main/LICENSE).
