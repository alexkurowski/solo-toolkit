require 'json'

def sh(cmd)
  puts cmd
  puts `#{cmd}`
end

manifest = JSON.parse File.read 'manifest.json'
version = manifest['version']

sh "git tag -a #{version} -m \"#{version}\""
sh "git push origin #{version}"
