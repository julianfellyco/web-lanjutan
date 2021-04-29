const http = require("http");

//buat object server dengan listen port 3000
http
  .createServer(function (req, res) {
    //http Header
    res.writeHead(200, { "Content-Type": "text/html" });

    //Respon ke browser / client
    res.write("<H1>Module HTTP Mobile and Web</H1>");

    //Respon diakhiri
    res.end();
  })
  .listen(3400);
