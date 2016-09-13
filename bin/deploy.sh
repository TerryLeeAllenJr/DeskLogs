#!/usr/bin/env bash

cd ~/Projects/DeskLogs/client/;
grunt build --force;cd ../;
grunt deploy;