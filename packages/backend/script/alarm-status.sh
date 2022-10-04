#!/bin/bash
# Prerequisites:
set -eou pipefail;

sdate="$(date +%s)"

apiUrlURL=$API_URL
availableDiff=$AVAILABLE_DIFF

echoerr() { printf "%s\n" "$*" >&2; }

printf '[%s] Started processing status\n' "$(date +%d-%m-%Y:%H:%M:%S)"
currentDiff=$(curl -s -H "Content-Type:application/json"\
  $apiUrlURL\
  | jq '.diff')
printf '[%s] Current diff: %s \n' "$(date +%d-%m-%Y:%H:%M:%S)" "$currentDiff"
printf '[%s] Available diff: %s \n' "$(date +%d-%m-%Y:%H:%M:%S)" "$availableDiff"

if (( $(bc <<<"$currentDiff > $availableDiff") )); then
    err=$(printf '[%s] Diff too high' "$(date +%d-%m-%Y:%H:%M:%S)")
    echoerr $err
fi
