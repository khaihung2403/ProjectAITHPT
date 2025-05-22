from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import mysql.connector
from db_config import DB_CONFIG
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Đường dẫn thư mục lưu ảnh
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['UPLOAD_FOLDER'] = os.path.abspath(
    os.path.join(basedir, '..', 'Frontend', 'src', 'image'))

# Tạo thư mục nếu chưa tồn tại
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
print(f"Thư mục lưu ảnh: {app.config['UPLOAD_FOLDER']}")


@app.route('/upload', methods=['POST'])
def upload_images():
    if 'name' not in request.form or 'student_id' not in request.form:
        return jsonify({'message': 'Thiếu thông tin sinh viên'}), 400

    name = request.form['name']
    student_id = request.form['student_id']

    images = request.files.getlist('images')
    if not images or len(images) == 0:
        return jsonify({'message': 'Không có ảnh nào được gửi'}), 400

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        saved_paths = []

        for i, image in enumerate(images):
            if image.mimetype not in ['image/jpeg', 'image/png']:
                continue  # Bỏ qua ảnh sai định dạng

            filename = secure_filename(
                f"{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i+1}.jpg")
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            saved_paths.append(image_path)

            # Chỉ lưu thông tin vào DB với ảnh đầu tiên
            if i == 0:
                cursor.execute("""
                    INSERT INTO students (name, student_id, image_path)
                    VALUES (%s, %s, %s)
                """, (name, student_id, image_path))

        conn.commit()
        return jsonify({'message': f'✅ Đã lưu {len(saved_paths)} ảnh vào hệ thống'}), 200
    except mysql.connector.Error as err:
        return jsonify({'message': f'Lỗi CSDL: {str(err)}'}), 500
    except Exception as e:
        return jsonify({'message': f'Lỗi server: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


@app.route('/')
def home():
    return send_from_directory('public', 'camera1.html')


@app.route('/src/<path:path>')
def serve_js(path):
    return send_from_directory('public/src', path)


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('public', path)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)
