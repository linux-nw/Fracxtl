# Fracxtl

**Status:** 🟢 Active · Version 1.0.0

Desktop app (Electron) that encrypts text messages with AES-256-GCM and hides them in the text chunk of a Mandelbrot fractal PNG. No server, no pixel changes.

**Name:** Fracxtl combines fractal and cryptography.

---

## Download

➡️ [Latest version (Windows installer)](https://github.com/linux-nw/fracxtl/releases/latest)

Windows SmartScreen may show "Unknown publisher" on first launch because the file is not signed. Click "More info" and then "Run anyway" to start it.

---

## Usage

1. Enter a message and a password, click Encrypt and save the generated PNG.
2. To decrypt, load the PNG and enter the same password.

Good to know:

- The security depends on the password, ideally a long passphrase. Fracxtl has not been reviewed by cryptography experts.
- The message is encrypted, but not invisible: metadata tools such as `exiftool` show the text chunk immediately.
- If the PNG is re-saved or compressed (other programs, some chat apps and image hosts), the chunk can be lost and the message is gone.
- Decryption only works with PNGs that Fracxtl created.

Technology: PBKDF2 (600,000 rounds) with HKDF, HMAC-SHA256 for verification. The fractal parameters depend on a random salt, so every encryption produces a different image.

---

## Build it yourself

```bash
npm install
npm start       # start the app
npm run dist    # Windows installer into dist/
```

---

## Repo structure

```
main.js, preload.js   Electron shell
index.html            UI and encryption
tools/                icon generation
```

---

## Privacy

Everything runs locally, nothing leaves your computer.

---

## License

[PolyForm Noncommercial 1.0.0](LICENSE). Personal and non-commercial use is free. For commercial use, please get in touch.