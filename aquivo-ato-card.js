// Shared, offline-only translation engine. API names and device data are never translated.
function createAquivoLocale(catalog) {
  const languages = {sk:'Slovenčina',cs:'Čeština',hu:'Magyar',pl:'Polski',en:'English',de:'Deutsch',fr:'Français'};
  const columns = {sk:-1,en:0,cs:1,hu:2,pl:3,de:4,fr:5};
  const normalize = value => String(value || '').toLowerCase().replace('_','-').split('-')[0];
  const supported = value => Object.hasOwn(languages, normalize(value));
  const resolve = (...preferences) => preferences.map(normalize).find(supported) || 'en';
  function t(language, source, values = {}) {
    source = String(source ?? '');
    const lang = resolve(language), row = catalog[source];
    const text = lang === 'sk' ? source : row?.[columns[lang]] || row?.[0] || source;
    return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match,key) => Object.hasOwn(values,key) ? String(values[key]) : match);
  }
  // Only explicitly marked static UI text is touched. Inputs, code, URLs,
  // user names, SSIDs, topics and values retain their original content.
  function localize(root, language) {
    for (const node of root.querySelectorAll('[data-i18n]')) node.textContent = t(language,node.getAttribute('data-i18n'));
    for (const node of root.querySelectorAll('[data-i18n-placeholder]')) node.setAttribute('placeholder',t(language,node.getAttribute('data-i18n-placeholder')));
    for (const node of root.querySelectorAll('[data-i18n-label]')) node.setAttribute('aria-label',t(language,node.getAttribute('data-i18n-label')));
  }
  return {languages, supported, resolve, t, localize};
}

