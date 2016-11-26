grep "{'timestamp" runlog*.log | grep DONE | cut -d" " -f 6,7 | cut -d":" -f2-10 | sed 's/ //g' | sed 's/[A-Za-z:]//g' | sed 's/,$//g' > data.csv
sed -i '' $'1i\\\nexiting,polite,asshole,time\n' data.csv
