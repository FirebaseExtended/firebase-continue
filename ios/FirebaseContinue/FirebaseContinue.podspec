Pod::Spec.new do |s|
  s.name             = 'FirebaseContinue'
  s.version          = '0.1.0'
  s.summary          = 'Firebase Continue enables mobile developers to integrate activity transitioning from their mobile apps to the web.'

  s.description      = <<-DESC
Firebase Continue for iOS enables iOS developers to easily integrate activity transitioning
from their apps to the web by way of Chrome extensions.
                       DESC

  s.homepage         = 'https://github.com/firebase/firebase-continue'
  s.license          = { :type => 'Apache 2.0', :file => '../../LICENSE' }
  s.authors          = 'Google, Inc'
  s.source           = { :git => 'https://github.com/firebase/firebase-continue.git', :tag => s.version.to_s }

  s.ios.deployment_target = '8.0'

  s.source_files = 'FirebaseContinue/Classes/**/*'

  s.public_header_files = 'FirebaseContinue/Classes/**/*.h'

  s.dependency 'FirebaseCommunity/Auth'
  s.dependency 'FirebaseCommunity/Database'
end
