#!/usr/bin/env ruby
require 'highline'
require 'redis'
require 'bcrypt'
require 'securerandom'

cli = HighLine.new

user = cli.ask("Username? (only used for description)")

auth_key = SecureRandom.hex

puts "Adding user '#{user}'"
puts "Authorization_key: #{auth_key}"
puts "Include it in an HTTP request in the Authorization header. (https only!)"

begin
  Redis.new.set("auth_key_#{auth_key}", user)
end
