from sched import scheduler

from flask import Flask, request, jsonify, render_template
import json
import uuid
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

# Configuring sender email
SENDER_EMAIL = 'email@gmail.com'
SENDER_PASSWORD = 'password'
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465

def load_goals():
    try:
        with open('goals.json', 'r') as f:
            goals = json.load(f)
            if isinstance(goals, list):
                return goals
            else:
                return []
    except FileNotFoundError:
        return []

def save_goals(goals):
    with open('goals.json', 'w') as f:
        json.dump(goals, f, indent = 4)

def send_email(receiver_email, subject, message):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    msg.attach(MIMEText(message, 'plain'))
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        print('Email sent!')
    except Exception as e:
        print(f'Error sending email: {e}')

def check_deadlines():
    goals = load_goals()
    today = datetime.now().strftime('%Y-%m-%d')

    for goal in goals:
        if goal.get('deadline') == today:
            email = goal.get('email')
            if email:
                subject = f'Reminder: Goal Deadline Today - {goal['specific']}'
                message = f"""
                        Hello there!
                        
                        This is a reminder that today ({today}) is the deadline for your goal:
                        
                        {goal['specific']}
                        
                        You got this!
                        """
                send_email(email, subject, message)

schedule = BackgroundScheduler()
schedule.add_job(func = check_deadlines, trigger = 'interval', minutes=1)
schedule.start()

@app.route('/goals', methods=['GET'])
def get_goals():
    goals = load_goals()
    return jsonify(goals)

@app.route('/goals', methods=['POST'])
def add_goal():
    data = request.json
    new_goal = {
        'id' : str(uuid.uuid4()),
        'specific' : data.get('specific'),
        'measurable' : data.get('measurable'),
        'achievable' : data.get('achievable'),
        'relevant' : data.get('relevant'),
        'time_bound' : data.get('time_bound'),
        'deadline' : data.get('deadline'),
        'email' : data.get('email')
    }
    goals = load_goals()
    goals.append(new_goal)
    save_goals(goals)
    return jsonify({'message' : 'Goal added with email reminder', 'goal' : new_goal}), 201

@app.route('/goals/<goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    goals = load_goals()
    goals = [g for g in goals if g['id'] != goal_id]
    save_goals(goals)
    return jsonify({'message' : 'Goal deleted'}), 200

if __name__ == '__main__':
    try:
        app.run(debug = True)
    finally:
        scheduler.shutdown()