from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors

app = Flask(__name__)

# Cấu hình kết nối MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
# thay bằng mật khẩu của bạn nếu có
app.config['MYSQL_PASSWORD'] = 'Hunga1k56@'
app.config['MYSQL_DB'] = 'student'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)


@app.route('/')
def index():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    return render_template('index.html', students=students)


@app.route('/add', methods=['POST'])
def add_student():
    data = request.form
    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO students (student_id, name, birth_date, room_number) VALUES (%s, %s, %s, %s)",
        (data['student_id'], data['name'],
         data['birth_date'], data['room_number'])
    )
    mysql.connection.commit()
    return redirect(url_for('index'))


@app.route('/update/<int:id>', methods=['POST'])
def update_student(id):
    data = request.form
    cursor = mysql.connection.cursor()
    cursor.execute(
        "UPDATE students SET student_id=%s, name=%s, birth_date=%s, room_number=%s WHERE id=%s",
        (data['student_id'], data['name'],
         data['birth_date'], data['room_number'], id)
    )
    mysql.connection.commit()
    return redirect(url_for('index'))


@app.route('/delete/<int:id>', methods=['POST'])
def delete_student(id):
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM students WHERE id=%s", (id,))
    mysql.connection.commit()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)
