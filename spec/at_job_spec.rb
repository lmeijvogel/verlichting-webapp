require 'rspec'
require 'json'
require 'date'
require_relative '../at_job.rb'

describe AtJob do
  describe :to_json do
    subject(:job) { AtJob.new(id, date, job_name) }

    let(:id) { 123 }
    let(:date) { DateTime.now }
    let(:job_name) { "the job" }

    it "correctly encodes the job data" do
      expect(job.to_json).to eq %Q|{"id":#{id},"date":"#{date}","job":"#{job_name}"}|
    end
  end
end
