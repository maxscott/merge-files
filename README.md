# merge-files

### Install and Running

`npm run local <directory-name> <output-filename>`

e.g.:

`npm run local testData output.dat`

This will globally install the module, meaning you can subsequently run it using the command name:

`merge_files testData output.dat`

### Time Complexity

Updated:
Traverse all the files at the same time, checking individual sort order as we
go, and checking across the K files for the next lexicographically smallest line
for each of the N lines in all files. O(NK).

### Space Complexity

Updated:
Rewrote to use pointers to files and stream directly into the output
file, so the memory usage is now just pointers to the files. O(K) where K is the
total number of files.

### Possible improvements

Instead of finding the min item each time, store the top items as a min-heap
linked to the file pointers, and delete min/insert next line on each interation.
In a fibonacci heap, find-min and insert are O(1), whereas delete-min is O(lg
N).

This would improve performance from O(KN) to O(K log N). If the number of files
and number of lines per file grew at the same rate, this is equivalent to going
from O(N^2) to O(N log N).
