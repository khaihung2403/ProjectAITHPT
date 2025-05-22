from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Hunga1k56@",
    database="student"
)
cursor = db.cursor(dictionary=True)


@app.route('/students', methods=['GET'])
def get_students():
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
    like = f"%{q}%"
    cursor.execute("""
        SELECT * FROM students
        WHERE student_id LIKE %s OR name LIKE %s OR room_number LIKE %s
    """, (like, like, like))
    results = cursor.fetchall()
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
    images_data = data.get('images_base64', [])
    
    # Tạo thư mục theo họ và tên sinh viên trong static/uploads
    student_folder = os.path.join(app.config['UPLOAD_FOLDER'], name.replace(" ", "_"))  # thay dấu cách bằng _
    os.makedirs(student_folder, exist_ok=True)

    image_paths = []
    timestamp = int(datetime.now().timestamp())

    for idx, image_data in enumerate(images_data):
        filename = f"{student_id}_{timestamp}_{idx+1}.jpg"
        filepath = os.path.join(student_folder, filename)
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data.split(",")[1]))
        image_paths.append(filepath)

    main_image_path = image_paths[0] if image_paths else None

    query = """
        INSERT INTO students (student_id, name, birth_date, room_number, image_path)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (student_id, name, birth_date, room_number, main_image_path))
    db.commit()
    return jsonify({"message": "Thêm sinh viên thành công"}), 201



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

