const API_URL = "http://localhost:5000";
let selectedStudentId = null;
let capturedImages = [];

document.addEventListener("DOMContentLoaded", function () {
    loadStudents();

    document.getElementById("searchBtn").addEventListener("click", () => {
        const query = document.getElementById("searchInput").value;
        loadStudents(query);
    });

    document.getElementById("startCameraBtn").addEventListener("click", startCamera);
    document.getElementById("stopCameraBtn").addEventListener("click", stopCamera);
    document.getElementById("captureBtn").addEventListener("click", captureImage);
    document.getElementById("studentForm").addEventListener("submit", saveStudent);
    document.getElementById("resetBtn").addEventListener("click", resetForm);

    document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);
    document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
        document.getElementById("deleteModal").style.display = "none";
    });
    document.getElementById("closeDeleteModal").addEventListener("click", () => {
        document.getElementById("deleteModal").style.display = "none";
    });
});

function formatDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    if (parseInt(parts[0]) > 31) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
    }
    return dateStr;
}

async function loadStudents(query = "") {
    const url = query ? `${API_URL}/students/search?q=${encodeURIComponent(query)}` : `${API_URL}/students`;
    const response = await fetch(url);
    const data = await response.json();
    const tbody = document.getElementById("studentListBody");
    const noData = document.getElementById("noData");
    tbody.innerHTML = "";

    if (!data.length) {
        noData.style.display = "block";
        return;
    }
    noData.style.display = "none";

    data.forEach((student) => {
        const tr = document.createElement("tr");
        tr.id = `student-row-${student.id}`;
        tr.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.name}</td>
            <td>${formatDate(student.birth_date)}</td>
            <td>${student.room_number}</td>
            <td>
                <button class="btn edit-btn" onclick="editStudent(${student.id})">Sửa</button>
                <button class="btn btn-danger" onclick="showDeleteModal(${student.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (query && data.length === 1) {
        const row = document.getElementById(`student-row-${data[0].id}`);
        if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        const video = document.getElementById("videoElement");
        video.srcObject = stream;
        video.style.display = "block";
        document.getElementById("captureBtn").disabled = false;
        document.getElementById("stopCameraBtn").disabled = false;
    });
}

function stopCamera() {
    const video = document.getElementById("videoElement");
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    video.srcObject = null;
    video.style.display = "none";
    document.getElementById("captureBtn").disabled = true;
    document.getElementById("stopCameraBtn").disabled = true;
}

function captureImage() {
    const canvas = document.getElementById("canvas");
    const video = document.getElementById("videoElement");
    const ctx = canvas.getContext("2d");

    const totalCaptures = 20;
    const intervalTime = 150;
    let count = 0;
    capturedImages = [];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const captureInterval = setInterval(() => {
        if (count >= totalCaptures) {
            clearInterval(captureInterval);
            document.getElementById("capturedImage").src = capturedImages[0]; // ảnh đại diện
            alert("Đã chụp 20 ảnh trong 3 giây!");
            return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/png");
        capturedImages.push(image);
        count++;
    }, intervalTime);
}

function resetForm() {
    selectedStudentId = null;
    capturedImages = [];
    document.getElementById("studentForm").reset();
    document.getElementById("capturedImage").src = "";
}

async function saveStudent(e) {
    e.preventDefault();
    const student_id = document.getElementById("studentCode").value;
    const name = document.getElementById("fullName").value;
    const birth_date = document.getElementById("birthDate").value;
    const room_number = document.getElementById("dormRoom").value;

    if (capturedImages.length < 20) {
        alert("Vui lòng chụp đủ 20 ảnh trước khi lưu!");
        return;
    }

    const studentData = {
        student_id,
        name,
        birth_date,
        room_number,
        images_base64: capturedImages,
    };

    const method = selectedStudentId ? "PUT" : "POST";
    const url = selectedStudentId
        ? `${API_URL}/students/${selectedStudentId}`
        : `${API_URL}/students`;

    await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
    });

    resetForm();
    loadStudents();
}

async function editStudent(id) {
    const res = await fetch(`${API_URL}/students`);
    const data = await res.json();
    const student = data.find(s => s.id === id);
    if (student) {
        selectedStudentId = student.id;
        document.getElementById("studentCode").value = student.student_id;
        document.getElementById("fullName").value = student.name;
        document.getElementById("birthDate").value = student.birth_date;
        document.getElementById("dormRoom").value = student.room_number;
        document.getElementById("studentForm").scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

let deleteId = null;
function showDeleteModal(id) {
    deleteId = id;
    document.getElementById("deleteModal").style.display = "flex";
}

async function confirmDelete() {
    if (!deleteId) return;
    await fetch(`${API_URL}/students/${deleteId}`, { method: "DELETE" });
    document.getElementById("deleteModal").style.display = "none";
    loadStudents();
}

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("deleteModal")) {
        document.getElementById("deleteModal").style.display = "none";
    }
});
