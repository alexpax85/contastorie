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
        { name: "Cagnolino affettuoso", emoji: "🐶" },
        { name: "Pianta carnivora", emoji: "🪴" },
        { name: "Orsetto goloso", emoji: "🧸" },
        { name: "Sirenetta", emoji: "🧜‍♀️" },
        { name: "Pesciolino gentile", emoji: "🐠" },
    ];

    const settingsData = [
        { name: "Bosco incantato", emoji: "🌲" },
        { name: "Regno fatato", emoji: "🏰" },
        { name: "Mondo sottomarino", emoji: "🌊" },
        { name: "Spazio profondo", emoji: "🌌" },
        { name: "Villaggio magico", emoji: "🏘️" },
        { name: "Montagne delle nuvole", emoji: "🏔️" },
        { name: "Isola arcobaleno", emoji: "🌈" },
        { name: "Mondo degli unicorni", emoji: "✨" },
        { name: "Spiaggia dorata", emoji: "🏖️" },
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
    const createComicBtn = document.getElementById('create-comic');
    const createImagePromptBtn = document.getElementById('create-image-prompt');

    const storyTitleEl = document.getElementById('story-title');
    const storyTextEl = document.getElementById('story-text');

    // --- POPUP ELEMENTI ---
    const popupOverlay = document.getElementById('popup-overlay');
    const popupText = document.getElementById('popup-text');
    const popupSelectBtn = document.getElementById('popup-select');
    const popupCloseBtn = document.getElementById('popup-close');
    let selectedCard = null;

    // --- FUNZIONI ---

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
                card.classList.add('moral-card'); 
            }
            container.appendChild(card);
        });
    }

    function handleMoralCardSelection(event) {
        const card = event.target.closest('.moral-card');
        if (!card) return;

        const container = card.parentElement;
        container.querySelectorAll('.moral-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }

    function handleCardClick(event) {
        const card = event.target.closest('.option-card');
        if (!card || card.classList.contains('moral-card')) return;

        selectedCard = card;
        popupText.textContent = card.dataset.description;
        if (selectedCard.classList.contains('selected')) {
            popupSelectBtn.textContent = "Deseleziona";
        } else {
            popupSelectBtn.textContent = "Seleziona";
        }
        popupOverlay.classList.remove('hidden');
    }

    function handlePopupSelect() {
        if (!selectedCard) return;

        const { type } = selectedCard.dataset;
        
        if (type === 'character') {
            selectedCard.classList.toggle('selected');
        } else {
            const container = selectedCard.parentElement;
            container.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            selectedCard.classList.add('selected');
        }
        handlePopupClose();
    }

    function handlePopupClose() {
        popupOverlay.classList.add('hidden');
        selectedCard = null;
    }

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

    function showScreen(screenToShow) {
        const screens = {
            selection: selectionScreen,
            loading: loadingScreen,
            story: storyScreen
        };

        for (const key in screens) {
            if (key !== screenToShow) {
                hideElementAnimated(screens[key], 'fadeIn');
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
    
    function handleCopyText() {
        const fullStory = `${storyTitleEl.textContent}\n\n${storyTextEl.innerText}`;
        navigator.clipboard.writeText(fullStory).then(() => {
            alert('Storia copiata negli appunti con successo!');
        }).catch(err => {
            alert('Errore durante la copia del testo negli appunti.');
            console.error('Errore clipboard:', err);
        });
    }

    // Prompt per un fumetto a vignette basato sulla storia
    function buildComicPrompt(title, storyText) {
        return `Crea un fumetto a più vignette basato su questa fiaba per bambini, seguendo fedelmente l'intera trama dall'inizio alla fine, senza riassumere, saltare o accorciare passaggi della storia. Usa tutte le vignette necessarie per coprire ogni scena significativa. Mantieni personaggi e ambientazione coerenti in ogni vignetta, stile illustrato colorato e adatto ai bambini, con brevi didascalie o dialoghi dove utile.\n\nTitolo: ${title}\n\nStoria completa (da seguire per intero):\n${storyText}`;
    }

    // Prompt per un'unica immagine riassuntiva della storia
    function buildSummaryImagePrompt(title, storyText) {
        return `Crea un'unica illustrazione, in stile libro per bambini (acquerello, disegnata a mano, colori pastello caldi), che riassuma visivamente il momento più significativo di questa fiaba.\n\nTitolo: ${title}\n\nStoria:\n${storyText}`;
    }

    async function copyPromptToClipboard(promptText, successMessage) {
        try {
            await navigator.clipboard.writeText(promptText);
            alert(successMessage);
        } catch (err) {
            console.error('Errore clipboard:', err);
            alert('Errore durante la copia del prompt negli appunti.');
        }
    }

    function handleCreateComic() {
        const storyText = storyTextEl.innerText;
        if (!storyText) return;
        const prompt = buildComicPrompt(storyTitleEl.textContent, storyText);
        copyPromptToClipboard(prompt, '📋 Prompt per il fumetto copiato! Incollalo nella tua app AI preferita (ChatGPT, Gemini...) per generarlo.');
    }

    function handleCreateImagePrompt() {
        const storyText = storyTextEl.innerText;
        if (!storyText) return;
        const prompt = buildSummaryImagePrompt(storyTitleEl.textContent, storyText);
        copyPromptToClipboard(prompt, "📋 Prompt per l'immagine copiato! Incollalo nella tua app AI preferita (ChatGPT, Gemini...) per generarla.");
    }

    newStoryBtn.addEventListener('click', () => {
        storyTitleEl.textContent = '';
        storyTextEl.innerHTML = '';

        document.querySelectorAll('.option-card.selected').forEach(c => c.classList.remove('selected'));
        customCharacterInput.value = '';
        customSettingInput.value = '';
        customMoralInput.value = '';
        
        window.scrollTo(0, 0);
        showScreen('selection');
    });

    copyTextBtn.addEventListener('click', handleCopyText);
    createComicBtn.addEventListener('click', handleCreateComic);
    createImagePromptBtn.addEventListener('click', handleCreateImagePrompt);

    // Initialize option cards
    createOptionCards(characterOptionsContainer, charactersData, 'character');
    createOptionCards(settingOptionsContainer, settingsData, 'setting');
    createOptionCards(moralOptionsContainer, moralsData, 'moral', false);

    // Card click handlers
    characterOptionsContainer.addEventListener('click', handleCardClick);
    settingOptionsContainer.addEventListener('click', handleCardClick);
    moralOptionsContainer.addEventListener('click', handleMoralCardSelection);

    // Popup handlers
    popupSelectBtn.addEventListener('click', handlePopupSelect);
    popupCloseBtn.addEventListener('click', handlePopupClose);
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) handlePopupClose();
    });

    // Generate story
    generateStoryBtn.addEventListener('click', handleGenerateStory);
});