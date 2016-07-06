require 'redis'
require 'bcrypt'
require File.join(File.dirname(__FILE__), 'at_queue')
require 'json'
require 'sinatra/reloader'

class MyZWave < Sinatra::Base
  configure do
    secure = ENV['SECURE'] == "true"
    secret = ENV['SESSION_SECRET']
    # Storing login information in cookies is good enough for our purposes
    one_year = 60*60*24*365
    use Rack::Session::Cookie, :expire_after => one_year, :secret => secret, :secure => secure, :httponly => true

    register Sinatra::Reloader if development?
  end

  before do
    check_login_or_redirect unless request.path.include?("login")
  end

  get '/light/:name/level/:level' do
    recipient_count = redis.publish( "MyZWave", "dim #{params[:name]} #{params[:level]}" )

    "Recipients: #{recipient_count}"
  end

  post '/programme/:name/start' do
    sanitized_name = params[:name].match(/[a-z_]+/)[0]
    recipient_count = redis.publish( "MyZWave", "programme #{sanitized_name}" )

    if recipient_count > 0
      "OK: #{recipient_count} recipients"
    else
      status 503
      "No listening services"
    end
  end

  get '/available_programmes' do
    result = {availableProgrammes: redis.hgetall('zwave_available_programmes')}

    result.to_json
  end

  get '/current_programme' do
    result = {programme: redis.get('zwave_programme')}

    result.to_json
  end

  get '/current_lights' do
    keys = redis.keys("node_*")

    light_values = keys.inject({}) do |acc, key|
      value_37 = redis.hget(key, "class_37")
      value_38 = redis.hget(key, "class_38")

      if value_37.nil?
        acc[key] = {type: "dim", value: value_38}
      else
        acc[key] = {type: "switch", value: value_37}
      end

      acc
    end

    {lights: light_values}.to_json
  end

  get '/vacation_mode' do
    result = redis.hgetall("zwave_vacation_mode")

    result.to_json
  end

  post '/vacation_mode' do
    time_regex = %r[\d\d:\d\d]
    state = params.fetch("state")

    if state == 'on'
      start_time = params.fetch("start_time")
      end_time   = params.fetch("end_time")

      unless time_regex.match(start_time) && time_regex.match(end_time)
        status 400
        return "Invalid start or end time"
      end

      recipient_count = redis.publish( "MyZWave", "vacationMode on start:#{start_time} end:#{end_time}" )
    else
      recipient_count = redis.publish( "MyZWave", "vacationMode off" )
    end

    if recipient_count > 0
      "OK: #{recipient_count} recipients"
    else
      status 503
      "No listening services"
    end
  end

  get '/latest_events' do
    redis.lrange("zwave_recent_events", 0, -1).to_json
  end

  post '/scheduled_tasks/new' do
    sanitized_name = params[:name].match(/[a-z]+/)[0]

    datetime = DateTime.parse(params[:datetime])

    job = AtQueue.new.add(datetime, "ruby #{ENV['ZWAVE_COMMAND_EXECUTABLE_PATH']} programme #{sanitized_name}")
    job.to_json
  end

  get '/scheduled_tasks/list' do
    AtQueue.new.jobs_for(/zwave.rb (.*)/).to_json
  end

  post '/schedule/:id/destroy' do
    id = Integer(params[:id])

    AtQueue.new.destroy(id)

    "OK"
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
    if session.has_key?(:username)
      redis_key = "password_#{session[:username]}"
      user_exists = redis.exists(redis_key)

      if user_exists
        pass
      else
        session.clear
        halt 401, "Please login"
      end
    elsif request_has_valid_auth_token?
      pass
    else
      session.clear
      halt 401, "Please login"
    end
  end

  def request_has_valid_auth_token?
    provided_key = request.env["HTTP_AUTHORIZATION"]

    return false if provided_key.nil?

    auth_key_is_safe = contains_only_hex?(provided_key)

    return false unless auth_key_is_safe

    return redis.exists("auth_key_#{provided_key}")
  end

  def contains_only_hex?(key)
    key.downcase =~ %r|\A[0-9a-f]+\z|
  end
end
