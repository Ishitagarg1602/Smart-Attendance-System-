import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final bool isLoading;
  final bool isDisabled;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final double? width;
  final Widget? icon;
  final bool isOutlined;

  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.isLoading = false,
    this.isDisabled = false,
    this.borderRadius = 12,
    this.padding = const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
    this.width,
    this.icon,
    this.isOutlined = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final buttonColor = backgroundColor ?? theme.colorScheme.primary;
    final disabledColor = theme.colorScheme.onSurface.withOpacity(0.12);
    final buttonTextColor = textColor ?? theme.colorScheme.onPrimary;

    return SizedBox(
      width: width,
      child: isOutlined
          ? OutlinedButton(
              onPressed: isDisabled || isLoading ? null : onPressed,
              style: OutlinedButton.styleFrom(
                padding: padding,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                side: BorderSide(
                  color: isDisabled ? disabledColor : buttonColor,
                  width: 2,
                ),
                backgroundColor: Colors.transparent,
              ),
              child: _buildButtonContent(theme, buttonTextColor),
            )
          : ElevatedButton(
              onPressed: isDisabled || isLoading ? null : onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: isDisabled ? disabledColor : buttonColor,
                foregroundColor: buttonTextColor,
                padding: padding,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                elevation: 2,
                shadowColor: buttonColor.withOpacity(0.3),
              ),
              child: _buildButtonContent(theme, buttonTextColor),
            ),
    );
  }

  Widget _buildButtonContent(ThemeData theme, Color buttonTextColor) {
    if (isLoading) {
      return SizedBox(
        height: 24,
        width: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: buttonTextColor,
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[
          icon!,
          const SizedBox(width: 8),
        ],
        Text(
          text,
          style: theme.textTheme.labelLarge?.copyWith(
            color: buttonTextColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// Secondary button with different styling
class SecondaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final bool isLoading;

  const SecondaryButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      backgroundColor: Colors.transparent,
      textColor: Theme.of(context).colorScheme.primary,
      isLoading: isLoading,
      isOutlined: true,
      icon: icon != null
          ? Icon(
              icon,
              size: 20,
              color: Theme.of(context).colorScheme.primary,
            )
          : null,
    );
  }
}

// Danger button (for delete/cancel actions)
class DangerButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;

  const DangerButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomButton(
      text: text,
      onPressed: onPressed,
      backgroundColor: Theme.of(context).colorScheme.error,
      isLoading: isLoading,
    );
  }
}

// Floating action button with icon
class FloatingActionButtonWidget extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;
  final Color? backgroundColor;

  const FloatingActionButtonWidget({
    Key? key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.backgroundColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: onPressed,
      backgroundColor: backgroundColor ?? Theme.of(context).colorScheme.primary,
      foregroundColor: Theme.of(context).colorScheme.onPrimary,
      tooltip: tooltip,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(icon),
    );
  }
}