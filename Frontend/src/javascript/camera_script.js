document.addEventListener('DOMContentLoaded', () => {
    const webcamFeed = document.getElementById('webcamFeed');
    const webcamOverlay = document.getElementById('webcamOverlay');
    const startButton = document.getElementById('startButton');
    const retryButton = document.getElementById('retryButton');
    const supportButton = document.getElementById('supportButton');

    const statusMessageEl = document.getElementById('statusMessage');
    const studentInfoEl = document.getElementById('studentInfo');
    const placeholderInfoEl = document.getElementById('placeholderInfo');

    const studentAvatarEl = document.getElementById('studentAvatar');
    const studentNameEl = document.getElementById('studentName');
    const studentIdEl = document.getElementById('studentId');
    const studentRoomEl = document.getElementById('studentRoom');
    const accessTimeEl = document.getElementById('accessTime');

    let stream;
    let isScanning = false;
    let resetTimer;

    // --- Webcam Functions ---
    async function startWebcam() {
        try {
            if (stream) { // Stop existing stream before starting a new one
                stream.getTracks().forEach(track => track.stop());
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            webcamFeed.srcObject = stream;
            webcamOverlay.classList.add('hidden');
            startButton.textContent = 'Dừng quét';
            startButton.disabled = false;
            isScanning = true;
            statusMessageEl.textContent = 'Đang tìm kiếm khuôn mặt...';
            statusMessageEl.className = 'status-message info';
            placeholderInfoEl.classList.remove('hidden');
            studentInfoEl.classList.add('hidden');
            retryButton.classList.add('hidden');

            // Simulate face detection and API call
            // In a real app, you'd capture frames and send to backend here
            console.log("Webcam started. Simulating face detection...");
            setTimeout(captureAndSendFrame, 3000); // Simulate delay for detection

        } catch (err) {
            console.error("Lỗi khi truy cập webcam:", err);
            statusMessageEl.textContent = 'Lỗi: Không thể truy cập webcam. Vui lòng kiểm tra quyền truy cập.';
            statusMessageEl.className = 'status-message error';
            startButton.disabled = false;
            startButton.textContent = 'Bắt đầu quét';
            isScanning = false;
        }
    }

    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        webcamFeed.srcObject = null;
        webcamOverlay.classList.remove('hidden');
        webcamOverlay.querySelector('p').textContent = 'Vui lòng nhìn thẳng vào camera';
        startButton.textContent = 'Bắt đầu quét';
        isScanning = false;
        clearTimeout(resetTimer); // Clear any pending UI reset
        console.log("Webcam stopped.");
    }

    // --- Authentication Logic (Mocked) ---
    function mockFaceAuthentication() {
        if (!isScanning) return; // Stop if scanning was cancelled

        console.log("Đang gửi dữ liệu khuôn mặt (giả lập)...");
        // Simulate API call
        const randomNumber = Math.random();

        if (randomNumber > 0.4) { // Simulate success (60% chance)
            const mockStudentData = {
                name: "Nguyễn Văn A",
                id: "SV00123",
                room: "KTX-A101",
                avatar: "https://via.placeholder.com/120/007bff/ffffff?Text=Avatar", // Placeholder image
                accessType: randomNumber > 0.7 ? "Đã vào" : "Đã ra" // Randomly "Đã vào" or "Đã ra"
            };
            handleAuthenticationSuccess(mockStudentData);
        } else if (randomNumber > 0.15) { // Simulate "student not found" (25% chance)
            handleAuthenticationFailure("Sinh viên không tồn tại trong hệ thống.");
        }
        else { // Simulate "face not recognized" (15% chance)
            handleAuthenticationFailure("Không nhận diện được khuôn mặt. Vui lòng thử lại.");
        }
        async function captureAndSendFrame() {
            const video = document.getElementById('webcamFeed');
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
        
            const base64Image = canvas.toDataURL('image/jpeg');
        
            // Gửi về backend
            const response = await fetch('http://localhost:5000/api/upload_face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ten: prompt("Nhập họ và tên sinh viên:"),
                    msv: prompt("Nhập mã số sinh viên:"),
                    image: base64Image
                })
            });
        
            const result = await response.json();
            console.log(result);
        
            if (result.success) {
                handleAuthenticationSuccess({
                    name: result.ten,
                    id: result.msv,
                    room: result.room || 'N/A',
                    avatar: result.avatar || 'https://via.placeholder.com/120'
                });
            } else {
                handleAuthenticationFailure(result.message || "Không thể xác thực.");
            }
        }
        
    }

    function handleAuthenticationSuccess(studentData) {
        if (!isScanning) return;

        statusMessageEl.textContent = `Xác thực thành công! Chào mừng ${studentData.name}.`;
        statusMessageEl.className = 'status-message success';

        studentAvatarEl.src = studentData.avatar;
        studentNameEl.textContent = studentData.name;
        studentIdEl.textContent = studentData.id;
        studentRoomEl.textContent = studentData.room;
        const now = new Date();
        accessTimeEl.textContent = `${studentData.accessType} lúc ${now.toLocaleTimeString('vi-VN')} ${now.toLocaleDateString('vi-VN')}`;

        placeholderInfoEl.classList.add('hidden');
        studentInfoEl.classList.remove('hidden');
        retryButton.classList.add('hidden'); // Hide retry on success

        // Play success sound (to be implemented)
        // playSound('success.mp3');

        console.log("Xác thực thành công:", studentData);

        clearTimeout(resetTimer); // Clear previous timer if any
        resetTimer = setTimeout(() => {
            if (isScanning) { // Only reset if still in scanning mode (not manually stopped)
                 resetUIForNextScan();
            }
        }, 10000); // Reset after 5 seconds
    }

    function handleAuthenticationFailure(message) {
        if (!isScanning) return;

        statusMessageEl.textContent = message;
        statusMessageEl.className = 'status-message error';

        placeholderInfoEl.classList.remove('hidden');
        studentInfoEl.classList.add('hidden');
        retryButton.classList.remove('hidden');

        // Play failure sound (to be implemented)
        // playSound('failure.mp3');
        console.error("Xác thực thất bại:", message);

        // Do not automatically reset UI on failure, wait for retry or new scan
    }

    // --- UI Helper Functions ---
    function resetUIForNextScan() {
        statusMessageEl.textContent = 'Đang tìm kiếm khuôn mặt...';
        statusMessageEl.className = 'status-message info';
        placeholderInfoEl.classList.remove('hidden');
        studentInfoEl.classList.add('hidden');
        retryButton.classList.add('hidden');

        // Continue scanning by calling mock authentication again
        if (isScanning) {
            console.log("UI reset. Continuing scan...");
            setTimeout(mockFaceAuthentication, 1000); // Short delay before next auto-scan attempt
        }
    }


    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
        startButton.disabled = true; // Disable button immediately to prevent double clicks
        if (isScanning) {
            stopWebcam();
            statusMessageEl.textContent = 'Đã dừng quét.';
            statusMessageEl.className = 'status-message info';
            placeholderInfoEl.classList.remove('hidden');
            studentInfoEl.classList.add('hidden');
            retryButton.classList.add('hidden');
            startButton.disabled = false;
        } else {
            startWebcam();
        }
    });

    retryButton.addEventListener('click', () => {
        if (!isScanning) {
            statusMessageEl.textContent = 'Vui lòng "Bắt đầu quét" trước khi thử lại.';
            statusMessageEl.className = 'status-message error';
            return;
        }
        statusMessageEl.textContent = 'Đang thử xác thực lại...';
        statusMessageEl.className = 'status-message info';
        retryButton.classList.add('hidden'); // Hide retry button while processing
        placeholderInfoEl.classList.remove('hidden');
        studentInfoEl.classList.add('hidden');
        console.log("Nút 'Xác thực lại' được nhấp.");
        setTimeout(mockFaceAuthentication, 1000); // Simulate delay for retry
    });

    supportButton.addEventListener('click', () => {
        // In a real app, this would trigger a notification to guards/admins
        alert('Yêu cầu hỗ trợ đã được gửi đến bộ phận bảo vệ. Vui lòng chờ trong giây lát.');
        console.log("Nút 'Yêu cầu hỗ trợ' được nhấp.");
        // Optionally, you could add more sophisticated UI feedback here
    });

    // Initial state
    statusMessageEl.textContent = 'Nhấn "Bắt đầu quét" để khởi động hệ thống.';
    statusMessageEl.className = 'status-message info';
});
