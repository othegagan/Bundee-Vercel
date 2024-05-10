
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');


firebase.initializeApp({
    apiKey: "AIzaSyCDrkykMVA-vT7h2KwR9vNs_Jhv4cycuMM",
    authDomain: "mybundeedev.firebaseapp.com",
    projectId: "mybundeedev",
    storageBucket: "mybundeedev.appspot.com",
    messagingSenderId: "904803044779",
    appId: "1:904803044779:web:98a2d6323f0222d6c996ee"
});

const messaging = firebase.messaging();

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: `);
    console.log(JSON.parse(event.data.text()));//
    const notificationObject = JSON.parse(event.data.text());

    const data = notificationObject.notification;
    const title = data.title;
    const options = {
        body: title.body,
        icon: '/bundee-logo.png',
    };
    self.notificationURL = data.click_action;
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();

    event.waitUntil(
        clients.openWindow(self.notificationURL)
    );
});