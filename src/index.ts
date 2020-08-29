#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { EOL } = require('os')

class MergeFilesCommandLine {
  directoryReadService: DirectoryReadService
  fileReadService: FileReadService
  confirmSortedService: ConfirmSortedService
  fileObjectMergeService: FileObjectMergeService
  fileWriterService: FileWriterService

  constructor(
    directoryReadService: DirectoryReadService,
    fileReadService: FileReadService,
    confirmSortedService: ConfirmSortedService,
    fileObjectMergeService: FileObjectMergeService,
    fileWriterService: FileWriterService
  ) {
    this.directoryReadService = directoryReadService;
    this.fileReadService = fileReadService;
    this.confirmSortedService = confirmSortedService;
    this.fileObjectMergeService = fileObjectMergeService;
    this.fileWriterService = fileWriterService;
  }

  run() {
    if (process.argv.slice(2).length !== 2) {
      console.error("Incorrect number of arguments.");
      process.exit(1);
    }

    const [directoryName, outputFilename] = process.argv.slice(2);

    const files: FileObject[] = this.directoryReadService.readAll(directoryName)
      .map(this.fileReadService.readFile)
      .map(this.confirmSortedService.assert)

    const output: string[] = this.fileObjectMergeService.mergeSort(files);

    this.fileWriterService.write(outputFilename, output);
  }
}

interface FileObject {
  name: string,
  content: string[]
}

class FileWriterService {
  write(name: string, content: string[]) {
    const file = fs.createWriteStream(name);

    file.on('error', (err: any) => { throw new Error(err); });

    content.forEach(function(v) { file.write(v + EOL); });

    file.end();
  }
}

class FileObjectMergeService {
  mergeSort(files: FileObject[]): string[] {
    if (files.length == 0) { return []; }
    if (files.length == 1) { return files[0].content; }

    const mid = files.length / 2;
    const left = files.slice(0, mid);
    const right = files.slice(mid, files.length);

    return this.merge(this.mergeSort(left), this.mergeSort(right));
  }

  merge(left: string[], right: string[]): string[] {
    const merged: string[] = [];
    let leftIdx = 0;
    let rightIdx = 0;

    while(leftIdx < left.length && rightIdx < right.length) {
      if(left[leftIdx] < right[rightIdx]) {
        merged.push(left[leftIdx++]);
      } else {
        merged.push(right[rightIdx++]);
      }
    }

    if (leftIdx === left.length) {
      while(rightIdx < right.length) {
        merged.push(right[rightIdx++]);
      }
    } else if (rightIdx === right.length) {
      while(leftIdx < left.length) {
        merged.push(left[leftIdx++]);
      }
    }

    return merged;
  }
}

// assert the arr is sorted lexicographically (alphabetic when using string
// made of words with characters
class ConfirmSortedService {
  assert(fileObj: FileObject): FileObject {
    const {content, name} = fileObj;

    let last: string = content[0];
    content.slice(1).forEach(current => {
      const sorted = current >= last
      if (!sorted) { throw new Error(name + " did not contain sorted lines") }
      last = current;
    });

    return fileObj;
  }
}

class FileReadService {
  readFile(filename: string): FileObject {
    return {
      content: fs
          .readFileSync(filename)
          .toString()
          .split("\n")
          .filter(Boolean), // filter out falsey values like ""
      name: filename
    }
  }
}

class DirectoryReadService {
  readAll(directoryName: string): any[] {
    return fs.readdirSync(directoryName)
      .map(path.parse)
      .map((a: { base: string }) => path.join(directoryName, a.base))
  }
}

try {
  new MergeFilesCommandLine(
    new DirectoryReadService(),
    new FileReadService(),
    new ConfirmSortedService(),
    new FileObjectMergeService(),
    new FileWriterService()
  ).run()
} catch(e) {
  console.error(e);
  process.exit(1);
}

