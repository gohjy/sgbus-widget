# SGBusWidget Changelog

## v0.2.0
- Added legend for colors and line styles.
- Added `arrivelah-instance` and `request-timeout` attributes for `<sgbus-widget>` for more customisation.
- Made debug logging opt-in via loading the `sgbus-widget.js` script with a `?debug` query param.
- Improved `MutationObserver` handling.
- Various other small improvements.

## v0.1.8
- Fixed an issue where if fetching data failed, the text "Stop data could not be found" would be prepended to the stop container every time the data failed. If this happened enough times, there would be a chain of such messages that would not be cleared, even if the fetch subsequently succeeded.

## v0.1.7
- Fixed an issue where when no stops were included in config, or when no stops with non-empty `svcs` arrays were included, SGBusWidget would throw an error and leave a "Loading data" message onscreen.
- Fixed an issue where if the user's device time zone had minute or second offsets from UTC, the SGT time would also (wrongly) include those offsets.

## v0.1.6
- Clean up code (no changes to functionality or usage)

## v0.1.5
- Use `console.debug` instead of `console.log` and add clear indication that the console message is from SGBusWidget

## v0.1.4
- Fixed an issue where the font size of the stop name headers would temporarily appear bigger before the stylesheet loaded.

## v0.1.3
- Fixed an issue with the script causing the custom element not to update every 30 seconds as expected.
- Updated several links around the repo to the new links (forgot to do previously).
- Add 30 sec reload documentation to docs.

## v0.1.2
Fixed an issue with the script causing the styling not to work. 
Add some proper credits in the README.
And change the README title from sgbus-widget to SGBusWidget.

## v0.1.1
Fix a bug that caused the last update text to be part of the grid. One breaking change that breaks stuff for approximately zero people, since this was released less than an hour after v0.1.0.

## v0.1.0
Initial release.
