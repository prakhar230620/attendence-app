from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_mysqldb import MySQL
from config import Config
import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a secure secret key
app.config.from_object(Config)

mysql = MySQL(app)


# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            flash('Please login first', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cur = mysql.connection.cursor()
        try:
            cur.execute("SELECT id, username FROM teachers WHERE username=%s AND password=%s", (username, password))
            teacher = cur.fetchone()
            if teacher:
                session['logged_in'] = True
                session['teacher_id'] = teacher[0]
                session['username'] = teacher[1]
                flash('Login successful', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid credentials', 'danger')
        except Exception as e:
            flash('Database error occurred', 'danger')
        finally:
            cur.close()
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'success')
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT * FROM students ORDER BY roll_no")
        students = cur.fetchall()
        return render_template('dashboard.html', students=students)
    except Exception as e:
        flash('Error fetching student data', 'danger')
        return redirect(url_for('index'))
    finally:
        cur.close()


@app.route('/attendance', methods=['GET', 'POST'])
@login_required
def attendance():
    if request.method == 'POST':
        date = request.form.get('date')
        if not date:
            flash('Please select a date', 'danger')
            return redirect(url_for('dashboard'))

        attendance_data = request.form.getlist('attendance')
        cur = mysql.connection.cursor()
        try:
            # First delete any existing attendance for this date
            cur.execute("DELETE FROM attendance WHERE date = %s", (date,))

            # Insert new attendance records
            for student_id in attendance_data:
                cur.execute("INSERT INTO attendance (student_id, date, status, teacher_id) VALUES (%s, %s, %s, %s)",
                            (student_id, date, 'Present', session['teacher_id']))

            mysql.connection.commit()
            flash('Attendance saved successfully', 'success')
        except Exception as e:
            mysql.connection.rollback()
            flash('Error saving attendance', 'danger')
        finally:
            cur.close()
        return redirect(url_for('dashboard'))
    return redirect(url_for('dashboard'))


@app.route('/report')
@login_required
def report():
    cur = mysql.connection.cursor()
    try:
        cur.execute("""
            SELECT s.name, s.roll_no, a.date, a.status
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id
            ORDER BY a.date DESC, s.roll_no
        """)
        reports = cur.fetchall()
        return render_template('report.html', reports=reports)
    except Exception as e:
        flash('Error fetching report data', 'danger')
        return redirect(url_for('dashboard'))
    finally:
        cur.close()


if __name__ == '__main__':
    app.run(debug=True)