# GEMINI.md - Generatore di Fiabe Interattivo

## 📖 Panoramica del Progetto

Webapp per la generazione automatica di fiabe personalizzate per bambini dai 5 ai 7 anni, utilizzando l'intelligenza artificiale di Gemini. L'applicazione permette di creare storie educative e coinvolgenti attraverso la selezione di personaggi, ambientazioni e morali.

## 🎯 Obiettivi Principali

- Generare fiabe originali e appropriate per la fascia d'età 5-7 anni
- Offrire un'esperienza utente rilassante e adatta ai bambini
- Garantire che ogni storia contenga un insegnamento educativo chiaro
- Durata di lettura: 5-10 minuti (circa 400-800 parole)
- Utilizzare linguaggio semplice, evocativo e fantasioso

## 🎨 Design e User Experience

### Stile Visivo
- **Palette colori**: Tonalità pastello morbide e rilassanti (azzurro chiaro, rosa tenue, verde menta, giallo delicato)
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

## 🤖 Integrazione con Gemini AI

### Prompt Engineering
Il sistema deve costruire prompt strutturati che includano:

```
Crea una fiaba per bambini di 5-7 anni con le seguenti caratteristiche:

PERSONAGGI: [personaggi selezionati]
AMBIENTAZIONE: [ambientazione selezionata]  
MORALE: [insegnamento da trasmettere]

REQUISITI:
- Lunghezza: 400-800 parole (lettura 5-10 minuti)
- Linguaggio: Semplice, comprensibile per età 5-7 anni
- Tono: Positivo, rassicurante, magico
- Struttura: Inizio, sviluppo, climax, conclusione con insegnamento chiaro
- Stile: Narrativo, coinvolgente, con dialoghi semplici
- Vocabolario: Evocativo ma accessibile, che stimoli l'immaginazione
- NO contenuti spaventosi o inappropriati
- L'insegnamento deve emergere naturalmente dalla storia

FORMATO OUTPUT:
- Titolo accattivante
- Storia divisa in paragrafi brevi
- Finale che evidenzi chiaramente la morale
```

### Configurazione API
- Modello consigliato: `gemini-2.5-flash` (utilizzando l'endpoint API `v1beta`)
- Temperature: 0.8-0.9 (creatività elevata ma controllata)
- Max tokens: 4096 (per accomodare la lunghezza desiderata)
- Safety settings: Bloccare contenuti inappropriati per bambini
- **Gestione della chiave API**: La chiave API è gestita in modo sicuro tramite variabili d'ambiente sul backend (Vercel) e non è esposta nel frontend.

## 📱 Struttura dell'Applicazione

### Architettura
- **Frontend (Client-side)**: HTML5, CSS3, JavaScript Vanilla. Gestisce l'interfaccia utente e invia le richieste al backend.
- **Backend (Serverless Function)**: Node.js, Vercel API routes. Riceve le richieste dal frontend, effettua la chiamata all'API di Gemini (utilizzando la chiave API sicura da variabili d'ambiente) e restituisce la storia al frontend.

### Pagina Principale (Home)
1. **Header**: Titolo accogliente "✨ Il Magico Creatore di Fiabe ✨"
2. **Sezione di selezione** con 3 step visualizzati in modo progressivo:
   - Step 1: Scegli i personaggi
   - Step 2: Scegli l'ambientazione
   - Step 3: Scegli l'insegnamento
3. **Pulsante "Crea la mia fiaba!"**: Grande, colorato, invitante
4. **Loading state**: Animazione dolce con messaggio "Sto creando la tua fiaba magica..."

### Pagina Risultato (Storia Generata)
1. **Titolo della fiaba**: Grande e decorativo
2. **Area di lettura**: 
   - Testo ben spaziato e leggibile
   - Paragrafi separati
   - Possibilità di scorrere comodamente
3. **Azioni**:
   - 📋 Copia testo
   - 💾 Salva come PDF (opzionale)
   - 🔄 Crea una nuova fiaba
   - ⭐ Rigenerare con gli stessi parametri

## 🛠️ Stack Tecnologico Consigliato

### Frontend
- **HTML5** + **CSS3** (con variabili CSS per temi)
- **JavaScript Vanilla**
- **Responsive design**: Mobile-first approach

