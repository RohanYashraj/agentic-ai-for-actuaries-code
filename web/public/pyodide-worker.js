/* Pyodide execution worker.
 *
 * Served as a static classic worker so the Python runtime stays fully
 * outside the app bundle and loads from the CDN only when a visitor
 * first presses Run. One run executes at a time (the client serializes);
 * loaded packages and fetched files are cached across runs.
 *
 * Messages in:  { type: "run", id, spec: {dir, entry, files, packages, data},
 *                 entrySource }
 * Messages out: { type: "status"|"stdout"|"stderr", id, text }
 *               { type: "done", id, ms } | { type: "error", id, message }
 */
"use strict";

var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
var DEMOS_BASE = "/demos";

var pyodidePromise = null;
var loadedPackages = {};
var writtenFiles = {};

function post(msg) {
  self.postMessage(msg);
}

function fetchText(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error("fetch failed (" + r.status + "): " + url);
    return r.text();
  });
}

function getPyodide(id) {
  if (!pyodidePromise) {
    post({ type: "status", id: id, text: "loading Python runtime (~10 MB)…" });
    importScripts(PYODIDE_URL);
    pyodidePromise = self.loadPyodide().catch(function (err) {
      pyodidePromise = null; // allow retry after transient CDN failures
      throw err;
    });
  }
  return pyodidePromise;
}

function ensurePackages(pyodide, packages, id) {
  var chain = Promise.resolve();
  packages.forEach(function (pkg) {
    chain = chain.then(function () {
      if (loadedPackages[pkg]) return;
      post({ type: "status", id: id, text: "loading " + pkg + "…" });
      return pyodide.loadPackage(pkg).then(function () {
        loadedPackages[pkg] = true;
      });
    });
  });
  return chain;
}

function mkdirp(pyodide, path) {
  try {
    pyodide.FS.mkdirTree(path);
  } catch (e) {
    /* exists */
  }
}

function ensureFiles(pyodide, spec) {
  mkdirp(pyodide, "/demo/" + spec.dir);
  mkdirp(pyodide, "/demo/data");
  var jobs = [];
  spec.files.forEach(function (f) {
    var path = "/demo/" + spec.dir + "/" + f;
    if (writtenFiles[path]) return;
    jobs.push(
      fetchText(DEMOS_BASE + "/" + spec.dir + "/" + f).then(function (text) {
        pyodide.FS.writeFile(path, text);
        writtenFiles[path] = true;
      })
    );
  });
  spec.data.forEach(function (f) {
    var path = "/demo/data/" + f;
    if (writtenFiles[path]) return;
    jobs.push(
      fetchText(DEMOS_BASE + "/data/" + f).then(function (text) {
        pyodide.FS.writeFile(path, text);
        writtenFiles[path] = true;
      })
    );
  });
  return Promise.all(jobs);
}

/* Run the entry file as __main__ from its own directory, evicting this
 * demo's modules first so edits and same-named modules from sibling
 * chapters (every chapter has a support.py) never leak between runs. */
function driverCode(spec) {
  var moduleNames = spec.files.map(function (f) {
    return f.replace(/\.py$/, "");
  });
  return [
    "import os, sys, runpy",
    "os.chdir('/demo/" + spec.dir + "')",
    "sys.path = [p for p in sys.path if not p.startswith('/demo/')]",
    "sys.path.insert(0, '/demo/" + spec.dir + "')",
    "for _m in " + JSON.stringify(moduleNames) + ":",
    "    sys.modules.pop(_m, None)",
    "runpy.run_path('" + spec.entry + "', run_name='__main__')",
  ].join("\n");
}

function runDemo(id, spec, entrySource) {
  var t0 = Date.now();
  return getPyodide(id)
    .then(function (pyodide) {
      return ensurePackages(pyodide, spec.packages, id)
        .then(function () {
          post({ type: "status", id: id, text: "preparing files…" });
          return ensureFiles(pyodide, spec);
        })
        .then(function () {
          pyodide.FS.writeFile("/demo/" + spec.dir + "/" + spec.entry, entrySource);
          pyodide.setStdout({
            batched: function (line) {
              post({ type: "stdout", id: id, text: line });
            },
          });
          pyodide.setStderr({
            batched: function (line) {
              post({ type: "stderr", id: id, text: line });
            },
          });
          post({ type: "status", id: id, text: "running…" });
          return pyodide.runPythonAsync(driverCode(spec));
        });
    })
    .then(function () {
      post({ type: "done", id: id, ms: Date.now() - t0 });
    })
    .catch(function (err) {
      post({
        type: "error",
        id: id,
        message: err && err.message ? err.message : String(err),
      });
    });
}

var queue = Promise.resolve();

self.onmessage = function (e) {
  var msg = e.data;
  if (!msg || msg.type !== "run") return;
  queue = queue.then(function () {
    return runDemo(msg.id, msg.spec, msg.entrySource);
  });
};
