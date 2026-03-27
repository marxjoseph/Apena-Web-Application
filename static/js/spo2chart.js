let myChart = null;  
let labels = null;
let values = null;
let myChartBio = null;  
let bioLabels = null;
let bioValues = null;
const minPoints = 10;

function fetchPatientDataSpo2(num) {
  fetch(`/api/data/spo2?patient=${num}`)
  .then(res => res.json())
  .then(data => {
    labels = data.map(row => row.time.slice(11, 19));
    values = data.map(row => row.spo2_pct);
    generateStatsAndChartSpo2(labels, values);
  });
}

function fetchPatientDataBioz(num) {
  fetch(`/api/data/bioz?patient=${num}`)
  .then(res => res.json())
  .then(data => {
    bioLabels = data.map(row => row.time.slice(11, 19));
    bioValues = data.map(row => row.sample);
    generateStatsAndChartBioz(bioLabels, bioValues);
  });
}

function generateStatsAndChartSpo2(times, spo2) {
  const safe = val => (isFinite(val) ? val : 'None');
  const avg = Math.round(spo2.reduce((a, b) => a + b, 0) / spo2.length);
  document.getElementById('stat-avg').innerHTML   = `${safe(avg)}<span class="unit">%</span>`;
  document.getElementById('stat-min').innerHTML   = `${safe(Math.min(...spo2))}<span class="unit">%</span>`;
  document.getElementById('stat-max').innerHTML   = `${safe(Math.max(...spo2))}<span class="unit">%</span>`;
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

function generateStatsAndChartBioz(times, bioz) {
  const safe = val => (isFinite(val) ? val : 'None');
  const avg = (bioz.reduce((a, b) => a + b, 0) / bioz.length).toFixed(3);
  document.getElementById('stat-avg-bioz').innerHTML   = `${safe(avg)}<span class="unit"></span>`;
  document.getElementById('stat-min-bioz').innerHTML   = `${safe(Math.min(...bioz).toFixed(3))}<span class="unit"></span>`;
  document.getElementById('stat-max-bioz').innerHTML   = `${safe(Math.max(...bioz).toFixed(3))}<span class="unit"></span>`;
  document.getElementById('stat-count-bioz').textContent = bioz.length.toLocaleString();
  if (myChartBio) {
    myChartBio.destroy();
  }
  myChartBio = new Chart(document.getElementById("biozChart"), {
    type: 'line',
    data: {
      labels: times,
      datasets: [{
        label: 'BioZ',
        data: bioz
      }]
    }
  });
}

patients = document.querySelectorAll(".patient-button");
patients.forEach(patient => {
  patient.addEventListener("click", e => {
    console.log("here");
    if (e.target.tagName === "BUTTON") {
      fetchPatientDataSpo2(e.target.dataset.patient);
      document.getElementById("start-time").value = null;
      document.getElementById("end-time").value = null;
      fetchPatientDataBioz(e.target.dataset.patient);
      document.getElementById("start-time-bioz").value = null;
      document.getElementById("end-time-bioz").value = null;
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
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] > start && labels[i] < end) {
      times.push(labels[i]);
      spo2.push(values[i]);
    }
  }
  if(times.length >= minPoints) {
    generateStatsAndChartSpo2(times, spo2);
  }
  else {
    alert(`There needs to be at least 10 valid points in between the times chosen. There was only ${times.length} valid points.`);  
  }
});

reset = document.getElementById("filter-reset") 
  reset.addEventListener("click", () => {
    generateStatsAndChartSpo2(labels, values)
    document.getElementById("start-time").value = null;
    document.getElementById("end-time").value = null;
});

filterBio = document.getElementById("filter-button-bioz");
filterBio.addEventListener("click", () => {
  const start = document.getElementById("start-time-bioz").value;
  const end = document.getElementById("end-time-bioz").value;
  const times = [];
  const bioz = [];
  for (let i = 0; i < bioLabels.length; i++) {
    if (bioLabels[i] > start && bioLabels[i] < end) {
      times.push(bioLabels[i]);
      bioz.push(bioValues[i]);
    }
  }
  if(times.length >= minPoints) {
    generateStatsAndChartBioz(times, bioz);
  }
  else {
    alert(`There needs to be at least 10 valid points in between the times chosen. There was only ${times.length} valid points.`);  
  }
});

resetBio = document.getElementById("filter-reset-bioz") 
resetBio.addEventListener("click", () => {
  generateStatsAndChartBioz(bioLabels, bioValues)
  document.getElementById("start-time-bioz").value = null;
  document.getElementById("end-time-bioz").value = null;
});

logout = document.getElementById("logout")
logout.addEventListener("click", () => {
  fetch("/logout")
  .then(res => {
    window.location.reload();
  });
});

fetchPatientDataSpo2(1); // Default (test) Call
fetchPatientDataBioz(1); // Default (test) Call
