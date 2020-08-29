#!/usr/bin/env node
"use strict";
var fs = require('fs');
var path = require('path');
var EOL = require('os').EOL;
var MergeFilesCommandLine = /** @class */ (function () {
    function MergeFilesCommandLine(directoryReadService, fileReadService, confirmSortedService, fileObjectMergeService, fileWriterService) {
        this.directoryReadService = directoryReadService;
        this.fileReadService = fileReadService;
        this.confirmSortedService = confirmSortedService;
        this.fileObjectMergeService = fileObjectMergeService;
        this.fileWriterService = fileWriterService;
    }
    MergeFilesCommandLine.prototype.run = function () {
        if (process.argv.slice(2).length !== 2) {
            console.error("Incorrect number of arguments.");
            process.exit(1);
        }
        var _a = process.argv.slice(2), directoryName = _a[0], outputFilename = _a[1];
        var files = this.directoryReadService.readAll(directoryName)
            .map(this.fileReadService.readFile)
            .map(this.confirmSortedService.assert);
        var output = this.fileObjectMergeService.mergeSort(files);
        this.fileWriterService.write(outputFilename, output);
    };
    return MergeFilesCommandLine;
}());
var FileWriterService = /** @class */ (function () {
    function FileWriterService() {
    }
    FileWriterService.prototype.write = function (name, content) {
        var file = fs.createWriteStream(name);
        file.on('error', function (err) { throw new Error(err); });
        content.forEach(function (v) { file.write(v + EOL); });
        file.end();
    };
    return FileWriterService;
}());
var FileObjectMergeService = /** @class */ (function () {
    function FileObjectMergeService() {
    }
    FileObjectMergeService.prototype.mergeSort = function (files) {
        if (files.length == 0) {
            return [];
        }
        if (files.length == 1) {
            return files[0].content;
        }
        var mid = files.length / 2;
        var left = files.slice(0, mid);
        var right = files.slice(mid, files.length);
        return this.merge(this.mergeSort(left), this.mergeSort(right));
    };
    FileObjectMergeService.prototype.merge = function (left, right) {
        var merged = [];
        var leftIdx = 0;
        var rightIdx = 0;
        while (leftIdx < left.length && rightIdx < right.length) {
            if (left[leftIdx] < right[rightIdx]) {
                merged.push(left[leftIdx++]);
            }
            else {
                merged.push(right[rightIdx++]);
            }
        }
        if (leftIdx === left.length) {
            while (rightIdx < right.length) {
                merged.push(right[rightIdx++]);
            }
        }
        else if (rightIdx === right.length) {
            while (leftIdx < left.length) {
                merged.push(left[leftIdx++]);
            }
        }
        return merged;
    };
    return FileObjectMergeService;
}());
// assert the arr is sorted lexicographically (alphabetic when using string
// made of words with characters
var ConfirmSortedService = /** @class */ (function () {
    function ConfirmSortedService() {
    }
    ConfirmSortedService.prototype.assert = function (fileObj) {
        var content = fileObj.content, name = fileObj.name;
        var last = content[0];
        content.slice(1).forEach(function (current) {
            var sorted = current >= last;
            if (!sorted) {
                throw new Error(name + " did not contain sorted lines");
            }
            last = current;
        });
        return fileObj;
    };
    return ConfirmSortedService;
}());
var FileReadService = /** @class */ (function () {
    function FileReadService() {
    }
    FileReadService.prototype.readFile = function (filename) {
        return {
            content: fs
                .readFileSync(filename)
                .toString()
                .split("\n")
                .filter(Boolean),
            name: filename
        };
    };
    return FileReadService;
}());
var DirectoryReadService = /** @class */ (function () {
    function DirectoryReadService() {
    }
    DirectoryReadService.prototype.readAll = function (directoryName) {
        return fs.readdirSync(directoryName)
            .map(path.parse)
            .map(function (a) { return path.join(directoryName, a.base); });
    };
    return DirectoryReadService;
}());
try {
    new MergeFilesCommandLine(new DirectoryReadService(), new FileReadService(), new ConfirmSortedService(), new FileObjectMergeService(), new FileWriterService()).run();
}
catch (e) {
    console.error(e);
    process.exit(1);
}
