# CLAUDE.md

Repo: Franse-taal-in-contextuele-module

## Wat dit is

Een doorverwijzing. De module is opgegaan in TaalHulp (repo antonnoe/taalhulp-fr) op 24-10-2026 (bron: README.md). Deze repo bevat alleen nog doorverwijspagina's en bestanden die oude installaties opruimen.

## Live adres

Niet in de repo vastgelegd. De pagina's verwijzen door naar https://taalhulp-fr.vercel.app/ (rubriekpagina's met een parameter, bijvoorbeeld ?scenario=auto).

## Opbouw

- index.html en 14 pagina's rubriek-*.html (auto, buren, correspondentie, financieel, gezondheid, huishouden, klussen, mairie, op-bezoek, post, shopping, telefoongesprek, werk, wonen): doorverwijspagina's, noindex.
- sw.js: zelfopruimende service worker, verwijdert alle caches en schrijft zichzelf uit, zodat geinstalleerde oude versies niet blijven hangen.
- tts.js en tts-auto.js: oude spraakhulp (tekst naar spraak).
- manifest.webmanifest en icons/: oude installeerbare app.
- README.md en LICENSE.

## Techniek

Statische HTML en JavaScript, geen pakketten, geen build, geen tests. Lettertype Mulish via Google Fonts. In een iframe komt er embed=1 achter de doorverwijzing.

## Externe diensten en namen van omgevingsvariabelen

Geen omgevingsvariabelen. Alleen Google Fonts en de doorverwijzing naar TaalHulp op Vercel.

## Hoe het live gaat

Niet in de repo vastgelegd (geen vercel.json, CNAME of workflow aanwezig).

## Regels en besluiten

- Deze repo verwijst alleen nog door, nieuwe functies horen in TaalHulp (bron: README.md).

Laatst nagelopen: 5 november 2026
