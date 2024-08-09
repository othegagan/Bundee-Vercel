import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("4f1aaae66406e358");
const iv = CryptoJS.enc.Utf8.parse("df1e180949793972");

// Function to encrypt data
export const encryptingData = (userId) => {
    try {
        const encrypted = CryptoJS.AES.encrypt(userId, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const encryptedText = encrypted.toString();

        if (process.env.NODE_ENV === "development") {
            console.log("Encrypted Text:", encryptedText);
        }

        return encryptedText;
    } catch (error) {
        console.error("Encryption Error:", error);
        return null;
    }
};

// Function to decrypt data
export const decryptingData = (cipherText) => {
    try {
        const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const decryptedString = CryptoJS.enc.Utf8.stringify(decrypted);

        if (process.env.NODE_ENV === "development") {
            console.log("Decrypted Text:", decryptedString);
        }

        return decryptedString;
    } catch (error) {
        console.error("Decryption Error:", error);
        return null;
    }
};
