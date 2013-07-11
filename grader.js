#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    return checkHtml(fs.readFileSync(htmlfile), checksfile);
};

var checkRemoteFile = function(url, checksfile, callback) {
  rest.get(url).on('complete', function(data, response) {
    if(callback && typeof(callback) === 'function') {
      callback(checkHtml(data, checksfile));
    } else {
      console.log('Please specify callback for checkRemoteFile');
    }
  });
}

var checkHtml = function(htmldata, checksfile) {
    $ = cheerio.load(htmldata);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_url>', 'Url to index.html')
        .parse(process.argv);
    if(program.url) {
      checkRemoteFile(program.url, program.checks, function(jsonOut) {
        console.log(JSON.stringify(jsonOut, null, 4));
      });
    } else {
      var jsonOut = checkHtml(fs.readFileSync(program.file), program.checks);
      console.log(JSON.stringify(jsonOut, null, 4));
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkRemoteFile = checkRemoteFile;
}