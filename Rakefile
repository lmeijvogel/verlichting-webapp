Rake.application.options.trace_rules = true

require 'rake/clean'
require 'erb'

require './static_files_uploader.rb'

CLEAN.include(%w[tmp/**/* work/**/* dist/**/*])

desc "Build the development version"
task :default => :work

desc "Build the development version"
task :work => %w[css_work image_work work/index.html work/javascripts/my_zwave.js work/javascripts/bootstrap.min.js]

desc "Build the production version"
task :dist => %w[fingerprinted_css image_dist fingerprinted_js dist/index.html]

# TODO: This clears the work directory as well
task :deploy => %w[clean dist] do
  StaticFilesUploader.new('./deploy.yml').call
end

JS_SOURCE_FILES = FileList['source/javascripts/my_zwave/*']
CSS_SOURCE_FILES = FileList["source/stylesheets/*.css"]
IMAGE_SOURCE_FILES = FileList["source/images/*"]

MY_ZWAVE_JS_TMP = "tmp/javascripts/my_zwave.js"

directory "work/javascripts"
directory "work/stylesheets"
directory "work/images"
directory "dist/images"
directory "dist/stylesheets"
directory "dist/javascripts"
directory "tmp/javascripts"

file MY_ZWAVE_JS_TMP => [JS_SOURCE_FILES, "tmp/javascripts"].flatten do |task|
  `browserify source/javascripts/my_zwave/start.js -o #{task.name}`
end

# For the fingerprinted files, no rule can be written since the
# filename is only known when it is run and a hash is calculated
task :fingerprinted_js => %w[fingerprinted_myzwave_js fingerprinted_bootstrap_js]

task :fingerprinted_myzwave_js => ["tmp/javascripts/my_zwave.min.js", "dist/javascripts"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/javascripts")
end

task :fingerprinted_bootstrap_js => ["source/javascripts/bootstrap.min.js", "dist/javascripts"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/javascripts")
end

task :fingerprinted_css => %w[fingerprinted_bootstrap_css fingerprinted_normalize_css fingerprinted_all_css]

task :fingerprinted_bootstrap_css => ["source/stylesheets/bootstrap.min.css", "dist/stylesheets"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/stylesheets")
end

task :fingerprinted_normalize_css => ["source/stylesheets/normalize.css", "dist/stylesheets"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/stylesheets")
end

task :fingerprinted_all_css => ["source/stylesheets/all.css", "dist/stylesheets"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/stylesheets")
end

file "work/javascripts/my_zwave.js" => [MY_ZWAVE_JS_TMP, "work/javascripts"] do |task|
  cp task.source, task.name
end

file "tmp/javascripts/my_zwave.min.js" => MY_ZWAVE_JS_TMP do |task|
  `uglifyjs #{task.source} --screw-ie8 --mangle --wrap --output #{task.name}`
end

CSS_SOURCE_FILES.each do |source|
  name = source.pathmap("%{^source/,work/}p")
  dest_dir = name.pathmap("%d")

  file name => [source, dest_dir] do |task|
    cp task.source, task.name
  end
end

file "work/javascripts/bootstrap.min.js" => ["source/javascripts/bootstrap.min.js", "work/javascripts"] do |task|
  cp task.source, task.name
end

%w[work dist].each do |build_target|
  file "#{build_target}/images/*" => ["source/images/*", "#{build_target}/images"] do |task|
    cp task.source, task.name
  end

  IMAGE_SOURCE_FILES.each do |source|
    name = source.pathmap("%{^source/,#{build_target}/}p")
    dest_dir = name.pathmap("%d")

    file name => [source, dest_dir] do |task|
      cp task.source, task.name
    end
  end
end

task "css_work" => CSS_SOURCE_FILES.pathmap("%{source,work}p")

task "image_work" => IMAGE_SOURCE_FILES.pathmap("%{source,work}p")
task "image_dist" => IMAGE_SOURCE_FILES.pathmap("%{source,dist}p")

file "work/index.html" => "source/index.html.erb" do |task|
  write_index(output_path: "work", is_production: false)
end

file "dist/index.html" => "source/index.html.erb" do |task|
  write_index(output_path: "dist", is_production: true)
end

def write_index(output_path:, is_production:)
  puts "Writing index.html"
  File.open("source/index.html.erb", "r") do |erb|
    File.open("#{output_path}/index.html", "w") do |output|
      template = ERB.new(erb.read)

      output.write(template.result(binding))
    end
  end
end

def fingerprinted_file(path)
  source_fingerprint = Digest::SHA256.hexdigest(File.read(path))

  path.pathmap("%n-#{source_fingerprint}%x")
end

def copy_fingerprinted_file(source, to:)
  dest = File.join(to, fingerprinted_file(source))
  cp source, dest unless File.exists?(dest)
end
