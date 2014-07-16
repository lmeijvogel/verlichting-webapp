require 'rubygems'
require 'sinatra'

disable :run

require File.dirname(__FILE__)+'/my_zwave'

FileUtils.mkdir_p 'log' unless File.exists?('log')
log = File.new("log/sinatra.log", "a")
$stdout.reopen(log)
$stderr.reopen(log)

# In a production environment, the build directory is served by nginx
unless ENV['RACK_ENV'] == "production"
  class Slash < Sinatra::Base
    configure do
      set :public_folder, File.dirname(__FILE__) + "/build"
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
