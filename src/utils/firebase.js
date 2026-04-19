// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjj0Dupip9pIbi_de8F8EYF1QZYRTQVFw",
  authDomain: "clone-project-3115b.firebaseapp.com",
  projectId: "clone-project-3115b",
  storageBucket: "clone-project-3115b.firebasestorage.app",
  messagingSenderId: "819953227460",
  appId: "1:819953227460:web:3668868734c93c533d5b91",
  measurementId: "G-XS1XS1YN9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth=getAuth()