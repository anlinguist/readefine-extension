// offscreenAuth.ts

import { initializeApp } from "firebase/app";
import { Auth, getAuth, User } from "firebase/auth";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth/web-extension";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

interface Message {
    type: string;
    [key: string]: any;
}

interface Response {
    success?: boolean;
    error?: string;
    [key: string]: any;
}

class OffscreenAuth {
    app: FirebaseApp;
    firebaseConfig: FirebaseOptions;
    auth: Auth;
    currentUser: User | null = null;
    loading: boolean = true;

    constructor() {
        this.firebaseConfig = {
            apiKey: 'AIzaSyATJuMtg6ucTh5RROL6V4WVa4xB4HWXZgA',
            authDomain: 'auth.getreadefine.com',
            databaseURL: 'https://query-readefine.firebaseio.com',
            projectId: 'query-readefine',
            storageBucket: 'query-readefine.appspot.com',
            messagingSenderId: '505377161365',
            appId: '1:505377161365:web:1e9f68316802dd87df1b9c',
            measurementId: "G-7YHB86PJVQ"
        };
        this.app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.app);

        this.setupAuthStateListener();
        this.setupMessageListener();
    }

    private setupAuthStateListener() {
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this.loading = false;

            chrome.runtime.sendMessage({
                type: 'USER_STATE_UPDATED',
                user: this.getUserData(this.currentUser),
                loading: this.loading,
            });
        });
    }

    private setupMessageListener() {
        chrome.runtime.onMessage.addListener(this.messageHandler.bind(this));
    }

    private messageHandler(
        message: Message,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: Response) => void
    ) {
        if (!message.osaction) {
            return false;
        }
        (async () => {
            if (sender.id === chrome.runtime.id) {
                const response = await this.messageSwitchBoard(message);
                sendResponse(response);
            } else {
                sendResponse({ error: 'Unauthorized sender', success: false });
            }
        })();
        return true;
    }

    private async messageSwitchBoard(message: Message): Promise<Response> {
        switch (message.type) {
            case 'GET_USER_STATE':
                return { user: this.getUserData(this.currentUser), loading: this.loading };

            case 'GET_USER_TOKEN':
                if (this.currentUser) {
                    try {
                        const token = await this.currentUser.getIdToken();
                        return { token };
                    } catch (error: any) {
                        console.error('Error getting token:', error);
                        return { token: undefined, error: error.message };
                    }
                } else {
                    return { token: undefined, error: 'No user is signed in' };
                }

            case 'GET_USER_ID':
                if (this.currentUser) {
                    return { uid: this.currentUser.uid };
                } else {
                    return { uid: undefined, error: 'No user is signed in' };
                }

            case 'SIGN_USER_IN':
                if (message.customToken) {
                    return await this.handleSignInWithCustomToken(message.customToken);
                } else {
                    return { success: false, error: 'No custom token provided' };
                }

            case 'SIGN_USER_OUT':
                try {
                    await this.auth.signOut();
                    return { success: true };
                } catch (error: any) {
                    console.error('Error signing out:', error);
                    return { success: false, error: error.message };
                }

            default:
                return { error: 'Unknown message type', success: false };
        }
    }

    private async handleSignInWithCustomToken(customToken: string): Promise<Response> {
        try {
            const userCredential = await signInWithCustomToken(this.auth, customToken);
            this.currentUser = userCredential.user;
            this.loading = false;

            chrome.runtime.sendMessage({
                type: 'USER_STATE_UPDATED',
                user: this.getUserData(this.currentUser),
                loading: this.loading,
            });

            return { success: true };
        } catch (error: any) {
            console.error('Error signing in with custom token:', error);
            return { success: false, error: error.message };
        }
    }

    private getUserData(user: User | null) {
        if (!user) return null;
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
    }
}

new OffscreenAuth();