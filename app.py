from flask import Flask, jsonify, render_template, request, session, redirect, url_for, flash
import requests
import csv
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me-in-production")

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
        username = request.form.get("username")
        password = request.form.get("password")
        try:
            response = requests.post(
                "https://firebase-api-6y5g.onrender.com/login/clinician",
                json={"email": username, "password": password}
            )
            if response.status_code == 200:
                session["logged_in"] = True
                session["username"] = username
                session["token"] = response.json()["token"]
                session["clinician_id"] = response.json()["clinician_id"]
                print(f"Success for login: {response.status_code}")
                return redirect(url_for("home"))
            else:
                error = response.json()["error"]
        except requests.exceptions.RequestException:
            error = "Could not reach authentication server for login"
    return render_template("login.html", error=error)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
@login_required
def home():
    response = None
    try:
        response = requests.get(
            "https://firebase-api-6y5g.onrender.com/patients/my-patients",
            headers={'Authorization':f"Bearer {session["token"]}"},
            json={"email": session["username"], "clinician_id": session["clinician_id"]}
        )
        if response.status_code == 200:
            session["patients_data"] = response.json()
            print(session["patients_data"])
            print(f"Success for get patients: {response.status_code}")
        else:
            print(response.status_code)
    except requests.exceptions.RequestException as e:
        print(e)
    return render_template("index.html", response=session["patients_data"])


@app.route("/api/data/spo2")
@login_required
def get_data_spo2():
    results = []
    with open(f'TestData/TestDataSp{request.args.get("patient")}.csv', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["spo2_valid"] == "1":
                results.append({
                    "time":   row["time"],
                    "spo2":   int(row["spo2_pct"]),
                    "hr":     int(row["hr_bpm"]),
                    #"device": row["device"]
                })
    return jsonify(results)

@app.route("/api/data/bioz")
@login_required
def get_data_bio():
    results = []
    with open(f'TestData/TestDataBio{request.args.get("patient")}.csv', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            results.append({
                "time":   row["Time_Seconds"],
                "bio":   float(row["Filtered_BioZ_Amplitude"])
            })
    return jsonify(results)

@app.route('/add_patient', methods=['POST'])
@login_required
def add_patient():
    name = request.form.get('patient_name')
    dob = request.form.get('patient_dob')
    try:
        response = requests.post(
            "https://firebase-api-6y5g.onrender.com/register/patient",
            headers={"Authorization": f"Bearer {session['token']}"},
            json={"name": name, "date_of_birth": dob}
        )
        if response.status_code == 200:
            print(f"Success for register patients: {response.status_code}")
        else:
            flash(f"Failed to register, Status Code: {response.status_code}", "error")
    except requests.exceptions.RequestException as e:
        flash(f"Failed to register, Status Code: {response.status_code}", "error")
    
    return redirect(url_for('home'))

@app.route('/set_patient', methods=['POST'])
@login_required
def set_patient():
    patient_name = ""
    patient_id = request.form.get('patient_id')
    for patient in session["patients_data"]["patients"]:
        if patient["id"] == patient_id:
            patient_name = patient["name"]
    try:
        response = requests.post(
            "https://firebase-api-6y5g.onrender.com/device/set-patient",
            headers={"Authorization": f"Bearer {session['token']}"},
            json={"patient_id": patient_id}
        )
        if response.status_code == 200:
            flash(f"Incoming data target updated to patient: {patient_name}", "success")
        else:
            flash(f"Failed to set patient, Status Code: {response.status_code}", "error")
    except requests.exceptions.RequestException as e:
        flash(f"Failed to set patient, Status Code: {response.status_code}", "error")

    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run()