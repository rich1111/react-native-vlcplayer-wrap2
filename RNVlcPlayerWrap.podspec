require 'json'
version = JSON.parse(File.read('package.json'))["version"]

Pod::Spec.new do |s|

  s.name           = "RNVlcPlayerWrap"
  s.version        = '1.0.0'
  s.summary        = "VLCPlayer supports various formats (mp4, m3u8, flv, mov, rtsp, rtmp, etc.)."
  s.homepage       = "https://github.com/rich1111/react-native-vlcplayer-wrap2"
  s.license        = "MIT"
  s.author         = { "Rich111 Chen" => "rich111.chen@gmail.com" }
  s.platforms      = { :ios => "9.0", :tvos => "9.2" }
  s.source         = { :git => "https://github.com/rich1111/react-native-vlcplayer-wrap2.git", :tag => "v#{s.version}" }
  s.source_files   = 'ios/RCTVLCPlayer/**/*.{h,m}'
  #s.resources      = "Fonts/*.ttf"
  s.preserve_paths = "**/*.js"
  s.dependency 'React'

end
