import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


// production Firebase config.
const firebaseConfigpPROD = {
  apiKey: "AIzaSyCEjv9f7n107pZmtwJrver9BWZFIbLKlcU",
  authDomain: "mybundeeproduction.firebaseapp.com",
  projectId: "mybundeeproduction",
  storageBucket: "mybundeeproduction.appspot.com",
  messagingSenderId: "42828664879",
  appId: "1:42828664879:web:bc99672305773ff25836da"
};


// QA Firebase config.
const firebaseConfigQA = {
  apiKey: "AIzaSyCDrkykMVA-vT7h2KwR9vNs_Jhv4cycuMM",
  authDomain: "mybundeedev.firebaseapp.com",
  projectId: "mybundeedev",
  storageBucket: "mybundeedev.appspot.com",
  messagingSenderId: "904803044779",
  appId: "1:904803044779:web:98a2d6323f0222d6c996ee",
};


// development Firebase config.
const firebaseConfigDEV = {
  apiKey: "AIzaSyBZyUq9n3lPrLmcmOSOzWY5_hYud-nQUew",
  authDomain: "bundee.firebaseapp.com",
  projectId: "bundee",
  storageBucket: "bundee.appspot.com",
  messagingSenderId: "238975725958",
  appId: "1:238975725958:web:e41401ba2ad7548ecefc07"
};

const env = process.env.NEXT_PUBLIC_APP_ENV

let firebaseConfig;

if (env === "production") {
  firebaseConfig = firebaseConfigpPROD;
} else if (env === "test") {
  firebaseConfig = firebaseConfigQA;
} else {
  firebaseConfig = firebaseConfigDEV;
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;