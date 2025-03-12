import { BrowserUtils, browserUtils as lbu } from "./browserUtils";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, Auth } from "firebase/auth";
import { Offscreen, offscreen } from "./offscreen";

export class FirebaseManager {
    browserUtils: BrowserUtils;
    offscreen: Offscreen | null = null;
    auth: Auth | null = null;
    currentUser: any = null;
    loading: boolean = true;

    constructor(browserUtils: BrowserUtils = lbu) {
        this.browserUtils = browserUtils;
        this.setupFirebaseIfRequired();
    }

    async setupFirebaseIfRequired() {
        const { isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isFirefox || isSafari) {
            const firebaseConfig = {
                apiKey: 'AIzaSyATJuMtg6ucTh5RROL6V4WVa4xB4HWXZgA',
                authDomain: 'auth.getreadefine.com',
                databaseURL: 'https://query-readefine.firebaseio.com',
                projectId: 'query-readefine',
                storageBucket: 'query-readefine.appspot.com',
                messagingSenderId: '505377161365',
                appId: '1:505377161365:web:1e9f68316802dd87df1b9c',
                measurementId: "G-7YHB86PJVQ"
            };

            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);

            // Listen for auth state changes
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
    }

    async getUserState() {
        const { isChrome, isEdge, isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isChrome || isEdge) {
            await offscreen?.setupOffscreenDocument(offscreen.OFFSCREEN_DOCUMENT_PATH);

            const auth = await chrome.runtime.sendMessage({
                osaction: true,
                type: 'GET_USER_STATE'
            });

            return auth;
        } else if (isFirefox || isSafari) {
            return { user: this.getUserData(this.currentUser), loading: this.loading };
        }
    }

    async getUserToken() {
        const { isChrome, isEdge, isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isChrome || isEdge) {
            await offscreen?.setupOffscreenDocument(offscreen.OFFSCREEN_DOCUMENT_PATH);

            const token = await chrome.runtime.sendMessage({
                osaction: true,
                type: 'GET_USER_TOKEN'
            });

            return token;
        } else if (isFirefox || isSafari) {
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
        }
    }

    async getUserId() {
        const { isChrome, isEdge, isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isChrome || isEdge) {
            await offscreen?.setupOffscreenDocument(offscreen.OFFSCREEN_DOCUMENT_PATH);

            const userId = await chrome.runtime.sendMessage({
                osaction: true,
                type: 'GET_USER_ID'
            });

            return userId;
        } else if (isFirefox || isSafari) {
            return { uid: this.currentUser?.uid }
        }
    }

    async signUserIn(message: any) {
        const { isChrome, isEdge, isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isChrome || isEdge) {
            await offscreen?.setupOffscreenDocument(offscreen.OFFSCREEN_DOCUMENT_PATH);

            const auth = await chrome.runtime.sendMessage({
                osaction: true,
                type: 'SIGN_USER_IN',
                customToken: message.customToken
            });

            return auth;
        } else if (isFirefox || isSafari) {
            if (message.customToken && this.auth) {
                try {
                    const userCredential = await signInWithCustomToken(this.auth, message.customToken);
                    this.currentUser = userCredential.user;
                    this.loading = false;

                    return { success: true, user: this.getUserData(this.currentUser) };
                } catch (error: any) {
                    console.error('Error signing in with custom token:', error);
                    return { success: false, error: error.message };
                }
            } else {
                return { success: false, error: 'No custom token provided' };
            }
        }
    }

    async signUserOut() {
        const { isChrome, isEdge, isFirefox, isSafari } = this.browserUtils.getBrowserInfo();
        if (isChrome || isEdge) {
            await offscreen?.setupOffscreenDocument(offscreen.OFFSCREEN_DOCUMENT_PATH);

            const auth = await chrome.runtime.sendMessage({
                osaction: true,
                type: 'SIGN_USER_OUT'
            });

            return auth;
        } else if (isFirefox || isSafari) {
            if (this.auth) {
                try {
                    await this.auth.signOut();
                    this.currentUser = null;
                    return { success: true };
                } catch (error: any) {
                    console.error('Error signing out:', error);
                    return { success: false, error: error.message };
                }
            }
        }
    }

    private getUserData(user: any) {
        if (!user) return null;
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
    }
}

export const firebaseManager = new FirebaseManager();