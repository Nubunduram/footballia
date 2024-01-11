let language;

//Check What's the Actual Language
function langCode() {
    return localStorage.getItem('language') || 'en';
}


function getLanguage() {
    return fetch(`Languages/${langCode()}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Language file not found or failed to load');
            }
            return response.json();
        })
        .then(lang => {
            language = lang;
        })
        .catch(error => console.error('Error fetching language:', error));
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    return getLanguage();
}

function updateText() {
    const elementsToUpdate = ['li-eng', 'li-fr', 'h1', 'h2', 'name-label', 'email-label', 'password-label', 'agree',
        'terms', 'and', 'policy', 'sign-in-button', 'sign-up-button', 'or-text', 'google-button'
    ];

    elementsToUpdate.forEach(function (elementId) {
        const element = document.getElementById(elementId);
        if (element && (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit'))) {
            element.value = language[elementId];
        } else if (element) {
            element.textContent = language[elementId];
        }
    });
}

export { getLanguage, setLanguage, updateText, langCode };