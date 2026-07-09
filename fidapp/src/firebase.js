// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyB4NrnY4IkbizWajyLdp_NrbeVGocSSFjE",
  authDomain: "fidapp-b9785.firebaseapp.com",
  projectId: "fidapp-b9785",
  storageBucket: "fidapp-b9785.firebasestorage.app",
  messagingSenderId: "4591198983",
  appId: "1:4591198983:web:498272972b72970b3c9ba2"
};

const app       = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

const VAPID_KEY = "BLhdlVt4bCqNfslyRDrQhKQHouvxjXJgFmJD3mKOSwm6WDMzK2tLKu6F0Jh-2OR7s_DS6GuAwpMDHfLYtTeVIvQ"

// Demander la permission et obtenir le token FCM
export async function requestFCMToken() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permission notifications refusée')
      return null
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    return token
  } catch (e) {
    console.error('Erreur FCM token:', e)
    return null
  }
}

// Écouter les notifications quand l'app est ouverte
export function onForegroundMessage(callback) {
  return onMessage(messaging, callback)
}