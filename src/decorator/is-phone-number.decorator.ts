import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates Vietnamese phone numbers
 * Supports formats: 0xxxxxxxxx or +84xxxxxxxxx (10 digits after 0, or 9 digits after +84)
 */
export function IsVietnamesePhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isVietnamesePhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          // Vietnamese phone number patterns:
          // - Starting with 0: 0xxxxxxxxx (10 digits total)
          // - Starting with +84: +84xxxxxxxxx (12 chars total, 9 digits after +84)
          // - Starting with 84: 84xxxxxxxxx (11 digits total)
          const phoneRegex = /^(\+84|84|0)[3-9]\d{8}$/;
          return phoneRegex.test(value.replace(/\s+/g, ''));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Vietnamese phone number (e.g., 0912345678 or +84912345678)`;
        },
      },
    });
  };
}
