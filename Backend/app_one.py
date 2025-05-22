from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import logging

app = Flask(__name__)
CORS(app)

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kết nối MySQL
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Hunga1k56@",
        database="student"
    )
    cursor = db.cursor(dictionary=True)
    logger.info("Connected to MySQL database")
except mysql.connector.Error as err:
    logger.error(f"Failed to connect to database: {err}")
    exit(1)


@app.route('/')
def index():
    return 'Welcome to the Student API'


@app.route('/students', methods=['GET'])
def get_students():
    try:
        cursor.execute(
            "SELECT student_id, name, birth_date, room_number FROM students")
        rows = cursor.fetchall()
        for row in rows:
            row['birth_date'] = row['birth_date'].strftime(
                '%Y-%m-%d') if row['birth_date'] else None
        logger.info("Fetched students list")
        return jsonify(rows)
    except mysql.connector.Error as err:
        logger.error(f"Error fetching students: {err}")
        return jsonify({"message": f"❌ Lỗi: {err}"}), 500


@app.route('/students', methods=['POST'])
def add_student():
    data = request.get_json()
    student_id = data.get('student_id')
    name = data.get('name')
    birth_date = data.get('birth_date')
    room_number = data.get('room_number')

    if not student_id or not name:
        logger.warning("Missing student_id or name in POST request")
        return jsonify({"message": "⚠️ Vui lòng cung cấp Mã SV và Họ tên"}), 400

    # Kiểm tra trùng lặp student_id
    cursor.execute(
        "SELECT student_id FROM students WHERE student_id = %s", (student_id,))
    if cursor.fetchone():
        logger.warning(f"Duplicate student_id: {student_id}")
        return jsonify({"message": f"❌ Mã sinh viên {student_id} đã tồn tại"}), 400

    try:
        sql = "INSERT INTO students (student_id, name, birth_date, room_number) VALUES (%s, %s, %s, %s)"
        val = (student_id, name, birth_date, room_number)
        cursor.execute(sql, val)
        db.commit()
        logger.info(f"Added student with ID: {student_id}")
        return jsonify({"message": "✅ Thêm sinh viên thành công"}), 201
    except mysql.connector.Error as err:
        logger.error(f"Error adding student: {err}")
        return jsonify({"message": f"❌ Lỗi: {err}"}), 400


@app.route('/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    name = data.get('name')
    birth_date = data.get('birth_date')
    room_number = data.get('room_number')

    if not name:
        logger.warning("Missing name in PUT request")
        return jsonify({"message": "⚠️ Vui lòng cung cấp Họ tên"}), 400

    try:
        sql = "UPDATE students SET name=%s, birth_date=%s, room_number=%s WHERE student_id=%s"
        val = (name, birth_date, room_number, student_id)
        cursor.execute(sql, val)
        db.commit()
        if cursor.rowcount == 0:
            logger.warning(f"Student not found for update: {student_id}")
            return jsonify({"message": "❌ Không tìm thấy sinh viên để cập nhật"}), 404
        logger.info(f"Updated student with ID: {student_id}")
        return jsonify({"message": "✅ Cập nhật thành công"})
    except mysql.connector.Error as err:
        logger.error(f"Error updating student: {err}")
        return jsonify({"message": f"❌ Lỗi: {err}"}), 400


@app.route('/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        cursor.execute(
            "DELETE FROM students WHERE student_id = %s", (student_id,))
        db.commit()
        if cursor.rowcount == 0:
            logger.warning(f"Student not found for deletion: {student_id}")
            return jsonify({"message": "❌ Không tìm thấy sinh viên để xóa"}), 404
        logger.info(f"Deleted student with ID: {student_id}")
        return jsonify({"message": "✅ Xóa sinh viên thành công"})
    except mysql.connector.Error as err:
        logger.error(f"Error deleting student: {err}")
        return jsonify({"message": f"❌ Lỗi: {err}"}), 400


@app.route('/students/search', methods=['GET'])
def search_students():
    query = request.args.get("q", "")
    like_query = f"%{query}%"

    try:
        sql = """
            SELECT student_id, name, birth_date, room_number
            FROM students
            WHERE student_id LIKE %s OR name LIKE %s OR room_number LIKE %s
        """
        cursor.execute(sql, (like_query, like_query, like_query))
        results = cursor.fetchall()

        for row in results:
            row['birth_date'] = row['birth_date'].strftime(
                '%Y-%m-%d') if row['birth_date'] else None

        logger.info(f"Search success for query: {query}")
        return jsonify(results)
    except mysql.connector.Error as err:
        logger.error(f"Error searching students: {err}")
        return jsonify({"message": f"❌ Lỗi: {err}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import mysql.connector

# app = Flask(__name__)
# CORS(app)  # Cho phép frontend gọi API từ domain khác

# # Kết nối MySQL
# db = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     password="nguyengiakhanh9122005",
#     database="student"
# )
# cursor = db.cursor(dictionary=True)

# # Lấy danh sách sinh viên


# @app.route('/students', methods=['GET'])
# def get_students():
#     cursor.execute("SELECT * FROM students")
#     students = cursor.fetchall()
#     return jsonify(students)

# # Thêm sinh viên


# @app.route('/students', methods=['POST'])
# def add_student():
#     data = request.get_json()
#     query = "INSERT INTO students (student_id, name, birth_date, room_number) VALUES (%s, %s, %s, %s)"
#     values = (data['student_id'], data['name'],
#               data['birth_date'], data['room_number'])
#     cursor.execute(query, values)
#     db.commit()
#     return jsonify({'message': 'Thêm sinh viên thành công'})

# # Cập nhật sinh viên


# @app.route('/students/<student_id>', methods=['PUT'])
# def update_student(student_id):
#     data = request.get_json()
#     query = "UPDATE students SET name=%s, birth_date=%s, room_number=%s WHERE student_id=%s"
#     values = (data['name'], data['birth_date'],
#               data['room_number'], student_id)
#     cursor.execute(query, values)
#     db.commit()
#     return jsonify({'message': 'Cập nhật thành công'})

# # Xóa sinh viên


# @app.route('/students/<student_id>', methods=['DELETE'])
# def delete_student(student_id):
#     cursor.execute("DELETE FROM students WHERE student_id=%s", (student_id,))
#     db.commit()
#     return jsonify({'message': 'Xóa sinh viên thành công'})


# if __name__ == '__main__':
#     app.run(debug=True)
