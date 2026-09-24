// ==========================================
// DỮ LIỆU
// ==========================================

let tasks =
    JSON.parse(localStorage.getItem("studyTasks")) || [];


// ==========================================
// LƯU DỮ LIỆU
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "studyTasks",
        JSON.stringify(tasks)
    );
}


// ==========================================
// THÊM BÀI
// ==========================================

function addTask() {

    const subject =
        document.getElementById("subject").value.trim();

    const content =
        document.getElementById("content").value.trim();

    const deadline =
        document.getElementById("deadline").value;

    const priority =
        document.getElementById("priority").value;


    if (
        subject === "" ||
        content === "" ||
        deadline === ""
    ) {

        alert("Vui lòng nhập đầy đủ thông tin!");

        return;
    }


    const task = {

        id: getNextTaskId(),

        subject: subject,

        content: content,

        deadline: deadline,

        priority: priority,

        notifications: []

    };


    tasks.push(task);

    saveTasks();

    displayTasks();


    document.getElementById("subject").value = "";

    document.getElementById("content").value = "";

    document.getElementById("deadline").value = "";

    document.getElementById("priority").value = "thuong";


    showPopup(
        "Đã thêm bài",
        `${priorityIcon(priority)} ${content}`
    );
}


// ==========================================
// TẠO MÃ BÀI
// ==========================================

function getNextTaskId() {

    if (tasks.length === 0) {

        return "001";
    }


    let maxId = 0;


    tasks.forEach(function(task) {

        const number =
            parseInt(task.id);

        if (number > maxId) {

            maxId = number;
        }
    });


    return String(maxId + 1).padStart(3, "0");
}


// ==========================================
// HIỂN THỊ BÀI
// ==========================================

function displayTasks() {

    const taskList =
        document.getElementById("taskList");


    if (tasks.length === 0) {

        taskList.innerHTML =
            "<p>Chưa có bài tập nào.</p>";

        return;
    }


    taskList.innerHTML = "";


    tasks.forEach(function(task) {

        const completed =
            isCompleted(task.deadline);

        const priority =
            getPriorityInfo(task.priority);


        const taskBox =
            document.createElement("div");


        taskBox.className = "task";


        taskBox.innerHTML = `

            <h3>
                ${priority.icon}
                ${escapeHTML(task.content)}
            </h3>

            <p>
                <strong>Môn:</strong>
                ${escapeHTML(task.subject)}
            </p>

            <p>
                <strong>Hạn nộp:</strong>
                ${formatDeadline(task.deadline)}
            </p>

            <p>
                <strong>Mã:</strong>
                ${task.id}
            </p>

            <p>
                <strong>Mức độ:</strong>
            </p>

            <span class="priority ${priority.className}">
                ${priority.icon}
                ${priority.name}
            </span>

            <p>
                <strong>Trạng thái:</strong>
                ${
                    completed
                    ? "🟢 HOÀN THÀNH"
                    : "🟡 CHƯA HOÀN THÀNH"
                }
            </p>

            <button
                class="delete-button"
                onclick="deleteTask('${task.id}')"
            >
                🗑️ Xóa bài
            </button>
        `;


        taskList.appendChild(taskBox);

    });
}


// ==========================================
// THÔNG TIN MỨC ĐỘ
// ==========================================

function getPriorityInfo(priority) {

    if (priority === "bat-buoc") {

        return {

            icon: "🔴",

            name: "BẮT-BUỘC",

            className:
                "priority-bat-buoc"
        };
    }


    if (priority === "quan-trong") {

        return {

            icon: "🟠",

            name: "QUAN-TRỌNG",

            className:
                "priority-quan-trong"
        };
    }


    if (priority === "tham-khao") {

        return {

            icon: "🟢",

            name: "THAM KHẢO",

            className:
                "priority-tham-khao"
        };
    }


    return {

        icon: "🟡",

        name: "THƯỜNG",

        className:
            "priority-thuong"
    };
}


function priorityIcon(priority) {

    return getPriorityInfo(priority).icon;
}


// ==========================================
// KIỂM TRA QUÁ HẠN
// ==========================================

function isCompleted(deadline) {

    return new Date() > new Date(deadline);
}


// ==========================================
// HIỂN THỊ HẠN
// ==========================================

