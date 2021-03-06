require 'redis'
require 'bcrypt'
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

    result = programmes.inject({}) do |acc, programme|
      acc[programme['name']] = programme["displayName"]
      acc
    end

    {availableProgrammes: result}.to_json
  end

  get '/current_programme' do
    rest_interface.get('/programmes/current').body
  end

  get '/main_switch' do
    response = rest_interface.get('/main_switch/enabled')

    response.body
  end

  post '/main_switch/:state' do
    unless %[true false].include?(params[:state])
      status 400
      {error: "Invalid switch state"}.to_json
      return
    end

    state = params[:state] == 'true' ? 'on' : 'off'
    response = rest_interface.post("/main_switch/enabled/#{state}")

    if response.success?
      { state: params[:state] == 'true' }.to_json
    else
      status 400
      {error: "Could not change main switch state"}
    end
  end

  get '/current_lights' do
    api_result = JSON.parse(rest_interface.get('/nodes').body)

    light_values = api_result["lights"].map do |name, data|
      result = {
        node_id: data["id"],
        name: name,
        display_name: data["displayName"]
      }

      extra_data = if data.dig("values", "37")
                     value = data["values"]["37"]["value"]

                     {activation_type: "switch", state: value == "true"}
                   elsif data.dig("values", "38")
                     value = data["values"]["38"]["value"]

                     {activation_type: "dim", value: value.to_i}
                   else
                     {}
                   end

      result.merge(extra_data)
    end

    {lights: light_values}.to_json
  end

  get '/vacation_mode' do
    response = JSON.parse(rest_interface.get('/vacation_mode').body)

    if response["state"]
      {
        state: "on",
        start_time: response["meanStartTime"],
        end_time: response["meanEndTime"]
      }
    else
      {
        state: "off"
      }
    end.to_json
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

      uri = "/vacation_mode/on/#{start_time}/#{end_time}"
    else
      uri = "/vacation_mode/off"
    end

    response = rest_interface.post(uri)

    if response.success?
      payload.to_json
    else
      status 500
      return {error: "Error sending request to ZWave"}
    end
  end

  get '/latest_events' do
    redis.lrange("zwave_recent_events", 0, -1).map do |line|
      JSON.parse(line)
    end.to_json
  end

  post '/heal_network' do
    uri = '/debug/heal_network'

    response = rest_interface.post(uri)

    if response.success?
      {state: 'command sent'}.to_json
    else
      status 500
      return {error: "Error sending request to ZWave"}
    end
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
    user, authorization_key = authentication_from_request

    redis_auth_key = "auth_key_#{user}"

    return false unless user && authorization_key

    unless contains_only_alpha?(user)
      puts "WARNING: Authentication failure: Username contains non-alpha chars."
      return false
    end

    stored_key = redis.get(redis_auth_key)

    unless stored_key
      puts "WARNING: Authentication failure: User does not exist in Redis: #{user}"

      return false
    end

    key_matches = BCrypt::Password.new(stored_key) == authorization_key

    if key_matches
      puts "Authentication key matches stored key"
    else
      puts "WARNING: Authentication failure: Authentication key does not match stored key!"
    end

    key_matches
  rescue BCrypt::Errors::InvalidHash
    puts "ERROR: Invalid hash stored in Redis for user #{user}: #{stored_key.inspect}"

    false
  end

  def authentication_from_request
    # First try params (necessary for the Tasker automation
    if params.has_key?("user") && params.has_key?("authorization_key")
      puts "Authentication data found in request params"
      return params.values_at("user", "authorization_key")
    end

    # Then try HTTP basic authentication
    if request.env.has_key?("HTTP_AUTHORIZATION")
      auth_string = request.env["HTTP_AUTHORIZATION"]

      if (match = auth_string.match(/^Basic (.*)$/))
        base64 = match[1]

        user, authorization_key = Base64.decode64(base64).strip.split(":")

        puts "Authentication data found in request header HTTP_AUTHORIZATION"

        return [user, authorization_key]
      end
    end

    puts "No authentication token found in request"

    return nil
  end

  def contains_only_alpha?(key)
    key.downcase =~ %r|\A[a-z]+\z|
  end

  def rest_interface
    @@rest_interface ||= RestInterface.new
  end
end
