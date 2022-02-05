import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import path from "path";
import App from "../src/App.js";

const app = express();
const PORT = 9000 || process.env.PORT;

// Register external plugins
fs.readdir(path.resolve("./plugins"), "utf-8", (err, data) => {
  if (err) throw err;

  data.forEach((p) => {
    const { isActive } = require(path.resolve(`./plugins/${p}/plugin.json`));

    if (!isActive) {
      return false;
    }

    const plugin = require(path.resolve(`./plugins/${p}/index.js`));
    app.use(require(path.resolve(`./plugins/${p}/index.js`)));
  });
});

app.use("^/$", (req, res) => {
  fs.readFile(path.resolve("./build/index.html"), "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ statusCode: 500, error: "SErver error" });
    }

    res
      .status(200)
      .send(
        data.replace(
          '<div id="root"></div>',
          `<div id="root">${ReactDOMServer.renderToNodeStream(<App />)}</div>`
        )
      );
  });
});

app.use(express.static(path.resolve("./build")));

app.listen(PORT, () =>
  console.log(`SEver running on http://localhost:${PORT}`)
);
