
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyDj92aIh1zniGW5Ps8S7uGswz8pxTw7LO4",
  authDomain: "weweather1-c9385.firebaseapp.com",
  databaseURL: "https://weweather1-c9385-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weweather1-c9385",
  storageBucket: "weweather1-c9385.firebasestorage.app",
  messagingSenderId: "855812580274",
  appId: "1:855812580274:web:9b658798f6f524ef52baab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
