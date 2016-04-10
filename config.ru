require 'rubygems'
require 'sinatra'

require 'dotenv'
Dotenv.load

disable :run

require File.dirname(__FILE__)+'/my_zwave'

is_production_environment = ENV['RACK_ENV'] == "production"

# In a production environment, the build directory is served by nginx
if is_production_environment
  FileUtils.mkdir_p 'log' unless File.exists?('log')
  log = File.new("log/sinatra.log", "a")
  $stdout.reopen(log)
  $stderr.reopen(log)
else
  class Slash < Sinatra::Base
    configure do
      set :public_folder, File.dirname(__FILE__) + "/site"
    end

    get "/" do
      redirect to "/index.html"
    end
  end

  map '/' do
    run Slash
  end
end

map "/my_zwave" do
  run MyZWave
end
