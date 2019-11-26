#!/bin/bash
rm -rf invest.png
nave use 10 node index.js
curl https://slack.com/api/files.upload -F token="$SLACK_TOKEN" -F channels="CM68098CQ" -F title="Today's Investment" -F filename="invest.png" -F file=@"./invest.png"
