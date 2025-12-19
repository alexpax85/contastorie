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

    // --- POPUP ELEMENTI ---
    const popupOverlay = document.getElementById('popup-overlay');
    const popupText = document.getElementById('popup-text');
    const popupSelectBtn = document.getElementById('popup-select');
    const popupCloseBtn = document.getElementById('popup-close');
    let selectedCard = null;

    // --- FUNZIONI ---

    /**
     * Crea e popola le card di opzione.
     * @param {HTMLElement} container - Il contenitore dove inserire le card.
     * @param {Array<Object>} data - L'array di dati per le opzioni.
     * @param {string} type - Il tipo di opzione (character, setting, moral).
     * @param {boolean} usePopup - Se la card deve usare il popup per la selezione.
     */
    function createOptionCards(container, data, type, usePopup = true) {
        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('option-card');
            card.dataset.type = type;
            card.dataset.value = item.name;
            card.dataset.description = item.name;
            if (usePopup) {
                card.innerHTML = item.emoji;
            } else {
                card.innerHTML = `${item.emoji} <span>${item.name}</span>`;
                card.classList.add('moral-card'); // Aggiungi una classe specifica per le morali
            }
            container.appendChild(card);
        });
    }

    /**
     * Gestisce la selezione delle card per le morali (senza popup).
     * @param {MouseEvent} event - L'evento click.
     */
    function handleMoralCardSelection(event) {
        const card = event.target.closest('.moral-card');
        if (!card) return;

        const container = card.parentElement;
        container.querySelectorAll('.moral-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }

    /**
     * Mostra il popup con la descrizione e cambia il testo del pulsante.
     */
    function handleCardClick(event) {
        const card = event.target.closest('.option-card');
        if (!card || card.classList.contains('moral-card')) return; // Non aprire popup per moral-card

        selectedCard = card;
        popupText.textContent = card.dataset.description;
        if (selectedCard.classList.contains('selected')) {
            popupSelectBtn.textContent = "Deseleziona";
        } else {
            popupSelectBtn.textContent = "Seleziona";
        }
        popupOverlay.classList.remove('hidden');
    }

    /**
     * Gestisce la selezione/deselezione dal popup.
     */
    function handlePopupSelect() {
        if (!selectedCard) return;

        const { type } = selectedCard.dataset;
        
        if (type === 'character') {
            selectedCard.classList.toggle('selected');
        } else {
            // Per ambientazione, deseleziona gli altri
            const container = selectedCard.parentElement;
            container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            selectedCard.classList.add('selected');
        }
        handlePopupClose();
    }

    /**
     * Chiude il popup.
     */
    function handlePopupClose() {
        popupOverlay.classList.add('hidden');
        selectedCard = null;
    }


    /**
     * Raccoglie le selezioni dell'utente.
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
     * Mostra una schermata e nasconde le altre.
     */
    function hideElementAnimated(element, animationClass, onComplete) {
        if (element.classList.contains('hidden')) {
            if (onComplete) onComplete();
            return;
        }
        element.classList.add(animationClass, 'animating-out');
        const handleAnimationEnd = () => {
            element.classList.add('hidden');
            element.classList.remove(animationClass, 'animating-out');
            element.removeEventListener('animationend', handleAnimationEnd);
            if (onComplete) onComplete();
        };
        element.addEventListener('animationend', handleAnimationEnd, { once: true });
    }

    function showElementAnimated(element, animationClass) {
        element.classList.remove('hidden');
        element.classList.add(animationClass);
        const handleAnimationEnd = () => {
            element.classList.remove(animationClass);
            element.removeEventListener('animationend', handleAnimationEnd);
        };
        element.addEventListener('animationend', handleAnimationEnd, { once: true });
    }

    /**
     * Mostra una schermata e nasconde le altre con animazioni.
     */
    function showScreen(screenToShow) {
        const screens = {
            selection: selectionScreen,
            loading: loadingScreen,
            story: storyScreen
        };

        for (const key in screens) {
            if (key !== screenToShow) {
                hideElementAnimated(screens[key], 'fadeIn'); // Use fadeIn for hiding for now
            }
        }

        if (screenToShow === 'selection') {
            showElementAnimated(selectionScreen, 'fadeIn');
        } else if (screenToShow === 'loading') {
            showElementAnimated(loadingScreen, 'fadeIn');
        } else if (screenToShow === 'story') {
            showElementAnimated(storyScreen, 'fadeIn');
        }
    }

    /**
     * Funzione principale per generare la storia.
     */
    async function handleGenerateStory() {
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
     * Copia il testo della storia negli appunti.
     */
    function handleCopyText() {
        console.log('Attempting to copy story to clipboard...');
        const fullStory = `${storyTitleEl.textContent}\n\n${storyTextEl.innerText}`;
        navigator.clipboard.writeText(fullStory).then(() => {
            alert('Storia copiata negli appunti con successo!');
        }).catch(err => {
            alert('Errore durante la copia del testo negli appunti. Controlla la console per dettagli.');
            console.error('Errore clipboard:', err);
        });
    }

    // --- INIZIALIZZAZIONE ---
    createOptionCards(characterOptionsContainer, charactersData, 'character', true);
    createOptionCards(settingOptionsContainer, settingsData, 'setting', true);
    createOptionCards(moralOptionsContainer, moralsData, 'moral', false); // Le morali usano il vecchio stile

    // --- EVENT LISTENERS ---
    selectionScreen.addEventListener('click', handleCardClick); // Per personaggi e ambientazioni (con popup)
    moralOptionsContainer.addEventListener('click', handleMoralCardSelection); // Per morali (senza popup)
    generateStoryBtn.addEventListener('click', handleGenerateStory);
    popupSelectBtn.addEventListener('click', handlePopupSelect);
    popupCloseBtn.addEventListener('click', handlePopupClose);


    newStoryBtn.addEventListener('click', () => {
        // Pulisci la storia precedente
        storyTitleEl.textContent = '';
        storyTextEl.innerHTML = '';

        // Resetta le selezioni
        document.querySelectorAll('.option-card.selected').forEach(c => c.classList.remove('selected'));
        customCharacterInput.value = '';
        customSettingInput.value = '';
        customMoralInput.value = '';
        
        // Riporta in cima e mostra la schermata di selezione
        window.scrollTo(0, 0);
        showScreen('selection');
    });

    copyTextBtn.addEventListener('click', handleCopyText);
});
