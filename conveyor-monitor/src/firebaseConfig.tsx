import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDKegkVWSANct_yVgBj7RiytQ-GTWXD3Do",
  authDomain: "conveyor-monitor-7a197.firebaseapp.com",
  databaseURL: "https://conveyor-monitor-7a197-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "conveyor-monitor-7a197",
  storageBucket: "conveyor-monitor-7a197.firebasestorage.app",
  messagingSenderId: "1071445111847",
  appId: "1:1071445111847:web:ee052227fa9e533ac48a02"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export database biar bisa diakses di komponen lain
export const db = getDatabase(app);
export { ref, onValue, set, remove, push };