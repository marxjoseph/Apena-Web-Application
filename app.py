from flask import Flask, jsonify, render_template
import csv

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/data")
def get_data():
    results = []

    with open("TestData/TestData1.csv", newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row["spo2_valid"] == "1":  # Only valid readings
                results.append({
                    "time": row["time"],
                    "spo2": int(row["spo2_pct"]),
                    "hr": int(row["hr_bpm"]),
                    "device": row["device"]
                })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)