<img src="https://i.imgur.com/USWDXgZ.png" height="110">

---

This project is still in **alpha**. New features are still being introduced. delet<sup>3</sup> isn't ready for release yet, so you may come across some imperfections.

---

🌳 **Branches**

- Currently, the main development branch is [dev](https://github.com/suvanl/delet3/tree/dev)

- The [l10n_dev](https://github.com/suvanl/delet3/tree/l10n_dev) branch is used by the Crowdin integration to commit changes when translations are updated. Pull requests will automatically be created by the integration to merge these changes into the dev branch

- The master branch is the most stable, whereas the dev branch will have the latest features


💬 **Message Strings**
- As delet<sup>3</sup> supports localisation, message strings won't directly be visible in code

- In some cases, comments will show what a localised string says in English

- If you'd like to see the content of a message string, you can refer to the `core/locales/en-GB.json` file, which is the base locale file

 ⭐️ **Custom Emojis**

Currently, custom emojis are referenced using hardcoded IDs, which are server-specific. Configuring custom emoji IDs will be made much simpler in a future release, to support dynamic emoji IDs.

## Installing delet<sup>3</sup>

**Prerequisites:**
- [Node.js](https://nodejs.org/en/) (v16.9.0 or above)

**Instructions:**
1. Clone or download this repository.
2. Rename the `.env.example` file in the project root to `.env`, and enter the required data. See `.github/guides/setup.md` for instructions.
3. Run `npm install` to install all required modules. Use the `--production` flag if you want to skip devDependencies.
4. Run `npm start` to start the bot.

## Translations [![Crowdin](https://badges.crowdin.net/delet/localized.svg)](https://crowdin.com/project/delet)
delet<sup>3</sup> has multi-locale support! To start contributing translations, please follow the [translation guide](https://gist.github.com/suvanl/d349831795a0a70de58ba08791dcb539) to see how to access the Crowdin project.

**Translators**

delet3's wonderful translators:
- 🇳🇱 Dutch (Nederlands) - vaelinalsorna
- 🇩🇪 German (Deutsch) - [@PeachyTree](https://github.com/PeachyTree)
- 🇳🇴 Norwegian (Norsk) - [@nitramleo](https://github.com/nitramleo)