## Please Ask before submitting a new theme
* We are currently not looking to add any new themes. See https://github.com/Jacse/themes-for-brackets/issues/85
* If you feel that we are missing a theme or would like to add one please open an issue before you spend time creating a new theme.

###We reccommend the following brackets extensions to aid in debugging:

* https://github.com/cfjedimaster/brackets-csslint
* https://github.com/dsbonev/whitespace-normalizer
* https://github.com/mikaeljorhult/brackets-todo (optional)
* https://github.com/DennisKehrig/brackets-show-whitespace (optional)
* https://github.com/couzteau/brackets-git-info (optional)

###Coding Guidelines:

* Please use 4 spaces instead of tabs.
* Make sure there is a new line at the end of the file.
* Install csslint extension and make sure there are no errors.
* Themes should be all lower case and use a - instead of a space for example: `theme-name.css`

###How to use csslint

1. Clone the git repository `https://github.com/Jacse/themes-for-brackets.git`
2. In brackets select open folder and open the themes-for-brackets folder that contains this `CONTRIBUTING.md` and the `.csslintrc` file
3. With `.csslintrc` in the root folder and the extension installed in brackets it will now work!

###Creating your own theme is easy.
1. Have a look at Pawel's bare Brackets theme [here](https://github.com/trimek/BearTheme/blob/master/BearTheme.css).
2. Copy it, customize it, and add it to the custom themes folder
  3. On Windows it is located at `C:\Users\[USERNAME]\AppData\Roaming\Brackets\custom themes`
  4. On OS X it is located at `~/Library/Application Support/Brackets/custom themes`
  5. On Linux it is located at `/home/[USERNAME]/.config/Brackets/custom themes` 
