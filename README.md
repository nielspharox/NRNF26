# NRNF26
No risk no fun 
# WK Pool 2026

Odds-gebaseerde WK-poule. Hoe meer underdog je tipt, hoe meer punten.

## Puntenformule

```
punten = 10.000 / kans (%)
```

Voorbeeld:
- Favoriet op 70% → 143 punten bij goede tip
- Underdog op 15% → 667 punten bij goede tip
- Grote verrassing op 5% → 2000 punten bij goede tip

---

## Live zetten via GitHub Pages

### Stap 1 — Repository aanmaken
1. Ga naar [github.com](https://github.com) en maak een nieuw **public** repository aan.
2. Geef het een naam, bijv. `wk-pool-2026`.

### Stap 2 — Bestanden uploaden
Upload `index.html` naar de root van de repository.

### Stap 3 — GitHub Pages inschakelen
1. Ga naar **Settings → Pages**
2. Onder *Source*: kies **Deploy from a branch**
3. Branch: `main`, map: `/ (root)`
4. Klik **Save**

Na ~1 minuut is je pool live op:
```
https://<jouw-gebruikersnaam>.github.io/wk-pool-2026/
```

Stuur die link naar je collega's.

---

## Odds API instellen

1. Maak een gratis account op [the-odds-api.com](https://the-odds-api.com)
2. Kopieer je API-sleutel (gratis tier = 500 requests/maand)
3. Open de pool → tabblad **Wedstrijden**
4. Plak je key en klik **Odds ophalen**

De odds worden automatisch omgezet naar impliciete kansen (%) en de punten worden berekend.

> **Let op**: The Odds API toont WK-wedstrijden pas als ze in hun systeem zijn (doorgaans een paar weken voor het toernooi). Tot die tijd kun je wedstrijden handmatig toevoegen.

---

## Gebruik

| Rol | Actie |
|-----|-------|
| Beheerder | Odds ophalen / Wedstrijden toevoegen / Uitslagen invullen |
| Deelnemers | Naam invullen → Tips opslaan |
| Iedereen | Scorebord bekijken |

Alle data wordt opgeslagen in `localStorage` van de browser van de beheerder. Tips van deelnemers worden opgeslagen in hun eigen browser.

### Tips van collega's verzamelen
Omdat GitHub Pages geen server-side opslag heeft, zijn er twee opties:

**Optie A (simpel):** Deelnemers sturen hun tips naar jou, jij voert ze in als beheerder.

**Optie B (zelfstandig):** Voeg een gratis backend toe via [Supabase](https://supabase.com) of [Firebase](https://firebase.google.com) — vraag gerust om hulp hierbij.

---

## Lokaal testen

Open `index.html` direct in je browser. Geen server nodig.