const CardLocale=createAquivoLocale({"Nepodporovaný jazyk.":["Unsupported language.","Nepodporovaný jazyk.","Nem támogatott nyelv.","Nieobsługiwany język.","Nicht unterstützte Sprache.","Langue non prise en charge."],"Odpoveď neprišla. Stav over na zariadení.":["No response received. Check the device state.","Odpověď nepřišla. Stav ověř na zařízení.","Nem érkezett válasz. Ellenőrizd az eszköz állapotát.","Nie otrzymano odpowiedzi. Sprawdź stan urządzenia.","Keine Antwort erhalten. Gerätezustand prüfen.","Aucune réponse reçue. Vérifiez l’état de l’appareil."],"Jazyk":["Language","Jazyk","Nyelv","Język","Sprache","Langue"],"Automaticky":["Automatic","Automaticky","Automatikus","Automatycznie","Automatisch","Automatique"],"Podľa jazyka HASS":["Follow HASS language","Podle jazyka HASS","A HASS nyelve szerint","Zgodnie z językiem HASS","Sprache von HASS verwenden","Selon la langue de HASS"],"Akvárium":["Aquarium","Akvárium","Akvárium","Akwarium","Aquarium","Aquarium"],"Načítavam":["Loading","Načítám","Betöltés","Wczytywanie","Wird geladen","Chargement"],"Čakám":["Waiting","Čekám","Várakozás","Oczekiwanie","Warten","En attente"],"Nastavenie":["Setup","Nastavení","Beállítás","Konfiguracja","Einrichtung","Configuration"],"Offline":["Offline","Offline","Nem elérhető","Offline","Offline","Hors ligne"],"Online":["Online","Online","Elérhető","Online","Online","En ligne"],"Alarm":["Alarm","Alarm","Riasztás","Alarm","Alarm","Alarme"],"Pumpa":["Pump","Čerpadlo","Szivattyú","Pompa","Pumpe","Pompe"],"Neznámy":["Unknown","Neznámý","Ismeretlen","Nieznany","Unbekannt","Inconnu"],"Vypnutá":["Off","Vypnuté","Kikapcsolva","Wyłączona","Aus","Arrêtée"],"Beží":["Running","Běží","Működik","Pracuje","Läuft","En marche"],"Dopúšťa":["Topping up","Dopouští","Utántöltés","Uzupełnia","Füllt nach","Remplissage"],"Zapnúť AUTO":["Enable AUTO","Zapnout AUTO","AUTO bekapcsolása","Włącz AUTO","AUTO einschalten","Activer AUTO"],"AUTO je zapnuté":["AUTO is enabled","AUTO je zapnuté","Az AUTO be van kapcsolva","AUTO jest włączone","AUTO ist eingeschaltet","AUTO est activé"],"SERVICE / zastaviť":["SERVICE / stop","SERVICE / zastavit","SERVICE / leállítás","SERVICE / zatrzymaj","SERVICE / stoppen","SERVICE / arrêter"],"Potvrdiť alarm":["Acknowledge alarm","Potvrdit alarm","Riasztás nyugtázása","Potwierdź alarm","Alarm bestätigen","Acquitter l’alarme"],"zostáva v zásobníku":["remaining in reservoir","zbývá v zásobníku","a tartályban maradt","pozostało w zbiorniku","im Vorratsbehälter verbleibend","restant dans le réservoir"],"Dopustené dnes":["Added today","Dopuštěno dnes","Ma utántöltve","Uzupełniono dzisiaj","Heute nachgefüllt","Ajouté aujourd’hui"],"Posledné dopúšťanie":["Last top-up","Poslední dopouštění","Utolsó utántöltés","Ostatnie uzupełnianie","Letzte Nachfüllung","Dernier remplissage"],"Odhad podľa kalibrácie. Dopúšťanie riadi lokálny plavák.":["Estimate based on calibration. A local float switch controls top-ups.","Odhad podle kalibrace. Dopouštění řídí místní plovák.","Kalibráláson alapuló becslés. Az utántöltést a helyi úszókapcsoló vezérli.","Szacunek na podstawie kalibracji. Uzupełnianiem steruje lokalny pływak.","Schätzung anhand der Kalibrierung. Der lokale Schwimmerschalter steuert das Nachfüllen.","Estimation selon l’étalonnage. Le flotteur local commande le remplissage."],"Doplniť zásobník ↗":["Refill reservoir ↗","Doplnit zásobník ↗","Tartály feltöltése ↗","Uzupełnij zbiornik ↗","Vorratsbehälter auffüllen ↗","Remplir le réservoir ↗"],"IP adresu webu nastav v úprave karty.":["Set the fallback web address in the card editor.","Záložní adresu webu nastav v editoru karty.","A tartalék webcímet a kártyaszerkesztőben állíthatod be.","Ustaw zapasowy adres strony w edytorze karty.","Die Ersatz-Webadresse im Karteneditor festlegen.","Définissez l’adresse web de secours dans l’éditeur de carte."],"Reset počítadla":["Reset counter","Reset počítadla","Számláló nullázása","Wyzeruj licznik","Zähler zurücksetzen","Réinitialiser le compteur"],"Karta {version}":["Card {version}","Karta {version}","Kártya {version}","Karta {version}","Karte {version}","Carte {version}"],"Doplnil si vodu?":["Did you refill the water?","Doplnil jsi vodu?","Feltöltötted a vizet?","Czy uzupełniono wodę?","Wasser aufgefüllt?","Avez-vous ajouté de l’eau ?"],"Zadaj skutočný celkový zostatok po doplnení. Tento údaj nastav odhadom alebo podľa objemu nádoby.":["Enter the actual total remaining after refilling. Estimate it or use the container volume.","Zadej skutečný celkový zůstatek po doplnění. Použij odhad nebo objem nádoby.","Add meg a feltöltés utáni teljes vízmennyiséget becslés vagy a tartály térfogata alapján.","Podaj rzeczywistą całkowitą ilość wody po uzupełnieniu. Oszacuj ją lub użyj pojemności zbiornika.","Den tatsächlichen Gesamtvorrat nach dem Auffüllen eingeben. Schätzen oder das Behältervolumen verwenden.","Saisissez le volume total réel après remplissage, estimé ou basé sur la capacité du récipient."],"Voda v zásobníku (ml)":["Water in reservoir (ml)","Voda v zásobníku (ml)","Víz a tartályban (ml)","Woda w zbiorniku (ml)","Wasser im Vorratsbehälter (ml)","Eau dans le réservoir (ml)"],"Uložiť skutočný zostatok":["Save actual remaining volume","Uložit skutečný zůstatek","Tényleges mennyiség mentése","Zapisz rzeczywistą ilość","Tatsächlichen Vorrat speichern","Enregistrer le volume réel"],"Vyplniť plný objem":["Fill in full capacity","Vyplnit plný objem","Teljes kapacitás megadása","Wpisz pełną pojemność","Volle Kapazität eintragen","Saisir la pleine capacité"],"Späť":["Back","Zpět","Vissza","Wstecz","Zurück","Retour"],"Reset počítadla limitu?":["Reset the limit counter?","Reset počítadla limitu?","Nullázod a korlátszámlálót?","Wyzerować licznik limitu?","Limitzähler zurücksetzen?","Réinitialiser le compteur de limite ?"],"Vynuluje spotrebu ochranného 24-hodinového obdobia a otvorí nový rozpočet dopúšťania. Zostatok v bandaske, kalibrácia a celková spotreba zostanú zachované. AUTO sa samo nezapne.":["Clears usage for the protective 24-hour period and starts a new top-up allowance. Remaining water, calibration and lifetime usage are preserved. AUTO will not turn on by itself.","Vynuluje spotřebu ochranného 24hodinového období a otevře nový limit. Zůstatek vody, kalibrace a celková spotřeba se zachovají. AUTO se samo nezapne.","Nullázza a védelmi 24 órás időszak fogyasztását, és új keretet nyit. A vízkészlet, a kalibrálás és az összes fogyasztás megmarad. Az AUTO nem kapcsol be magától.","Zeruje zużycie w ochronnym okresie 24 godzin i rozpoczyna nowy limit. Zapas wody, kalibracja i zużycie całkowite zostają zachowane. AUTO nie włączy się samo.","Setzt den Verbrauch des 24-Stunden-Schutzzeitraums zurück und beginnt ein neues Nachfüllbudget. Wasservorrat, Kalibrierung und Gesamtverbrauch bleiben erhalten. AUTO schaltet sich nicht selbst ein.","Remet à zéro la consommation de la période de protection de 24 heures et ouvre un nouveau quota. La réserve, l’étalonnage et le total sont conservés. AUTO ne s’active pas seul."],"Vynulovať počítadlo limitu":["Reset limit counter","Vynulovat počítadlo limitu","Korlátszámláló nullázása","Wyzeruj licznik limitu","Limitzähler zurücksetzen","Réinitialiser le compteur de limite"],"Neplatné zariadenie dopúšťača.":["Invalid top-up device.","Neplatné zařízení dopouštěče.","Érvénytelen utántöltő eszköz.","Nieprawidłowe urządzenie uzupełniające.","Ungültiges Nachfüllgerät.","Appareil de remplissage non valide."],"Zadaj platnú HTTP alebo HTTPS adresu webu ATO.":["Enter a valid HTTP or HTTPS address for the ATO web interface.","Zadej platnou HTTP nebo HTTPS adresu webu ATO.","Adj meg érvényes HTTP vagy HTTPS címet az ATO webfelületéhez.","Podaj prawidłowy adres HTTP lub HTTPS strony ATO.","Eine gültige HTTP- oder HTTPS-Adresse der ATO-Weboberfläche eingeben.","Saisissez une adresse HTTP ou HTTPS valide pour l’interface ATO."],"Nepodarilo sa načítať entity. Skús obnoviť stránku.":["Could not load entities. Reload the page.","Nepodařilo se načíst entity. Obnov stránku.","Az entitások nem tölthetők be. Frissítsd az oldalt.","Nie udało się wczytać encji. Odśwież stronę.","Entitäten konnten nicht geladen werden. Seite neu laden.","Impossible de charger les entités. Rechargez la page."],"Načítavam dopúšťač…":["Loading top-up device…","Načítám dopouštěč…","Utántöltő betöltése…","Wczytywanie urządzenia…","Nachfüllgerät wird geladen…","Chargement de l’appareil…"],"V nastavení karty vyber dopúšťač Aquivo.":["Select the Aquivo top-up device in the card settings.","V nastavení karty vyber dopouštěč Aquivo.","Válaszd ki az Aquivo utántöltőt a kártya beállításaiban.","Wybierz urządzenie Aquivo w ustawieniach karty.","Das Aquivo-Nachfüllgerät in den Karteneinstellungen auswählen.","Sélectionnez l’appareil Aquivo dans les réglages de la carte."],"Entity dopúšťača sa ešte nenačítali. Skontroluj Zigbee2MQTT.":["Device entities have not loaded yet. Check Zigbee2MQTT.","Entity dopouštěče se ještě nenačetly. Zkontroluj Zigbee2MQTT.","Az eszköz entitásai még nem töltődtek be. Ellenőrizd a Zigbee2MQTT-t.","Encje urządzenia nie zostały jeszcze wczytane. Sprawdź Zigbee2MQTT.","Geräteentitäten sind noch nicht geladen. Zigbee2MQTT prüfen.","Les entités ne sont pas encore chargées. Vérifiez Zigbee2MQTT."],"História nedostupná":["History unavailable","Historie nedostupná","Az előzmények nem érhetők el","Historia niedostępna","Verlauf nicht verfügbar","Historique indisponible"],"Od polnoci podľa časového pásma Home Assistanta":["Since midnight in the Home Assistant time zone","Od půlnoci v časovém pásmu Home Assistanta","Éjféltől a Home Assistant időzónája szerint","Od północy w strefie czasowej Home Assistant","Seit Mitternacht in der Zeitzone von Home Assistant","Depuis minuit dans le fuseau de Home Assistant"],"Načítavam dnešnú spotrebu":["Loading today’s usage","Načítám dnešní spotřebu","Mai fogyasztás betöltése","Wczytywanie dzisiejszego zużycia","Heutiger Verbrauch wird geladen","Chargement de la consommation du jour"],"Dnešný údaj nie je dostupný v histórii":["Today’s value is unavailable in history","Dnešní údaj není v historii dostupný","A mai adat nem érhető el az előzményekben","Dzisiejsza wartość jest niedostępna w historii","Heutiger Wert ist im Verlauf nicht verfügbar","La valeur du jour n’est pas disponible dans l’historique"],"Pôvodný časový alarm. Potvrď alarm.":["Legacy time alarm. Acknowledge the alarm.","Původní časový alarm. Potvrď alarm.","Korábbi időriasztás. Nyugtázd a riasztást.","Poprzedni alarm czasu. Potwierdź alarm.","Älterer Zeitalarm. Alarm bestätigen.","Ancienne alarme de durée. Acquittez l’alarme."],"Zásobník je podľa odhadu prázdny.":["The reservoir is estimated to be empty.","Zásobník je podle odhadu prázdný.","A tartály a becslés szerint üres.","Zbiornik jest według szacunku pusty.","Der Vorratsbehälter ist laut Schätzung leer.","Le réservoir est estimé vide."],"Dosiahnutý limit dopúšťania. Skontroluj hladinu a počítadlo.":["Top-up limit reached. Check the water level and counter.","Dosažen limit dopouštění. Zkontroluj hladinu a počítadlo.","Elérted az utántöltési korlátot. Ellenőrizd a vízszintet és a számlálót.","Osiągnięto limit uzupełniania. Sprawdź poziom wody i licznik.","Nachfülllimit erreicht. Wasserstand und Zähler prüfen.","Limite de remplissage atteinte. Vérifiez le niveau et le compteur."],"Chyba ukladania nastavení. Výstup je zablokovaný.":["Settings storage error. Output is blocked.","Chyba ukládání nastavení. Výstup je zablokován.","Beállításmentési hiba. A kimenet le van tiltva.","Błąd zapisu ustawień. Wyjście jest zablokowane.","Fehler beim Speichern. Ausgang ist gesperrt.","Erreur de sauvegarde des réglages. La sortie est bloquée."],"Dosiahnutý limit jedného dopúšťania. Skontroluj hladinu a plavák.":["Single top-up limit reached. Check the water level and float switch.","Dosažen limit jednoho dopouštění. Zkontroluj hladinu a plovák.","Elérted az egyszeri utántöltési korlátot. Ellenőrizd a vízszintet és az úszókapcsolót.","Osiągnięto limit jednego uzupełniania. Sprawdź poziom wody i pływak.","Limit für einen Nachfüllvorgang erreicht. Wasserstand und Schwimmer prüfen.","Limite d’un remplissage atteinte. Vérifiez le niveau et le flotteur."],"Čerpanie sa bezpečnostne zastavilo. Skontroluj hladinu a potvrď alarm.":["Pumping stopped for safety. Check the water level and acknowledge the alarm.","Čerpání se bezpečnostně zastavilo. Zkontroluj hladinu a potvrď alarm.","A szivattyúzás biztonsági okból leállt. Ellenőrizd a vízszintet, és nyugtázd a riasztást.","Pompowanie zatrzymano ze względów bezpieczeństwa. Sprawdź poziom wody i potwierdź alarm.","Pumpen aus Sicherheitsgründen gestoppt. Wasserstand prüfen und Alarm bestätigen.","Pompage arrêté par sécurité. Vérifiez le niveau et acquittez l’alarme."],"Zariadenie je nedostupné. SERVICE sa môžeš pokúsiť odoslať.":["Device unavailable. You can still try sending SERVICE.","Zařízení je nedostupné. SERVICE se můžeš pokusit odeslat.","Az eszköz nem érhető el. A SERVICE parancsot megpróbálhatod elküldeni.","Urządzenie niedostępne. Możesz spróbować wysłać SERVICE.","Gerät nicht erreichbar. SERVICE kann trotzdem gesendet werden.","Appareil indisponible. Vous pouvez tenter d’envoyer SERVICE."],"Dopúšťanie blokuje alarm. Podrobnosti skontroluj na zariadení.":["An alarm is blocking top-ups. Check the device for details.","Dopouštění blokuje alarm. Podrobnosti zkontroluj na zařízení.","Egy riasztás blokkolja az utántöltést. A részleteket az eszközön ellenőrizd.","Alarm blokuje uzupełnianie. Sprawdź szczegóły na urządzeniu.","Ein Alarm blockiert das Nachfüllen. Details am Gerät prüfen.","Une alarme bloque le remplissage. Consultez les détails sur l’appareil."],"Najprv ulož kalibráciu pumpy.":["Save the pump calibration first.","Nejprve ulož kalibraci čerpadla.","Előbb mentsd a szivattyú kalibrálását.","Najpierw zapisz kalibrację pompy.","Zuerst die Pumpenkalibrierung speichern.","Enregistrez d’abord l’étalonnage de la pompe."],"Ulož alebo zruš neukončenú kalibráciu.":["Save or discard the unfinished calibration.","Ulož nebo zruš nedokončenou kalibraci.","Mentsd vagy vesd el a befejezetlen kalibrálást.","Zapisz lub odrzuć niedokończoną kalibrację.","Unvollständige Kalibrierung speichern oder verwerfen.","Enregistrez ou annulez l’étalonnage inachevé."],"AUTO zatiaľ nie je pripravené. Podrobnosti sú na webe ATO.":["AUTO is not ready yet. See the ATO web interface for details.","AUTO zatím není připravené. Podrobnosti jsou na webu ATO.","Az AUTO még nem kész. Részletek az ATO webfelületén.","AUTO nie jest jeszcze gotowe. Szczegóły na stronie ATO.","AUTO ist noch nicht bereit. Details in der ATO-Weboberfläche.","AUTO n’est pas encore prêt. Consultez l’interface web ATO."],"Web ATO ↗ {host}":["ATO web ↗ {host}","Web ATO ↗ {host}","ATO web ↗ {host}","Strona ATO ↗ {host}","ATO-Web ↗ {host}","Web ATO ↗ {host}"],"približne {volume} ml":["approximately {volume} ml","přibližně {volume} ml","körülbelül {volume} ml","około {volume} ml","etwa {volume} ml","environ {volume} ml"],"objem neznámy":["volume unknown","objem neznámý","ismeretlen térfogat","objętość nieznana","Volumen unbekannt","volume inconnu"],"História nie je dostupná":["History is unavailable","Historie není dostupná","Az előzmények nem érhetők el","Historia jest niedostępna","Verlauf ist nicht verfügbar","L’historique n’est pas disponible"],"Bez dokončeného dopúšťania v posledných 7 dňoch":["No completed top-up in the last 7 days","Žádné dokončené dopouštění za posledních 7 dní","Nem volt befejezett utántöltés az elmúlt 7 napban","Brak ukończonego uzupełniania w ciągu ostatnich 7 dni","Kein abgeschlossener Nachfüllvorgang in den letzten 7 Tagen","Aucun remplissage terminé durant les 7 derniers jours"],"Čas ukončenia podľa histórie HASS. Objem je odhad podľa kalibrácie, nie meranie prietoku.":["End time from HASS history. Volume is estimated from calibration, not measured by a flow meter.","Čas ukončení podle historie HASS. Objem je odhad podle kalibrace, ne měření průtoku.","Befejezési idő a HASS előzményeiből. A térfogat kalibráláson alapuló becslés, nem átfolyásmérés.","Czas zakończenia z historii HASS. Objętość jest szacunkiem z kalibracji, a nie pomiarem przepływu.","Endzeit aus dem HASS-Verlauf. Volumen anhand der Kalibrierung geschätzt, keine Durchflussmessung.","Heure de fin selon l’historique HASS. Volume estimé selon l’étalonnage, sans débitmètre."],"Vyžaduje obnovenie údajov Zigbee zariadenia.":["Refresh the Zigbee device data first.","Nejprve obnov údaje zařízení Zigbee.","Előbb frissítsd a Zigbee eszköz adatait.","Najpierw odśwież dane urządzenia Zigbee.","Zuerst die Zigbee-Gerätedaten aktualisieren.","Actualisez d’abord les données Zigbee de l’appareil."],"Najprv zvoľ SERVICE.":["Select SERVICE first.","Nejprve zvol SERVICE.","Előbb válaszd a SERVICE módot.","Najpierw wybierz SERVICE.","Zuerst SERVICE wählen.","Sélectionnez d’abord SERVICE."],"Vynuluje iba počítadlo ochranného limitu.":["Resets only the protective limit counter.","Vynuluje pouze počítadlo ochranného limitu.","Csak a védelmi korlát számlálóját nullázza.","Zeruje tylko licznik limitu ochronnego.","Setzt nur den Zähler des Schutzlimits zurück.","Réinitialise uniquement le compteur de limite de protection."],"Stav plaváka neznámy":["Float switch state unknown","Stav plováku neznámý","Az úszókapcsoló állapota ismeretlen","Stan pływaka nieznany","Schwimmerzustand unbekannt","État du flotteur inconnu"],"Plavák žiada vodu":["Float switch requests water","Plovák žádá vodu","Az úszókapcsoló vizet kér","Pływak żąda wody","Schwimmer fordert Wasser an","Le flotteur demande de l’eau"],"Hladina je v poriadku":["Water level is OK","Hladina je v pořádku","A vízszint rendben van","Poziom wody jest prawidłowy","Wasserstand ist in Ordnung","Niveau d’eau correct"],"Reset vyžaduje SERVICE a vypnutú pumpu.":["Reset requires SERVICE and a stopped pump.","Reset vyžaduje SERVICE a vypnuté čerpadlo.","A nullázáshoz SERVICE mód és álló szivattyú szükséges.","Reset wymaga SERVICE i wyłączonej pompy.","Zurücksetzen erfordert SERVICE und eine ausgeschaltete Pumpe.","La réinitialisation nécessite SERVICE et une pompe arrêtée."],"Odosielam príkaz…":["Sending command…","Odesílám příkaz…","Parancs küldése…","Wysyłanie polecenia…","Befehl wird gesendet…","Envoi de la commande…"],"Príkaz bol odoslaný.":["Command sent.","Příkaz byl odeslán.","Parancs elküldve.","Polecenie wysłane.","Befehl gesendet.","Commande envoyée."],"Čakám na potvrdenie stavu…":["Waiting for state confirmation…","Čekám na potvrzení stavu…","Várakozás az állapot visszaigazolására…","Oczekiwanie na potwierdzenie stanu…","Warten auf Zustandsbestätigung…","En attente de confirmation de l’état…"],"Stav sa nepotvrdil. Skontroluj spojenie so zariadením.":["State was not confirmed. Check the device connection.","Stav se nepotvrdil. Zkontroluj spojení se zařízením.","Az állapot nem lett visszaigazolva. Ellenőrizd az eszköz kapcsolatát.","Stan nie został potwierdzony. Sprawdź połączenie z urządzeniem.","Zustand nicht bestätigt. Verbindung zum Gerät prüfen.","État non confirmé. Vérifiez la connexion à l’appareil."],"Príkaz sa nepodaril.":["Command failed.","Příkaz se nezdařil.","A parancs sikertelen.","Polecenie nie powiodło się.","Befehl fehlgeschlagen.","Échec de la commande."],"Zadaj platný zostatok a ponechaj SERVICE s vypnutou pumpou.":["Enter a valid remaining volume and keep SERVICE with the pump off.","Zadej platný zůstatek a ponech SERVICE s vypnutým čerpadlem.","Adj meg érvényes vízmennyiséget, és hagyd SERVICE módban, álló szivattyúval.","Podaj prawidłową ilość wody i pozostaw SERVICE z wyłączoną pompą.","Gültigen Vorrat eingeben und SERVICE mit ausgeschalteter Pumpe beibehalten.","Saisissez un volume valide et gardez SERVICE avec la pompe arrêtée."],"Nepodarilo sa načítať zariadenia.":["Could not load devices.","Nepodařilo se načíst zařízení.","Az eszközök nem tölthetők be.","Nie udało się wczytać urządzeń.","Geräte konnten nicht geladen werden.","Impossible de charger les appareils."],"Názov karty":["Card name","Název karty","Kártya neve","Nazwa karty","Kartenname","Nom de la carte"],"Dopúšťač":["Top-up device","Dopouštěč","Utántöltő","Urządzenie uzupełniające","Nachfüllgerät","Appareil de remplissage"],"Automaticky (ak je iba jeden)":["Automatic (if only one)","Automaticky (pokud je jen jeden)","Automatikus (ha csak egy van)","Automatycznie (gdy jest tylko jedno)","Automatisch (wenn nur eines vorhanden)","Automatique (s’il n’y en a qu’un)"],"Náhradná adresa webu ATO":["Fallback ATO web address","Záložní adresa webu ATO","Tartalék ATO webcím","Zapasowy adres strony ATO","Ersatzadresse der ATO-Weboberfläche","Adresse web ATO de secours"],"Automaticky zo zariadenia":["Automatically from device","Automaticky ze zařízení","Automatikusan az eszközről","Automatycznie z urządzenia","Automatisch vom Gerät","Automatiquement depuis l’appareil"],"Načítavam zariadenia…":["Loading devices…","Načítám zařízení…","Eszközök betöltése…","Wczytywanie urządzeń…","Geräte werden geladen…","Chargement des appareils…"],"Dopúšťač Aquivo ATO sa ešte nenašiel. Najprv ho pridaj cez Zigbee2MQTT.":["Aquivo ATO has not been found yet. Add it through Zigbee2MQTT first.","Dopouštěč Aquivo ATO zatím nebyl nalezen. Nejprve ho přidej přes Zigbee2MQTT.","Az Aquivo ATO még nem található. Előbb add hozzá a Zigbee2MQTT-n keresztül.","Nie znaleziono jeszcze Aquivo ATO. Najpierw dodaj je przez Zigbee2MQTT.","Aquivo ATO wurde noch nicht gefunden. Zuerst über Zigbee2MQTT hinzufügen.","Aquivo ATO n’a pas encore été trouvé. Ajoutez-le d’abord via Zigbee2MQTT."],"Karta sama nájde entity vybraného dopúšťača. Kalibrácia a ochrany ostávajú vo firmvéri.":["The card finds the selected device’s entities automatically. Calibration and protections stay in the firmware.","Karta sama najde entity vybraného dopouštěče. Kalibrace a ochrany zůstávají ve firmwaru.","A kártya automatikusan megtalálja a kiválasztott eszköz entitásait. A kalibrálás és a védelem a firmware-ben marad.","Karta automatycznie znajduje encje wybranego urządzenia. Kalibracja i zabezpieczenia pozostają w firmware.","Die Karte findet die Entitäten des gewählten Geräts automatisch. Kalibrierung und Schutz bleiben in der Firmware.","La carte trouve automatiquement les entités de l’appareil choisi. L’étalonnage et les protections restent dans le micrologiciel."],"Zadaj platnú HTTP alebo HTTPS adresu.":["Enter a valid HTTP or HTTPS address.","Zadej platnou HTTP nebo HTTPS adresu.","Adj meg érvényes HTTP vagy HTTPS címet.","Podaj prawidłowy adres HTTP lub HTTPS.","Eine gültige HTTP- oder HTTPS-Adresse eingeben.","Saisissez une adresse HTTP ou HTTPS valide."],"Aquivo · Akváriový dopúšťač":["Aquivo · Aquarium top-up","Aquivo · Akvarijní dopouštěč","Aquivo · Akvárium-utántöltő","Aquivo · Dolewka akwariowa","Aquivo · Aquarium-Nachfüllung","Aquivo · Remplissage d’aquarium"],"Zostatok vody, dopúšťanie a bezpečné ovládanie AUTO / SERVICE.":["Water reserve, top-ups and safe AUTO / SERVICE controls.","Zůstatek vody, dopouštění a bezpečné ovládání AUTO / SERVICE.","Vízkészlet, utántöltés és biztonságos AUTO / SERVICE vezérlés.","Zapas wody, uzupełnianie i bezpieczne sterowanie AUTO / SERVICE.","Wasservorrat, Nachfüllen und sichere AUTO-/SERVICE-Steuerung.","Réserve d’eau, remplissage et commandes AUTO / SERVICE sûres."],"Chyba plaváka alebo kábla. Skontroluj zapojenie 4k7 a potvrď alarm.":["Float or cable fault. Check the 4k7 wiring and acknowledge the alarm.","Chyba plováku nebo kabelu. Zkontroluj zapojení 4k7 a potvrď alarm.","Úszó- vagy kábelhiba. Ellenőrizd a 4k7 bekötést, majd nyugtázd a riasztást.","Błąd pływaka lub przewodu. Sprawdź połączenie 4k7 i potwierdź alarm.","Schwimmer- oder Kabelfehler. 4k7-Verdrahtung prüfen und Alarm bestätigen.","Défaut du flotteur ou du câble. Vérifiez le câblage 4k7 et acquittez l’alarme."],"Plavák":["Float switch","Plovák","Úszókapcsoló","Pływak","Schwimmerschalter","Flotteur"],"Chyba plaváka alebo kábla":["Float or cable fault","Chyba plováku nebo kabelu","Úszó- vagy kábelhiba","Błąd pływaka lub przewodu","Schwimmer- oder Kabelfehler","Défaut du flotteur ou du câble"],"Skontroluj kábel a konektor. Po oprave potvrď alarm.":["Check the cable and connector. Acknowledge the alarm after repair.","Zkontroluj kabel a konektor. Po opravě potvrď alarm.","Ellenőrizd a kábelt és a csatlakozót. Javítás után nyugtázd a riasztást.","Sprawdź przewód i złącze. Po naprawie potwierdź alarm.","Kabel und Stecker prüfen. Nach der Reparatur den Alarm bestätigen.","Vérifiez le câble et le connecteur. Après réparation, acquittez l’alarme."],"Kontakt zopnutý":["Contact closed","Kontakt sepnutý","Érintkező zárva","Styk zamknięty","Kontakt geschlossen","Contact fermé"],"Kontakt rozopnutý":["Contact open","Kontakt rozepnutý","Érintkező nyitva","Styk otwarty","Kontakt offen","Contact ouvert"]});
/* Aquivo ATO Card 1.2.1 — local dashboard UI, no external dependencies. */
const VERSION = '1.2.1';
const registryCache = new WeakMap();
const FIELDS = {
  mode: ['binary_output_1', 'Automatické dopúšťanie', 'switch'],
  web_ip_high: ["analog_input_70", "Web IPv4 horná časť", "sensor"],
  web_ip_low: ["analog_input_71", "Web IPv4 dolná časť", "sensor"],
  web_ip_check: ["analog_input_72", "Web IPv4 kontrola", "sensor"],
  percent: ['analog_in_percentage_9', 'Zostatok zásobníka', 'sensor'],
  remaining: ['analog_input_3', 'Zostávajúca voda', 'sensor'],
  daily: ['analog_input_4', 'Spotreba za aktuálne 24 h', 'sensor'],
  total: ['analog_input_5', 'Celková spotreba vody', 'sensor'],
  pump: ['binary_input_10', 'Pumpa beží', 'binary_sensor'],
  low: ['binary_input_11', 'Plavák žiada dopúšťanie', 'binary_sensor'],
  fault: ['binary_input_12', 'Alarm dopúšťača', 'binary_sensor'],
  ready: ['binary_input_13', 'Pripravené na AUTO', 'binary_sensor'],
  calibrating: ['binary_input_14', 'Prebieha kalibrácia', 'binary_sensor'],
  faultCode: ['analog_input_2', 'Kód alarmu', 'sensor'],
  flow: ['analog_input_6', 'Kalibrovaný prietok pumpy', 'sensor'],
  calibration: ['analog_input_7', 'Dĺžka neuloženého merania', 'sensor'],
  dailyLimit: ['analog_output_22', 'Limit dopúšťania za 24 h', 'number'],
  capacity: ['analog_output_20', 'Objem zásobníka', 'number'],
  refill: ['analog_output_21', 'Zostatok po doplnení vody', 'number'],
  clear: ['binary_output_30', 'Potvrdiť alarm', 'switch'],
  reset: ['binary_output_34', 'Reset počítadla limitu', 'switch'],
};
const validState = s => s && !['unknown', 'unavailable'].includes(s.state);
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function webAddress(value) {
  if (!String(value || '').trim()) return '';
  try {
    const raw=String(value).trim();
    const url=new URL(raw.includes('://')?raw:'http://'+raw);
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
function historySamples(rows) {
  return (Array.isArray(rows)?rows:[]).map(r=>({v:r.s??r.state,t:typeof r.lu==='number'?r.lu*1000:Date.parse(r.last_changed??r.last_updated)}))
    .filter(r=>Number.isFinite(r.t)).sort((a,b)=>a.t-b.t);
}
function settledCounter(history,pumpId,totalId,now) {
  const pumps=historySamples(history?.[pumpId]).filter(r=>r.t<=now);
  const totals=historySamples(history?.[totalId]).filter(r=>r.t<=now);
  let active=null,stop=null,previous;
  for(const r of pumps){
    if(r.v==='on'&&previous==='off')active=r.t;
    else if(r.v==='off'&&previous==='on'&&active!==null){stop=r.t;active=null;}
    else if(!['on','off'].includes(r.v)){active=null;stop=null;}
    previous=r.v;
  }
  if(!['on','off'].includes(previous)||previous==='on'&&active===null)return null;
  const pending=active!==null || stop!==null&&now<stop+75000;
  // Freeze at the last completed reporting window. Later stale packets must
  // not rewrite today's sum. An active run is added only after it settles.
  let cutoff=active!==null?active-2000:stop!==null?Math.min(now,stop+75000):now;
  if(pending&&active===null){
    const start=pumps.filter(r=>r.v==='on'&&r.t<stop).at(-1)?.t;
    cutoff=start!==undefined?start-2000:cutoff;
  }
  // Lifetime resets and substantial idle ledger corrections are genuine
  // changes; do not conceal them behind a frozen completed-cycle snapshot.
  if(!pending){
    let previousValue;
    for(const r of totals){const n=Number(r.v);
      if(r.t>cutoff&&Number.isFinite(n)&&(n===0||previousValue!==undefined&&previousValue-n>25))cutoff=now;
      previousValue=Number.isFinite(n)?n:undefined;
    }
  }
  const sample=totals.filter(r=>r.t<=cutoff).at(-1);
  const value=sample&&String(sample.v??'').trim()!==''&&Number.isFinite(Number(sample.v))&&Number(sample.v)>=0?Number(sample.v):null;
  return {value,cutoff,pending,retryAt:active===null&&pending?stop+76000:null};
}
function lastFilling(history, pumpId, totalId, calibrationId, now) {
  const pumps=historySamples(history?.[pumpId]),totals=historySamples(history?.[totalId]);
  const calibration=historySamples(history?.[calibrationId]);
  const at=(rows,t)=>{let found;for(const r of rows){if(r.t>t)break;found=r;}return found;};
  let previous,active=null,last=null;
  for(let i=0;i<pumps.length;i++){
    const sample=pumps[i];
    if(sample.v==='on' && previous==='off')active=sample.t;
    else if(sample.v==='off' && previous==='on' && active!==null){
      const initial=at(calibration,active);
      // A reporting gap or an unknown calibration mode cannot prove a fill.
      const clean=initial?.v==='off' && !calibration.some(r=>r.t>active&&r.t<=sample.t&&r.v!=='off');
      if(clean){
        const next=pumps.slice(i+1).find(r=>r.v==='on');
        // Endpoint clusters are reported independently. Give the final total
        // one SDK refresh (60 s) plus the paced queue, and exclude initial
        // increments that can be delivered just before the pump ON report.
        const end=Math.min(sample.t+75000,now,next?next.t-2000:Infinity);
        const before=at(totals,active-2000),after=at(totals,end);
        const value=r=>r&&r.v!==null&&String(r.v).trim()!==''&&Number.isFinite(Number(r.v))&&Number(r.v)>=0?Number(r.v):null;
        let ml=value(before)!==null&&value(after)!==null?value(after)-value(before):null;
        const segment=[before,...totals.filter(r=>r.t>active-2000&&r.t<=end)].filter(Boolean);
        let peak=value(before);
        for(const row of segment){
          const current=value(row);
          // A completed fill is an endpoint difference, not a sum of updates.
          // Small stale values and the bounded (<=25 ml) reservation settlement
          // may decrease temporarily or permanently. Resets, larger corrections
          // and reporting gaps still invalidate the estimate.
          if(current===null || (peak!==null && peak-current>25))ml=null;
          if(current!==null)peak=Math.max(peak??current,current);
        }
        last={start:active,end:sample.t,ml:ml!==null&&ml>=0?ml:null,pending:now<sample.t+75000&&(!next||now<next.t)};
      }
      active=null;
    } else if(!['on','off'].includes(sample.v))active=null;
    previous=sample.v;
  }
  return last;
}
function calendarWindow(now, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
  const parts = stamp => Object.fromEntries(formatter.formatToParts(new Date(stamp)).filter(p=>p.type!=='literal').map(p=>[p.type, Number(p.value)]));
  const p=parts(now), local=Date.UTC(p.year,p.month-1,p.day);let start=local;
  // Resolve the offset at midnight itself, including 23/25-hour DST days.
  for(let i=0;i<4;i++){const q=parts(start);const represented=Date.UTC(q.year,q.month-1,q.day,q.hour,q.minute,q.second);const shift=represented-local;if(!shift)break;start-=shift;}
  return {key:`${timeZone}|${p.year}-${p.month}-${p.day}`, start:new Date(start).toISOString()};
}
function historyAnchor(rows, start, current, queriedAt) {
  const stamp=v=>typeof v==='number'?v*1000:Date.parse(v);
  const values=(Array.isArray(rows)?rows:[]).filter(s=>{const v=s.s??s.state;return v!==null&&v!==undefined&&String(v).trim()!=='';}).map(s=>({v:Number(s.s??s.state),t:stamp(s.lu??s.last_updated??s.last_changed)}))
    .filter(s=>Number.isFinite(s.v)&&s.v>=0&&Number.isFinite(s.t)).sort((a,b)=>a.t-b.t);
  if(!values.length || (values[0].t>Date.parse(start)+1000 && values[0].v!==0))return null;
  // Include the state visible when the query began, while Recorder catches up.
  if(current!==null && Number.isFinite(current))values.push({v:current,t:queriedAt});
  const base=values[0].v;let previous=base,offset=0;
  for(const sample of values.slice(1)){
    // A reset to zero starts a new lifetime segment. Nonzero corrections
    // remain corrections and must not be counted as additional water.
    if(sample.v===0 && previous>0)offset+=previous;
    previous=sample.v;
  }
  return {base,offset};
}
function devicesFor(registry) {
  return registry.devices.filter(d => d.manufacturer === 'Aquivo' && (d.model_id === 'AQUIVO-ATO-ZB' || /(?:^|[^A-Z0-9])AQUIVO-ATO-ZB(?:$|[^A-Z0-9])/.test(d.model || '')));
}
function mapEntities(registry, deviceId) {
  const entities = registry.entities.filter(e => e.device_id === deviceId && !e.disabled_by);
  const map = {};
  for (const [field, [property, label, domain]] of Object.entries(FIELDS)) {
    const candidates = entities.filter(e => e.entity_id.startsWith(domain + '.'));
    const exact = candidates.filter(e => new RegExp('(?:^|_)' + property + '(?:_|$)').test(e.unique_id || ''));
    const named = candidates.filter(e => normalize(e.original_name) === normalize(label));
    const found = exact.length ? exact : named;
    if (found.length === 1) map[field] = found[0].entity_id;
  }
  return map;
}
async function getRegistry(hass, force = false) {
  const key = hass.connection || hass;
  const cached = registryCache.get(key);
  if (!force && cached && Date.now() - cached.time < 60000) return cached.promise;
  const promise = Promise.all([
    hass.callWS({type: 'config/device_registry/list'}),
    hass.callWS({type: 'config/entity_registry/list'}),
  ]).then(([devices, entities]) => ({devices, entities}));
  registryCache.set(key, {time: Date.now(), promise});
  promise.catch(() => { if (registryCache.get(key)?.promise === promise) registryCache.delete(key); });
  return promise;
}
const ICON = `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 25h44v24a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7Z" fill="currentColor" opacity=".14"/><path d="M10 32c8-8 14 8 22 0s14 8 22 0M10 25h44v24a7 7 0 0 1-7 7H17a7 7 0 0 1-7-7Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M38 14c0 8-12 8-12 0 0-4 6-11 6-11s6 7 6 11Z" fill="currentColor"/><path d="m24 42-5-4v8Zm0 0c5-6 13-6 18 0-5 6-13 6-18 0" fill="currentColor"/><circle cx="37" cy="41" r="1" fill="var(--ha-card-background,var(--card-background-color,#fff))"/></svg>`;

class AquivoAtoCard extends HTMLElement {
  constructor() {
    super(); this.attachShadow({mode: 'open'}); this._map = {}; this._registry = null;
    this._loading = false; this._command = null; this._message = ''; this._lastDraw = '';
    this._todaySerial=0;this._todayKey='';this._todayAnchor=null;this._todayPending=null;this._todayRetryAt=0;
    this._lastFillSerial=0;this._lastFillKey='';this._lastFill=null;this._lastFillPending=null;this._lastFillAt=0;
    this._settledCounter=null;
    this._resetFillTracking();
  }
  static getConfigElement() { return document.createElement('aquivo-ato-card-editor'); }
  static getStubConfig() { return {type: 'custom:aquivo-ato-card'}; }
  getCardSize() { return 8; }
  getGridOptions() { return {columns: 12, rows: 'auto', min_columns: 6}; }
  setConfig(config) {
    if(config.language && config.language!=='auto' && !CardLocale.supported(config.language)) throw new Error(this._t('Nepodporovaný jazyk.'));
    if (config.device_id !== undefined && typeof config.device_id !== 'string') throw new Error(this._t("Neplatné zariadenie dopúšťača."));
    if(config.web_url && !webAddress(config.web_url))throw new Error(this._t("Zadaj platnú HTTP alebo HTTPS adresu webu ATO."));
    clearTimeout(this._lastFillTimer);++this._lastFillSerial;this._lastFillKey='';this._lastFill=null;this._lastFillPending=null;this._lastFillAt=0;this._settledCounter=null;
    this._resetFillTracking();
    this._config = {...config}; this._registryAt = 0; this._lastDraw = '';this._map={};this._todayKey='';this._todayAnchor=null;this._todayPending=null;++this._todaySerial;this._create(); this._resolve(); this._render();
  }
  set hass(hass) { this._hass = hass; this._resolve();this._loadToday();this._loadLastFill();this._render(); }
  connectedCallback() {
    this._create(); this._resolve();
    this._loadLastFill();
    this._poll ||= setInterval(() => { if (document.visibilityState !== 'hidden'){this._resolve(true);this._loadToday();this._loadLastFill();this._render();} }, 60000);
  }
  disconnectedCallback() { clearInterval(this._poll); this._poll = null; clearTimeout(this._commandTimer); this._commandTimer = null; this._command = null;this._todayPending=null;++this._todaySerial;this._lastFillPending=null;clearTimeout(this._lastFillTimer);++this._lastFillSerial;this._resetFillTracking(); }
  async _resolve(force = false) {
    if (!this._hass || !this._config || this._loading || (!force && this._registry && this._registryAt > Date.now() - 60000)) return;
    this._loading = true;
    try {
      const registry = await getRegistry(this._hass, force); this._registry = registry; this._registryAt = Date.now();
      const devices = devicesFor(registry);
      this._deviceId = this._config.device_id || (devices.length === 1 ? devices[0].id : null);
      this._device = devices.find(d => d.id === this._deviceId);
      this._map = this._device ? mapEntities(registry, this._deviceId) : {};
      this._registryError = '';
    } catch { this._registryError = "Nepodarilo sa načítať entity. Skús obnoviť stránku."; }
    finally { this._loading = false;this._loadToday();this._loadLastFill();this._render(); }
  }
  _resetFillTracking() {
    this._fillIdentity='';this._observedPump=null;this._expectedFillStop=0;
    this._fillRetryUntil=0;this._fillRetryStep=0;this._lastFillAwaiting=false;this._lastFillAgain=false;
  }
  _observeFillStop(now) {
    const identity=[this._deviceId,this._map.pump,this._map.total,this._map.calibrating].join('|');
    if(identity!==this._fillIdentity){this._resetFillTracking();this._fillIdentity=identity;}
    const pump=this._state('pump'),state=['on','off'].includes(pump?.state)?pump.state:null;
    // Only a transition observed while connected starts the short Recorder
    // catch-up window. A restored OFF state is not proof of a new run.
    if(this._observedPump==='on'&&state==='off') {
      const stamp=Date.parse(pump.last_changed);
      this._expectedFillStop=Number.isFinite(stamp)?stamp:now;
      this._fillRetryUntil=now+90000;this._fillRetryStep=0;
      this._lastFillAwaiting=true;this._lastFillAt=0;
    }
    this._observedPump=state;
  }
  _scheduleFillRefresh() {
    clearTimeout(this._lastFillTimer);
    const now=Date.now();let retry=this._settledCounter?.retryAt;
    if(this._lastFillAwaiting) {
      if(now<this._fillRetryUntil) {
        const delays=[1500,3000,6000,12000,20000,30000];
        const catchup=Math.min(this._fillRetryUntil,now+delays[Math.min(this._fillRetryStep++,delays.length-1)]);
        retry=retry?Math.min(retry,catchup):catchup;
      } else {
        // Preserve the distinction between an old fill and an unavailable
        // new record. Ordinary one-minute polling can recover later.
        this._lastFillError=true;this._lastFillAt=now-240000;
      }
    }
    if(retry)this._lastFillTimer=setTimeout(()=>this._loadLastFill(true),Math.max(1000,retry-now));
  }
  async _loadLastFill(force=false) {
    if(!this.isConnected || !this._hass || !this._map.pump || !this._map.total || !this._map.calibrating)return;
    const now=Date.now(),pump=this._state('pump');this._observeFillStop(now);
    const key=[this._deviceId,this._map.pump,pump?.state,pump?.last_changed,pump?.state==='off'?this._state('total')?.state:''].join('|');
    if(this._lastFillPending){if(force)this._lastFillAgain=true;return;}
    if(!force && key===this._lastFillKey && now-this._lastFillAt<300000)return;
    this._lastFillKey=key;this._lastFillAt=now;
    const token={serial:++this._lastFillSerial,device:this._deviceId};this._lastFillPending=token;
    const pumpId=this._map.pump,totalId=this._map.total,calibrationId=this._map.calibrating;let timer;
    try {
      const history=await Promise.race([
        this._hass.callWS({type:'history/history_during_period',start_time:new Date(now-7*86400000).toISOString(),end_time:new Date(now).toISOString(),entity_ids:[pumpId,totalId,calibrationId],include_start_time_state:true,minimal_response:true,no_attributes:true}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('history timeout')),8000);}),
      ]);
      if(token.serial===this._lastFillSerial && token.device===this._deviceId){
        const evaluatedAt=Date.now();
        this._lastFill=lastFilling(history,pumpId,totalId,calibrationId,evaluatedAt);
        this._settledCounter=settledCounter(history,pumpId,totalId,evaluatedAt);this._lastFillError=false;
        // Recorder may lag behind the live OFF entity. An old successful
        // query must not suppress retries for five minutes. Calibration is
        // still excluded by lastFilling, even when its OFF is recorded.
        const stopRecorded=this._expectedFillStop&&historySamples(history?.[pumpId]).some(r=>r.v==='off'&&Math.abs(r.t-this._expectedFillStop)<1000);
        if(stopRecorded){this._expectedFillStop=0;this._lastFillAwaiting=false;this._fillRetryUntil=0;}
        this._loadToday();this._scheduleFillRefresh();
      }
    } catch {if(token.serial===this._lastFillSerial){this._lastFillError=true;this._lastFillAt=Date.now()-240000;this._scheduleFillRefresh();}}
    finally {
      clearTimeout(timer);
      if(this._lastFillPending===token){this._lastFillPending=null;this._lastDraw='';this._render();const again=this._lastFillAgain;this._lastFillAgain=false;if(again||key!==[this._deviceId,this._map.pump,this._state('pump')?.state,this._state('pump')?.last_changed,this._state('pump')?.state==='off'?this._state('total')?.state:''].join('|'))this._loadLastFill(again);}
    }
  }
  async _loadToday() {
    if(!this._hass || !this._map.total || !this._settledCounter)return;
    const now=Date.now(),zone=this._hass.config?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    let day;try{day=calendarWindow(now,zone);}catch{return;}
    const key=day.key+'|'+this._map.total,current=this._settledCounter.value;
    const changed=key!==this._todayKey, decreased=!changed&&current!==null&&this._todayLast!==null&&current<this._todayLast;
    this._todayLast=current;
    if(changed || decreased){this._todayKey=key;this._todayAnchor=null;this._todayRetryAt=0;++this._todaySerial;}
    if(this._todayPending){if(changed||decreased)this._todayAgain=true;return;}
    if(this._todayAnchor || now<this._todayRetryAt)return;
    const token={serial:++this._todaySerial,key};this._todayPending=token;
    const entity=this._map.total;let timer;
    try {
      const history=await Promise.race([
        this._hass.callWS({type:'history/history_during_period',start_time:day.start,end_time:new Date(Math.max(Date.parse(day.start),this._settledCounter.cutoff)).toISOString(),entity_ids:[entity],include_start_time_state:true,minimal_response:true,no_attributes:true}),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('history timeout')),8000);}),
      ]);
      if(token.serial===this._todaySerial && token.key===this._todayKey){
        this._todayAnchor=historyAnchor(history?.[entity],day.start,current,now);
        this._todayRetryAt=this._todayAnchor?0:Date.now()+60000;
      }
    } catch {if(token.serial===this._todaySerial)this._todayRetryAt=Date.now()+60000;}
    finally {
      clearTimeout(timer);
      if(this._todayPending===token){this._todayPending=null;this._lastDraw='';this._render();}
      if(this._todayAgain){this._todayAgain=false;this._loadToday();}
    }
  }
  _todayVolume() {
    const total=this._settledCounter?.value;
    return this._todayAnchor && Number.isFinite(total)?Math.max(0,total+this._todayAnchor.offset-this._todayAnchor.base):null;
  }
  _state(field) { return this._hass?.states[this._map[field]]; }
  _number(field) { const s = this._state(field); return validState(s) && s.state.trim() !== '' && Number.isFinite(Number(s.state)) ? Number(s.state) : null; }
  _isOn(field) { return this._state(field)?.state === 'on'; }
  _webUrl() {
    const keys=['web_ip_high','web_ip_low','web_ip_check'];
    if(keys.some(key=>this._map[key])){
      if(!validState(this._state('mode')))return '';
      const [high,low,check]=keys.map(key=>this._number(key));
      if(![high,low,check].every(n=>Number.isInteger(n)&&n>=0&&n<=65535)||(high^low)!==check)return '';
      const octets=[high>>>8,high&255,low>>>8,low&255];if(octets[0]===0||octets[0]===127||octets[0]>=224)return '';
      return 'http://'+octets.join('.')+'/';
    }
    return webAddress(this._device?.configuration_url)||webAddress(this._config.web_url);
  }
  _language() { return CardLocale.resolve(this._config?.language === 'auto' ? '' : this._config?.language, this._hass?.locale?.language, this._hass?.language); }
  _t(source,values) { return CardLocale.t(this._language(),source,values); }
  _fmt(n, digits = 0) { return new Intl.NumberFormat(this._language(), {maximumFractionDigits: digits}).format(n); }
  _litres(n) { return n === null ? '—' : this._fmt(n / 1000, 2); }
  _setError(id,source){this._uiErrors||={};this._uiErrors[id]=source;this._el(id).textContent=this._t(source);}
  _el(id) { return this.shadowRoot.getElementById(id); }
  _create() {
    if (this._el('card')) return;
    this.shadowRoot.innerHTML = `<style>
:host{display:block;--ato-a:#23b7a0;--ato-ink:var(--primary-text-color,#163d44);--ato-muted:var(--secondary-text-color,#668187)}*{box-sizing:border-box}ha-card{display:block;overflow:hidden;border-radius:22px;color:var(--ato-ink);background:var(--ha-card-background,var(--card-background-color,#fff));padding:22px;position:relative}.head{display:flex;gap:12px;align-items:center}.mark{width:44px;height:44px;color:var(--ato-a);flex-shrink:0}.mark svg{width:100%;height:100%}.brand{font-size:10px;letter-spacing:2px;font-weight:800;color:var(--ato-muted)}h2{font-size:20px;line-height:1.3;margin:3px 0;font-weight:650}.pill{margin-left:auto;border-radius:999px;font-size:11px;letter-spacing:.4px;padding:7px 10px;background:color-mix(in srgb,var(--ato-a) 13%,transparent);color:var(--ato-ink);white-space:nowrap}.pill.bad{background:#b530301b;color:var(--error-color,#c64747)}.main{display:flex;align-items:center;gap:24px;margin:26px 0 22px}.tank{position:relative;width:110px;height:145px;flex-shrink:0;border:2px solid color-mix(in srgb,var(--ato-a) 27%,transparent);border-radius:14px 14px 25px 25px;background:color-mix(in srgb,var(--ato-a) 4%,transparent);overflow:hidden}.water{position:absolute;bottom:0;width:100%;height:calc(var(--fill,0)*1%);min-height:0;background:linear-gradient(165deg,#33cbb7aa,#139b91cc);transition:height 1s ease}.surface{height:5px;background:#ffffff4a}.fish{position:absolute;top:44%;left:21%;width:58px;height:30px;opacity:.9}.bubble{position:absolute;width:6px;height:6px;border:1.5px solid #fff9;border-radius:50%;right:22%;top:24%}.bubble.b2{width:4px;height:4px;right:32%;top:15%}.tank.unknown .water{height:0}.tank.unknown::after{content:'?';position:absolute;inset:0;display:grid;place-items:center;font-size:40px;color:var(--ato-muted)}.big{font-size:54px;font-weight:650;letter-spacing:-3px;line-height:1.05;font-variant-numeric:tabular-nums}.big small{font-size:23px;letter-spacing:0;font-weight:400;padding-left:4px;color:var(--ato-muted)}.sub{font-size:13px;color:var(--ato-muted);margin-top:9px}.available{font-size:14px;margin-top:5px}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.metric{background:color-mix(in srgb,var(--ato-a) 5%,transparent);border:1px solid color-mix(in srgb,var(--ato-a) 9%,transparent);border-radius:13px;padding:12px 14px;min-width:0}.float-metric{grid-column:1/-1}.float-metric.bad{border-color:var(--error-color,#c64747);background:#b530300c}.float-metric.bad .metric-value{color:var(--error-color,#c64747)}.float-metric .metric-value{overflow-wrap:anywhere}.float-metric .metric-label:last-child{margin:6px 0 0}.metric-label{font-size:11px;color:var(--ato-muted);margin-bottom:5px}.metric-value{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--ato-muted);margin-right:6px;vertical-align:middle}.dot.on{background:var(--ato-a);box-shadow:0 0 0 4px #23b7a014}.controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}button{overflow-wrap:anywhere;font:inherit;cursor:pointer;border:0;border-radius:11px;padding:12px 10px;min-height:44px;color:var(--ato-ink);background:color-mix(in srgb,var(--ato-a) 10%,transparent);transition:opacity .15s,background .15s}button:focus-visible,summary:focus-visible,input:focus-visible{outline:2px solid var(--ato-a);outline-offset:3px}button.primary{background:#158a7d;color:white}button.stop{border:1px solid #c2545438;background:#c254540c;color:var(--ato-ink)}button.active{box-shadow:inset 0 0 0 2px var(--ato-a)}button:disabled{cursor:default;opacity:.4}.note{font-size:11px;line-height:1.5;color:var(--ato-muted);margin:12px 0 0}.notice{font-size:12px;line-height:1.5;padding:10px 12px;background:color-mix(in srgb,var(--ato-a) 8%,transparent);border-radius:10px;margin:0 0 13px}.notice.error{background:#c2545415;color:var(--error-color,#c64747)}.notice:empty{display:none}.footer{margin-top:14px;padding-top:13px;border-top:1px solid var(--divider-color,#ddd);display:flex;justify-content:space-between;align-items:center;gap:8px}.links{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px}.links a{color:var(--ato-a);font-size:12px;text-decoration:none;overflow-wrap:anywhere}.links button{font-size:12px;padding:8px 10px;min-height:36px}.last-fill{padding:12px 14px;border:1px solid var(--divider-color,#ddd);border-radius:13px;margin-bottom:14px}.last-fill .metric-value{font-size:14px;line-height:1.5}.footer button{padding:7px 10px;min-height:36px;font-size:12px;background:transparent}.float{font-size:11px;color:var(--ato-muted)}.overlay{position:absolute;inset:0;background:var(--ha-card-background,var(--card-background-color,#fff));padding:24px;z-index:3;display:flex;flex-direction:column;justify-content:center}.overlay[hidden]{display:none}h3{font-size:20px;margin:0 0 8px}.overlay p{color:var(--ato-muted);font-size:13px;line-height:1.6;margin:0 0 18px}label{font-size:12px;color:var(--ato-muted)}input{width:100%;margin-top:8px;border:1px solid var(--divider-color,#ccc);border-radius:10px;padding:13px;font:inherit;color:var(--ato-ink);background:transparent}.modal-actions{display:grid;gap:8px;margin-top:16px}.overlay .notice{margin-top:12px}.empty{padding:18px 0;font-size:13px;line-height:1.6;color:var(--ato-muted)}[hidden]{display:none!important}@media(max-width:330px){ha-card{padding:16px}.main{gap:16px}.tank{width:88px;height:130px}.big{font-size:46px}.metric{padding:10px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style><ha-card id="card"><div class="head"><div class="mark">${ICON}</div><div><div class="brand">AQUIVO · ATO</div><h2 id="title"><span data-i18n="Akvárium">Akvárium</span></h2></div><span id="status" class="pill"><span data-i18n="Načítavam">Načítavam</span></span></div>
<div id="empty" class="empty" hidden></div><div id="body"><div class="main"><div id="tank" class="tank"><div id="water" class="water"><div class="surface"></div><svg class="fish" viewBox="0 0 60 30" aria-hidden="true"><path d="m15 15-11-8v16Zm0 0c12-15 28-15 39 0-11 15-27 15-39 0" fill="#fff"/><circle cx="43" cy="13" r="2" fill="#167e79"/></svg><i class="bubble"></i><i class="bubble b2"></i></div></div><div><div class="big"><span id="percent">—</span><small>%</small></div><div class="sub"><span data-i18n="zostáva v zásobníku">zostáva v zásobníku</span></div><div class="available"><span id="litres">—</span> l <span id="capacity"></span></div></div></div>
<div class="metrics"><div class="metric"><div class="metric-label"><span data-i18n="Dopustené dnes">Dopustené dnes</span></div><div class="metric-value"><span id="daily">—</span> l</div><div id="daily-note" class="metric-label"></div></div><div class="metric"><div class="metric-label"><span data-i18n="Pumpa">Pumpa</span></div><div class="metric-value"><i id="pump-dot" class="dot"></i><span id="pump">—</span></div></div><div id="float-metric" class="metric float-metric" role="status" aria-live="polite"><div class="metric-label"><span data-i18n="Plavák">Plavák</span></div><div id="float" class="metric-value">—</div><div id="float-note" class="metric-label"></div></div></div><div class="last-fill"><div class="metric-label"><span data-i18n="Posledné dopúšťanie">Posledné dopúšťanie</span></div><div id="last-fill" class="metric-value"><span data-i18n="Čakám">Čakám</span></div></div><div id="notice" class="notice" role="status"></div><div class="controls"><button id="auto" class="primary"><span data-i18n="Zapnúť AUTO">Zapnúť AUTO</span></button><button id="service" class="stop"><span data-i18n="SERVICE / zastaviť">SERVICE / zastaviť</span></button></div><p class="note"><span data-i18n="Odhad podľa kalibrácie. Dopúšťanie riadi lokálny plavák.">Odhad podľa kalibrácie. Dopúšťanie riadi lokálny plavák.</span></p><div class="footer"><button id="refill-open"><span data-i18n="Doplniť zásobník ↗">Doplniť zásobník ↗</span></button></div><div class="links"><a id="web" target="_blank" rel="noopener noreferrer" hidden></a><span id="web-missing" class="note"><span data-i18n="IP adresu webu nastav v úprave karty.">IP adresu webu nastav v úprave karty.</span></span><button id="reset-open"><span data-i18n="Reset počítadla">Reset počítadla</span></button></div><div id="card-version" class="note" style="text-align:right"></div><button id="clear" hidden><span data-i18n="Potvrdiť alarm">Potvrdiť alarm</span></button></div>
<div id="modal" class="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden><h3 id="modal-title"><span data-i18n="Doplnil si vodu?">Doplnil si vodu?</span></h3><p><span data-i18n="Zadaj skutočný celkový zostatok po doplnení. Tento údaj nastav odhadom alebo podľa objemu nádoby.">Zadaj skutočný celkový zostatok po doplnení. Tento údaj nastav odhadom alebo podľa objemu nádoby.</span></p><label for="refill-value"><span data-i18n="Voda v zásobníku (ml)">Voda v zásobníku (ml)</span><input id="refill-value" type="number" min="0" step="1" inputmode="decimal"></label><div id="modal-error" class="notice error" role="status"></div><div class="modal-actions"><button id="refill-save" class="primary"><span data-i18n="Uložiť skutočný zostatok">Uložiť skutočný zostatok</span></button><button id="refill-full"><span data-i18n="Vyplniť plný objem">Vyplniť plný objem</span></button><button id="refill-cancel"><span data-i18n="Späť">Späť</span></button></div></div><div id="reset-modal" class="overlay" role="dialog" aria-modal="true" aria-labelledby="reset-title" hidden><h3 id="reset-title"><span data-i18n="Reset počítadla limitu?">Reset počítadla limitu?</span></h3><p><span data-i18n="Vynuluje spotrebu ochranného 24-hodinového obdobia a otvorí nový rozpočet dopúšťania. Zostatok v bandaske, kalibrácia a celková spotreba zostanú zachované. AUTO sa samo nezapne.">Vynuluje spotrebu ochranného 24-hodinového obdobia a otvorí nový rozpočet dopúšťania. Zostatok v bandaske, kalibrácia a celková spotreba zostanú zachované. AUTO sa samo nezapne.</span></p><div id="reset-error" class="notice error" role="status"></div><div class="modal-actions"><button id="reset-confirm" class="primary"><span data-i18n="Vynulovať počítadlo limitu">Vynulovať počítadlo limitu</span></button><button id="reset-cancel"><span data-i18n="Späť">Späť</span></button></div></div></ha-card>`;
    this._el('reset-open').onclick=()=>this._openReset();
    this._el('reset-cancel').onclick=()=>this._closeReset();
    this._el('reset-confirm').onclick=()=>this._resetCounter();
    this._el('reset-modal').onkeydown=event=>{if(event.key==='Escape'){event.stopPropagation();this._closeReset();}if(event.key==='Tab'){const targets=[...this._el('reset-modal').querySelectorAll('button')].filter(e=>!e.disabled);const i=targets.indexOf(this.shadowRoot.activeElement);if(event.shiftKey&&i===0){event.preventDefault();targets.at(-1).focus();}else if(!event.shiftKey&&i===targets.length-1){event.preventDefault();targets[0].focus();}}};
    this._el('auto').onclick = () => this._mode(true);
    this._el('service').onclick = () => this._mode(false);
    this._el('clear').onclick = () => this._send('clear', 'switch', 'turn_on', {entity_id:this._map.clear});
    this._el('refill-open').onclick = () => this._openRefill();
    this._el('refill-cancel').onclick = () => this._closeRefill();
    this._el('refill-save').onclick = () => this._refill();
    this._el('refill-full').onclick = () => { const n=this._number('capacity'); if(n!==null) this._el('refill-value').value=n; };
    this._el('modal').onkeydown = event => {
      if(event.key==='Escape') { event.stopPropagation(); this._closeRefill(); }
      if(event.key==='Tab') { const targets=[...this._el('modal').querySelectorAll('input,button')].filter(e=>!e.disabled); const i=targets.indexOf(this.shadowRoot.activeElement); if(event.shiftKey && i===0){event.preventDefault();targets.at(-1).focus();} else if(!event.shiftKey && i===targets.length-1){event.preventDefault();targets[0].focus();} }
    };
  }
  _render() {
    if(!this._config || !this._hass || !this._el('card')) return;
    const language=this._language(); CardLocale.localize(this.shadowRoot,language); this._el('card').lang=language;
    for(const [id,source] of Object.entries(this._uiErrors||{}))this._el(id).textContent=this._t(source);
    const signature=JSON.stringify([language,this._config,this._deviceId,this._registryError,this._message,this._command,this._todayKey,this._todayAnchor,this._todayRetryAt,this._settledCounter,this._lastFill,this._lastFillError,this._lastFillPending,this._lastFillAwaiting,Object.entries(this._map).map(([k,id])=>[k,id,this._hass.states[id]?.state])]);
    if(signature===this._lastDraw) return; this._lastDraw=signature;
    this._el('card-version').textContent=this._t('Karta {version}',{version:VERSION});
    this._el('title').textContent=this._config.name || this._device?.name_by_user || this._t("Akvárium");
    const empty=this._registryError || (!this._registry?this._t("Načítavam dopúšťač…"):!this._device?this._t("V nastavení karty vyber dopúšťač Aquivo."):!this._map.mode?this._t("Entity dopúšťača sa ešte nenačítali. Skontroluj Zigbee2MQTT."):'');
    this._el('empty').textContent=this._t(empty);this._el('empty').hidden=!empty;this._el('body').hidden=!!empty;
    const online=validState(this._state('mode')); const automatic=this._isOn('mode');const fault=this._isOn('fault');const pumping=this._isOn('pump');
    const percent=this._number('percent'),remaining=this._number('remaining'),capacity=this._number('capacity');
    this._el('status').textContent=empty?this._t("Nastavenie"):!online?this._t("Offline"):fault?this._t("Alarm"):automatic?'AUTO':'SERVICE';this._el('status').classList.toggle('bad',!empty&&(!online||fault));
    this._el('percent').textContent=online&&percent!==null?this._fmt(percent):'—';this._el('litres').textContent=online?this._litres(remaining):'—';this._el('capacity').textContent=capacity!==null?' / '+this._litres(capacity)+' l':'';
    this._el('tank').classList.toggle('unknown',!online||percent===null);this._el('water').style.setProperty('--fill',online&&percent!==null?Math.min(100,Math.max(0,percent)):0);
    this._el('daily-note').hidden=!this._lastFillError&&!this._settledCounter?.pending;
    this._el('daily-note').textContent=this._lastFillError?this._t("História nedostupná"):this._settledCounter?.pending?this._t("Čakám"):'';
    this._el('daily').textContent=online?this._litres(this._todayVolume()):'—';this._el('daily').title=this._todayAnchor?this._t("Od polnoci podľa časového pásma Home Assistanta"):this._todayPending?this._t("Načítavam dnešnú spotrebu"):this._t("Dnešný údaj nie je dostupný v histórii");this._el('pump').textContent=!online||!validState(this._state('pump'))?this._t("Neznámy"):pumping?this._t("Dopúšťa"):this._t("Vypnutá");this._el('pump-dot').classList.toggle('on',online&&pumping);
    const expected=this._command?.expected;
    if(expected && this._command?.sent && this._state(expected.field)?.state===expected.state){clearTimeout(this._commandTimer);this._command=null;this._message='';}
    const busy=!!this._command;
    const code=this._number('faultCode'),daily=this._number('daily'),limit=this._number('dailyLimit');
    const alarms={1:this._t("Pôvodný časový alarm. Potvrď alarm."),2:this._t("Zásobník je podľa odhadu prázdny."),3:this._t("Dosiahnutý limit dopúšťania. Skontroluj hladinu a počítadlo."),4:this._t("Chyba ukladania nastavení. Výstup je zablokovaný."),5:this._t("Dosiahnutý limit jedného dopúšťania. Skontroluj hladinu a plavák."),6:this._t("Čerpanie sa bezpečnostne zastavilo. Skontroluj hladinu a potvrď alarm."),7:this._t("Chyba plaváka alebo kábla. Skontroluj zapojenie 4k7 a potvrď alarm.")};
    const reason=!online?this._t("Zariadenie je nedostupné. SERVICE sa môžeš pokúsiť odoslať."):fault?(alarms[code]||this._t("Dopúšťanie blokuje alarm. Podrobnosti skontroluj na zariadení.")):this._state('ready')?.state==='off'?(this._number('flow')===0?this._t("Najprv ulož kalibráciu pumpy."):this._number('calibration')>0?this._t("Ulož alebo zruš neukončenú kalibráciu."):remaining!==null&&remaining<=0?this._t("Zásobník je podľa odhadu prázdny."):daily!==null&&limit!==null&&daily>=limit?this._t("Dosiahnutý limit dopúšťania. Skontroluj hladinu a počítadlo."):this._t("AUTO zatiaľ nie je pripravené. Podrobnosti sú na webe ATO.")):'';
    const web=this._webUrl();
    this._el('web').hidden=!web;this._el('web-missing').hidden=!!web;
    this._el('web').href=web;this._el('web').textContent=web?this._t("Web ATO ↗ {host}",{host:new URL(web).host}):'';
    const fill=this._lastFillAwaiting?null:this._lastFill;
    this._el('last-fill').textContent=fill?new Intl.DateTimeFormat(this._language(),{timeZone:this._hass.config?.time_zone,day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'}).format(fill.end)+(fill.pending?' · '+this._t("Čakám"):fill.ml===null?' · '+this._t("objem neznámy"):' · '+this._t("približne {volume} ml",{volume:this._fmt(fill.ml)})):this._lastFillError?this._t("História nie je dostupná"):(this._lastFillPending||this._lastFillAwaiting)?this._t("Čakám"):this._t("Bez dokončeného dopúšťania v posledných 7 dňoch");
    this._el('last-fill').title=this._t("Čas ukončenia podľa histórie HASS. Objem je odhad podľa kalibrácie, nie meranie prietoku.");
    this._el('reset-open').disabled=!online||automatic||pumping||this._isOn('calibrating')||busy||!this._map.reset;
    this._el('reset-open').title=!this._map.reset?this._t("Vyžaduje obnovenie údajov Zigbee zariadenia."):automatic||pumping?this._t("Najprv zvoľ SERVICE."):this._t("Vynuluje iba počítadlo ochranného limitu.");
    this._el('reset-confirm').disabled=!online||automatic||pumping||this._isOn('calibrating')||busy||!this._map.reset;
    this._el('notice').textContent=this._t(this._message||reason);this._el('notice').classList.toggle('error',!!reason);
    this._el('auto').disabled=!online||fault||this._state('ready')?.state!=='on'||busy||automatic;
    // STOP stays available even when another command is pending or availability is stale.
    this._el('service').disabled=!this._map.mode;this._el('auto').textContent=automatic?this._t("AUTO je zapnuté"):this._t("Zapnúť AUTO");
    // A latched float alarm takes priority over a stale/recovered LOW entity.
    // Other faults (e.g. the water budget) must not be attributed to the float.
    const floatFault=online&&code===7;
    const floatKnown=online&&validState(this._state('low'))&&(!fault||(Number.isInteger(code)&&code>0));
    this._el('float').textContent=floatFault?this._t("Chyba plaváka alebo kábla"):!floatKnown?this._t("Stav plaváka neznámy"):this._isOn('low')?this._t("Plavák žiada vodu"):this._t("Hladina je v poriadku");
    this._el('float-note').textContent=floatFault?this._t("Skontroluj kábel a konektor. Po oprave potvrď alarm."):!floatKnown?'':this._isOn('low')?this._t("Kontakt zopnutý"):this._t("Kontakt rozopnutý");
    this._el('float-metric').classList.toggle('bad',floatFault);

    this._el('refill-open').disabled=!online||automatic||pumping||busy||!this._map.refill;
    this._el('refill-open').title=automatic?this._t('Najprv zvoľ SERVICE.'):'';
    this._el('clear').hidden=!fault||!this._map.clear;this._el('clear').disabled=!online||automatic||busy;
    this._el('refill-save').disabled=busy||!online||automatic||pumping;this._el('refill-full').disabled=capacity===null;
  }
  _openReset() {
    if(!validState(this._state('mode'))||this._isOn('mode')||this._isOn('pump')||this._isOn('calibrating')||this._command||!this._map.reset)return;
    this._setError('reset-error','');this._el('reset-modal').hidden=false;this._el('reset-cancel').focus();
  }
  _closeReset() {this._el('reset-modal').hidden=true;this._el('reset-open').focus();}
  async _resetCounter() {
    if(this._el('reset-modal').hidden||!validState(this._state('mode'))||this._isOn('mode')||this._isOn('pump')||this._isOn('calibrating')||!this._map.reset){this._setError('reset-error',"Reset vyžaduje SERVICE a vypnutú pumpu.");return;}
    if(await this._send('reset','switch','turn_on',{entity_id:this._map.reset},{field:'daily',state:'0'}))this._closeReset();
    else this._setError('reset-error',this._message);
  }
  async _mode(on) {
    if(!this._map.mode) return;
    if(on && (!validState(this._state('mode'))||this._state('ready')?.state!=='on'||this._isOn('fault'))) return;
    await this._send('mode','switch',on?'turn_on':'turn_off',{entity_id:this._map.mode},{field:'mode',state:on?'on':'off'});
  }
  async _send(kind,domain,service,data,expected) {
    if(!this._hass || !data.entity_id) return false;
    if(this._command && !(kind==='mode'&&service==='turn_off')) return false;
    const token={kind,expected}; clearTimeout(this._commandTimer);this._command=token;this._message="Odosielam príkaz…";this._lastDraw='';this._render();
    try {
      // A frontend timeout limits the wait; it does not claim to cancel a command already sent.
      let timer;await Promise.race([this._hass.callService(domain,service,data),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Odpoveď neprišla. Stav over na zariadení.')),10000);})]).finally(()=>clearTimeout(timer));
      if(this._command!==token) return false;
      token.sent=true;
      if(!expected || this._state(expected.field)?.state===expected.state){this._command=null;this._message=expected?'':"Príkaz bol odoslaný.";}
      else {this._message="Čakám na potvrdenie stavu…";this._commandTimer=setTimeout(()=>{if(this._command===token){this._command=null;this._message="Stav sa nepotvrdil. Skontroluj spojenie so zariadením.";this._render();}},10000);}
      this._lastDraw='';this._render();return true;
    } catch(error) {if(this._command===token){this._command=null;this._message=error.message||"Príkaz sa nepodaril.";this._lastDraw='';this._render();}return false;}
  }
  _openRefill() {
    if(this._isOn('mode')||this._isOn('pump')||!validState(this._state('mode'))||!this._map.refill) return;
    this._el('refill-value').value='';const max=this._number('capacity');if(max!==null)this._el('refill-value').max=max;else this._el('refill-value').removeAttribute('max');
    this._setError('modal-error','');this._el('modal').hidden=false;this._el('refill-value').focus();
  }
  _closeRefill() {this._el('modal').hidden=true;this._el('refill-open').focus();}
  async _refill() {
    const input=this._el('refill-value'),value=Number(input.value),max=this._number('capacity');
    if(input.value.trim()===''||!Number.isFinite(value)||value<0||(max!==null&&value>max)||this._isOn('mode')||this._isOn('pump')||!validState(this._state('mode'))){this._setError('modal-error',"Zadaj platný zostatok a ponechaj SERVICE s vypnutou pumpou.");return;}
    if(await this._send('refill','number','set_value',{entity_id:this._map.refill,value})){this._closeRefill();}
    else this._setError('modal-error',this._message);
  }
}
class AquivoAtoCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._registry=null;}
  setConfig(config){this._config={...config};this._render();}
  set hass(hass){const previous=this._language();this._hass=hass;if(previous!==this._language())this._render();if(!this._loading&&!this._registry){this._loading=true;getRegistry(hass).then(r=>{this._registry=r;this._render();}).catch(()=>{this._error="Nepodarilo sa načítať zariadenia.";this._render();}).finally(()=>this._loading=false);}}
  _language(){return CardLocale.resolve(this._config?.language==='auto'?'':this._config?.language,this._hass?.locale?.language,this._hass?.language);}
  _t(source,values){return CardLocale.t(this._language(),source,values);}
  _changed(key,value){this._config={...this._config,[key]:value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));}
  _render(){
    if(!this._config)return;
    const devices=this._registry?devicesFor(this._registry):[];
    this.shadowRoot.innerHTML=`<style>:host{display:block;padding:8px}label{display:block;margin:0 0 16px;font-size:13px}input,select{display:block;width:100%;margin-top:8px;padding:12px;box-sizing:border-box;border:1px solid var(--divider-color,#ccc);border-radius:8px;color:var(--primary-text-color);background:var(--card-background-color);font:inherit}p{font-size:12px;color:var(--secondary-text-color);line-height:1.6}</style><label>${escape(this._t('Jazyk'))}<select id="language"><option value="auto" ${!this._config.language||this._config.language==='auto'?'selected':''}>${escape(this._t('Podľa jazyka HASS'))}</option>${Object.entries(CardLocale.languages).map(([code,name])=>`<option value="${code}" ${this._config.language===code?'selected':''}>${name}</option>`).join('')}</select></label><label><span data-i18n="Názov karty">Názov karty</span><input id="name" placeholder="${escape(this._t('Akvárium'))}" value="${escape(this._config.name||'')}"></label><label><span data-i18n="Dopúšťač">Dopúšťač</span><select id="device"><option value="" data-i18n="Automaticky (ak je iba jeden)">Automaticky (ak je iba jeden)</option>${devices.map(d=>`<option value="${escape(d.id)}" ${d.id===this._config.device_id?'selected':''}>${escape(d.name_by_user||d.name||'Aquivo ATO')}</option>`).join('')}</select></label><label><span data-i18n="Náhradná adresa webu ATO">Náhradná adresa webu ATO</span><input id="web-url" data-i18n-placeholder="Automaticky zo zariadenia" placeholder="Automaticky zo zariadenia" value="${escape(this._config.web_url||'')}"></label><p>${escape(this._t(this._error)||(!this._registry?this._t("Načítavam zariadenia…"):!devices.length?this._t("Dopúšťač Aquivo ATO sa ešte nenašiel. Najprv ho pridaj cez Zigbee2MQTT."):this._t("Karta sama nájde entity vybraného dopúšťača. Kalibrácia a ochrany ostávajú vo firmvéri.")))}</p>`;
    CardLocale.localize(this.shadowRoot,this._language());
    this.shadowRoot.getElementById('language').onchange=e=>{this._changed('language',e.target.value);this._render();};
    this.shadowRoot.getElementById('name').onchange=e=>this._changed('name',e.target.value);
    this.shadowRoot.getElementById('web-url').onchange=e=>{const raw=e.target.value.trim(),url=webAddress(raw);if(raw&&!url){e.target.setCustomValidity(this._t("Zadaj platnú HTTP alebo HTTPS adresu."));e.target.reportValidity();return;}e.target.setCustomValidity('');this._changed('web_url',url);};
    this.shadowRoot.getElementById('device').onchange=e=>this._changed('device_id',e.target.value);
  }
}
if(!customElements.get('aquivo-ato-card'))customElements.define('aquivo-ato-card',AquivoAtoCard);
if(!customElements.get('aquivo-ato-card-editor'))customElements.define('aquivo-ato-card-editor',AquivoAtoCardEditor);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='aquivo-ato-card'))window.customCards.push({type:'aquivo-ato-card',name:'Aquivo ATO Card',description:'Aquarium top-up, water reserve and AUTO / SERVICE controls.',preview:true});
console.info(`%c AQUIVO ATO CARD %c ${VERSION} `,'background:#158a7d;color:white;padding:4px','background:#153d44;color:white;padding:4px');
