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