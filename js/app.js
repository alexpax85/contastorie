document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const charactersData = [
        { name: "Volpe astuta", emoji: "🦊" },
        { name: "Coniglio veloce", emoji: "🐰" },
        { name: "Scoiattolo acrobata", emoji: "🐿️" },
        { name: "Gufo saggio", emoji: "🦉" },
        { name: "Drago buono", emoji: "🐉" },
        { name: "Unicorno scintillante", emoji: "🦄" },
        { name: "Fata gentile", emoji: "🧚" },
        { name: "Elfo curioso", emoji: "🧝" },
        { name: "Esploratrice coraggiosa", emoji: "👧" },
        { name: "Inventore geniale", emoji: "🧑‍🔬" },
        { name: "Robot gentile", emoji: "🤖" },
        { name: "Alieno amichevole", emoji: "👽" },
    ];

    const settingsData = [
        { name: "Bosco incantato", emoji: "🌲" },
        { name: "Regno fatato", emoji: "🏰" },
        { name: "Mondo sottomarino", emoji: "🌊" },
        { name: "Spazio profondo", emoji: "🌌" },
        { name: "Villaggio magico", emoji: "🏘️" },
        { name: "Montagne delle nuvole", emoji: "🏔️" },
        { name: "Isola arcobaleno", emoji: "🌈" },
    ];

    const moralsData = [
        { name: "L'importanza dell'amicizia", emoji: "🤝" },
        { name: "Il coraggio di provare cose nuove", emoji: "💪" },
        { name: "La gentilezza verso gli altri", emoji: "❤️" },
        { name: "Il rispetto per la natura", emoji: "🌱" },
        { name: "L'unicità di ognuno è speciale", emoji: "🎨" },
        { name: "L'importanza di dire la verità", emoji: "🗣️" },
        { name: "L'aiuto reciproco e la collaborazione", emoji: "🤗" },
        { name: "La pazienza e la calma", emoji: "🧘" },
    ];

    // --- ELEMENTI DEL DOM ---
    const selectionScreen = document.getElementById('selection-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const storyScreen = document.getElementById('story-screen');

    const characterOptionsContainer = document.querySelector('#step-1 .options');
    const settingOptionsContainer = document.querySelector('#step-2 .options');
    const moralOptionsContainer = document.querySelector('#step-3 .options');

    const customCharacterInput = document.getElementById('custom-character');
    const customSettingInput = document.getElementById('custom-setting');
    const customMoralInput = document.getElementById('custom-moral');

    const generateStoryBtn = document.getElementById('generate-story');
    const newStoryBtn = document.getElementById('new-story');
    const copyTextBtn = document.getElementById('copy-text');

    const storyTitleEl = document.getElementById('story-title');
    const storyTextEl = document.getElementById('story-text');

    // --- FUNZIONI ---

    /**
     * Crea e popola le card di opzione
     * @param {HTMLElement} container - Il contenitore dove inserire le card
     * @param {Array<Object>} data - L'array di dati per le opzioni
     * @param {string} type - Il tipo di opzione (character, setting, moral)
     */
    function createOptionCards(container, data, type) {
        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('option-card');
            card.dataset.type = type;
            card.dataset.value = item.name;
            card.innerHTML = `${item.emoji} <span>${item.name}</span>`;
            container.appendChild(card);
        });
    }

    /**
     * Gestisce la selezione delle card
     * @param {MouseEvent} event - L'evento click
     */
    function handleCardSelection(event) {
        const card = event.target.closest('.option-card');
        if (!card) return;

        const { type, value } = card.dataset;
        
        // Per personaggi, permette selezione multipla
        if (type === 'character') {
            card.classList.toggle('selected');
        } else {
            // Per ambientazione e morale, deseleziona gli altri
            const container = card.parentElement;
            container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        }
    }

    /**
     * Raccoglie le selezioni dell'utente
     * @returns {Object|null} - Un oggetto con le selezioni o null se la validazione fallisce
     */
    function getSelections() {
        const selectedCharacters = Array.from(characterOptionsContainer.querySelectorAll('.selected')).map(c => c.dataset.value);
        if (customCharacterInput.value.trim()) {
            selectedCharacters.push(customCharacterInput.value.trim());
        }

        const selectedSettingCard = settingOptionsContainer.querySelector('.selected');
        let setting = selectedSettingCard ? selectedSettingCard.dataset.value : customSettingInput.value.trim();

        const selectedMoralCard = moralOptionsContainer.querySelector('.selected');
        let moral = selectedMoralCard ? selectedMoralCard.dataset.value : customMoralInput.value.trim();

        if (selectedCharacters.length === 0) {
            alert("Per favore, scegli almeno un personaggio!");
            return null;
        }
        if (!setting) {
            alert("Per favore, scegli un\'ambientazione!");
            return null;
        }
        if (!moral) {
            alert("Per favore, scegli un insegnamento!");
            return null;
        }

        return { characters: selectedCharacters, setting, moral };
    }
    
    /**
     * Mostra una schermata e nasconde le altre
     * @param {string} screenToShow - 'selection', 'loading', o 'story'
     */
    function showScreen(screenToShow) {
        selectionScreen.classList.add('hidden');
        loadingScreen.classList.add('hidden');
        storyScreen.classList.add('hidden');

        if (screenToShow === 'selection') {
            selectionScreen.classList.remove('hidden');
        } else if (screenToShow === 'loading') {
            loadingScreen.classList.remove('hidden');
        } else if (screenToShow === 'story') {
            storyScreen.classList.remove('hidden');
        }
    }

    /**
     * Funzione principale per generare la storia
     */
    async function handleGenerateStory() {
        console.log('Chiave API utilizzata:', API_KEY);
        if (typeof API_KEY === 'undefined' || API_KEY === 'YOUR_API_KEY') {
            alert('Per favore, inserisci la tua API Key di Google AI nel file js/gemini-api.js');
            return;
        }
        
        const selections = getSelections();
        if (!selections) return;

        showScreen('loading');

        try {
            const { title, storyText } = await generateStory(selections.characters, selections.setting, selections.moral);
            storyTitleEl.textContent = title;
            storyTextEl.innerHTML = storyText.replace(/\n/g, '<br>');
            showScreen('story');
        } catch (error) {
            alert(`Oops! Qualcosa è andato storto: ${error.message}`);
            showScreen('selection');
        }
    }
    
    /**
     * Copia il testo della storia negli appunti
     */
    function handleCopyText() {
        const fullStory = `${storyTitleEl.textContent}\n\n${storyTextEl.innerText}`;
        navigator.clipboard.writeText(fullStory).then(() => {
            alert('Storia copiata negli appunti!');
        }).catch(err => {
            alert('Errore nella copia del testo.');
            console.error('Errore clipboard:', err);
        });
    }

    // --- INIZIALIZZAZIONE ---
    createOptionCards(characterOptionsContainer, charactersData, 'character');
    createOptionCards(settingOptionsContainer, settingsData, 'setting');
    createOptionCards(moralOptionsContainer, moralsData, 'moral');

    // --- EVENT LISTENERS ---
    document.querySelector('.options').parentElement.parentElement.addEventListener('click', handleCardSelection);
    generateStoryBtn.addEventListener('click', handleGenerateStory);

    newStoryBtn.addEventListener('click', () => {
         // Resetta le selezioni
        document.querySelectorAll('.option-card.selected').forEach(c => c.classList.remove('selected'));
        customCharacterInput.value = '';
        customSettingInput.value = '';
        customMoralInput.value = '';
        showScreen('selection');
    });

    copyTextBtn.addEventListener('click', handleCopyText);
});
