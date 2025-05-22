create database student;  

use student; 

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE,
    room_number VARCHAR(20),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (student_id, name, birth_date, room_number) VALUES
('SV001', 'Nguyễn Văn An', '2003-05-12', 'A101'),
('SV002', 'Trần Thị Bình', '2002-11-23', 'B102'),
('SV003', 'Lê Văn Đỗ', '2003-01-15', 'C103'),
('SV004', 'Phạm Thị Hiền', '2001-09-05', 'D101'),
('SV005', 'Hoàng Văn Khoa', '2002-03-17', 'B104'),
('SV006', 'Đặng Thị Loan', '2003-08-08', 'A105'),
('SV007', 'Ngô Văn Dũng', '2002-12-25', 'B102'),
('SV008', 'Vũ Thị Hoa', '2001-06-30', 'C106'),
('SV009', 'Trịnh Văn Quyết', '2002-04-10', 'A107'),
('SV010', 'Lý Thị Kiều', '2003-07-20', 'A108'),
('SV011', 'Nguyễn Gia Khánh', '2005-12-09', 'A106'),
('SV012', 'Ngô Nguyễn Khải Hưng', '2005-09-30', 'B207'),
('SV013', 'Tạ Quang Linh', '2005-06-07', 'A108'),
('SV014', 'Lường Minh Trí', '2005-08-20', 'A150'),
('SV015', 'Nguyễn Quang Hải', '2004-03-09', 'A128'),
('SV016', 'Nguyễn Hoàng Long', '2005-05-20', 'B125'), 
('SV017', 'Nguyễn Hoàng Hải', '2004-03-15', 'A127'),
('SV018', 'Nguyễn Đức Phúc', '2005-03-09', 'A109 '),
('SV019', 'Nguyễn Quang Dũng', '2006-09-10', 'B128'),
('SV020', 'Ngô Đức Hiển', '2004-03-010', 'A120'),
('SV021', 'Nguyễn Duy Bách', '2004-03-08', 'C128');

select * from students; 