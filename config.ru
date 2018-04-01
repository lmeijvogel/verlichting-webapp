require 'rubygems'
require 'sinatra'

require 'dotenv'
Dotenv.load

disable :run

require File.dirname(__FILE__)+'/my_zwave'

is_production_environment = ENV['RACK_ENV'] == "production"

# In a production environment, the build directory is served by nginx
unless is_production_environment
  class Slash < Sinatra::Base
    configure do
      set :public_folder, File.dirname(__FILE__) + "/work"
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
