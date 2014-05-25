require 'sinatra'

require_relative 'my_zwave'

configure do
  set :public_folder, File.dirname(__FILE__) + "/build"
end

get "/" do
  redirect to "/index.html"
end

map "/my_zwave" do
  run MyZWave
end

run Sinatra::Application
