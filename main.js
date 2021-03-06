/*
 * 모듈 가져오기
 */
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

/*
 * 공통 템플릿 HTML
 */
function templateHTML(title, list, body, control) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB2</a></h1>
    ${list}
    ${control}
    ${body} 
  </body>
  </html>
  `;
}

/*
 * 템플릿 리스트 
 */
function templateList(filelist) {
  var list = '<ul>';
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + '</ul>';
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === '/') {
    if (queryData.id === undefined) {
     /*
      * 파일 목록 가져오기
      */
      fs.readdir('./data', function (error, filelist) {
        var title = "반가워요!!";
        var description = "헬로우 노드js";
        var list = templateList(filelist);
        var template = templateHTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    } else { 
      fs.readdir('./data', function (error, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var list = templateList(filelist);
          var title = queryData.id;
          var template = templateHTML(title, list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a> 
              <a href="/update?id=${title}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>
              `
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  /*
   * 생성하기 
   */
  } else if (pathname === '/create') {
    fs.readdir('./data', function (error, filelist) {
      var title = "web - create";
      var list = templateList(filelist);
      var template = templateHTML(title, list, `
      <form action="/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
          <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
          <input type="submit">
      </p>
      </form>
    `);
      response.writeHead(200);
      response.end(template);
    })
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end('sucessss');
      })
    })

  /*
   * 수정하기
   */  
  } else if(pathname === '/update'){
    fs.readdir('./data', function (error, filelist) {
      fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
        var list = templateList(filelist);
        var title = queryData.id;
        var template = templateHTML(title, list,
          `  
          <form action="/update_process" method="post">
            <input name="id" type="hidden" value=${title}>    
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  
  } else if(pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();

      })
    })
  });
 /*
  * 삭제하기 
  */
  } else if(pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id; 
      fs.unlink(`data/${id}`, function(error){
        response.writeHead(302, { Location: `/` });
        response.end();

        
      })
  });
 /*
  * 에러 페이지  
  */
  }else {
    response.writeHead(404);
    response.end('not founddd');
  }
});
app.listen(3000);