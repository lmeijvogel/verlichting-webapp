#!/usr/bin/env ruby
require 'highline'
require 'redis'
require 'bcrypt'

cli = HighLine.new

user = cli.ask("Username?")
pass = cli.ask("Password?") { |c| c.echo = false }

puts "Adding user '#{user}'"

begin
  hashed_password = BCrypt::Password.create(pass)

  Redis.new.set("password_#{user}", hashed_password)

  puts "... done"
end
