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
          const expense =
            contentType === 'application/json'
              ? JSON.parse(body)
              : querystring.parse(body);

          if (!expense.date || !expense.title || !expense.amount) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });

            return res.end('Missing fields');
          }

          fs.writeFileSync(dataPath, JSON.stringify(expense));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(expense));
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
