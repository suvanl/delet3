<img src="https://i.imgur.com/kFI3pc6.png" height="110">

---

**Branches.**

- Currently, the main development branch is [localisation](https://github.com/suvanl/delet3/tree/localisation)

- The [l10n_localisation2](https://github.com/suvanl/delet3/tree/l10n_localisation2) branch should not be directly worked on - it is reserved for changes made by the Crowdin integration when new translations are added. Pull requests will automatically be created by the integration to merge these changes into the **localisation** branch

- Changes from the **l10n_localisation2** branch are never directly merged into the [master](https://github.com/suvanl/delet3/tree/master) branch


**Message Strings.**
- As delet<sup>3</sup> has been set up to be localised, message strings won't directly be visible in code

- In some cases, comments will show what a localised string says in English

- If you'd like to see the content of a message string, you can refer to the `core/locales/en-GB.json` file, which is the base locale file