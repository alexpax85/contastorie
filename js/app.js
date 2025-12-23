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
    const createIllustrationBtn = document.getElementById('create-illustration'); // NEW

    const storyTitleEl = document.getElementById('story-title');
    const storyTextEl = document.getElementById('story-text');
    
    // Create container for media (Image)
    const storyMediaContainer = document.createElement('div');
    storyMediaContainer.id = 'story-media-container';
    // Insert it before the actions buttons
    storyScreen.insertBefore(storyMediaContainer, document.querySelector('#story-screen .actions'));

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

    // NEW: Handle Image Generation
    async function handleCreateIllustration() {
        const storyText = storyTextEl.innerText;
        if (!storyText) return;

        createIllustrationBtn.disabled = true;
        const originalText = createIllustrationBtn.textContent;
        createIllustrationBtn.textContent = "🎨 Sto disegnando...";

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: storyText })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Errore sconosciuto");
            }

            const data = await response.json();
            
            // Clear previous media
            storyMediaContainer.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = data.imageUrl;
            img.alt = "Illustrazione magica";
            img.style.maxWidth = '100%';
            img.style.borderRadius = '15px';
            img.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            img.style.marginTop = '20px';
            
            // Allow copying image on click (optional but nice)
            img.title = "Clicca per copiare l'immagine";
            img.style.cursor = "pointer";
            img.onclick = async () => {
                try {
                    const response = await fetch(data.imageUrl);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert("Immagine copiata negli appunti!");
                } catch (e) {
                    console.error("Copia immagine fallita", e);
                    alert("Impossibile copiare l'immagine automaticamente.");
                }
            };

            storyMediaContainer.appendChild(img);

        } catch (error) {
            console.error("Errore generazione immagine:", error);
            alert(`Non sono riuscito a creare il disegno: ${error.message}`);
        } finally {
            createIllustrationBtn.disabled = false;
            createIllustrationBtn.textContent = originalText;
        }
    }

    // --- INIZIALIZZAZIONE ---
    createOptionCards(characterOptionsContainer, charactersData, 'character', true);
    createOptionCards(settingOptionsContainer, settingsData, 'setting', true);
    createOptionCards(moralOptionsContainer, moralsData, 'moral', false); 

    // --- EVENT LISTENERS ---
    selectionScreen.addEventListener('click', handleCardClick); 
    moralOptionsContainer.addEventListener('click', handleMoralCardSelection); 
    generateStoryBtn.addEventListener('click', handleGenerateStory);
    popupSelectBtn.addEventListener('click', handlePopupSelect);
    popupCloseBtn.addEventListener('click', handlePopupClose);


    newStoryBtn.addEventListener('click', () => {
        storyTitleEl.textContent = '';
        storyTextEl.innerHTML = '';
        storyMediaContainer.innerHTML = ''; // Clear images

        document.querySelectorAll('.option-card.selected').forEach(c => c.classList.remove('selected'));
        customCharacterInput.value = '';
        customSettingInput.value = '';
        customMoralInput.value = '';
        
        window.scrollTo(0, 0);
        showScreen('selection');
    });

    copyTextBtn.addEventListener('click', handleCopyText);
    createIllustrationBtn.addEventListener('click', handleCreateIllustration); // Listener for new button
});