# Fracxtl

**Status:** 🟢 Aktiv · Version 1.0.0

Desktop-App (Electron), die Textnachrichten mit AES-256-GCM verschlüsselt und im Text-Chunk eines Mandelbrot-Fraktal-PNGs versteckt. Ohne Server, ohne Pixeländerung.

**Name:** Fracxtl verbindet Fraktal und Kryptografie.

---

## Download

➡️ [Neueste Version (Windows-Installer)](https://github.com/linux-nw/fracxtl/releases/latest)

Windows SmartScreen kann beim ersten Start "Unbekannter Herausgeber" melden, weil die Datei nicht signiert ist. Mit "Weitere Informationen" und "Trotzdem ausführen" startet sie.

---

## Nutzung

1. Nachricht und Passwort eingeben, auf Verschlüsseln klicken und das erzeugte PNG speichern.
2. Zum Entschlüsseln das PNG laden und dasselbe Passwort eingeben.

Gut zu wissen:

- Die Sicherheit hängt am Passwort, am besten eine lange Passphrase. Fracxtl wurde nicht von Kryptografie-Fachleuten geprüft.
- Die Nachricht ist verschlüsselt, aber nicht unsichtbar: Metadaten-Tools wie `exiftool` zeigen den Text-Chunk sofort an.
- Wird das PNG neu gespeichert oder komprimiert (andere Programme, manche Chat-Apps und Bildhoster), kann der Chunk verloren gehen und die Nachricht ist weg.
- Entschlüsseln geht nur mit PNGs, die Fracxtl erzeugt hat.

Technik: PBKDF2 (600.000 Runden) mit HKDF, HMAC-SHA256 zur Prüfung. Die Fraktal-Parameter hängen von einem zufälligen Salt ab, jede Verschlüsselung ergibt ein anderes Bild.

---

## Selbst bauen

```bash
npm install
npm start       # App starten
npm run dist    # Windows-Installer nach dist/
```

---

## Repo-Struktur

```
main.js, preload.js   Electron-Hülle
index.html            Oberfläche und Verschlüsselung
tools/                Icon-Erzeugung
```

---

## Datenschutz

Alles läuft lokal, nichts verlässt deinen Rechner.

---

## Lizenz

[MIT](LICENSE)
