require 'fileutils'

group 'browserify' do
  guard 'shell' do
    watch %r[source/javascripts/.*.js] do |f|
      `browserify source/javascripts/my_zwave/start.js -o site/javascripts/my_zwave.js`
      puts "#{f[0]} has changed"
    end

    watch %r[source/stylesheets/.*.css] do |f|
      puts "#{f[0]} has changed"
      basename = File.basename(f[0])
      FileUtils.cp(f[0], "site/#{basename}")
    end

    watch %r[source/index.html] do |f|
      puts "#{f[0]} has changed"
      FileUtils.cp(f[0], "site/index.html")
    end
  end
end
