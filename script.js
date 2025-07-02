// script.js
import { database, ref, onValue } from "./firebase-config.js";

// ——— 1. Tampilkan tanggal ———
const dayEl = document.getElementById("day");
const monthEl = document.getElementById("month");
if (dayEl && monthEl) {
  const now = new Date();
  dayEl.innerText = now.getDate();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  monthEl.innerText = monthNames[now.getMonth()];
}

// ——— 2. Helper decode & safe set ———
function decodeCuaca(code) {
  const m = { 0: "Cerah", 1: "Cerah Berawan", 2: "Berawan", 3: "Hujan" };
  return m[parseInt(code)] || "Tidak diketahui";
}

function setTextSafe(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

// ——— 3. Update ikon cuaca ———
function updateWeatherIcon(status, iconId) {
  const el = document.getElementById(iconId);
  if (!el || !status) return;
  const parent = el.parentElement;
  if (parent && getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }
  const s = status.toLowerCase();
  let icon = "default.svg";
  if (s.includes("cerah")) icon = "cerah.svg";
  else if (s.includes("berawan")) icon = "berawan.svg";
  else if (s.includes("lebat")) icon = "hujanlebat.svg";
  else if (s.includes("hujan")) icon = "hujan2.svg";
  el.src = `assets/icons/${icon}`;
}

// ——— 4. Realtime sensor data ———
["Cikapundung", "Cipalasari"].forEach(loc => {
  const sensorRef = ref(database, loc);
  onValue(sensorRef, snap => {
    const data = snap.val() || {};
    const keys = Object.keys(data).map(Number).sort((a, b) => a - b).map(String);
    if (!keys.length) return;
    const latest = data[keys.pop()];

    const map = {
      Cikapundung: {
        temp: "tempCKP", hum: "humCKP", pres: "presCKP",
        curah: "curahCKP", cuaca: "cuacaCKP", angin: "anginCKP",
        ane: "aneCKP", tma: "tmaCKP", icon: "iconCuacaCKP", arah: "arahCKP"
      },
      Cipalasari: {
        temp: "tempCPL", hum: "humCPL", pres: "presCPL",
        curah: "curahCPL", cuaca: "cuacaCPL", angin: "anginCPL",
        ane: "aneCPL", tma: "tmaCPL", icon: "iconCuacaCPL", arah: "arahCPL"
      }
    }[loc];

    setTextSafe(map.temp, `${latest.suhu_dht ?? "-"}°C`);
    setTextSafe(map.hum, `${latest.kelembapan ?? "-"}%`);
    setTextSafe(map.pres, `${latest.tekanan?.toFixed(2) ?? "-"} hPa`);
    setTextSafe(map.curah, `${latest.curah_hujan_mm ?? "-"} mm`);
    setTextSafe(map.cuaca, `${latest.kondisi_cuaca ?? "-"},`);
    setTextSafe(map.angin, `${latest.kondisi_angin ?? "-"}`);
    setTextSafe(map.ane, `${latest.kecepatan_angin_kmh ?? "-"} km/h`);
    setTextSafe(map.tma, `${latest.jarak_air_m?.toFixed(2) ?? "-"} m`);
    setTextSafe(map.arah, `${latest.arah_angin ?? "-"}`);
    updateWeatherIcon(latest.kondisi_cuaca, map.icon);
  });
});

// ——— 5. Hourly Forecast ———
const hourlyBody = document.getElementById("hourly-body");
const locSelect = document.getElementById("lokasiSelect");
let unsubscribeHourly = null;

function fetchHourly(lokasi) {
  if (unsubscribeHourly) unsubscribeHourly();
  const path = `Prediksi/${lokasi}/PerJam`;
  const hourlyRef = ref(database, path);
  unsubscribeHourly = onValue(hourlyRef, snap => {
    const data = snap.val() || {};
    const keys = Object.keys(data).sort();
    if (!keys.length) {
      hourlyBody.innerHTML = '<tr><td colspan="4">Belum ada data prediksi</td></tr>';
      return;
    }
    hourlyBody.innerHTML = keys.map(k => {
      const d = data[k], t = new Date(d.timestamp);
      const hh = t.getHours().toString().padStart(2, "0"),
            mm = t.getMinutes().toString().padStart(2, "0");
      return `
      <tr>
        <td>${hh}:${mm}</td>
        <td>${parseFloat(d.suhu).toFixed(1)}</td>
        <td>${parseFloat(d.kelembapan).toFixed(0)}</td>
        <td>${decodeCuaca(d.cuaca_code)}</td>
      </tr>`;
    }).join("");
  }, err => {
    console.error("Gagal load prediksi hourly:", err);
    hourlyBody.innerHTML = '<tr><td colspan="4">Error saat load data</td></tr>';
  });
}

if (hourlyBody) {
  const initialLoc = locSelect?.value || "Cikapundung";
  fetchHourly(initialLoc);
}
if (locSelect) {
  locSelect.addEventListener("change", () => {
    fetchHourly(locSelect.value);
    localStorage.setItem("lokasiPilihan", locSelect.value);
    loadTenDay(locSelect.value); // untuk 10 hari juga
  });
}

// ——— 6. Ten-Day Forecast ———
const tenContainer = document.getElementById("weather-cards");
if (tenContainer && locSelect) {
  const iconMap = { 0: "cerah.svg", 1: "berawan.svg", 2: "hujan2.svg", 3: "hujanlebat.svg", default: "default.svg" };
  const saved = localStorage.getItem("lokasiPilihan") || "Cikapundung";
  locSelect.value = saved;
  loadTenDay(saved);

  function loadTenDay(lokasi) {
    onValue(ref(database, `Prediksi/${lokasi}/PerHari`), snap => {
      const data = snap.val() || {};
      const sorted = Object.entries(data).sort((a, b) => new Date(a[0]) - new Date(b[0]));
      tenContainer.innerHTML = sorted.slice(0, 10).map(([tgl, val]) => {
        const icon = iconMap[val.cuaca_code] || iconMap.default;
        return `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm position-relative">
            <img src="assets/icons/${icon}" class="position-absolute top-0 end-0 p-2" style="width:80px;height:80px"/>
            <div class="card-body">
              <h5 class="card-title">${tgl}</h5>
              <p class="card-text"><strong>Cuaca:</strong> ${decodeCuaca(val.cuaca_code)}</p>
              <p class="card-text"><strong>Suhu:</strong> ${parseFloat(val.suhu).toFixed(1)}°C</p>
              <p class="card-text"><strong>Humiditas:</strong> ${parseFloat(val.kelembapan).toFixed(0)}%</p>
              <p class="card-text"><strong>Curah Hujan:</strong> ${parseFloat(val.curah_hujan).toFixed(1)} mm</p>
            </div>
          </div>
        </div>`;
      }).join("") || `<p class="text-center">Belum ada data prediksi</p>`;
    });
  }
}
// ——— 7. Riwayat 10 Hari Terakhir & Prediksi 10 Hari Mendatang (Terpisah) ———
const histContainer = document.getElementById("history-cards");
const predContainer = document.getElementById("forecast-cards");

function loadHistory(lokasi) {
  if (!histContainer) return;
  histContainer.innerHTML = "<p class='text-center'>Loading...</p>";
  const iconMap = {
    0: "cerah.svg", 1: "berawan.svg", 2: "hujan2.svg", 3: "hujanlebat.svg", default: "default.svg"
  };

  const today = new Date();
  const fetches = [];
  for (let i = 10; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const url = `https://weweather1-c9385-default-rtdb.asia-southeast1.firebasedatabase.app/RiwayatPrediksi/${lokasi}/Daily/${dateStr}.json`;
    fetches.push(fetch(url).then(res => res.json().then(data => ({ dateStr, data }))));
  }

  Promise.all(fetches).then(results => {
    const cards = results
      .filter(e => e.data)
      .map(({ dateStr, data }) => {
        const icon = iconMap[data.cuaca_code] || iconMap.default;
        return `
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm position-relative">
              <img src="assets/icons/${icon}" class="position-absolute top-0 end-0 p-2" style="width:80px;height:80px"/>
              <div class="card-body">
                <h5 class="card-title">${dateStr}</h5>
                <p class="card-text"><strong>Cuaca:</strong> ${decodeCuaca(data.cuaca_code)}</p>
                <p class="card-text"><strong>Suhu:</strong> ${parseFloat(data.suhu).toFixed(1)}°C</p>
                <p class="card-text"><strong>Humiditas:</strong> ${parseFloat(data.kelembapan).toFixed(0)}%</p>
                <p class="card-text"><strong>Curah Hujan:</strong> ${parseFloat(data.curah_hujan || data.curah || 0).toFixed(1)} mm</p>
              </div>
            </div>
          </div>`;
      });

    histContainer.innerHTML = cards.join("") || `<p class='text-center'>Tidak ada data histori tersedia.</p>`;
  });
}

function loadTenDaySeparated(lokasi) {
  if (!predContainer) return;
  predContainer.innerHTML = "<p class='text-center'>Loading...</p>";
  const iconMap = {
    0: "cerah.svg", 1: "berawan.svg", 2: "hujan2.svg", 3: "hujanlebat.svg", default: "default.svg"
  };

  const refPred = ref(database, `Prediksi/${lokasi}/PerHari`);
  onValue(refPred, snap => {
    const data = snap.val() || {};
    const sorted = Object.entries(data).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    const cards = sorted.slice(0, 10).map(([dateStr, val]) => {
      const icon = iconMap[val.cuaca_code] || iconMap.default;
      return `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm position-relative">
            <img src="assets/icons/${icon}" class="position-absolute top-0 end-0 p-2" style="width:80px;height:80px"/>
            <div class="card-body">
              <h5 class="card-title">${dateStr}</h5>
              <p class="card-text"><strong>Cuaca:</strong> ${decodeCuaca(val.cuaca_code)}</p>
              <p class="card-text"><strong>Suhu:</strong> ${parseFloat(val.suhu).toFixed(1)}°C</p>
              <p class="card-text"><strong>Humiditas:</strong> ${parseFloat(val.kelembapan).toFixed(0)}%</p>
              <p class="card-text"><strong>Curah Hujan:</strong> ${parseFloat(val.curah_hujan || val.curah || 0).toFixed(1)} mm</p>
            </div>
          </div>
        </div>`;
    });

    predContainer.innerHTML = cards.join("") || `<p class='text-center'>Tidak ada data prediksi tersedia.</p>`;
  });
}

// Inisialisasi saat halaman dibuka
const lokasiTerakhir = localStorage.getItem("lokasiPilihan") || "Cikapundung";
loadHistory(lokasiTerakhir);
loadTenDaySeparated(lokasiTerakhir);

if (locSelect) {
  locSelect.value = lokasiTerakhir;
  locSelect.addEventListener("change", () => {
    localStorage.setItem("lokasiPilihan", locSelect.value);
    loadHistory(locSelect.value);
    loadTenDaySeparated(locSelect.value);
  });
}
