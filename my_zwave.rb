require 'redis'
require 'bcrypt'
require File.join(File.dirname(__FILE__), 'at_queue')
require 'json'
require 'sinatra/reloader'

class MyZWave < Sinatra::Base
  configure do
    secure = ENV['SECURE'] == "true"
    secret = ENV.fetch('SESSION_SECRET')
    raise "No session secret set!" if secret.nil? || secret.strip.empty?
    # Storing login information in cookies is good enough for our purposes
    one_year = 60*60*24*365
    use Rack::Session::Cookie, :expire_after => one_year, :secret => secret, :secure => secure, :httponly => true

    register Sinatra::Reloader if development?
  end

  before do
    check_login_or_redirect unless request.path =~ %r[^#{request.script_name}/login]
  end

  post '/light/:node_id/level/:level' do
    level = Integer(params[:level])
    recipient_count = redis.publish("MyZWave", "set #{params[:node_id]} #{level}")

    if recipient_count > 0
      {
        success: true,
        level: level,
        recipients: recipient_count
      }.to_json
    else
      status 503
      {
        success: false,
        recipients: recipient_count
      }.to_json
    end
  end

  post '/light/:node_id/switch/:state' do
    raise "Invalid state" unless %w[on off].include?(params[:state])

    recipient_count = redis.publish("MyZWave", "set #{params[:node_id]} #{params[:state]}")

    if recipient_count > 0
      {
        success: true,
        state: params[:state] == "on",
        recipients: recipient_count
      }.to_json
    else
      status 503
      {
        success: false,
        recipients: recipient_count
      }.to_json
    end
  end

  post '/programme/:name/start' do
    sanitized_name = params[:name].match(/[a-z_]+/)[0]
    recipient_count = redis.publish( "MyZWave", "programme #{sanitized_name}" )

    if recipient_count > 0
      {
        success: true,
        programme: sanitized_name,
        recipients: recipient_count
      }.to_json
    else
      status 503
      {
        success: false,
        recipients: recipient_count
      }.to_json
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

    light_values = keys.map do |key|
      node_id  = Integer(redis.hget(key, "node_id"))
      display_name = redis.hget(key, "display_name");
      value_37 = redis.hget(key, "class_37")
      value_38 = redis.hget(key, "class_38")

      result = {}
      if value_37.nil?
        result = {activation_type: "dim", value: value_38.to_i}
      else
        state = value_37 == "true"
        result = {activation_type: "switch", state: state}
      end

      result[:node_id] = node_id
      result[:display_name] = display_name;
      result[:name] = key.gsub(/node_/, '')

      result
    end

    {lights: light_values}.to_json
  end

  get '/vacation_mode' do
    result = redis.hgetall("zwave_vacation_mode")

    result.to_json
  end

  post '/vacation_mode' do
    time_regex = %r[\d\d:\d\d]

    payload = JSON.parse(request.body.read)
    state = payload.fetch("state")

    if state == 'on'
      start_time = payload.fetch("start_time")
      end_time   = payload.fetch("end_time")

      unless time_regex.match(start_time) && time_regex.match(end_time)
        status 400
        return "Invalid start or end time"
      end

      recipient_count = redis.publish( "MyZWave", "vacationMode on start:#{start_time} end:#{end_time}" )
    else
      recipient_count = redis.publish( "MyZWave", "vacationMode off" )
    end

    if recipient_count > 0
      payload.to_json
    else
      status 503
      "No listening services"
    end
  end

  get '/latest_events' do
    redis.lrange("zwave_recent_events", 0, -1).to_json
  end

  post '/disable_switch' do
    recipient_count = redis.publish("MyZWave", "disableSwitch")

    "Recipients: #{recipient_count}"
  end

  post '/enable_switch' do
    recipient_count = redis.publish("MyZWave", "enableSwitch")

    "Recipients: #{recipient_count}"
  end

  get '/switch_enabled' do
    redis.get("zwave_switch_enabled")
  end

  get "/login/show" do
    {
      loggedIn: session.has_key?(:username)
    }.to_json
  end

  post "/login/create" do
    data = JSON.parse(request.body.read)

    username = data["username"].gsub(/[^a-zA-Z_]/, "")

    if username != data["username"]
      status 401
      return "Invalid username or password"
    end

    password = data["password"]

    stored_password_hash = redis.get("password_#{username}")

    begin
      password_valid = BCrypt::Password.new(stored_password_hash) == password
      if password_valid
        session.clear
        session[:username] = username

        {
          loggedIn: session.has_key?(:username)
        }.to_json
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
    user = params["user"]
    authorization_key = params["authorization_key"]

    return false unless user && authorization_key
    return false unless contains_only_alpha?(user)

    stored_key = redis.get("auth_key_#{user}")

    return BCrypt::Password.new(stored_key) == authorization_key
  end

  def contains_only_alpha?(key)
    key.downcase =~ %r|\A[a-z]+\z|
  end
end
