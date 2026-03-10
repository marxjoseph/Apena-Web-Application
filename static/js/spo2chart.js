let myChart = null;  
let labels = null;
let values = null;
const minPoints = 10;

function fetchPatientData(num) {
  fetch(`/api/data?patient=${num}`)
  .then(res => res.json())
  .then(data => {
    labels = data.map(row => row.time);
    values = data.map(row => row.spo2);
    generateStatsAndChart(labels, values);
  });
}

function generateStatsAndChart(times, spo2) {
  const avg = Math.round(spo2.reduce((a, b) => a + b, 0) / spo2.length);
  document.getElementById('stat-avg').innerHTML   = `${avg}<span class="unit">%</span>`;
  document.getElementById('stat-min').innerHTML   = `${Math.min(...spo2)}<span class="unit">%</span>`;
  document.getElementById('stat-max').innerHTML   = `${Math.max(...spo2)}<span class="unit">%</span>`;
  document.getElementById('stat-count').textContent = spo2.length.toLocaleString();

  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(document.getElementById("spo2Chart"), {
    type: 'line',
    data: {
      labels: times,
      datasets: [{
        label: 'SpO2',
        data: spo2
      }]
    }
  });
}

patients = document.querySelectorAll(".patient-button");
patients.forEach(patient => {
  patient.addEventListener("click", e => {
    console.log("here");
    if (e.target.tagName === "BUTTON") {
      fetchPatientData(e.target.dataset.patient);
      patients.forEach(patientRemoveActive => {
        patientRemoveActive.classList.remove("active");
      });
      e.target.classList.add("active");
    }
  });
});

filter = document.getElementById("filter-button");
filter.addEventListener("click", () => {
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;
  const times = [];
  const spo2 = [];
  console.log(start, end);
  for (let i = 0; i < labels.length; i++) {
    console.log(labels[i]);
    if (labels[i] > start && labels[i] < end) {
      times.push(labels[i]);
      spo2.push(values[i]);
    }
  }
  if(times.length >= minPoints) {
    generateStatsAndChart(times, spo2);
  }
  else {
    alert(`There needs to be at least 10 valid points in between the times chosen. There was only ${times.length} valid points.`);  
  }
});

reset = document.getElementById("filter-reset") 
  reset.addEventListener("click", () => {
    generateStatsAndChart(labels, values)
    document.getElementById("start-time").value = null;
    document.getElementById("end-time").value = null;
});

fetchPatientData(1); // Default (test) Call
