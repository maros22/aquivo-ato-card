# Aquivo ATO Card · 1.2.0

A Home Assistant dashboard card for Aquivo ATO, using Zigbee2MQTT. Shows water reserve, pump, float switch, water added today and last top-up. Bundled offline translations: **Slovenčina · Čeština · Magyar · Polski · English · Deutsch · Français**.

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=maros22&repository=aquivo-ato-card&category=plugin)

## 1.2.0

Adds the supervised float/cable alarm (firmware 1.2.0, two 4k7 resistors required). Older firmware remains supported by this card.

Last top-up now refreshes automatically when Recorder receives a pump stop later than the live state. The card retries briefly without a page reload, shows a waiting state instead of the previous run, then allows 75 seconds for volume reports to settle. No firmware update or device command is required.

## HACS

1. Open HACS → menu → **Custom repositories**.
2. Add `https://github.com/maros22/aquivo-ato-card`, category **Dashboard**.
3. Download **Aquivo ATO Card**, reload the browser, and add a custom card:

```yaml
type: custom:aquivo-ato-card
language: auto
```

`auto` follows the HASS user’s language. The editor also offers `sk`, `cs`, `hu`, `pl`, `en`, `de`, `fr`. Unsupported languages fall back to English. Custom names remain unchanged. A single ATO is selected automatically; select one in the editor when there are several.

Resource, if HACS does not add it automatically: `/hacsfiles/aquivo-ato-card/aquivo-ato-card.js`, **JavaScript module**. HACS manages card updates. This is a **custom repository**; inclusion in the default catalog requires separate HACS approval. [Official custom repository guide](https://www.hacs.dev/docs/faq/custom_repositories/).

## Local installation

Download `aquivo-ato-card.js` from Releases or the ATO web interface. Copy to `/config/www/` (or `/homeassistant/www/`) and add `/local/aquivo-ato-card.js?v=1.2.0` as a JavaScript module in Settings → Dashboards → menu → Resources. Reload and use the YAML above. The ZIP also contains the optional `aquivo_ato` helper integration and its guide. Use only one resource: when switching to HACS, remove the old resource entry to avoid loading the card twice. Keep the dashboard, device and entities to preserve history.

## Slovenčina

V HACS otvor menu → Vlastné repozitáre. Pridaj adresu tohto repozitára ako **Dashboard**, stiahni Aquivo ATO Card a obnov prehliadač. Pridaj kartu podľa YAML vyššie. `language: auto` preberá jazyk HASS; `language: sk` vynúti slovenčinu. Jazyk vyberieš aj v editore. Bez HACS skopíruj JS do `www` a pridaj uvedený `/local/…` zdroj ako Modul JavaScriptu. Zmena jazyka nemení režim ani nastavenia dopúšťača.

## Čeština

V HACS otevři menu → Vlastní repozitáře. Přidej adresu tohoto repozitáře jako **Dashboard**, stáhni Aquivo ATO Card a obnov prohlížeč. Přidej kartu podle YAML výše. `language: auto` přebírá jazyk HASS; `language: cs` vynutí češtinu. Jazyk vybereš také v editoru. Bez HACS zkopíruj JS do `www` a přidej uvedený `/local/…` zdroj jako Modul JavaScriptu. Změna jazyka nemění režim ani nastavení dopouštěče.

## Magyar

A HACS menüjében nyisd meg az Egyéni tárolók pontot. Add hozzá a tároló címét **Dashboard** típussal, töltsd le az Aquivo ATO Card kártyát, és frissítsd a böngészőt. Használd a fenti YAML-t. A `language: auto` a HASS nyelvét követi, a `language: hu` magyarra állítja. A nyelv a szerkesztőben is választható. HACS nélkül másold a JS-t a `www` mappába, és add hozzá a fenti `/local/…` címet JavaScript-modulként. A nyelvváltás nem módosítja az eszköz beállításait vagy üzemmódját.

## Polski

W HACS otwórz menu → Własne repozytoria. Dodaj adres repozytorium jako **Dashboard**, pobierz Aquivo ATO Card i odśwież przeglądarkę. Dodaj kartę według powyższego YAML. `language: auto` używa języka HASS, a `language: pl` ustawia polski. Język można wybrać w edytorze. Bez HACS skopiuj JS do `www` i dodaj powyższy `/local/…` adres jako moduł JavaScript. Zmiana języka nie zmienia ustawień ani trybu urządzenia.

## English

Follow the HACS or local steps above. Use `language: en` to force English or `language: auto` to follow HASS. Language can also be selected in the visual editor. Changing it never sends a device command or alters top-up mode, calibration or history.

## Deutsch

In HACS Menü → Benutzerdefinierte Repositories öffnen. Die Repository-Adresse als **Dashboard** hinzufügen, Aquivo ATO Card herunterladen und Browser neu laden. Karte mit obigem YAML hinzufügen. `language: auto` folgt HASS; `language: de` wählt Deutsch. Die Sprache ist auch im Editor wählbar. Ohne HACS die JS-Datei nach `www` kopieren und obige `/local/…`-Adresse als JavaScript-Modul hinzufügen. Ein Sprachwechsel ändert keine Geräteeinstellungen und keinen Betriebsmodus.

## Français

Dans HACS, ouvrez le menu → Dépôts personnalisés. Ajoutez l’adresse du dépôt comme **Dashboard**, téléchargez Aquivo ATO Card et rechargez le navigateur. Utilisez le YAML ci-dessus. `language: auto` suit HASS ; `language: fr` impose le français. La langue se choisit aussi dans l’éditeur. Sans HACS, copiez le JS dans `www` et ajoutez l’adresse `/local/…` ci-dessus comme module JavaScript. Le changement de langue ne modifie ni réglages ni mode de l’appareil.

## Device and history

Pair **Aquivo / AQUIVO-ATO-ZB** through Zigbee2MQTT. The web link follows the current DHCP address through read-only endpoints 70–72. Older firmware may need interview and reconfiguration of the existing device. A fallback web URL is available in the editor.

“Added today” uses HASS history since local midnight. The firmware’s protective 24-hour budget is separate. Volumes are calibration estimates, not reservoir level measurements. Installing the card never starts the pump or bypasses protections. Keep existing entities to preserve Recorder history.

Firmware and signed OTA: [aquivo-ato-updates](https://github.com/maros22/aquivo-ato-updates). Card and firmware updates are separate. Public downloads contain no signing key or Wi-Fi/MQTT credentials.
