// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyB4NrnY4IkbizWajyLdp_NrbeVGocSSFjE",
  authDomain: "fidapp-b9785.firebaseapp.com",
  projectId: "fidapp-b9785",
  storageBucket: "fidapp-b9785.firebasestorage.app",
  messagingSenderId: "4591198983",
  appId: "1:4591198983:web:498272972b72970b3c9ba2"
})

const messaging = firebase.messaging()

// Recevoir les notifications en arrière-plan
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
  })
})