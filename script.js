var d = new Date();
document.getElementById("day").innerHTML = d.getDate();
import { database, ref, onValue } from "./firebase-config.js";

var month = new Array();
month[0] = "Januari";
month[1] = "Februari";
month[2] = "Maret";
month[3] = "April";
month[4] = "Mei";
month[5] = "Juni";
month[6] = "Juli";
month[7] = "Agustus";
month[8] = "September";
month[9] = "Oktober";
month[10] = "November";
month[11] = "Desember";
document.getElementById("month").innerHTML = month[d.getMonth()];

const arahAnginMap = {
    0: "Utara",
    1: "Selatan",
    2: "Timur",
    3: "Timur Laut",
    4: "Tenggara",
    5: "Barat",
    6: "Barat Daya",
    7: "Barat Laut"
  };
const weatherImageURL = "assets/style/today.png";

const tempCKP = ref(database, 'Cikapundung/DHT22/temperature');
const humCKP = ref(database, 'Cikapundung/DHT22/humidity');
const aneCKP = ref(database, 'Cikapundung/Anemometer/kmh');
const arahCKP = ref(database, 'Cikapundung/ArahAngin');
const presCKP = ref(database, 'Cikapundung/BMP280/pressure');
const luxCKP = ref(database, 'Cikapundung/Cahaya');
const curahCKP = ref(database, 'Cikapundung/CurahHujan');
const tmaCKP = ref(database, 'Cikapundung/TMA');    
const cuacaCKP = ref(database, 'Cikapundung/KondisiCuaca');
const anginCKP = ref(database, 'Cikapundung/KondisiAngin');

onValue(cuacaCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop(); // Ambil timestamp terakhir
        const status = data[lastKey];
        document.getElementById("cuacaCKP").innerText = `${status},`;
    } else {
        document.getElementById("cuacaCKP").innerText = "Cuaca: Tidak ada data";
    }
});

onValue(anginCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop(); // Ambil timestamp terakhir
        const status = data[lastKey];
        document.getElementById("anginCKP").innerText = `${status}`;
    } else {
        document.getElementById("anginCKP").innerText = "Kecepatan Angin: Tidak ada data";
    }
});

onValue(tempCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        document.getElementById("tempCKP").innerText = `${data[lastKey]}°C`;
    } else{
        document.getElementById("tempCKP").innerText = "Suhu No Data";
    }
});

onValue(humCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        document.getElementById("humCKP").innerText = `${data[lastKey]}%`;
    } else{
        document.getElementById("humCKP").innerText = "Kelembapan No Data";
    }
}
);  

onValue(presCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        document.getElementById("presCKP").innerText = `${data[lastKey]} hPa`;
    } else{
        document.getElementById("presCKP").innerText = "Tekanan No Data";
    }
}
);  

onValue(tmaCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        document.getElementById("tmaCKP").innerText = `${data[lastKey]} cm`;
    } else{
        document.getElementById("tmaCKP").innerText = "TMA No Data";
    }
}
);  

onValue(arahCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        const kodeArah = data[lastKey];
        const arahAngin = arahAnginMap[kodeArah] || "Tidak Diketahui";
        document.getElementById("arahCKP").innerText = arahAngin;
    } else{
        document.getElementById("arahCKP").innerText = "Arah Angin No Data";
    }
});

onValue(aneCKP, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const lastKey = Object.keys(data).sort().pop();
        document.getElementById("aneCKP").innerText = `${data[lastKey]} km/h`;
    } else{
        document.getElementById("aneCKP").innerText = "Kecepatan Angin No Data";
    }
}
);  