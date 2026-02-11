'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

const dataPath = path.resolve(__dirname, '..', 'db', 'expense.json');
const htmlPath = path.resolve(__dirname, '..', 'public', 'index.html');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      fs.readFile(htmlPath, (err, data) => {
        if (err) {
          res.writeHead(500);

          return res.end('Error loading index.html');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });

      return;
    }

    if (req.method === 'POST' && req.url === '/add-expense') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const contentType = req.headers['content-type'];
          const isJson =
            contentType && contentType.startsWith('application/json');

          const expense = isJson ? JSON.parse(body) : querystring.parse(body);

          if (!expense.date || !expense.title || !expense.amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });

            return res.end('Missing fields');
          }

          const prettyJson = JSON.stringify(expense, null, 2);

          fs.writeFileSync(dataPath, prettyJson);

          if (isJson) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(expense));
          } else {
            const responseHtml = `
              <!DOCTYPE html>
              <html>
                <head><title>Expense Saved</title></head>
                <body>
                  <h1>Expense Added Successfully</h1>
                  <pre>${prettyJson}</pre>
                  <a href="/">Add another one</a>
                </body>
              </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(responseHtml);
          }
        } catch (error) {
          res.writeHead(400);
          res.end('Invalid Data');
        }
      });

      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });
}

module.exports = {
  createServer,
};
