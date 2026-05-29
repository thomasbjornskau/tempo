# Løpefart

Et lite, åpent verktøy der løpere legger inn én tid og ser hvordan den står seg
gjennom hele løperlivet – på tvers av alder, kjønn, distanse og prestasjonsnivå.

[https://thomasbjornskau.github.io/tempo/](https://thomasbjornskau.github.io/tempo/)

![Løpefart](skjermbilde.png)

## Hva det gjør

- Velg distanse (5 km, 10 km, halvmaraton, maraton), legg inn tid (MM:SS eller
  TT:MM:SS), kjønn og alder (18–80).
- Regner ut **tempo** (min/km) og **hastighet** (km/t).
- Tegner en kurve over hvordan tiden ville sett ut for hvert alderstrinn, med din
  egen tid markert som punkt, og støttekurver for ulike prestasjonsnivå.
- Veksle mellom tempo og hastighet. Hold musa over grafen for å lese av hvert år.
- Regner tiden om til hva den ville vært på de andre distansene, ved å bevare
  age-grade (samme relative prestasjonsnivå).

## Slik kjører du den

Appen er én `index.html` uten byggesteg. Den må serveres over http(s) – ikke
åpnes direkte fra fil, fordi datafilen lastes som ES-modul.

**På nett (GitHub Pages):**
Legg `index.html` og `loperdata.js` i rota av repoet, push, og slå på Pages
under *Settings → Pages → Deploy from a branch → main → / (root)*.

**Lokalt:**
```bash
python3 -m http.server
# åpne http://localhost:8000
```

## Datagrunnlag

Modellen bygger på age-grading-prinsippet fra World Masters Athletics: en
verdensrekord-ekvivalent ved toppalder, justert med en aldersfaktor per
alder/kjønn. Verdenseliten (p99) faller ut av rekord-ekvivalenten; lavere nivåer
skaleres som en prosentandel av rekorden (age-graded %), i tråd med de
internasjonale age-grading-kategoriene.

**All data og logikk ligger i `loperdata.js`** – ett sted å justere standardtider,
aldersfaktor og nivåterskler.

### Forbehold

Aldersfaktoren er en kalibrert tilnærming til formen på WMA-kurvene, ikke de
offisielle faktorene tall for tall. Nivåene er en modell, ikke en folketelling:
percentilene er forankret i løperpopulasjonen (folk som faktisk stiller til
start), ikke i hele befolkningen.

For full troverdighet kan de offisielle WMA-faktorene (fritt tilgjengelige fra
bl.a. Alan Jones / Howard Grubb) legges inn som oppslagstabell i `loperdata.js`
uten å røre resten av koden.

## Teknisk

React 18 og Babel hentes fra CDN ved sidelast. Ingen npm, ingen bygging.
Vil du ha raskere oppstart senere, kan prosjektet flyttes til Vite.

## Lisens

MIT – se `LICENSE`.
