import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:smart_attendance/utils/constants.dart';

class AttendanceCard extends StatelessWidget {
  final String className;
  final String status;
  final DateTime timestamp;
  final double? distance;
  final String facultyName;
  final VoidCallback? onTap;
  final bool isVerified;

  const AttendanceCard({
    Key? key,
    required this.className,
    required this.status,
    required this.timestamp,
    this.distance,
    required this.facultyName,
    this.onTap,
    this.isVerified = true,
  }) : super(key: key);

  Color _getStatusColor() {
    switch (status) {
      case AppConstants.statusPresent:
        return Colors.green;
      case AppConstants.statusLate:
        return Colors.orange;
      case AppConstants.statusAbsent:
        return Colors.red;
      case AppConstants.statusRejected:
        return Colors.redAccent;
      default:
        return Colors.grey;
    }
  }

  String _getStatusText() {
    switch (status) {
      case AppConstants.statusPresent:
        return 'Present';
      case AppConstants.statusLate:
        return 'Late';
      case AppConstants.statusAbsent:
        return 'Absent';
      case AppConstants.statusRejected:
        return 'Rejected (Out of Range)';
      default:
        return 'Unknown';
    }
  }

  IconData _getStatusIcon() {
    switch (status) {
      case AppConstants.statusPresent:
        return Icons.check_circle;
      case AppConstants.statusLate:
        return Icons.access_time;
      case AppConstants.statusAbsent:
        return Icons.cancel;
      case AppConstants.statusRejected:
        return Icons.location_off;
      default:
        return Icons.help;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      className,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _getStatusColor().withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getStatusIcon(),
                          size: 16,
                          color: _getStatusColor(),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _getStatusText(),
                          style: TextStyle(
                            color: _getStatusColor(),
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'By: $facultyName',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: Colors.grey[500],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    DateFormat('MMM dd, yyyy • hh:mm a').format(timestamp),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                ],
              ),
              if (distance != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      size: 16,
                      color: Colors.grey[500],
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${distance!.toStringAsFixed(1)} meters away',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                ),
              ],
              if (!isVerified) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.warning,
                      size: 16,
                      color: Colors.orange,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Location not verified',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.orange,
                          ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// Compact Attendance Card for lists
class CompactAttendanceCard extends StatelessWidget {
  final String className;
  final String status;
  final DateTime timestamp;
  final VoidCallback? onTap;

  const CompactAttendanceCard({
    Key? key,
    required this.className,
    required this.status,
    required this.timestamp,
    this.onTap,
  }) : super(key: key);

  Color _getStatusColor() {
    switch (status) {
      case AppConstants.statusPresent:
        return Colors.green;
      case AppConstants.statusLate:
        return Colors.orange;
      case AppConstants.statusAbsent:
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: _getStatusColor().withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          status == AppConstants.statusPresent
              ? Icons.check
              : status == AppConstants.statusLate
                  ? Icons.access_time
                  : Icons.close,
          color: _getStatusColor(),
        ),
      ),
      title: Text(
        className,
        style: Theme.of(context).textTheme.bodyLarge,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        DateFormat('MMM dd • hh:mm a').format(timestamp),
        style: Theme.of(context).textTheme.bodySmall,
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: _getStatusColor().withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          status.toUpperCase(),
          style: TextStyle(
            color: _getStatusColor(),
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// Attendance Summary Card
class AttendanceSummaryCard extends StatelessWidget {
  final int present;
  final int absent;
  final int late;
  final int total;
  final double percentage;
  final int streak;

  const AttendanceSummaryCard({
    Key? key,
    required this.present,
    required this.absent,
    required this.late,
    required this.total,
    required this.percentage,
    this.streak = 0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Attendance Summary',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem(
                  context,
                  'Present',
                  present,
                  Colors.green,
                  Icons.check_circle,
                ),
                _buildStatItem(
                  context,
                  'Absent',
                  absent,
                  Colors.red,
                  Icons.cancel,
                ),
                _buildStatItem(
                  context,
                  'Late',
                  late,
                  Colors.orange,
                  Icons.access_time,
                ),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: percentage / 100,
              backgroundColor: Colors.grey[200],
              color: _getPercentageColor(percentage),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${percentage.toStringAsFixed(1)}%',
                  style: TextStyle(
                    color: _getPercentageColor(percentage),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (streak > 0)
                  Row(
                    children: [
                      Icon(
                        Icons.local_fire_department,
                        color: Colors.orange,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$streak day${streak > 1 ? 's' : ''} streak',
                        style: const TextStyle(
                          color: Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String label,
    int value,
    Color color,
    IconData icon,
  ) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value.toString(),
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[600],
              ),
        ),
      ],
    );
  }

  Color _getPercentageColor(double percentage) {
    if (percentage >= 75) return Colors.green;
    if (percentage >= 50) return Colors.orange;
    return Colors.red;
  }
}