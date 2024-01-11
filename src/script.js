// Import Firebase modules
import { firebaseConfig } from './firebase';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { getLanguage, setLanguage, updateText, langCode } from './translation.js';
import errorMessages from './error.js';


document.addEventListener("DOMContentLoaded", function () {

     function loadingScreen() {
        const loadingScreenElement = document.getElementById("loading-screen");
        loadingScreenElement.style.display = "flex";
        setTimeout(() => {
            // Hide the loading screen after 3 seconds
            loadingScreenElement.style.display = "none";
        }, 1600);
    }

    loadingScreen();



    // Display the Actual Year in the footer onload
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // TRANSLATION

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
    // Set the initial language in the HTML
    document.getElementById("current-language").textContent = (langCode() === 'fr') ? 'Français' : 'English';
    // Function to set language from HTML buttons
    window.setLanguage = function (lang) {
        setLanguage(lang).then(() => updateText());
    };
    // Document ready
    getLanguage().then(() => updateText());


    // FIREBASE

    // Init firebase app
    initializeApp(firebaseConfig);

    // Auth
    const auth = getAuth();

    auth.onAuthStateChanged((user) => {
        loadingScreen();
            if (user) {
                showLoggedPage();
            } else {
                showConnexionPage();
            }
    });


    const form = document.querySelector('.form');
    const signUpButton = document.getElementById('sign-up-button');
    const signInButton = document.getElementById('sign-in-button');

    let isSignUpMode = true;

    signUpButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (isSignUpMode) {
            handleSignUp();
        } else {
            // Switch back to sign-up mode
            isSignUpMode = true;
            showSignUpForm();
        }
    });

    signInButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (isSignUpMode) {
            // Switch to sign-in mode
            isSignUpMode = false;
            showSignInForm();
        } else {
            handleSignIn();
        }
    });

    // Showing Pages
    function showConnexionPage() {
        // Show connexion page content, hide logged page content
        document.querySelector('.connexion-page').style.display = 'block';
        document.querySelector('.logged-page').style.display = 'none';
    }

    function showLoggedPage() {
        // Get the current user
        const user = auth.currentUser;

        if (user) {
            // Show logged page content, hide connexion page content
            document.querySelector('.connexion-page').style.display = 'none';
            document.querySelector('.logged-page').style.display = 'block';
            const userName = user.displayName;
            const welcomeMessage = document.getElementById('h3');
            welcomeMessage.textContent = (langCode() === "en") ? `Welcome to Footballia, ${userName}` : `Bienvenue sur Footballia, ${userName}`;
            const disconnectionButton = document.getElementById('disconnect');
            disconnectionButton.textContent = (langCode() === "en") ? `Disconnection` : `Se deconnecter`;

        } else {
            showConnexionPage()
        }
    }

    // Hide/Show input to show the right Form
    function showSignInForm() {
        document.getElementById('name-label-input').style.display = 'none';
        document.getElementById('checkbox-container').style.display = 'none';
    }

    function showSignUpForm() {
        document.getElementById('name-label-input').style.display = 'flex';
        document.getElementById('checkbox-container').style.display = 'flex';
    }

    // Submit the form by pressing on Enter
    form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
    
            if (isSignUpMode) {
                signUpButton.click();
            } else {
                signInButton.click();
            }
        }
    });
    
    // Handling Form
    
    function validateSignUpInput(email, password, name, checkbox) {
        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const MIN_PASSWORD_LENGTH = 6;

        const lang = langCode();

        const showError = (message) => {
            alert(message[lang]);
        };
    
        const errorConditions = [
            { shouldShowError: !checkbox.checked, message: errorMessages.agreement },
            { shouldShowError: !name || name.trim() === "", message: errorMessages.name },
            { shouldShowError: !email || !emailFormat.test(email), message: !email ? errorMessages.invalidEmail : errorMessages.invalidEmailFormat },
            { shouldShowError: password.trim() === "", message: errorMessages.missingPassword },
            { shouldShowError: password.length < MIN_PASSWORD_LENGTH, message: errorMessages.weakPassword },
        ];
    
        for (const condition of errorConditions) {
            if (condition.shouldShowError) {
                showError(condition.message);
                return false;
            }
        }
        
        return true;
    }
    
    function signUpWithEmailAndPassword(email, password, name) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => updateProfile(auth.currentUser, { displayName: name }))
            .then(showLoggedPage)
            .catch((error) => {
                const errorCode = error.code;
                switch (errorCode) {
                    case 'auth/email-already-in-use':
                        alert(errorMessages.emailInUse[langCode()]);
                        break;
                    default:
                        alert(errorMessages.genericError[langCode()]);
                }
            });
    }

    function handleSignUp() {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const name = form.querySelector('#name').value;
        const checkbox = form.querySelector('#checkbox');
    
        if (validateSignUpInput(email, password, name, checkbox)) {
            signUpWithEmailAndPassword(email, password, name);
        }
    }
    


    function handleSignIn() {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        signInWithEmailAndPassword(auth, email, password)
            .catch(() => {
                const errorMessage = (langCode() === "en") ? "Email or password incorrect" : "L'email et/ou le mot de passe ne correspondent pas";
                alert(errorMessage);
            });
    }

    // Google Sign in

    const provider = new GoogleAuthProvider();

    const googleLoginButton = document.getElementById('google-login');

    auth.languageCode = langCode();

    googleLoginButton.addEventListener('click', function () {
        signInWithGoogle();
    });

    function signInWithGoogle() {
        signInWithPopup(auth, provider)
            .then((result) => {
                updateProfile(auth.currentUser, { mail: mail });
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const user = result.user;
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(`Google Sign-In Error: ${errorCode} - ${errorMessage}`);
            });
    }

    // Log Out
    const logoutButton = document.getElementById('disconnect');

    logoutButton.addEventListener('click', () => {
        signOut(auth)
    });
});


