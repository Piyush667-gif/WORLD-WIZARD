class WordWizard {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.wordTitle = document.getElementById('wordTitle');
        this.phonetics = document.getElementById('phonetics');
        this.meanings = document.getElementById('meanings');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        // Auto-focus on search input
        this.searchInput.focus();
    }
    
    async handleSearch() {
        const word = this.searchInput.value.trim().toLowerCase();
        
        if (!word) {
            this.showError('Please enter a word to search.');
            return;
        }
        
        this.showLoading();
        
        try {
            const data = await this.fetchWordData(word);
            this.displayResults(data);
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async fetchWordData(word) {
        try {
            const response = await fetch(`${this.apiUrl}${encodeURIComponent(word)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Sorry, we couldn't find the word "${word}". Please check your spelling and try again.`);
                } else {
                    throw new Error('Something went wrong. Please try again later.');
                }
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            if (error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            }
            throw error;
        }
    }
    
    showLoading() {
        this.hideAllStates();
        this.loadingState.classList.remove('hidden');
    }
    
    showError(message) {
        this.hideAllStates();
        this.errorMessage.textContent = message;
        this.errorState.classList.remove('hidden');
    }
    
    hideAllStates() {
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        this.resultsContainer.classList.add('hidden');
    }
    
    displayResults(data) {
        this.hideAllStates();
        
        const wordData = data[0];
        
        // Display word title
        this.wordTitle.textContent = wordData.word;
        
        // Display phonetics
        this.displayPhonetics(wordData.phonetics || []);
        
        // Display meanings
        this.displayMeanings(wordData.meanings || []);
        
        this.resultsContainer.classList.remove('hidden');
        
        // Smooth scroll to results
        this.resultsContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    displayPhonetics(phonetics) {
        this.phonetics.innerHTML = '';
        
        if (phonetics.length === 0) return;
        
        phonetics.forEach(phonetic => {
            if (phonetic.text) {
                const phoneticElement = document.createElement('div');
                phoneticElement.className = 'phonetic-item';
                
                const textSpan = document.createElement('span');
                textSpan.textContent = phonetic.text;
                phoneticElement.appendChild(textSpan);
                
                if (phonetic.audio) {
                    const audioBtn = document.createElement('button');
                    audioBtn.className = 'audio-btn';
                    audioBtn.innerHTML = '🔊';
                    audioBtn.title = 'Play pronunciation';
                    audioBtn.addEventListener('click', () => {
                        const audio = new Audio(phonetic.audio);
                        audio.play().catch(e => console.log('Audio playback failed:', e));
                    });
                    phoneticElement.appendChild(audioBtn);
                }
                
                this.phonetics.appendChild(phoneticElement);
            }
        });
    }
    
    displayMeanings(meanings) {
        this.meanings.innerHTML = '';
        
        meanings.forEach(meaning => {
            const meaningSection = document.createElement('div');
            meaningSection.className = 'meaning-section';
            
            // Part of speech
            const partOfSpeech = document.createElement('h3');
            partOfSpeech.className = 'part-of-speech';
            partOfSpeech.textContent = meaning.partOfSpeech;
            meaningSection.appendChild(partOfSpeech);
            
            // Definitions
            if (meaning.definitions && meaning.definitions.length > 0) {
                const definitionsList = document.createElement('ul');
                definitionsList.className = 'definitions-list';
                
                meaning.definitions.forEach(def => {
                    const definitionItem = document.createElement('li');
                    definitionItem.className = 'definition-item';
                    
                    const definitionText = document.createElement('div');
                    definitionText.className = 'definition-text';
                    definitionText.textContent = def.definition;
                    definitionItem.appendChild(definitionText);
                    
                    // Example
                    if (def.example) {
                        const example = document.createElement('div');
                        example.className = 'example';
                        example.textContent = `Example: "${def.example}"`;
                        definitionItem.appendChild(example);
                    }
                    
                    definitionsList.appendChild(definitionItem);
                });
                
                meaningSection.appendChild(definitionsList);
            }
            
            // Synonyms
            if (meaning.synonyms && meaning.synonyms.length > 0) {
                const synonymsDiv = document.createElement('div');
                synonymsDiv.className = 'synonyms';
                
                const synonymsTitle = document.createElement('h4');
                synonymsTitle.textContent = 'Synonyms:';
                synonymsDiv.appendChild(synonymsTitle);
                
                const synonymsList = document.createElement('div');
                synonymsList.className = 'word-list';
                
                meaning.synonyms.slice(0, 8).forEach(synonym => {
                    const synonymTag = document.createElement('span');
                    synonymTag.className = 'word-tag';
                    synonymTag.textContent = synonym;
                    synonymTag.addEventListener('click', () => {
                        this.searchInput.value = synonym;
                        this.handleSearch();
                    });
                    synonymsList.appendChild(synonymTag);
                });
                
                synonymsDiv.appendChild(synonymsList);
                meaningSection.appendChild(synonymsDiv);
            }
            
            // Antonyms
            if (meaning.antonyms && meaning.antonyms.length > 0) {
                const antonymsDiv = document.createElement('div');
                antonymsDiv.className = 'antonyms';
                
                const antonymsTitle = document.createElement('h4');
                antonymsTitle.textContent = 'Antonyms:';
                antonymsDiv.appendChild(antonymsTitle);
                
                const antonymsList = document.createElement('div');
                antonymsList.className = 'word-list';
                
                meaning.antonyms.slice(0, 8).forEach(antonym => {
                    const antonymTag = document.createElement('span');
                    antonymTag.className = 'word-tag';
                    antonymTag.textContent = antonym;
                    antonymTag.addEventListener('click', () => {
                        this.searchInput.value = antonym;
                        this.handleSearch();
                    });
                    antonymsList.appendChild(antonymTag);
                });
                
                antonymsDiv.appendChild(antonymsList);
                meaningSection.appendChild(antonymsDiv);
            }
            
            this.meanings.appendChild(meaningSection);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordWizard();
});

// Add some sample searches for demonstration
const sampleWords = ['serendipity', 'javascript', 'ephemeral', 'ubiquitous', 'mellifluous'];

// Optional: Add a random word feature
function getRandomSampleWord() {
    return sampleWords[Math.floor(Math.random() * sampleWords.length)];
}