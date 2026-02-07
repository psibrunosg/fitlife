importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAjpS8IWMJmlEHw6_7VRHATbLWJeHzbCYU",
  authDomain: "fisicalplanner.firebaseapp.com",
  databaseURL: "https://fisicalplanner-default-rtdb.firebaseio.com",
  projectId: "fisicalplanner",
  storageBucket: "fisicalplanner.firebasestorage.app",
  messagingSenderId: "439728765666",
  appId: "1:439728765666:web:884c65f808b9337a31bcbb",
  measurementId: "G-8G6JJXX00Z"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://ui-avatars.com/api/?name=Fit+Life&background=10b981&color=fff',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});