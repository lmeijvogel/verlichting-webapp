require 'httparty'

class RestInterface
  include HTTParty
  base_uri "#{ENV.fetch('UPSTREAM_SERVER_HOST')}:#{ENV.fetch('UPSTREAM_SERVER_PORT')}"

  def initialize
    self.live = true
  end

  def get(*args)
    self.class.get(*args)
  end

  def post(*args)
    return FakeResponse.new unless live?

    self.class.post(*args)
  end

  def live?
    @live
  end

  def live=(value)
    @live = value
  end

  class FakeResponse
    def success?
      true
    end
  end
end
