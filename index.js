const express = require("express");
const port = process.env.PORT || 15000;

var app = express();

const path = require("path");
const bodyParser = require("body-parser");

var pF = path.resolve(__dirname, "public");

const server = require("http").createServer(app);

app.use("/public", express.static("public"));
app.use("/scripts", express.static("build"));
app.use("/styling", express.static("css"));
app.use("/img", express.static("content/assets/productImages"));
app.use("/products", express.static("content"));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", function(req, resp) {
    resp.sendFile(pF + "/index.html");
});

server.listen(port, function(err) {
    if(err) {
        console.log(err);
        return(false);
    }
    console.log(port + " is running");
});