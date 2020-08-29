#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { EOL } = require('os')
const lineByLine = require('n-readlines');

class MergeFilesCommandLine {
  directoryReadService: DirectoryReadService

  constructor(directoryReadService: DirectoryReadService) {
    this.directoryReadService = directoryReadService;
  }

  run() {
    if (process.argv.slice(2).length !== 2) {
      console.error("Incorrect number of arguments.");
      process.exit(1);
    }

    const [directoryName, outputFilename] = process.argv.slice(2);
    const outputFile = fs.createWriteStream(outputFilename);
    const fileNames = this.directoryReadService.readAll(directoryName);

    let files = fileNames.map(a => {
      return {
        lbl: new lineByLine(a),
        latestLine: "",
        previousLine: ""
      }
    });

    files.forEach(f => {
      f.latestLine = f.lbl.next();
    })

    while (files.length !== 0) {
      // find lowest val
      const fileWithLowestString = files.reduce((acc,curr) => {
        if (acc.latestLine < curr.latestLine) return acc;
        return curr;
      });

      if (
        fileWithLowestString.latestLine.toString() <
        fileWithLowestString.previousLine.toString()) {
        throw new Error("File not already sorted");
      }

      // stream to output file
      if (fileWithLowestString.latestLine.toString() !== "") {
        outputFile.write(fileWithLowestString.latestLine + EOL);
      }

      // increment used file line
      fileWithLowestString.previousLine = fileWithLowestString.latestLine;
      fileWithLowestString.latestLine = fileWithLowestString.lbl.next();

      // if that file is empty, remove it from files
      if (!fileWithLowestString.latestLine) {
        files = files.filter(f => f !== fileWithLowestString);
      }
    }
  }
}

class DirectoryReadService {
  readAll(directoryName: string): string[] {
    return fs.readdirSync(directoryName)
      .map(path.parse)
      .map((a: { base: string }) => path.join(directoryName, a.base))
  }
}

try {
  new MergeFilesCommandLine(new DirectoryReadService()).run()
} catch(e) {
  console.error(e);
  process.exit(1);
}

