importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBJKAjA88lwgcNKAt8w0gw9S_58P3zmpLw",
    authDomain: "study-reminder-d4544.firebaseapp.com",
    projectId: "study-reminder-d4544",
    storageBucket: "study-reminder-d4544.firebasestorage.app",
    messagingSenderId: "601610775790",
    appId: "1:601610775790:web:4ea18fd72e5878c0bc97ff"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log("Nhận thông báo nền:", payload);

    const title =
        payload.notification?.title || "📚 Study Reminder";

    const options = {
        body:
            payload.notification?.body ||
            "Bạn có một thông báo mới.",
        icon: "/StudyReminder/icon.png",
        badge: "/StudyReminder/icon.png"
    };

    self.registration.showNotification(title, options);
});
