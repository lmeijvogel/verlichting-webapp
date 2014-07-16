require 'redis'
require 'bcrypt'
require File.join(File.dirname(__FILE__), 'at_queue')
require 'json'

class MyZWave < Sinatra::Base
  configure do
    # Storing login information in cookies is good enough for our purposes
    one_year = 60*60*24*365
    secret = File.read('session_secret.txt')
    use Rack::Session::Cookie, :expire_after => one_year, :secret => secret
  end

  before do
    check_login_or_redirect unless request.path.include?("login")
  end

  get '/light/:name/level/:level' do
    recipient_count = redis.publish( "MyZWave", "dim #{params[:name]} #{params[:level]}" )

    "Recipients: #{recipient_count}"
  end

  post '/programme/:name/start' do
    sanitized_name = params[:name].match(/[a-z]+/)[0]
    recipient_count = redis.publish( "MyZWave", "programme #{sanitized_name}" )

    if recipient_count > 0
      "OK: #{recipient_count} recipients"
    else
      status 503
      "No listening services"
    end
  end

  put '/scheduled_tasks' do
    sanitized_name = params[:name].match(/[a-z]+/)[0]

    datetime = DateTime.parse(params[:datetime])

    job = AtQueue.new.add(datetime, "ruby /home/lennaert/my-zwave/bin/zwave.rb programme #{sanitized_name}")
    job.to_json
  end

  get '/scheduled_tasks/list' do
    output = ""

    entries = AtQueue.new.jobs_for(/zwave.rb (.*)/) do |id, entry|
      output << "#{id}: #{entry}\n"
    end

    entries.to_json
  end

  post "/login/create" do
    username = params["username"].gsub(/[^a-zA-Z_]/, "")
    password = params["password"]

    stored_password_hash = redis.get("password_#{username}")

    begin
      password_valid = BCrypt::Password.new(stored_password_hash) == password
      if password_valid
        session.clear
        session[:username] = username

        "OK"
      else
        status 401
        "Invalid username or password"
      end
    rescue BCrypt::Errors::InvalidHash
      status 401
      "Invalid username or password"
    end
  end

  def redis
    @@redis ||= Redis.new
  end

  def check_login_or_redirect
    if session[:username].nil?
      halt 401, "Please login"
    else
      pass
    end
  end
end
