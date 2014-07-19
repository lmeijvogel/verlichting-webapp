require 'rspec'

require_relative "../../current_timezone_converter.rb"
require 'date'

class DateTime
  include CurrentTimeZoneConverter
end

describe CurrentTimeZoneConverter do
  describe :in_current_timezone do
    context "when the subject is already in the current timezone" do
      let(:datetime) { DateTime.now }

      it "returns the same time" do
        result = datetime.in_current_timezone
        expect(result).to eq(datetime)
      end

      it "returns a DateTime in the same timezone" do
        result = datetime.in_current_timezone.to_time.utc_offset
        expected = datetime.to_time.utc_offset

        expect(result).to eq expected
      end
    end

    context "when the subject is in a different timezone" do
      let(:datetime) { DateTime.new(2014, 07, 18, 15, 20, 0, "+7") }
      let(:expected) { DateTime.new(2014, 07, 18, 10, 20, 0, "+2") }

      it "returns an equivalent DateTime" do
        result = datetime.in_current_timezone

        expect(result).to eq expected
      end

       it "has the current timezone" do
         result = datetime.in_current_timezone
         expect(result.to_time.utc_offset).to eq(7200)
       end
    end
  end
end
