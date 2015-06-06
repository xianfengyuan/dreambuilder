#!/usr/bin/perl -w
# Need to explicitly load the functions in POSIX
use POSIX 'strftime';
use File::Copy;
use File::Basename;

# file name of the file you want to split

if (scalar@ARGV < 1) {
  print "$0 dbfilename\n";
  exit 0;
}
    
$filename = $ARGV[0];
$base = '/mnt/' . basename($filename);

# Note that if you pass no argument to localtime, it assumes the current time
$time = strftime '%Y-%m-%d %H:%M:%S', localtime;
$count = 0;
$filecount = 0;
# filename for original file
# syntax for the first file name - the header file - and it will be named with 00
# if you have more than 100 files, you could modify this statement to place a leading
# zero if the file is greater than 10 but less than 100
if ($filecount < 10)
{
     $header_filename = $base . "_0" . $filecount . ".sql";
}
print "$time - Creating file $header_filename\n";
open(OUTPUT, ">$header_filename") || die "Can't redirect stdout";
open(LINE ,"$filename") || die ("\nERROR - could not open file: $filename\n");
while (<LINE>)
{
if ($_ =~ "^-- Current Database: " && $count > 1)
{
               if ($count eq 1)
               
               {
                    print "Closing header file.\n";
                    close (OUTPUT);
               }
                    # close the old file
                    close(OUTPUT);
                    $filecount++;
                    # syntax for new file names
                    if ($filecount < 10)
                    
                    {
                         $new_filename = $base . "_0" . $filecount . ".sql";
                    }
                    
                    else
                    
                    {
                     $new_filename = $base . "_" . $filecount . ".sql";
                    }
                    
                    $time = strftime '%Y-%m-%d %H:%M:%S', localtime;
                    print "$time - Creating file $new_filename\n";
                    # copy the header file to the next new file, so the header info is in the file
                    copy("$header_filename","$new_filename") or die "Copy failed: $!";
                    open(OUTPUT, ">>$new_filename") || die "Can't redirect stdout";
                    print OUTPUT $_;
}
else
{
          # print information into the header file
                    print OUTPUT $_;
}
$count++;
# end while
}
close (LINE);
close (OUTPUT);
