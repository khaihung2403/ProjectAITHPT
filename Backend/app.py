from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Cấu hình thư mục lưu ảnh
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Cấu hình MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Hunga1k56@",
    database="student"
)
cursor = db.cursor(dictionary=True)


@app.route('/students', methods=['GET'])
def get_students():
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM students 
        ORDER BY CAST(SUBSTRING(student_id, 3) AS UNSIGNED)
    """)
    students = cursor.fetchall()
    for student in students:
        if student['birth_date']:
            student['birth_date'] = student['birth_date'].strftime('%d-%m-%Y')
    return jsonify(students)


@app.route("/students/search", methods=["GET"])
def search_students():
    q = request.args.get('q', '')
    query = """
        SELECT * FROM students
        WHERE student_id LIKE %s OR name LIKE %s OR room_number LIKE %s
    """
    like = f"%{q}%"
    cursor.execute(query, (like, like, like))
    results = cursor.fetchall()

    # 🔧 Định dạng lại ngày sinh
    for student in results:
        if student['birth_date']:
            student['birth_date'] = student['birth_date'].strftime('%d-%m-%Y')

    return jsonify(results)


@app.route("/students", methods=["POST"])
def create_student():
    data = request.json
    student_id = data['student_id']
    name = data['name']
    birth_date = data['birth_date']
    room_number = data['room_number']
    image_data = data.get('image_base64')

    image_path = None
    if image_data:
        filename = f"{student_id}_{int(datetime.now().timestamp())}.png"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data.split(",")[1]))
        image_path = filepath

    query = """
        INSERT INTO students (student_id, name, birth_date, room_number, image_path)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(
        query, (student_id, name, birth_date, room_number, image_path))
    db.commit()
    return jsonify({"message": "Thêm sinh viên thành công"}), 201


@app.route("/students/<int:id>", methods=["PUT"])
def update_student(id):
    data = request.json
    student_id = data['student_id']
    name = data['name']
    birth_date = data['birth_date']
    room_number = data['room_number']
    image_data = data.get('image_base64')

    image_path = None
    if image_data:
        filename = f"{student_id}_{int(datetime.now().timestamp())}.png"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data.split(",")[1]))
        image_path = filepath

    query = """
        UPDATE students
        SET student_id=%s, name=%s, birth_date=%s, room_number=%s, image_path=%s
        WHERE id=%s
    """
    cursor.execute(query, (student_id, name, birth_date,
                   room_number, image_path, id))
    db.commit()
    return jsonify({"message": "Cập nhật thành công"})


@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):
    cursor.execute("DELETE FROM students WHERE id=%s", (id,))
    db.commit()
    return jsonify({"message": "Xóa sinh viên thành công"})


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == "__main__":
    app.run(debug=True)
