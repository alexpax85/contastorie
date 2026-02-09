# Sessione di Troubleshooting Recente (17 Dicembre 2025)

## 1. Accesso Applicazione da Dispositivi Locali (iPhone)

**Problema:** L'app non era accessibile dall'iPhone (`http://192.168.188.81:8000`), nonostante il server Python fosse in esecuzione sul Mac. Errore `OSError: [Errno 57] Socket is not connected` nel log del server e "connessione di rete persa" su Safari.

**Causa:** Il Firewall di macOS bloccava le connessioni in entrata da altri dispositivi sulla rete locale.

**Soluzione:**
1.  Verificato il funzionamento del server localmente sul Mac tramite `http://localhost:8000` (funzionante).
2.  Disattivato temporaneamente il Firewall di macOS (o configurata un'eccezione per Python).

**Conclusione:** L'app è ora accessibile dall'iPhone.

**Apprendimento Chiave:** La differenza tra aprire un file HTML tramite `file://` (doppio click) e servirlo tramite `http://` (server web) è cruciale per le funzionalità JavaScript che richiedono chiamate di rete (API). `file://` blocca tali chiamate per motivi di sicurezza.

---

## 2. Errore API Gemini: 503 Service Unavailable ("The model is overloaded")

**Problema:** Dopo un riavvio del Mac, l'app ha smesso di generare storie, mostrando un errore `503 Service Unavailable` dall'API di Gemini, con il messaggio "The model is overloaded. Please try again later."

**Causa Iniziale (Ipotesi):** Assenza di un account di fatturazione collegato o API non abilitata nel progetto Google Cloud.

**Risoluzione Parziale:**
1.  **Esposizione Chiave API:** La chiave API era stata erroneamente esposta in chat. È stata immediatamente revocata e sostituita con una nuova.
2.  L'utente ha successivamente collegato un account di fatturazione e abilitato l'API nel progetto Google Cloud.

**Causa Finale (Risoluzione):** Il problema era legato al modello `gemini-2.5-flash` stesso (possibile sovraccarico reale o restrizioni di accesso/quota per quel progetto/regione).

**Soluzione Definitiva:**
1.  Sostituito il modello `gemini-2.5-flash` con `gemini-2.5-flash-lite` nel file `js/gemini-api.js`.
2.  Riavviato il server Python.

**Conclusione:** La generazione delle storie tramite l'API di Gemini funziona correttamente con il modello `gemini-2.5-flash-lite`.

---

## 3. Preparazione al Deployment e Sicurezza API Key

**Problema:** Il codice attuale espone la chiave API hardcoded nel file JavaScript client-side, rendendola insicura per il deployment pubblico.

**Proposta di Soluzione (Non ancora implementata):**
1.  Implementare un "proxy" tramite Serverless Functions su Vercel.
2.  Il frontend chiamerà un endpoint locale `/api/generate`.
3.  La Serverless Function (su Vercel) userà la chiave API (salvata in modo sicuro come variabile d'ambiente) per chiamare l'API di Gemini e inoltrare la risposta al frontend.

**Prossimo Passo:** Implementare la soluzione per la sicurezza della chiave API in vista del deployment.

---

# Aggiornamento: 23 Dicembre 2025 - Implementazione Generazione Immagini e Refactoring API

## 1. Problemi con SDK e Versionamento Modelli

**Problema:** Nel tentativo di implementare la generazione di immagini e TTS usando l'SDK `@google/generative-ai`, abbiamo riscontrato persistenti errori `404 Not Found` per modelli come `gemini-1.5-flash` e `gemini-pro`, nonostante fossero corretti secondo la documentazione generale. Inoltre, errori `400 Bad Request` indicavano conflitti nella configurazione dei parametri (es. `responseMimeType` non supportato per certi endpoint).

**Causa:** L'SDK Node.js, per default, potrebbe puntare alla versione stabile `v1` dell'API, mentre i modelli più recenti e multimodali (flash, flash-image) richiedono spesso l'endpoint `v1beta`. Inoltre, l'SDK astrae le chiamate in modo che a volte nasconde la specifica esatta dell'endpoint.

**Soluzione:**
Abbandono dell'SDK per le Serverless Functions. Abbiamo riscritto le funzioni (`api/generate-story.js` e la nuova `api/generate-image.js`) utilizzando chiamate `fetch` native dirette agli endpoint REST `v1beta`.

**Esempio Endpoint Funzionante:**
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`

## 2. Modelli Specifici Identificati

Dopo vari tentativi, abbiamo identificato una coppia di modelli "gemelli" che funzionano stabilmente per questo progetto e per la chiave API in uso:

*   **Testo / Prompt:** `gemini-2.5-flash-lite` (Veloce, affidabile per la storia e per generare il prompt visivo).
*   **Immagini:** `gemini-2.5-flash-image` (Modello specifico per la generazione di immagini della famiglia 2.5).

## 3. Peculiarità Generazione Immagini con Gemini

Abbiamo scoperto due dettagli tecnici cruciali per far funzionare `gemini-2.5-flash-image`:

1.  **Niente `responseMimeType`:** A differenza dei modelli di testo dove si specifica `application/json`, per questo modello di immagini NON bisogna passare `responseMimeType: "image/jpeg"` nella configurazione, altrimenti l'API restituisce un errore 400 (`INVALID_ARGUMENT`). Il modello sa già di dover generare un'immagine.
2.  **Struttura Risposta Multi-parte:** La risposta JSON dell'API può contenere più parti (`parts`). Spesso, la **prima parte** (`parts[0]`) contiene un breve testo introduttivo (es. "Here is your image"), mentre i dati dell'immagine (`inlineData`) si trovano nella **seconda parte** (`parts[1]`). Il codice deve iterare o cercare la parte corretta, non assumere che sia sempre la prima.

## 4. Stato Attuale

Il progetto ora dispone di:
*   Generazione Storie (testo) via `gemini-2.5-flash-lite`.
*   Generazione Illustrazioni (immagini) via `gemini-2.5-flash-image`.
*   Pulsante per copiare l'immagine generata.
*   Architettura serverless sicura su Vercel.

---

# Aggiornamento: 5 Febbraio 2026 - Risoluzione Errori 503/429 e Consolidamento Modelli

## 1. Troubleshooting Modelli Gemini 2.x

**Problema:** L'applicazione ha iniziato a restituire errori `503 Service Unavailable` e successivamente `429 Too Many Requests` utilizzando il modello `gemini-2.5-flash-lite` e il tentativo di fallback su `gemini-2.0-flash`.

**Causa:** 
- Il modello `gemini-2.5-flash-lite` risultava instabile o sovraccarico (503).
- Il modello `gemini-2.0-flash` è stato identificato come prossimo alla dismissione (scheduled shutdown Marzo 2026) e soggetto a forti limitazioni di quota (429).
- Una comunicazione ufficiale di Google ha indicato la necessità di gestire i "Thought Signatures" per i modelli Gemini 3, rendendo l'uso degli alias `-latest` più complesso.

**Soluzione:**
Dopo diversi test, è stato scelto il modello **`gemini-2.5-flash`** (versione standard, non lite) come soluzione definitiva per la generazione di testo e prompt. Questo modello offre:
- **Qualità superiore** nella narrazione rispetto alla versione lite.
- **Stabilità** maggiore rispetto ai modelli preview o in dismissione.
- **Piena compatibilità** con l'infrastruttura `v1beta` esistente.

## 2. Configurazione Finale Funzionante

L'applicazione è ora configurata e verificata con i seguenti endpoint:

*   **Testo / Prompt:** `gemini-2.5-flash`
*   **Immagini:** `gemini-2.5-flash-image`

**Risultato:** L'applicazione è tornata pienamente operativa, con una qualità di generazione delle storie ottimale e senza errori di quota o disponibilità.
