#!/usr/bin/env ruby
require 'highline'
require 'redis'
require 'bcrypt'
require 'securerandom'

cli = HighLine.new

user = cli.ask("Username?")

unless user =~ /\A[A-Za-z0-9]*\z/
  puts "Username can only contain letters and digits"
  exit 1
end

auth_key = SecureRandom.hex

puts <<~SUCCESS_MESSAGE
  Adding user '#{user}'
  Authorization_key: #{auth_key}

  It can be included in a request in two ways:
  - As request params:
    For GET requests: https://<location>?user=#{user}&authorization_key=#{auth_key} (Not recommended)
    For POST requests: Add `user=#{user}\\nauthorization_key=#{auth_key}` as data in the request body.
  - As HTTP Basic header (recommended):
    `curl --user #{user}:#{auth_key} https://<location>`
    `curl -H "Authorization: Basic $(echo #{user}:#{auth_key} | base64 -)"  https://<location>`

  Please only send it over the wire for https requests

  SUCCESS_MESSAGE

begin
  hashed_key = BCrypt::Password.create(auth_key)
  Redis.new.set("auth_key_#{user}", hashed_key)
end
