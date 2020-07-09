import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyAL18R-v6CEW5YepWqk9u36BOnR-eZ6GiQ",
  authDomain: "book-porter-5e0df.firebaseapp.com",
  databaseURL: "https://book-porter-5e0df.firebaseio.com",
  projectId: "book-porter-5e0df",
  storageBucket: "book-porter-5e0df.appspot.com",
  messagingSenderId: "420936550966",
  appId: "1:420936550966:web:48e1324189a5895517a697"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
