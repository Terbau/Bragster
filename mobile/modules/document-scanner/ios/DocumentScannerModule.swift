import CoreImage
import CoreImage.CIFilterBuiltins
import ExpoModulesCore
import UIKit
import Vision
import VisionKit

struct ProcessOptions: Record {
  /// "original" | "auto" | "grayscale" | "blackwhite"
  @Field var filter: String = "original"
  /// Detect the document in the image and crop/straighten it
  @Field var autoCrop: Bool = false
  /// Longest side of the output image in pixels
  @Field var maxDimension: Double = 3500
  /// The output JPEG is compressed/downscaled until it is below this size
  @Field var maxBytes: Int = 3_500_000
}

public class DocumentScannerModule: Module {
  private let ciContext = CIContext(options: [.useSoftwareRenderer: false])
  private var activeScan: DocumentScanSession?

  public func definition() -> ModuleDefinition {
    Name("DocumentScanner")

    Function("isAvailable") { () -> Bool in
      VNDocumentCameraViewController.isSupported
    }

    // Presents the VisionKit document camera. It finds the document in the
    // camera view, outlines it, captures it automatically once it is steady and
    // straightens it. Flash (auto/on/off) and filters can be changed in the
    // camera UI. Resolves with the scanned pages, or null if cancelled.
    AsyncFunction("scanAsync") { (promise: Promise) in
      guard VNDocumentCameraViewController.isSupported else {
        promise.reject(ScannerUnavailableException())
        return
      }
      guard self.activeScan == nil else {
        promise.reject(ScanInProgressException())
        return
      }
      guard let presenter = self.appContext?.utilities?.currentViewController() else {
        promise.reject(MissingViewControllerException())
        return
      }

      let outputDirectory: URL
      do {
        outputDirectory = try self.outputDirectory()
      } catch {
        promise.reject(ScanFailedException(error.localizedDescription))
        return
      }

      let session = DocumentScanSession(outputDirectory: outputDirectory) { [weak self] result in
        self?.activeScan = nil
        switch result {
        case .success(let uris):
          promise.resolve(["pages": uris])
        case .cancelled:
          promise.resolve(nil)
        case .failure(let error):
          promise.reject(ScanFailedException(error.localizedDescription))
        }
      }
      self.activeScan = session

      let controller = VNDocumentCameraViewController()
      controller.delegate = session
      controller.modalPresentationStyle = .fullScreen
      presenter.present(controller, animated: true)
    }.runOnQueue(.main)

    // Crops, enhances and compresses an image so it is ready to upload.
    AsyncFunction("processAsync") { (uri: String, options: ProcessOptions) throws -> [String: Any] in
      try self.process(uri: uri, options: options)
    }
  }

  // MARK: - Processing

  private func process(uri: String, options: ProcessOptions) throws -> [String: Any] {
    let url = URL(string: uri).flatMap { $0.scheme == nil ? nil : $0 } ?? URL(fileURLWithPath: uri)
    guard let loadedImage = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) else {
      throw ImageLoadException(uri)
    }

    var image = loadedImage.transformed(
      by: CGAffineTransform(translationX: -loadedImage.extent.origin.x, y: -loadedImage.extent.origin.y)
    )

    var cropped = false
    if options.autoCrop, let document = detectDocument(in: image) {
      image = perspectiveCorrected(image, to: document)
      cropped = true
    }

    image = applyFilter(options.filter, to: image)
    image = scaled(image, maxDimension: CGFloat(options.maxDimension))

    guard var cgImage = ciContext.createCGImage(image, from: image.extent.integral) else {
      throw ImageEncodeException()
    }

    // Compress until the image fits the upload limit (Vercel functions accept ~4.5 MB)
    var quality: CGFloat = 0.85
    var data = try encodeJpeg(cgImage, quality: quality)
    var attempts = 0
    while data.count > options.maxBytes && attempts < 8 {
      attempts += 1
      if quality > 0.6 {
        quality -= 0.1
      } else {
        let smaller = scaled(CIImage(cgImage: cgImage), factor: 0.8)
        guard let smallerImage = ciContext.createCGImage(smaller, from: smaller.extent.integral) else {
          throw ImageEncodeException()
        }
        cgImage = smallerImage
      }
      data = try encodeJpeg(cgImage, quality: quality)
    }

