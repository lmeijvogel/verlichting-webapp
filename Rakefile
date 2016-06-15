Rake.application.options.trace_rules = true

require 'rake/clean'
require 'erb'

CLEAN.include(%w[tmp/**/* work/**/* dist/**/*])

task :default => :build
task :build => :work

task :work => %w[css_work image_work work/index.html work/javascripts/my_zwave.js work/javascripts/bootstrap.min.js]
task :dist => %w[css_dist image_dist dist/index.html dist/javascripts/my_zwave.min.js dist/javascripts/bootstrap.min.js]

JS_SOURCE_FILES = FileList['source/javascripts/my_zwave/*']
CSS_SOURCE_FILES = FileList["source/stylesheets/*.css"]
IMAGE_SOURCE_FILES = FileList["source/images/*"]

MY_ZWAVE_JS_TMP = "tmp/javascripts/my_zwave.js"

file MY_ZWAVE_JS_TMP => JS_SOURCE_FILES do |task|
  mkdir_p("tmp/javascripts")

  `browserify source/javascripts/my_zwave/start.js -o #{task.name}`
end

file "work/javascripts/my_zwave.js" => MY_ZWAVE_JS_TMP do |task|
  mkdir_p("work/javascripts")

  cp task.source, task.name
end

file "dist/javascripts/my_zwave.min.js" => MY_ZWAVE_JS_TMP do |task|
  mkdir_p("dist/javascripts")

  `uglifyjs #{task.source} --screw-ie8 --mangle --wrap --output #{task.name}`
end

%w[work dist].each do |build_target|
  CSS_SOURCE_FILES.each do |source|
    name = source.pathmap("%{^source/,#{build_target}/}p")
    file name => source do |task|
      mkdir_p(task.name.pathmap("%d"))

      cp task.source, task.name
    end
  end

  file "#{build_target}/javascripts/bootstrap.min.js" => "source/javascripts/bootstrap.min.js" do |task|
    mkdir_p("#{build_target}/javascripts")

    cp task.source, task.name
  end

  file "#{build_target}/images/*" => "source/javascripts/bootstrap.min.js" do |task|
    mkdir_p("#{build_target}/images")

    cp task.source, task.name
  end

  IMAGE_SOURCE_FILES.each do |source|
    name = source.pathmap("%{^source/,#{build_target}/}p")

    file name => source do |task|
      mkdir_p(task.name.pathmap("%d"))

      cp task.source, task.name
    end
  end
end

task "css_work" => CSS_SOURCE_FILES.pathmap("%{source,work}p")
task "css_dist" => CSS_SOURCE_FILES.pathmap("%{source,dist}p")

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