### Backend/API
- **Node.js** con Vercel Serverless Functions
- **Gemini API** tramite Google AI SDK (chiamate gestite lato server)

### Deployment
- **Vercel**: Piattaforma scelta per il deployment frontend e backend (serverless functions).
- **GitHub**: Repository per il controllo versione e l'integrazione con Vercel per il Continuous Deployment.
- **Esecuzione locale**: Utilizzare `vercel dev` per simulare l'ambiente Vercel e testare frontend e backend localmente. La chiave API per lo sviluppo locale deve essere configurata in un file `.env.local`.

## 🔒 Considerazioni di Sicurezza e Privacy

- **API Key**: NON committare mai la chiave API nel codice frontend. Utilizzata in modo sicuro tramite variabili d'ambiente nelle funzioni serverless di Vercel.
- **Content Safety**: Utilizzare i filtri di sicurezza di Gemini per bloccare contenuti inappropriati.
- **Dati utente**: Non memorizzare dati personali o storie generate (privacy dei bambini).
- **Rate limiting**: (Da implementare) Controlli per evitare abusi dell'API e gestire il consumo delle quote.
- **Monitoraggio Costi**: Configurare alert di fatturazione per l'API di Gemini per prevenire spese inattese.

## 📋 Requisiti Funzionali Dettagliati

### Validazione Input
- Almeno un personaggio deve essere selezionato o inserito
- L'ambientazione deve essere specificata
- La morale deve essere selezionata o scritta
- Campi di testo personalizzati: limite 100 caratteri, validazione caratteri speciali

### Output della Storia
- **Lunghezza**: 400-800 parole
- **Struttura**: Titolo + 4-6 paragrafi
- **Tempo di lettura**: Indicato nell'interfaccia
- **Formattazione**: Paragrafi ben separati per facilitare la lettura

### Gestione Errori
- Messaggio friendly se la generazione fallisce (gestito dalla funzione serverless e mostrato nel frontend)
- Possibilità di ritentare senza re-inserire i dati
- Timeout dopo 30 secondi con messaggio appropriato

## 🎓 Linee Guida Pedagogiche

### Appropriatezza dei Contenuti
- ✅ Emozioni positive e gestione emotiva sana
- ✅ Risoluzione non violenta dei conflitti
- ✅ Diversità e inclusione
- ✅ Valori universali (amicizia, coraggio, onestà)
- ❌ Violenza o paura eccessiva
- ❌ Stereotipi negativi
- ❌ Temi troppo complessi per l'età

### Linguaggio Adatto
- Frasi brevi (max 15-20 parole)
- Vocabolario base + qualche parola nuova da contesto
- Ripetizioni di concetti chiave
- Dialoghi semplici e naturali
- Onomatopee e suoni (per coinvolgimento)

## 🚀 Roadmap Funzionalità Future (Opzionali)

- 🎨 Generazione di illustrazioni AI (DALL-E, Stable Diffusion)
- 🔊 Text-to-speech per leggere la storia ad alta voce
- 📚 Salvataggio delle fiabe preferite (local storage)
- 🌍 Supporto multilingua
- 👨‍👩‍👧 Modalità genitore con note educative
- 🎭 Modalità interattiva (scegli il tuo percorso)
- ⭐ Sistema di valutazione delle storie generate

## 📝 Note per lo Sviluppo

### Best Practices
- Testare le storie generate con feedback di genitori/educatori
- Iterare sui prompt in base alla qualità degli output
- Mantenere il codice semplice e commentato
- Priorità: usabilità per bambini e genitori

### File Structure Suggerita
```
fiabe-app/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── gemini-api.js
├── api/
│   └── generate-story.js  // Nuova funzione serverless
├── assets/
│   └── icons/
├── .env.local             // Variabili d'ambiente per sviluppo locale (non su Git)
├── .gitignore
├── Notes.md
└── README.md
```

## 🎯 Success Metrics

Un'implementazione di successo dovrebbe:
1. Generare storie coerenti e di qualità in <10 secondi
2. Avere un'interfaccia intuitiva utilizzabile da bambini con minimo aiuto
3. Produrre contenuti sempre appropriati e educativi
4. Essere esteticamente piacevole e rilassante
5. Funzionare fluidamente su desktop e mobile

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Dicembre 2024  
**Target**: Bambini 5-7 anni + Genitori/Educatori