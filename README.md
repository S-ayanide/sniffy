# Sniffy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Sizing

| Name | Description |
| ---- | ----------- |
| <a id="size/XS" href="#size/XS">`size/XS`</a> | Denotes a PR that changes 0-9 lines. |
| <a id="size/S" href="#size/S">`size/S`</a> | Denotes a PR that changes 10-29 lines. |
| <a id="size/M" href="#size/M">`size/M`</a> | Denotes a PR that changes 30-99 lines. |
| <a id="size/L" href="#size/L">`size/L`</a> | Denotes a PR that changes 100-499 lines. |
| <a id="size/XL" href="#size/XL">`size/XL`</a> | Denotes a PR that changes 500-999 lines. |
| <a id="size/XXL" href="#size/XXL">`size/XXL`</a> | Denotes a PR that changes 1000+ lines. |

Sniffy calculates the size of a PR as

```
total additions + total deletions - (all generated¹ file additions/deletions)
```

¹ A generated file is either one of the standard generated files as defined in [noqcks/generated](https://github.com/noqcks/generated/blob/master/lib/generated.js) or defined with `linguist-generated=true` in a `.gitattributes` file. See [Customizing how changed files appear on GitHub](https://help.github.com/articles/customizing-how-changed-files-appear-on-github/) for more information.

## Setup

This GitHub app runs on probot. It makes it very easy to create new GitHub apps.
If you want to run or develop pull-request-size just follow the commands
below. hit localhost:3000, and follow the probot instructions.

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## License

[MIT](LICENSE) © 2018 Benji Visser <benny@noqcks.io>
