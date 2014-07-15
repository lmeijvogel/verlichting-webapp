require 'open3'

require File.join(File.dirname(__FILE__), 'at_job.rb')

class AtQueue
  def add(datetime, job)
    job_id = at(datetime, job)

    AtJob.new(job_id, datetime, job)
  end

  def jobs_for(pattern)
    atq.lines.map do |job_line|
      tokenized_line = job_line.match(/^(\d+)\s+(.+) [a-z] [a-zA-Z]+$/)
      job_id = Integer(tokenized_line[1])
      date = DateTime.parse(tokenized_line[2])

      cli_output = at_c job_id
      value = parse(cli_output, pattern)

      AtJob.new(job_id, date, value) if value
    end.compact
  end

  private
  def parse(cli_output, pattern)
    matches = cli_output.match(pattern)
    matches[1] if matches
  end

  def at(datetime, job)
    utc_offset = Time.now.utc_offset
    formatted_time = (datetime + (Float(utc_offset)/86400)).strftime("%Y%m%d%H%M")
    command = "echo '#{job}' | at -t #{formatted_time}"

    Open4.popen3(command) do |_, _, stderr, _|
      # For some reason, 'at' writes to stderr
      output = stderr.read

      job_id_match = output.match(/^job ([0-9]+) at/)

      if job_id_match
        job_id_match[1]
      else
        raise output
      end
    end
  end

  def atq
    `atq`
  end

  def at_c(job_id)
    `at -c #{job_id}`
  end
end
