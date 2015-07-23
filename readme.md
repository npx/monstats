# MonStats BETA - Compare Puzzle and Dragons Monsters!

In order to compare the growth per level for several monsters, I implemented
this simple and mobile friendly tool.

## Credit
Images and Monster data fetched from https://www.padherder.com/ without
permission.

Images and Puzzle and Dragons are from GungHo Online Entertainment, Inc. used without permission.

## In case you want to develop...
The JavaScript sources are located in `src/js/`.

Do not make changes to `index.html` and make changes to `index.dev.html`
instead.

You can use the `npm http-server` to serve the root of this repository.

Lastly, `grunt build` does all the minification and cache busting for you,
which will also replace `index.html` which is hosted on GitHub pages.

## TODO
A lot can be done to improve the general UX.

* ~~store monster data in local storage (and offer to refetch after a while)~~
* ~~refactor codebase into nice services~~
* keep track of adding/deleting series to keep colors consistent
* offer more elaborate search
* speed up page load times by ~~minifying~~ and reducing used libraries
