let myChart = null;  

function fetchPatientData(num) {
  fetch(`/api/data?patient=${num}`)
  .then(res => res.json())
  .then(data => {
    const labels = data.map(row => row.time);
    const values = data.map(row => row.spo2);
    
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    document.getElementById('stat-avg').innerHTML   = `${avg}<span class="unit">%</span>`;
    document.getElementById('stat-min').innerHTML   = `${Math.min(...values)}<span class="unit">%</span>`;
    document.getElementById('stat-max').innerHTML   = `${Math.max(...values)}<span class="unit">%</span>`;
    document.getElementById('stat-count').textContent = values.length.toLocaleString();

    if (myChart) {
      myChart.destroy();
    }
    myChart = new Chart(document.getElementById("spo2Chart"), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'SpO2',
          data: values
        }]
      }
    });
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

fetchPatientData(1); // Default (test) Call
