# GEMINI.md - Generatore di Fiabe Interattivo

## 📖 Panoramica del Progetto

Webapp per la generazione automatica di fiabe personalizzate per bambini dai 5 ai 7 anni, utilizzando l'intelligenza artificiale di Gemini. L'applicazione permette di creare storie educative e coinvolgenti attraverso la selezione di personaggi, ambientazioni e morali, e di generare un'illustrazione magica che accompagna il racconto.

## 🎯 Obiettivi Principali

- Generare fiabe originali e appropriate per la fascia d'età 5-7 anni
- Creare illustrazioni visive coerenti con la storia generata
- Offrire un'esperienza utente rilassante e adatta ai bambini
- Garantire che ogni storia contenga un insegnamento educativo chiaro
- Durata di lettura: 5-10 minuti (circa 400-800 parole)
- Utilizzare linguaggio semplice, evocativo e fantasioso

## 🎨 Design e User Experience

### Stile Visivo
- **Palette colori**: Tonalità pastello morbide e rilassanti (azzurro chiaro, rosa tenue, verde menta, giallo delicato, viola magico #8e7cc3)
- **Font**: Caratteri arrotondati e leggibili (es. Quicksand, Nunito, Comic Neue)
- **Elementi grafici**: Icone friendly, animazioni dolci e non invasive
- **Layout**: Spazioso, pulito, intuitivo anche per i bambini
- **Atmosfera**: Rassicurante, magica, accogliente come un libro di fiabe illustrato

### Componenti UI
- Card grandi e colorati per la selezione degli elementi
- Pulsanti arrotondati con icone illustrative
- Spazio generoso tra gli elementi (touch-friendly)
- Feedback visivi delicati (hover, selezione)

## ⚙️ Funzionalità Core

### 1. Selezione Personaggi
**Opzioni pre-definite:**
- 🦊 Animali del bosco (volpe, coniglio, scoiattolo, gufo)
- 🐉 Creature magiche (drago buono, unicorno, fata, elfo)
- 👧 Bambini coraggiosi (esploratore/esploratrice, inventore/inventrice)
- 🤖 Personaggi fantastici (robot gentile, alieno curioso, pupazzo parlante)

**Opzioni aggiuntive:**
- Campo di testo libero per inserire personaggi personalizzati
- Possibilità di combinare 2-3 personaggi nella stessa storia

### 2. Selezione Ambientazione
**Opzioni pre-definite:**
- 🌲 Bosco incantato
- 🏰 Regno fatato con castello
- 🌊 Mondo sottomarino
- 🌌 Spazio e pianeti lontani
- 🏘️ Villaggio magico
- 🏔️ Montagne delle nuvole
- 🌈 Isola arcobaleno

**Opzioni aggiuntive:**
- Campo di testo per ambientazioni personalizzate

### 3. Selezione Morale/Insegnamento
**Opzioni pre-definite:**
- 🤝 L'importanza dell'amicizia
- 💪 Il coraggio di provare cose nuove
- ❤️ La gentilezza verso gli altri
- 🌱 Il rispetto per la natura
- 🎨 L'unicità di ognuno è speciale
- 🗣️ L'importanza di dire la verità
- 🤗 L'aiuto reciproco e la collaborazione
- 🧘 La pazienza e la calma
- 📚 La curiosità e l'amore per l'apprendimento
- 😊 L'accettazione delle proprie emozioni

**Opzioni aggiuntive:**
- Campo per specificare un insegnamento personalizzato

### 4. Funzionalità Aggiuntive (New!)
- **Generazione Illustrazione**: Creazione automatica di un'immagine in stile "digital art per bambini" basata sulla storia appena generata.
- **Copia Immagine**: Possibilità di copiare l'immagine generata negli appunti con un click.

## 🤖 Integrazione con Gemini AI

### Prompt Engineering
Il sistema deve costruire prompt strutturati che includano:

**Per la Storia:**
```
Crea una fiaba per bambini di 5-7 anni con le seguenti caratteristiche:
PERSONAGGI: [personaggi selezionati]
AMBIENTAZIONE: [ambientazione selezionata]  
MORALE: [insegnamento da trasmettere]
... (requisiti di stile e tono) ...
```

**Per l'Illustrazione (Processo a 2 step):**
1.  **Generazione Prompt Immagine:** Si chiede al modello testuale di riassumere la storia in una singola frase visiva e descrittiva in inglese.
2.  **Generazione Immagine:** Si usa il prompt generato per chiamare il modello di immagini.

### Configurazione API
L'integrazione utilizza chiamate `fetch` dirette agli endpoint `v1beta` dell'API di Google Generative AI per garantire il controllo sui modelli.

- **Endpoint Storia & Prompt Immagine**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
    - Modello: `gemini-2.5-flash` (bilanciamento ottimale qualità/velocità)
- **Endpoint Generazione Immagine**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
    - Modello: `gemini-2.5-flash-image`
    - Nota: Non si specifica `responseMimeType` nella configurazione per questo modello per evitare errori 400.

- **Gestione della chiave API**: La chiave API è gestita in modo sicuro tramite variabili d'ambiente (`GEMINI_API_KEY`) sul backend (Vercel Serverless Functions).

## 📱 Struttura dell'Applicazione

### Architettura
- **Frontend (Client-side)**: HTML5, CSS3, JavaScript Vanilla. Gestisce l'interfaccia utente e invia le richieste al backend.
- **Backend (Serverless Function)**: Node.js, Vercel API routes.
    - `api/generate-story.js`: Gestisce la creazione del testo.
    - `api/generate-image.js`: Gestisce la creazione dell'illustrazione.

### Pagina Principale (Home)
1. **Header**: Titolo accogliente "✨ Il Magico Creatore di Fiabe ✨"
2. **Sezione di selezione** con 3 step visualizzati in modo progressivo.
3. **Pulsante "Crea la mia fiaba!"**: Grande, colorato, invitante.

### Pagina Risultato (Storia Generata)
1. **Titolo della fiaba**: Grande e decorativo.
2. **Area Immagine (Nuova)**: Spazio dove appare l'illustrazione generata.
3. **Area di lettura**: Testo ben spaziato e leggibile.
4. **Azioni**:
   - 🎨 Crea un'illustrazione
   - 📋 Copia testo
   - 🔄 Crea una nuova fiaba

## 🛠️ Stack Tecnologico Consigliato

### Frontend
- **HTML5** + **CSS3** (con variabili CSS per temi)
- **JavaScript Vanilla**
- **Responsive design**: Mobile-first approach

### Backend/API
- **Node.js** con Vercel Serverless Functions
- **Google Generative AI API** (chiamate via `fetch` nativo)

### Deployment
- **Vercel**: Piattaforma scelta per il deployment frontend e backend.
- **GitHub**: Repository per il controllo versione e CI/CD.

## 🔒 Considerazioni di Sicurezza e Privacy

- **API Key**: Gestita lato server, mai esposta al client.
- **Content Safety**: Utilizzo dei filtri di sicurezza di Gemini.
- **Dati utente**: Nessuna memorizzazione persistente dei dati.

## 🎯 Success Metrics

Un'implementazione di successo dovrebbe:
1. Generare storie coerenti e di qualità in <10 secondi.
2. Generare illustrazioni pertinenti e sicure per i bambini.
3. Avere un'interfaccia intuitiva utilizzabile da bambini con minimo aiuto.
4. Essere esteticamente piacevole e rilassante.

---

**Versione**: 1.1 (Con Immagini)
**Ultimo aggiornamento**: 23 Dicembre 2025
**Target**: Bambini 5-7 anni + Genitori/Educatori
