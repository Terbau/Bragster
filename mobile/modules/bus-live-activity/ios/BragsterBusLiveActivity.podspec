Pod::Spec.new do |s|
  s.name           = 'BragsterBusLiveActivity'
  s.version        = '1.0.0'
  s.summary        = 'Shows a bus on its way to a stop on the Lock Screen'
  s.description    = 'Starts, updates and ends the bus Live Activity shown by the PadelLiveActivity widget extension.'
  s.author         = ''
  s.homepage       = 'https://bragster.vercel.app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # Live Activities need iOS 16.2, older versions still run the app
  s.weak_frameworks = 'ActivityKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,swift}"
end
