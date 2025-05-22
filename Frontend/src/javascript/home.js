window.addEventListener('DOMContentLoaded', function () {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;

        // Random size
        const size = Math.random() * 6 + 2;

        // Random animation delay
        const delay = Math.random() * 10;

        particle.style.left = posX + '%';
        particle.style.top = posY + '%';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDelay = delay + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.3;

        particlesContainer.appendChild(particle);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('adminLoginForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Change icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Quên mật khẩu event
    forgotPasswordLink.addEventListener('click', function (e) {
        e.preventDefault();
        errorMessage.innerHTML = '<i class="fas fa-info-circle"></i> Vui lòng liên hệ quản trị viên hệ thống để lấy lại mật khẩu.';
        errorMessage.style.display = 'block';
        errorMessage.style.backgroundColor = '#e3f2fd';
        errorMessage.style.color = '#FF0000';
        errorMessage.style.borderLeftColor = '#FF0000';

        // Hide after 3 seconds
        setTimeout(function () {
            errorMessage.style.display = 'none';
            errorMessage.style.backgroundColor = '#fee';
            errorMessage.style.color = '#e74c3c';
            errorMessage.style.borderLeftColor = '#e74c3c';
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Tên đăng nhập hoặc mật khẩu không chính xác!';
        }, 3000);
    });

    // Form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Form validation
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Button loading state
        const submitButton = document.querySelector('.login-button');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(function () {
            // Demo credentials
            if ((username === 'admin' && password === 'admin123') ||
                (username === 'Khanh' && password === '123')) {
                // Success case
                errorMessage.style.display = 'none';
                successMessage.style.display = 'block';

                // Redirect after 1 second
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 300);
            } else {
                // Error case
                errorMessage.style.display = 'block';
                submitButton.innerHTML = 'Đăng nhập';
                submitButton.disabled = false;

                // Add shake animation to form
                form.classList.add('shake');
                setTimeout(() => form.classList.remove('shake'), 300);

                // Hide error after 3 seconds
                setTimeout(function () {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        }, 1500);
    });

    // Animation for input focus
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.querySelector('label').style.color = '#3a7bd5';
        });
    });
});

// Add shake animation
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
    </style>
`);