var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");

function templateHTML(title, list, control, body) {
  return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>`;
}

function templateList(fileList) {
  var i = 0;
  var list = "<ul>";
  while (i < fileList.length) {
    list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}<a/></li>`;
    i++;
  }
  list = list + "</ul>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", (err, fileList) => {
        var title = "Welcome";
        var description = "Hello Node.js";
        var list = templateList(fileList);
        var template = templateHTML(
          title,
          list,
          `<a href="/create">create</a>`,
          `<h2>${title}</h2>${description}`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir("./data", (err, fileList) => {
        fs.readFile(`data/${queryData.id}`, "utf8", (err, description) => {
          var title = queryData.id;
          var list = templateList(fileList);
          var template = templateHTML(
            title,
            list,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
            `<h2>${title}</h2>${description}`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", (err, fileList) => {
      var title = "WEB - create";
      var list = templateList(fileList);
      var template = templateHTML(
        title,
        list,
        "",
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" id="" cols="30" rows="10" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", () => {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", (err, fileList) => {
      fs.readFile(`data/${queryData.id}`, "utf8", (err, description) => {
        var title = queryData.id;
        var list = templateList(fileList);
        var template = templateHTML(
          title,
          list,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
          `
          <form action="/update_process" method="post">
          <input type='hidden' name='id' value='${title}'>
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" id="" cols="30" rows="10" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
        </form>
          `
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathname === "update_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on('end', () => {
      var post = qs.parse(body)
      var id = post.id
      var title = post.title
      var description = post.description
      console.log(post)
    })
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
