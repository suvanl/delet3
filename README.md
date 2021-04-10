<img src="https://i.imgur.com/8Nn68vR.png" height="110">

---

This project is still in **alpha**. New features are still being introduced. delet<sup>3</sup> isn't ready for release yet, so you may come across some imperfections.

---

**Branches**

- Currently, the main development branch is [localisation](https://github.com/suvanl/delet3/tree/localisation)

- The [l10n_localisation2](https://github.com/suvanl/delet3/tree/l10n_localisation2) branch should not be directly worked on - it is reserved for changes made by the Crowdin integration when new translations are added. Pull requests will automatically be created by the integration to merge these changes into the **localisation** branch

- Changes from the **l10n_localisation2** branch are never directly merged into the [master](https://github.com/suvanl/delet3/tree/master) branch

- The **master** branch is the most stable, whereas the **localisation** branch will have the latest features.


**Message Strings**
- As delet<sup>3</sup> has been set up to be localised, message strings won't directly be visible in code

- In some cases, comments will show what a localised string says in English

- If you'd like to see the content of a message string, you can refer to the `core/locales/en-GB.json` file, which is the base locale file

## Installing delet<sup>3</sup>

**Prerequisites:**
- [Node.js](https://nodejs.org/en/) (v14.15.5 LTS is recommended)


**Instructions:**
1. Clone or download this repository.
2. Rename the `.env.example` file in the project root to `.env`, and enter the required data. See `.github/guides/setup.md` for instructions.
3. Run `npm install` to install all required modules. Use the `--production` flag if you want to skip devDependencies.
4. Run `node index.js` to start the bot.

## Translations
delet<sup>3</sup> has multi-locale support! To start contributing translations, please follow the [translation guide](https://gist.github.com/suvanl/d349831795a0a70de58ba08791dcb539) to see how to access the Crowdin project.
