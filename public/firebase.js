// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClDuNC17qkry3Oit7oVsT5swpt3yggtkI",
  authDomain: "thao-nguyen-case-study.firebaseapp.com",
  projectId: "thao-nguyen-case-study",
  storageBucket: "thao-nguyen-case-study.appspot.com",
  messagingSenderId: "165708911969",
  appId: "1:165708911969:web:03dc02b0a8ed2c86c1a120",
  measurementId: "G-LMCX5CCN3B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