    let outputUrl = try outputDirectory().appendingPathComponent("receipt-\(UUID().uuidString).jpg")
    try data.write(to: outputUrl)

    return [
      "uri": outputUrl.absoluteString,
      "width": cgImage.width,
      "height": cgImage.height,
      "cropped": cropped,
      "size": data.count,
    ]
  }

  /// Finds the most prominent document (e.g. a receipt) in the image.
  private func detectDocument(in image: CIImage) -> VNRectangleObservation? {
    let handler = VNImageRequestHandler(ciImage: image, options: [:])

    let segmentation = VNDetectDocumentSegmentationRequest()
    if (try? handler.perform([segmentation])) != nil,
       let observation = segmentation.results?.first,
       observation.confidence >= 0.5,
       isUsefulCrop(observation) {
      return observation
    }

    // Fall back to classic rectangle detection. Receipts are long and narrow,
    // so allow small aspect ratios.
    let rectangles = VNDetectRectanglesRequest()
    rectangles.maximumObservations = 1
    rectangles.minimumConfidence = 0.6
    rectangles.minimumAspectRatio = 0.1
    rectangles.maximumAspectRatio = 1
    rectangles.minimumSize = 0.2
    rectangles.quadratureTolerance = 30
    if (try? handler.perform([rectangles])) != nil,
       let observation = rectangles.results?.first,
       isUsefulCrop(observation) {
      return observation
    }

    return nil
  }

  /// Ignores detections that are tiny or cover (almost) the whole image.
  private func isUsefulCrop(_ observation: VNRectangleObservation) -> Bool {
    let points = [observation.topLeft, observation.topRight, observation.bottomRight, observation.bottomLeft]
    var area: CGFloat = 0
    for index in points.indices {
      let current = points[index]
      let next = points[(index + 1) % points.count]
      area += current.x * next.y - next.x * current.y
    }
    area = abs(area) / 2
    return area > 0.05 && area < 0.97
  }

  private func perspectiveCorrected(_ image: CIImage, to document: VNRectangleObservation) -> CIImage {
    // Vision and Core Image both use normalized coordinates with a bottom-left origin
    let size = image.extent.size
    func point(_ normalized: CGPoint) -> CGPoint {
      CGPoint(x: normalized.x * size.width, y: normalized.y * size.height)
    }

    let filter = CIFilter.perspectiveCorrection()
    filter.inputImage = image
    filter.topLeft = point(document.topLeft)
    filter.topRight = point(document.topRight)
    filter.bottomLeft = point(document.bottomLeft)
    filter.bottomRight = point(document.bottomRight)
    guard let output = filter.outputImage else {
      return image
    }
    return output.transformed(
      by: CGAffineTransform(translationX: -output.extent.origin.x, y: -output.extent.origin.y)
    )
  }

  private func applyFilter(_ name: String, to image: CIImage) -> CIImage {
    switch name {
    case "auto":
      return documentEnhanced(image)
    case "grayscale":
      return sharpened(colorControls(documentEnhanced(image), saturation: 0, contrast: 1.1))
    case "blackwhite":
      return sharpened(colorControls(documentEnhanced(image), saturation: 0, contrast: 1.8, brightness: 0.05))
    default:
      return image
    }
  }

  /// Removes shadows, whitens the background and boosts the contrast of text.
  private func documentEnhanced(_ image: CIImage) -> CIImage {
    let filter = CIFilter.documentEnhancer()
    filter.inputImage = image
    filter.amount = 1
    return filter.outputImage ?? image
  }

  private func colorControls(_ image: CIImage, saturation: Float, contrast: Float, brightness: Float = 0) -> CIImage {
    let filter = CIFilter.colorControls()
    filter.inputImage = image
    filter.saturation = saturation
    filter.contrast = contrast
    filter.brightness = brightness
    return filter.outputImage ?? image
  }

  private func sharpened(_ image: CIImage) -> CIImage {
    let filter = CIFilter.sharpenLuminance()
    filter.inputImage = image
    filter.sharpness = 0.4
    return filter.outputImage ?? image
  }

  private func scaled(_ image: CIImage, maxDimension: CGFloat) -> CIImage {
    let longestSide = max(image.extent.width, image.extent.height)
    guard longestSide > maxDimension else {
      return image
    }
    return scaled(image, factor: maxDimension / longestSide)
  }

  private func scaled(_ image: CIImage, factor: CGFloat) -> CIImage {
    let filter = CIFilter.lanczosScaleTransform()
    filter.inputImage = image
    filter.scale = Float(factor)
    filter.aspectRatio = 1
    return filter.outputImage ?? image
  }

  private func encodeJpeg(_ image: CGImage, quality: CGFloat) throws -> Data {
    guard let data = UIImage(cgImage: image).jpegData(compressionQuality: quality) else {
      throw ImageEncodeException()
    }
    return data
  }

  private func outputDirectory() throws -> URL {
    let fileManager = FileManager.default
    let directory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
      .appendingPathComponent("DocumentScanner", isDirectory: true)

    if fileManager.fileExists(atPath: directory.path) {
      removeFiles(in: directory, olderThan: 24 * 60 * 60)
    } else {
      try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
    }
    return directory
  }

  private func removeFiles(in directory: URL, olderThan age: TimeInterval) {
    let fileManager = FileManager.default
    guard let files = try? fileManager.contentsOfDirectory(
      at: directory,
      includingPropertiesForKeys: [.contentModificationDateKey]
    ) else {
      return
    }
    let cutoff = Date().addingTimeInterval(-age)
    for file in files {
      let modified = try? file.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate
      if let modified, modified < cutoff {
        try? fileManager.removeItem(at: file)
      }
    }
  }
}

