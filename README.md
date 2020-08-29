# merge-files

### Install and Running

`npm run local <directory-name> <output-filename>`

e.g.:

`npm run local testData output.dat`

This will globally install the module, meaning you can subsequently run it using the command name:

`merge_files testData output.dat`

### Time Complexity

The files in the specified directory not sorted, but checked for sort status, this is a linear operation per file.

The confirmed-sorted files are merged ala mergesort, which is another linear operation given any two files/merged file content.

Therefore, the time complexity of the program is O(N), where N represents the number total lines across all files.

### Space Complexity

The files are all loaded into memory O(N), and then the aggregated content created as a result of the merge is built up in memory O(N).

Idiosyncrasies of garbage collection not withstanding, the space required in memory is O(2N), asymptotically linear space O(N).

### Possible improvements

The space complexity could be reduced to nearly constant by maintaining pointers to each file line and streaming directly into an output file.

The time complexity could be improved if we expected a large number of duplicate lines by using bucket sort or a similar sorting algorithm that exploits a known range of values.
