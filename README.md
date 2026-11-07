# Aquivo ATO Card · 1.0.2

Karta pre dopúšťač Aquivo ATO a Home Assistant. Zobrazuje zásobník, plavák, pumpu, dopustené dnes a posledné dopúšťanie. Komunikuje cez Zigbee2MQTT.

## HACS

1. HACS → menu → Vlastné repozitáre.
2. Pridaj `https://github.com/maros22/aquivo-ato-card`, kategória **Dashboard**.
3. Stiahni Aquivo ATO Card a obnov prehliadač.
4. Pridaj kartu do dashboardu:

```yaml
type: custom:aquivo-ato-card
name: Dopúšťanie
```

Pri jednom ATO sa zariadenie vyberie automaticky. Pri viacerých ho vyber v editore. Zdroj HACS je `/hacsfiles/aquivo-ato-card/aquivo-ato-card.js`, typ Modul JavaScriptu; ak ho HACS nepridá sám, pridaj ho v Nastavenia → Ovládacie panely → Zdroje.

Pri prechode z ručnej inštalácie odstráň starý JavaScript zdroj tejto karty, aby sa nenačítala dvakrát. Existujúcu kartu v dashboarde možno zachovať.

## Bez HACS

Stiahni JavaScript z webu zariadenia alebo rozbaľ ZIP. Súbor `aquivo-ato-card.js` skopíruj do `/config/www/` a pridaj `/local/aquivo-ato-card.js?v=1.0.2` ako Modul JavaScriptu. Obnov prehliadač. ZIP obsahuje aj pomocnú integráciu; pri nej postupuj podľa priloženého návodu a nepoužívaj druhý JavaScript zdroj súčasne.

Odkaz na web sleduje aktuálnu DHCP adresu ATO. Pri prechode zo starého firmvéru obnov interview a konfiguráciu zariadenia v Zigbee2MQTT, aby pribudli endpointy 70–72. Náhradnú adresu pre starší firmvér možno zadať v editore.

## Objem a ochrany

Dopustené dnes sa počíta z histórie HASS od miestnej polnoci. Ochranný limit firmvéru má samostatné 24-hodinové obdobie. Objemy sú odhad podľa kalibrácie, nie meranie hladiny. Karta nezapína pumpu pri inštalácii ani neobchádza ochrany ATO. Zmeny zásobníka a potvrdenie alarmu vyžadujú SERVICE.

Firmvér a aktualizácie: https://github.com/maros22/aquivo-ato-updates . Kartu, návod a aktualizácie možno stiahnuť bez kľúča výrobcu.

## Prechod zo staršej karty

V existujúcej karte uprav iba typ na `custom:aquivo-ato-card`. Nemaž zariadenie ani jeho entity; história je naviazaná na ne. Používaj iba jeden JavaScript zdroj novej karty. Zariadenie po zmene názvu modelu obnov cez interview a prekonfigurovanie v Zigbee2MQTT, bez odstraňovania alebo nového párovania.

MQTT používa témy `aquivo/ato-<MAC>/…`. V Homey prekopíruj nové Topics z webu ATO do existujúceho MQTT zariadenia, aby zostali zachované jeho väzby a Flows.
