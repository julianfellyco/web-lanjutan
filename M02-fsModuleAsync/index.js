  
const http = require("http");
const fs = require("fs");

//buat object server dengan listen port 3400
http
  .createServer(function (req, res) {
    //menggunakan modul readFile
    fs.readFile("index.html", (err, data) => {
      //mengembalikan pesan error ketika gagal baca file
      if (err) throw err;

      //http Header
      res.writeHead(200, { "Content-Type": "text/html" });

      //Respon ke browser / client berupa data dari file index.html
      res.write(data);

      //Respon diakhiri
      res.end();
    });
  })
  .listen(3400);