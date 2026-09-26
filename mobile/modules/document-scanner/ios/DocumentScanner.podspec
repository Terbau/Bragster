Pod::Spec.new do |s|
  s.name           = 'DocumentScanner'
  s.version        = '1.0.0'
  s.summary        = 'Document scanning and receipt image processing for Bragster'
  s.description    = 'Wraps the VisionKit document camera and uses Vision and Core Image to crop and enhance scanned receipts.'
  s.author         = ''
  s.homepage       = 'https://bragster.vercel.app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'VisionKit', 'Vision', 'CoreImage'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,swift}"
end