// MARK: - VisionKit delegate

private final class DocumentScanSession: NSObject, VNDocumentCameraViewControllerDelegate {
  enum Result {
    case success([String])
    case cancelled
    case failure(Error)
  }

  private let outputDirectory: URL
  private let completion: (Result) -> Void

  init(outputDirectory: URL, completion: @escaping (Result) -> Void) {
    self.outputDirectory = outputDirectory
    self.completion = completion
  }

  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
    let pages = (0..<scan.pageCount).map { scan.imageOfPage(at: $0) }
    controller.dismiss(animated: true)

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let uris = try pages.map { page -> String in
          guard let data = page.jpegData(compressionQuality: 0.92) else {
            throw ImageEncodeException()
          }
          let url = self.outputDirectory.appendingPathComponent("scan-\(UUID().uuidString).jpg")
          try data.write(to: url)
          return url.absoluteString
        }
        self.finish(.success(uris))
      } catch {
        self.finish(.failure(error))
      }
    }
  }

  func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
    controller.dismiss(animated: true)
    finish(.cancelled)
  }

  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
    controller.dismiss(animated: true)
    finish(.failure(error))
  }

  private func finish(_ result: Result) {
    DispatchQueue.main.async {
      self.completion(result)
    }
  }
}

// MARK: - Exceptions

private final class ScannerUnavailableException: Exception {
  override var reason: String {
    "Document scanning is not supported on this device"
  }
}

private final class ScanInProgressException: Exception {
  override var reason: String {
    "A document scan is already in progress"
  }
}

private final class MissingViewControllerException: Exception {
  override var reason: String {
    "Could not find a view controller to present the scanner from"
  }
}

private final class ScanFailedException: GenericException<String> {
  override var reason: String {
    "Document scan failed: \(param)"
  }
}

private final class ImageLoadException: GenericException<String> {
  override var reason: String {
    "Could not load the image at \(param)"
  }
}

private final class ImageEncodeException: Exception {
  override var reason: String {
    "Could not encode the image"
  }
}
