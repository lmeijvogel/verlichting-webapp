require 'redis'
require 'bcrypt'
require File.join(File.dirname(__FILE__), 'at_queue')
require 'json'
require 'sinatra/reloader'
require_relative 'rest_interface'

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

  get '/live' do
    {
      state: rest_interface.live?
    }.to_json
  end

  post '/live/:state' do
    rest_interface.live = params[:state].to_s == 'true'

    {
      state: rest_interface.live?
    }.to_json
  end

  post '/light/:node_id/level/:level' do
    node_id = Integer(params[:node_id])
    level = Integer(params[:level])

    response = rest_interface.post("/nodes/#{node_id}/dim/#{level}")

    if response.success?
      {
        success: true,
        level: level
      }.to_json
    else
      status 503
      {
        success: false
      }.to_json
    end
  end

  post '/light/:node_id/switch/:state' do
    raise "Invalid state" unless %w[on off].include?(params[:state])

    node_id = Integer(params[:node_id])
    state = params[:state]

    response = rest_interface.post("/nodes/#{node_id}/switch/#{state}")

    if response.success?
      {
        success: true,
        state: params[:state] == "on"
      }.to_json
    else
      status 503
      {
        success: false
      }.to_json
    end
  end

  post '/programme/:name/start' do
    sanitized_name = params[:name].match(/[a-z_]+/)[0]
    result = rest_interface.post("/programmes/#{sanitized_name}/start")

    if result.success?
      {
        success: true,
        programme: sanitized_name
      }.to_json
    else
      status 503
      {
        success: false
      }.to_json
    end
  end

  get '/available_programmes' do
    programmes = JSON.parse(rest_interface.get('/programmes').body)["programmes"]

    result = programmes.inject({}) do |acc, (name, data)|
      acc[name] = data["displayName"]
      acc
    end

    {availableProgrammes: result}.to_json
  end

  get '/current_programme' do
    rest_interface.get('/programmes/current').body
  end

  get '/main_switch' do
    state = redis.get('zwave_switch_enabled') == "true"

    result = {state: state}

    result.to_json
  end

  post '/main_switch/:state' do
    unless %[true false].include?(params[:state])
      status 400
      {error: "Invalid switch state"}.to_json
      return
    end

    turnOn = params[:state] == "true"
    command = turnOn ? "enableSwitch" : "disableSwitch"

    recipient_count = publish( "MyZWave", "#{command}" )

    {state: turnOn, recipient_count: recipient_count}.to_json
  end

  get '/current_lights' do
    api_result = JSON.parse(rest_interface.get('/nodes').body)

    light_values = api_result["lights"].map do |name, data|
      result = {
        node_id: data["id"],
        name: name,
        display_name: data["displayName"]
      }

      extra_data = if data["values"].key?("37")
                 value = data["values"]["37"]["value"]

                 {activation_type: "switch", state: value == "true"}
               elsif data["values"].key?("38")
                 value = data["values"]["38"]["value"]

                 {activation_type: "dim", value: value.to_i}
               end

      result.merge(extra_data)
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

      recipient_count = publish( "MyZWave", "vacationMode on start:#{start_time} end:#{end_time}" )
    else
      recipient_count = publish( "MyZWave", "vacationMode off" )
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

  def publish(*args)
    if @@live
      redis.publish(*args)
    else
      99
    end
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

  def rest_interface
    @@rest_interface ||= RestInterface.new
  end
end
