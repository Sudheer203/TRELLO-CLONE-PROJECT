# Trello Clone (Vanilla JS + Trello REST API)

A Trello-style board built with HTML, CSS and vanilla JavaScript. All data comes from the real Trello REST API.

## Features
- Board: load from Trello, refresh, loading spinner, error messages
- Lists: display, create, rename, delete (archives the list; Trello's API has no permanent list delete)
- Cards: display, create, rename, archive
- Checklists: display, create, rename, delete, progress bar, multiple per card
- Checkitems: display, create, edit, check, uncheck, delete, live progress
- Confirmation before delete/archive, duplicate-submit protection, toast notifications

## Tech stack
HTML5, CSS3, JavaScript (ES6+, fetch + async/await), Trello REST API, Font Awesome, Google Fonts (Inter).

## Folder structure
```
trello-clone/
├── index.html
├── css/        style.css  board.css  lists.css  cards.css
├── js/         config.js  api.js  app.js  board.js  lists.js  cards.js  checklists.js  checkitems.js
│               config.example.js   (safe template to commit)
├── assets/     images/  icons/
├── .gitignore  (ignores js/config.js)
└── README.md
```
Script load order in `index.html`: config -> api -> app -> board -> lists -> cards -> checklists -> checkitems.

## 1. Get your API key
1. Sign in to Trello, open https://trello.com/app-key
2. Create a Power-Up if asked (any name), then copy the **API Key**.
3. Under "Allowed origins" add `http://127.0.0.1:5500` (the VS Code Live Server address).

## 2. Generate your API token
Open this URL in your browser (replace `YOUR_API_KEY`) and click **Allow**:

`https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=TrelloClone&key=YOUR_API_KEY`

Copy the token shown. It needs `read,write` scope.

## 3. Get your Board ID
Open your board in Trello, copy its URL (`https://trello.com/b/<shortLink>/name`), and open
`https://trello.com/b/<shortLink>.json` — the `"id"` value at the top is the Board ID.
(The short link in the URL also works as the Board ID.)

## 4. Configure
Edit `js/config.js`:
```js
const CONFIG = {
  API_KEY: "your key",
  API_TOKEN: "your token",
  BOARD_ID: "your board id",
  API_BASE_URL: "https://api.trello.com/1",
};
```
`js/config.js` is in `.gitignore`, so credentials are never pushed to GitHub. Commit only `config.example.js`.

## 5. Run in VS Code
1. Open the `trello-clone` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` -> **Open with Live Server**.

## 6. Test every feature
| Area | Steps | Expected |
|---|---|---|
| Board | Open the page, click Refresh | Title, lists and cards appear; toast on refresh |
| Errors | Put a wrong key/token/board ID, reload | Red error message explains the problem |
| List | Add another list / pencil / trash | Created, renamed, removed (after confirm) |
| Card | Add a card / pencil / archive icon | Created in the right list, renamed, archived |
| Checklist | Click a card -> Add checklist / pencil / trash | Created, renamed, deleted; multiple allowed |
| Checkitem | Add an item, tick/untick, pencil, trash | Progress bar and card badge update each time |
| Empty input | Submit a blank name | "This field cannot be empty." |

Verify each change in Trello itself by refreshing the real board.
