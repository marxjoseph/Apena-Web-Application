from flask import Flask, jsonify, render_template, request, session, redirect, url_for
import csv
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me-in-production")

USERNAME = os.environ.get("APP_USERNAME", "admin")
PASSWORD = os.environ.get("APP_PASSWORD", "password123")

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST": 
        if (request.form.get("username") == USERNAME and
                request.form.get("password") == PASSWORD):
            session["logged_in"] = True
            session["username"] = request.form.get("username")
            return redirect(url_for("home"))
        error = "Invalid credentials."
    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
@login_required
def home():
    return render_template("index.html")


@app.route("/api/data")
@login_required
def get_data():
    results = []
    with open("TestData/TestData1.csv", newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["spo2_valid"] == "1":
                results.append({
                    "time":   row["time"],
                    "spo2":   int(row["spo2_pct"]),
                    "hr":     int(row["hr_bpm"]),
                    "device": row["device"]
                })
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True, port=5001)