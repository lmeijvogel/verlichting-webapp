require 'rspec'
require File.join(File.dirname(__FILE__), '../at_queue.rb')

describe AtQueue do
  # job_1 and job_3 defined below
  context "when a zwave job is requested" do
    it "returns the programme and action" do
      expect(subject.send(:parse, job_1, /zwave.rb (.*)/)).to eq("le_programme start")
    end
  end

  context "when a non-zwave at job exists" do
    it "returns nil" do
      expect(subject.send(:parse, job_2, /zwave.rb (.*)/)).to be nil
    end
  end

  describe "add" do
    let(:datetime) { DateTime.now }
    let(:name) { "some_job" }

    before do
      subject.stub(:at).with(datetime, name).and_return(12)
    end

    it "returns the creatd job" do
      actual = subject.add(datetime, name)
      expected = AtJob.new(12, datetime, name)
      expect(actual).to eql(expected)
    end
  end

  describe "integration" do
    before do
      subject.stub(:atq).and_return(jobs)

      subject.stub(:at_c).with(25).and_return(job_1)
      subject.stub(:at_c).with(24).and_return(job_2)
    end

    it "returns the scheduled tasks" do
      actual = subject.jobs_for(/zwave.rb (.*)/)

      expect(actual).to eq [
        AtJob.new(25, DateTime.civil(2014, 7, 13, 20, 55, 0, "+2"), "le_programme start")
      ]
    end
  end

  let(:jobs) { <<-OUTPUT
25      Sun Jul 13 20:55:00 2014 a user
24      Sun Jul 13 20:35:00 2014 a user
  OUTPUT
  }
  let(:job_1) { <<-OUTPUT
#!/bin/sh
# atrun uid=1000 gid=1000
# mail user 0
umask 2
rvm_bin_path=/home/user/.rvm/bin; export rvm_bin_path
GEM_HOME=/home/user/.rvm/gems/ruby-2.1.1; export GEM_HOME
IRBRC=/home/user/.rvm/rubies/ruby-2.1.1/.irbrc; export IRBRC
SSH_TTY=/dev/pts/1; export SSH_TTY
rvm_stored_umask=0002; export rvm_stored_umask
USER=user; export USER
_system_type=Linux; export _system_type
rvm_path=/home/user/.rvm; export rvm_path
rvm_prefix=/home/user; export rvm_prefix
MAIL=/var/mail/user; export MAIL
rvm_loaded_flag=1; export rvm_loaded_flag
PWD=/home/user; export PWD
EDITOR=vim; export EDITOR
LANG=en_US.UTF-8; export LANG
_system_arch=i386; export _system_arch
_system_version=12.04; export _system_version
rvm_version=1.25.18\ \(master\); export rvm_version
SHLVL=1; export SHLVL
HOME=/home/user; export HOME
LANGUAGE=en_US:en; export LANGUAGE
LOGNAME=user; export LOGNAME
VISUAL=vim; export VISUAL
GEM_PATH=/home/user/.rvm/gems/ruby-2.1.1:/home/user/.rvm/gems/ruby-2.1.1@global; export GEM_PATH
rvm_user_install_flag=1; export rvm_user_install_flag
_system_name=Ubuntu; export _system_name
cd /home/user || {
         echo 'Execution directory inaccessible' >&2
         exit 1
}
/some/path/zwave.rb le_programme start

    OUTPUT
  }

  let(:job_2) { <<-OUTPUT
#!/bin/sh
# atrun uid=1000 gid=1000
# mail user 0
umask 2
rvm_bin_path=/home/user/.rvm/bin; export rvm_bin_path
GEM_HOME=/home/user/.rvm/gems/ruby-2.1.1; export GEM_HOME
IRBRC=/home/user/.rvm/rubies/ruby-2.1.1/.irbrc; export IRBRC
SSH_TTY=/dev/pts/1; export SSH_TTY
rvm_stored_umask=0002; export rvm_stored_umask
USER=user; export USER
_system_type=Linux; export _system_type
rvm_path=/home/user/.rvm; export rvm_path
rvm_prefix=/home/user; export rvm_prefix
MAIL=/var/mail/user; export MAIL
rvm_loaded_flag=1; export rvm_loaded_flag
PWD=/home/user; export PWD
EDITOR=vim; export EDITOR
LANG=en_US.UTF-8; export LANG
_system_arch=i386; export _system_arch
_system_version=12.04; export _system_version
rvm_version=1.25.18\ \(master\); export rvm_version
SHLVL=1; export SHLVL
HOME=/home/user; export HOME
LANGUAGE=en_US:en; export LANGUAGE
LOGNAME=user; export LOGNAME
VISUAL=vim; export VISUAL
GEM_PATH=/home/user/.rvm/gems/ruby-2.1.1:/home/user/.rvm/gems/ruby-2.1.1@global; export GEM_PATH
rvm_user_install_flag=1; export rvm_user_install_flag
_system_name=Ubuntu; export _system_name
cd /home/user || {
         echo 'Execution directory inaccessible' >&2
         exit 1
}
/some/path/program --args one,two

    OUTPUT
  }

end
