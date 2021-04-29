
const fs = require("fs");

//buat file mw.text dan mengisi dengan data:
fs.appendFile("mw.txt", "Kelas Mobile dan Web!", function (err) {
  if (err) throw err;
  console.log("Berhasil disimpan!");
});

//run dengan: node appendFile.js