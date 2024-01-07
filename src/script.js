document.addEventListener("DOMContentLoaded", function () {
    // Display the Actual Year in the footer onload
    const currentYearElement = document.getElementById("current-year");
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;

    // Translation Menu Dropdown
    const languageMenu = document.getElementById("language-menu");
    const languageList = document.getElementById("language-list");
    const currentLanguageContainer = document.getElementById("current-language-container");

    // Toggle language list visibility on click
    currentLanguageContainer.addEventListener("click", function () {
        languageList.style.display = (languageList.style.display === "block") ? "none" : "block";
    });

    // Set the selected language on click and close the menu
    languageList.addEventListener("click", function (event) {
        if (event.target.tagName === "LI") {
            const selectedLanguage = event.target.dataset.lang;
            document.getElementById("current-language").textContent = selectedLanguage;
            // Close the menu after a language is selected
            languageList.style.display = "none";
        }
    });

    // Close the menu when clicking anywhere else on the document
    document.addEventListener("click", function (e) {
        if (!languageMenu.contains(e.target) && !currentLanguageContainer.contains(e.target)) {
            languageList.style.display = "none";
        }
    });

    // Translation
    let language;

    function getLanguage() {
        const langCode = localStorage.getItem('language') || 'en';

        return fetch(`Languages/${langCode}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Language file not found or failed to load');
                }
                return response.json();
            })
            .then(lang => {
                language = lang;
                updateText();
            })
            .catch(error => console.error('Error fetching language:', error));
    }

    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        getLanguage();
    }

    function updateText() {
        const elementsToUpdate = ['li-eng', 'li-fr', 'h1', 'h2', 'name-label', 'email-label', 'password-label', 'agree',
            'terms', 'and', 'policy', 'sign-in-button', 'sign-up-button', 'or-text', 'google-button'
        ];

        elementsToUpdate.forEach(function (elementId) {
            const element = document.getElementById(elementId);
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                // For buttons, update the 'value' attribute
                element.value = language[elementId];
            } else {
                // For other elements, update the text content
                element.textContent = language[elementId];
            }
        });
    }

    // Set the initial language in the HTML
    const initialLanguage = localStorage.getItem('language') || 'en';
    document.getElementById("current-language").textContent = (initialLanguage === 'fr') ? 'Français' : 'English';

    // Add this function to set language from HTML buttons
    window.setLanguage = function (lang) {
        setLanguage(lang);
    };

    // Document ready
    getLanguage();
});
// FIREBASE 

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC-yV9fjSVKU-svWZbTv_GCgxta7qBBIrY",
    authDomain: "footbalia.firebaseapp.com",
    projectId: "footbalia",
    storageBucket: "footbalia.appspot.com",
    messagingSenderId: "401806992603",
    appId: "1:401806992603:web:866e3fece5021a811618fe"
};

// init firebase app
initializeApp(firebaseConfig);


// Auth
const auth = getAuth(); // Ensure that auth is initialized

const signUpForm = document.querySelector('.form');
const signInForm = document.querySelector('.form');
const signUpButton = document.getElementById('sign-up-button');
const signInButton = document.getElementById('sign-in-button');

let isSignUpMode = true;

signUpButton.addEventListener('click', function (e) {
    e.preventDefault();

    if (isSignUpMode) {
        // Handle sign-up logic
        const email = signUpForm.querySelector('#email').value;
        const password = signUpForm.querySelector('#password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                console.log("user created:", cred.user);
                signUpForm.reset();
            })
            .catch((error) => {
                console.error(error.message)
            });
    } else {
        // Switch back to sign-up mode
        isSignUpMode = true;

        // Reset the form to the sign-up version with all elements displayed
        document.getElementById('name-label-input').style.display = 'flex';
        document.getElementById('checkbox-container').style.display = 'flex';

        // Handle any additional logic or UI updates needed for sign-up mode
    }
});

signInButton.addEventListener('click', function (e) {
    e.preventDefault();

    if (isSignUpMode) {
        // Switch to sign-in mode
        isSignUpMode = false;

        // Hide the Name input and Terms/Privacy Policy section in sign-in mode
        document.getElementById('name-label-input').style.display = 'none';
        document.getElementById('checkbox-container').style.display = 'none';

    } else {
        // Handle sign-in logic
        const email = signInForm.querySelector('#email').value;
        const password = signInForm.querySelector('#password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((cred) => {
                console.log('User Logged In:', cred.user)
            })
            .catch((error) => {
                console.error(error.message)
            })
    }
});


// Log Out

// const logoutButton = document.querySelector('.logout');
// logoutButton.addEventListener('click', () => {
//     signOut(auth)
//     .then(() => {
//         console.log('User Signed Out')
//     })
//     .catch((error) => {
//         console.error(error.message)
//     })
// }) 