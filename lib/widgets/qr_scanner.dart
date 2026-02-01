import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QRScannerWidget extends StatefulWidget {
  final Function(String) onScan;
  final String? title;
  final bool showFlash;
  final bool showSwitchCamera;

  const QRScannerWidget({
    Key? key,
    required this.onScan,
    this.title,
    this.showFlash = true,
    this.showSwitchCamera = true,
  }) : super(key: key);

  @override
  State<QRScannerWidget> createState() => _QRScannerWidgetState();
}

class _QRScannerWidgetState extends State<QRScannerWidget> {
  MobileScannerController cameraController = MobileScannerController();
  bool _isScanning = true;
  bool _flashEnabled = false;
  CameraFacing _cameraFacing = CameraFacing.back;
  String? _lastScannedCode;

  @override
  void initState() {
    super.initState();
    _startScanner();
  }

  void _startScanner() {
    setState(() {
      _isScanning = true;
    });
  }

  void _stopScanner() {
    setState(() {
      _isScanning = false;
    });
  }

  void _toggleFlash() {
    setState(() {
      _flashEnabled = !_flashEnabled;
      cameraController.toggleTorch();
    });
  }

  void _switchCamera() {
    setState(() {
      _cameraFacing = _cameraFacing == CameraFacing.back
          ? CameraFacing.front
          : CameraFacing.back;
      cameraController.switchCamera();
    });
  }

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final barcode = barcodes.first;
    if (barcode.rawValue == null) return;

    final scannedCode = barcode.rawValue!;
    
    // Prevent duplicate scans
    if (_lastScannedCode == scannedCode) return;
    _lastScannedCode = scannedCode;

    // Stop scanner temporarily
    _stopScanner();

    // Call onScan callback
    widget.onScan(scannedCode);

    // Resume scanning after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        _startScanner();
        _lastScannedCode = null;
      }
    });
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          MobileScanner(
            controller: cameraController,
            onDetect: _onDetect,
            fit: BoxFit.cover,
          ),

          // Overlay
          _buildOverlay(context),

          // Controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: _buildControls(),
          ),

          // App Bar
          if (widget.title != null) _buildAppBar(context),
        ],
      ),
    );
  }

  Widget _buildOverlay(BuildContext context) {
    return Container(
      decoration: ShapeDecoration(
        shape: _ScannerOverlayShape(
          cutOutSize: MediaQuery.of(context).size.width * 0.7,
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        if (widget.showFlash)
          IconButton(
            onPressed: _toggleFlash,
            icon: Icon(
              _flashEnabled ? Icons.flash_on : Icons.flash_off,
              color: Colors.white,
              size: 32,
            ),
          ),
        if (widget.showSwitchCamera)
          IconButton(
            onPressed: _switchCamera,
            icon: const Icon(
              Icons.cameraswitch,
              color: Colors.white,
              size: 32,
            ),
          ),
      ],
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      title: Text(
        widget.title ?? 'Scan QR Code',
        style: const TextStyle(color: Colors.white),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.of(context).pop(),
      ),
    );
  }
}

class _ScannerOverlayShape extends ShapeBorder {
  final double cutOutSize;

  const _ScannerOverlayShape({required this.cutOutSize});

  @override
  EdgeInsetsGeometry get dimensions => const EdgeInsets.all(0);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()
      ..addRect(Rect.fromLTWH(rect.left, rect.top, rect.width, rect.height));
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    return Path()
      ..addRect(rect)
      ..addPath(
        Path()
          ..addRRect(
            RRect.fromRectAndRadius(
              Rect.fromCenter(
                center: rect.center,
                width: cutOutSize,
                height: cutOutSize,
              ),
              const Radius.circular(16),
            ),
          ),
        Offset.zero,
      )
      ..fillType = PathFillType.evenOdd;
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.6)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = getOuterPath(rect);
    canvas.drawPath(path, paint);

    // Draw border around cutout
    final cutoutRect = Rect.fromCenter(
      center: rect.center,
      width: cutOutSize,
      height: cutOutSize,
    );

    canvas.drawRRect(
      RRect.fromRectAndRadius(cutoutRect, const Radius.circular(16)),
      borderPaint,
    );

    // Draw corner indicators
    final cornerLength = 20.0;
    final cornerWidth = 4.0;
    final cornerPaint = Paint()
      ..color = Colors.green
      ..style = PaintingStyle.fill;

    // Top-left corner
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.left - cornerWidth,
        cutoutRect.top - cornerWidth,
        cornerLength,
        cornerWidth,
      ),
      cornerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.left - cornerWidth,
        cutoutRect.top - cornerWidth,
        cornerWidth,
        cornerLength,
      ),
      cornerPaint,
    );

    // Top-right corner
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.right - cornerLength + cornerWidth,
        cutoutRect.top - cornerWidth,
        cornerLength,
        cornerWidth,
      ),
      cornerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.right,
        cutoutRect.top - cornerWidth,
        cornerWidth,
        cornerLength,
      ),
      cornerPaint,
    );

    // Bottom-left corner
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.left - cornerWidth,
        cutoutRect.bottom,
        cornerLength,
        cornerWidth,
      ),
      cornerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.left - cornerWidth,
        cutoutRect.bottom - cornerLength + cornerWidth,
        cornerWidth,
        cornerLength,
      ),
      cornerPaint,
    );

    // Bottom-right corner
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.right - cornerLength + cornerWidth,
        cutoutRect.bottom,
        cornerLength,
        cornerWidth,
      ),
      cornerPaint,
    );
    canvas.drawRect(
      Rect.fromLTWH(
        cutoutRect.right,
        cutoutRect.bottom - cornerLength + cornerWidth,
        cornerWidth,
        cornerLength,
      ),
      cornerPaint,
    );
  }

  @override
  ShapeBorder scale(double t) => this;
}

// Simple QR Scanner Dialog
class QRScannerDialog extends StatelessWidget {
  final Function(String) onScan;

  const QRScannerDialog({Key? key, required this.onScan}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(20),
      child: Container(
        height: 400,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Scan QR Code',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            Expanded(
              child: QRScannerWidget(
                onScan: (code) {
                  onScan(code);
                  Navigator.of(context).pop();
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Position the QR code within the frame',
                style: TextStyle(
                  color: Colors.grey[600],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}