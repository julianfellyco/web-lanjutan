const fs = require("fs");

try {
  fs.renameSync("mwsore.json", "mwpagi.json");
  //done
  console.log("Berhasil mengganti nama!");
} catch (err) {
  console.error(err);
}