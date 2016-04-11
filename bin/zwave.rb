#!/usr/bin/env ruby

require 'shellwords'

command = ARGV.join(" ")

`/usr/bin/redis-cli publish MyZWave #{Shellwords.shellescape(command)}`
