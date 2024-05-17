
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');


firebase.initializeApp({
    apiKey: "AIzaSyAtBzIcJK3PdWKZd_dwtTsEXgX5hKZV9hM",
    authDomain: "mybundeeqa.firebaseapp.com",
    projectId: "mybundeeqa",
    storageBucket: "mybundeeqa.appspot.com",
    messagingSenderId: "999392789960",
    appId: "1:999392789960:web:1a6b1cd1669517d8beacfd"
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