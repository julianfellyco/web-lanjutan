  
const fs = require("fs");

fs.rename("mwpagi.json", "mwsore.json", (err) => {
  if (err) {
    return console.error(err);
  }

  //done
  console.log("Berhasil mengganti nama!");
});