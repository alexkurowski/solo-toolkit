require 'json'

manifest = JSON.parse File.read 'manifest.json'

current_version = manifest['version']

sub_versions = current_version.split '.'
sub_versions.push sub_versions.pop.to_i + 1
new_version = sub_versions.join '.'

File.write 'manifest.json',
  File.read('manifest.json')
      .sub("\"version\": \"#{current_version}\"", "\"version\": \"#{new_version}\"")

File.write 'package.json',
  File.read('package.json')
      .sub("\"version\": \"#{current_version}\"", "\"version\": \"#{new_version}\"")

puts "#{current_version} -> #{new_version}"
