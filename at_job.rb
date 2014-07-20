class AtJob < Struct.new(:id, :date, :job)
  def to_json(*args)
    to_h.to_json(*args)
  end
end
