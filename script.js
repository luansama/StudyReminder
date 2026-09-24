```javascript
// ==============================
// FIREBASE CONFIG
// ==============================

const firebaseConfig = {
    apiKey: "AIzaSyBJKAjA88lwgcNKAt8w0gw9S_58P3zmpLw",
    authDomain: "study-reminder-d4544.firebaseapp.com",
    projectId: "study-reminder-d4544",
    storageBucket: "study-reminder-d4544.firebasestorage.app",
    messagingSenderId: "601610775790",
    appId: "1:601610775790:web:4ea18fd72e5878c0bc97ff"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();


// ==============================
// VAPID PUBLIC KEY
// ==============================

const VAPID_KEY =
    "BCI1tv37OumYy57CWPxS8_5HsMM94MJPaidtqkYqZtCqiDONVbMtYLbGMJmHV5vX2KcovYHwL_1D4zvYA3WiLQQ";


// ==============================
// DATA
// ==============================

let tasks = JSON.parse(
    localStorage.getItem("studyTasks") || "[]"
);


// ==============================
// ELEMENTS
// ==============================

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const notificationButton =
    document.getElementById("notificationButton");

const notificationPopup =
    document.getElementById("notificationPopup");

const popupMessage =
    document.getElementById("popupMessage");


// ==============================
// POPUP
// ==============================

function showPopup(message) {

    popupMessage.textContent = message;

    notificationPopup.classList.add("show");

    setTimeout(function () {
        notificationPopup.classList.remove("show");
    }, 3000);
}


// ==============================
// SAVE TASKS
// ==============================

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}


// ==============================
// ADD TASK
// ==============================

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const subject =
        document.getElementById("subject").value.trim();

    const content =
        document.getElementById("content").value.trim();

    const deadline =
        document.getElementById("deadline").value;

    const priority =
        document.getElementById("priority").value;

    const task = {

        id: Date.now(),

        subject: subject,

        content: content,

        deadline: deadline,

        priority: priority,

        completed: false,

        reminders: {}

    };

    tasks.push(task);

    saveTasks();

    displayTasks();

    taskForm.reset();

    showPopup("✅ Đã thêm bài tập!");

});


// ==============================
// PRIORITY
// ==============================

function getPriorityInfo(priority) {

    if (priority === "mandatory") {
        return {
            text: "🔴 BẮT-BUỘC",
            className: "priority-mandatory"
        };
    }

    if (priority === "important") {
        return {
            text: "🟠 QUAN-TRỌNG",
            className: "priority-important"
        };
    }

    if (priority === "reference") {
        return {
            text: "🟢 THAM KHẢO",
            className: "priority-reference"
        };
    }

    return {
        text: "🟡 THƯỜNG",
        className: "priority-normal"
    };
}


// ==============================
// DATE FORMAT
// ==============================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


// ==============================
// DISPLAY TASKS
// ==============================

function displayTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML =
            '<p class="empty">Chưa có bài tập nào.</p>';

        return;
    }

    tasks.forEach(function (task) {

        const deadline =
            new Date(task.deadline);

        const now =
            new Date();

        if (
            now >= deadline &&
            !task.completed
        ) {
            task.completed = true;
        }

        const priority =
            getPriorityInfo(task.priority);

        const card =
            document.createElement("div");

        card.className = "task-card";

        if (task.completed) {
            card.classList.add("completed");
        }

        card.innerHTML = `

            <div class="task-header">

                <h3>
                    ${escapeHTML(task.subject)}
                </h3>

                <span class="priority ${priority.className}">
                    ${priority.text}
                </span>

            </div>

            <p class="task-content">
                ${escapeHTML(task.content)}
            </p>

            <p class="deadline">
                ⏰ ${formatDate(task.deadline)}
            </p>

            <p class="status">
                ${
                    task.completed
                    ? "🟢 HOÀN THÀNH"
                    : "🟡 CHƯA HOÀN THÀNH"
                }
            </p>

            <button
                class="delete-button"
                onclick="deleteTask(${task.id})"
            >
                🗑️ Xóa
            </button>

        `;

        taskList.appendChild(card);

    });

    saveTasks();
}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==============================
// DELETE
// ==============================

function deleteTask(id) {

    tasks =
        tasks.filter(function (task) {
            return task.id !== id;
        });

    saveTasks();

    displayTasks();

    showPopup("🗑️ Đã xóa bài tập.");

}


// ==============================
// FIREBASE NOTIFICATION
// ==============================

async function enableNotifications() {

    try {

        if (!("Notification" in window)) {

            showPopup(
                "❌ Trình duyệt không hỗ trợ thông báo."
            );

            return;
        }


        // Xin quyền thông báo

        const permission =
            await Notification.requestPermission();


        if (permission !== "granted") {

            showPopup(
                "❌ Bạn chưa cho phép thông báo."
            );

            return;
        }


        // Đăng ký Firebase Messaging Service Worker

        const registration =
            await navigator.serviceWorker.register(
                "./firebase-messaging-sw.js"
            );


        // Lấy FCM token

        const token =
            await messaging.getToken({

                vapidKey: VAPID_KEY,

                serviceWorkerRegistration:
                    registration

            });


        if (!token) {

            showPopup(
                "❌ Không lấy được FCM token."
            );

            return;
        }


        // Lưu token trên máy

        localStorage.setItem(
            "fcmToken",
            token
        );


        console.log(
            "FCM TOKEN:",
            token
        );


        // Hiện token để test Firebase

        showToken(token);

        showPopup(
            "✅ Đã bật thông báo!"
        );


    } catch (error) {

        console.error(
            "Lỗi Firebase Messaging:",
            error
        );

        showPopup(
            "❌ Lỗi bật thông báo. Xem Console."
        );

    }

}


// ==============================
// SHOW TOKEN
// ==============================

function showToken(token) {

    let box =
        document.getElementById("tokenBox");


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "tokenBox";

        box.style.marginTop =
            "15px";

        box.innerHTML = `

            <p>
                <b>FCM Token dùng để test:</b>
            </p>

            <textarea
                id="fcmToken"
                readonly
                style="
                    width:100%;
                    min-height:100px;
                    box-sizing:border-box;
                "
            ></textarea>

            <button
                id="copyTokenButton"
                style="margin-top:8px;"
            >
                📋 Sao chép token
            </button>

        `;

        document
            .querySelector("header")
            .appendChild(box);

    }


    document.getElementById(
        "fcmToken"
    ).value = token;


    document.getElementById(
        "copyTokenButton"
    ).onclick = async function () {

        await navigator.clipboard.writeText(token);

        showPopup(
            "📋 Đã sao chép FCM token!"
        );

    };

}


// ==============================
// FOREGROUND MESSAGE
// ==============================

messaging.onMessage(function (payload) {

    console.log(
        "Nhận thông báo khi app đang mở:",
        payload
    );


    const title =
        payload.notification?.title ||
        "📚 Study Reminder";


    const body =
        payload.notification?.body ||
        "Bạn có một thông báo mới.";


    showPopup(
        "🔔 " + title + ": " + body
    );

});


// ==============================
// BUTTON
// ==============================

notificationButton.addEventListener(
    "click",
    enableNotifications
);


// ==============================
// OLD LOCAL REMINDERS
// ==============================

function checkNotifications() {

    const now =
        new Date();


    tasks.forEach(function (task) {

        if (task.completed) {
            return;
        }


        const deadline =
            new Date(task.deadline);


        if (now >= deadline) {
            return;
        }


        const difference =
            deadline - now;


        const oneDay =
            24 * 60 * 60 * 1000;

        const twelveHours =
            12 * 60 * 60 * 1000;

        const threeHours =
            3 * 60 * 60 * 1000;


        checkReminder(
            task,
            difference,
            oneDay,
            "Còn 1 ngày nữa đến hạn!"
        );


        checkReminder(
            task,
            difference,
            twelveHours,
            "Còn 12 giờ nữa đến hạn!"
        );


        checkReminder(
            task,
            difference,
            threeHours,
            "Còn 3 giờ nữa đến hạn!"
        );

    });

}


function checkReminder(
    task,
    difference,
    target,
    message
) {

    const key =
        String(target);


    if (
        difference <= target &&
        difference > target - 60000 &&
        !task.reminders[key]
    ) {

        task.reminders[key] = true;

        saveTasks();

        showPopup(
            "🔔 " +
            task.subject +
            ": " +
            message
        );

    }

}


// Kiểm tra mỗi phút

setInterval(
    checkNotifications,
    60000
);


// Hiển thị ngay khi mở app

displayTasks();
```
