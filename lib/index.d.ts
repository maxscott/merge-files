#!/usr/bin/env node
declare const fs: any;
declare const path: any;
declare const EOL: any;
declare class MergeFilesCommandLine {
    directoryReadService: DirectoryReadService;
    fileReadService: FileReadService;
    confirmSortedService: ConfirmSortedService;
    fileObjectMergeService: FileObjectMergeService;
    fileWriterService: FileWriterService;
    constructor(directoryReadService: DirectoryReadService, fileReadService: FileReadService, confirmSortedService: ConfirmSortedService, fileObjectMergeService: FileObjectMergeService, fileWriterService: FileWriterService);
    run(): void;
}
interface FileObject {
    name: string;
    content: string[];
}
declare class FileWriterService {
    write(name: string, content: string[]): void;
}
declare class FileObjectMergeService {
    mergeSort(files: FileObject[]): string[];
    merge(left: string[], right: string[]): string[];
}
declare class ConfirmSortedService {
    assert(fileObj: FileObject): FileObject;
}
declare class FileReadService {
    readFile(filename: string): FileObject;
}
declare class DirectoryReadService {
    readAll(directoryName: string): any[];
}
