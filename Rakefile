Rake.application.options.trace_rules = true

require 'rake/clean'
require 'erb'

require './static_files_uploader.rb'

CLEAN.include(%w[tmp/**/* work/**/* dist/**/*])

desc "Build the development version"
task :default => :work

desc "Build the development version"
task :work => %w[css_work work/index.html work/javascripts/vue.js work/javascripts/material.min.js work/javascripts/my_zwave.js]

desc "Build the production version"
task :dist => %w[fingerprinted_js fingerprinted_css dist/index.html]

# TODO: This clears the work directory as well
desc "Build the production version and deploy to the server."
task :deploy => %w[clean dist] do
  StaticFilesUploader.new('./deploy.yml').call
end

JS_SOURCE_FILES = FileList['source/javascripts/my_zwave/*']
CSS_SOURCE_FILES = FileList["source/stylesheets/*.css"]

VUE_JS_TMP = "tmp/javascripts/vue.js"
MY_ZWAVE_JS_TMP = "tmp/javascripts/my_zwave.js"
MATERIAL_JS_TMP = "tmp/javascripts/material.js"

directory "work/javascripts"
directory "work/stylesheets"
directory "dist/stylesheets"
directory "dist/javascripts"
directory "tmp/javascripts"

file MY_ZWAVE_JS_TMP => [JS_SOURCE_FILES, "tmp/javascripts"].flatten do |task|
  `node_modules/.bin/webpack source/javascripts/my_zwave/start.js #{task.name}`
end

file VUE_JS_TMP => ["source/javascripts/vue.js", "tmp/javascripts"].flatten do |task|
  cp task.source, task.name
end

file MATERIAL_JS_TMP => ["source/javascripts/material.min.js", "tmp/javascripts"].flatten do |task|
  cp task.source, task.name
end
# For the fingerprinted files, no rule can be written since the
# filename is only known when it is run and a hash is calculated
task :fingerprinted_js => %w[fingerprinted_vue_min_js fingerprinted_myzwave_js fingerprinted_material_js]

task :fingerprinted_vue_min_js => ["source/javascripts/vue.min.js", "dist/javascripts"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/javascripts")
end

task :fingerprinted_myzwave_js => ["tmp/javascripts/my_zwave.min.js", "dist/javascripts"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/javascripts")
end

task :fingerprinted_material_js => ["tmp/javascripts/material.min.js", "dist/javascripts"] do |task|
  copy_fingerprinted_file(task.source, to: "dist/javascripts")
end

task :fingerprinted_css => ["source/stylesheets/all.css", "source/stylesheets/material.indigo-pink.min.css", "dist/stylesheets"] do |task|
  task.sources[0..-2].each do |source|
    copy_fingerprinted_file(source, to: "dist/stylesheets")
  end
end

file "work/javascripts/my_zwave.js" => [MY_ZWAVE_JS_TMP, "work/javascripts"] do |task|
  cp task.source, task.name
end

file "work/javascripts/material.min.js" => ["source/javascripts/material.min.js", "work/javascripts"] do |task|
  cp task.source, task.name
end

file "work/javascripts/vue.js" => ["source/javascripts/vue.js", "work/javascripts"] do |task|
  cp task.source, task.name
end

file "tmp/javascripts/my_zwave.min.js" => MY_ZWAVE_JS_TMP do |task|
  `node_modules/uglify-js/bin/uglifyjs #{task.source} --screw-ie8 --mangle --wrap --output #{task.name}`
end

file "tmp/javascripts/material.min.js" => ["source/javascripts/material.min.js", "tmp/javascripts"] do |task|
  cp task.source, task.name
end

CSS_SOURCE_FILES.each do |source|
  name = source.pathmap("%{^source/,work/}p")
  dest_dir = name.pathmap("%d")

  file name => [source, dest_dir] do |task|
    cp task.source, task.name
  end
end

task "css_work" => CSS_SOURCE_FILES.pathmap("%{source,work}p")

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
