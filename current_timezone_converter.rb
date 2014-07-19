module CurrentTimeZoneConverter
  def in_current_timezone
    self.new_offset(timezone_offset_in_days)
  end

  def with_current_timezone_offset
    difference_in_offsets = timezone_offset_in_days - self.offset

    self.new_offset(timezone_offset_in_days) - difference_in_offsets
  end

  private
  def timezone_offset_in_days
    DateTime.now.offset
  end
end