function formatDeadline(deadline) {

    const date =
        new Date(deadline);

    const now =
        new Date();


    const sameDay =

        date.getDate() === now.getDate() &&

        date.getMonth() === now.getMonth() &&

        date.getFullYear() === now.getFullYear();


    const time =
        date.toLocaleTimeString(
            "vi-VN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    if (sameDay) {

        return `HÔM NAY - ${time}`;
    }


    return date.toLocaleString("vi-VN");
}


// ==========================================
// XÓA BÀI
// ==========================================

function deleteTask(id) {

    if (
        !confirm("Bạn có chắc muốn xóa bài này?")
    ) {

        return;
    }


    tasks =
        tasks.filter(function(task) {

            return task.id !== id;
        });


    saveTasks();

    displayTasks();
}


// ==========================================
// XIN QUYỀN THÔNG BÁO
// ==========================================

function requestNotificationPermission() {

    if (!("Notification" in window)) {

        alert(
            "Trình duyệt này không hỗ trợ thông báo."
        );

        return;
    }


    Notification.requestPermission()
        .then(function(permission) {

            if (permission === "granted") {

                showPopup(
                    "🔔 Đã bật thông báo",
                    "Study Reminder có thể gửi thông báo."
                );


                new Notification(
                    "📚 Study Reminder",
                    {
                        body:
                            "Thông báo bài tập đã được bật!"
                    }
                );

            }

            else {

                showPopup(
                    "Thông báo chưa được bật",
                    "Bạn chưa cho phép trình duyệt gửi thông báo."
                );
            }

        });
}


// ==========================================
// GỬI NOTIFICATION
// ==========================================

function sendNotification(task, message) {

    const title =
        `${priorityIcon(task.priority)} ${task.content}`;


    const body =
        `${task.subject}\n${message}\nMã: ${task.id}`;


    // Notification hệ thống
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "📚 Study Reminder",
            {
                body: body
            }
        );
    }


    // Popup trong trang
    showPopup(
        title,
        body
    );
}


// ==========================================
// POPUP TRONG TRANG
// ==========================================

function showPopup(title, message) {

    let popup =
        document.getElementById("notificationPopup");


    if (!popup) {

        popup =
            document.createElement("div");

        popup.id =
            "notificationPopup";


        popup.innerHTML = `

            <div id="popupTitle"></div>

            <div id="popupMessage"></div>

        `;


        document.body.appendChild(popup);
    }


    document.getElementById("popupTitle")
        .textContent = title;


    document.getElementById("popupMessage")
        .textContent = message;


    popup.classList.add("show");


    setTimeout(function() {

        popup.classList.remove("show");

    }, 6000);
}


// ==========================================
// KIỂM TRA NHẮC BÀI
// ==========================================

function checkNotifications() {

    const now =
        new Date();


    tasks.forEach(function(task) {

        const deadline =
            new Date(task.deadline);


        // Không nhắc bài đã quá hạn
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


        // 24 GIỜ
        checkReminder(
            task,
            difference,
            oneDay,
            "Còn 1 ngày nữa đến hạn!"
        );


        // 12 GIỜ
        checkReminder(
            task,
            difference,
            twelveHours,
            "Còn 12 giờ nữa đến hạn!"
        );


        // 3 GIỜ
        checkReminder(
            task,
            difference,
            threeHours,
            "Còn 3 giờ nữa đến hạn!"
        );

    });

}


// ==========================================
// KIỂM TRA TỪNG MỐC
// ==========================================

function checkReminder(
    task,
    difference,
    targetTime,
    message
) {

    const tolerance =
        60 * 1000;


    if (
        Math.abs(difference - targetTime)
        <= tolerance
    ) {

        const key =
            `${task.id}-${targetTime}`;


        if (!task.notifications.includes(key)) {

            task.notifications.push(key);


            saveTasks();


            sendNotification(
                task,
                message
            );
        }
    }
}


// ==========================================
// CHỐNG HTML LỖI
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// KHỞI ĐỘNG
// ==========================================

displayTasks();


// Kiểm tra ngay
checkNotifications();


// Kiểm tra mỗi phút
setInterval(
    function() {

        displayTasks();

        checkNotifications();

    },
    60000
);
