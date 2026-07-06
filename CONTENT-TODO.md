# Content to finalize — Camron Finlay Baseball

The site is LIVE and fully functional with real photos. To make it 100% accurate and turn on the live features, provide:

## From Ryan / the family
1. **Real stats** — replace the starter numbers in `data/stats.json` (AVG, HR, RBI, SB) and the home-run log with Camron's actual figures.
2. **More action photos** (optional, high-impact) — a batting/pitching/fielding action shot at high resolution would make an even stronger hero. Drop files in `assets/photos/` and swap in `index.html` / hero background.
3. **Highlight video** — a Hudl or YouTube link to embed in the Highlights section.

## To turn on the 3 live features
4. **Home-run ticker (parent-updatable):** create a Google Sheet with rows like `homeRuns,14` and `hr,13,2-run shot vs rival`; publish to web as CSV; paste the CSV URL into `HR_SHEET_CSV_URL` in `js/main.js`. Then Ryan just edits the sheet to update the count.
5. **Outlook calendar sync:** create a "Camron Baseball" calendar in Outlook, publish it, and paste the public `.ics` URL into `ICS_FEED_URL` in `js/main.js`. Games added in Outlook then appear automatically.
6. **Recruiter form:** create a free key at https://web3forms.com for **ryanfinlay13@gmail.com**, paste it into `WEB3FORMS_ACCESS_KEY` in `js/main.js`. Submissions then email straight to Ryan.

## Domain
7. Purchase **camronfinlaybaseball.com**, then tell Gio — he'll add the CNAME and point DNS so the site lives at the custom domain.

## Confirm
- Bats: **Switch** · Throws: **Right** (confirmed)
- Positions: 1B / 3B / SS / P / OF (confirmed)
- 5'5", 160 lbs, L'Anse Creuse Middle School Central (confirmed)
