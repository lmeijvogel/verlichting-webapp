require 'redis'

class MyZWave < Sinatra::Base
  get '/light/:name/level/:level' do
    recipient_count = redis.publish( "MyZWave", "dim #{params[:name]} #{params[:level]}" )

    "Recipients: #{recipient_count}"
  end

  post '/programme/:name/start' do
    sanitized_name = params[:name].match(/[a-z]+/)[0]
    recipient_count = redis.publish( "MyZWave", "programme #{sanitized_name}" )

    "Recipients: #{recipient_count}"
  end

  def redis
    @@redis ||= Redis.new
  end
end
