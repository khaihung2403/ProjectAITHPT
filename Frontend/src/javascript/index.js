document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu-item[data-section]");
  const sections = document.querySelectorAll(".main-content > div");

  menuItems.forEach(item => {
      item.addEventListener("click", () => {
          // Remove active state from all menu items
          menuItems.forEach(i => i.classList.remove("active"));
          // Hide all sections
          sections.forEach(s => s.classList.remove("active"));

          // Add active to clicked item
          item.classList.add("active");

          // Show the corresponding section
          const sectionName = item.getAttribute("data-section");
          const section = document.querySelector(`.${sectionName}-section`);
          if (section) {
              section.classList.add("active");
          }

          // Update page title
          const pageTitle = document.querySelector(".page-title h1");
          pageTitle.textContent = item.innerText.trim();
      });
  });
});   


function updateDateTime() {
    const now = new Date();

    // Lấy ngày trong tuần
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = weekdays[now.getDay()];

    // Định dạng ngày giờ
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('current-date').textContent = `${dayOfWeek}, ${day}/${month}/${year}`;
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
}

// Gọi hàm mỗi giây để cập nhật liên tục
setInterval(updateDateTime, 1000);

// Gọi lần đầu khi trang vừa load
updateDateTime();


