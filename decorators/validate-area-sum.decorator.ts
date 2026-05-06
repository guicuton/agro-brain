import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function ValidateAreaSum(
  fields: [string, string],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateAreaSum',
      target: object.constructor,
      propertyName,
      constraints: fields,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [first, second] = args.constraints as [string, string];
          const total = Number(value);
          const a = Number((args.object as any)[first]);
          const b = Number((args.object as any)[second]);

          if (!Number.isFinite(total) || !Number.isFinite(a) || !Number.isFinite(b)) {
            return false;
          }

          return a + b <= total;
        },

        defaultMessage(args: ValidationArguments) {
          const [first, second] = args.constraints as [string, string];
          return `${first} + ${second} must not exceed ${args.property}`;
        },
      },
    });
  };
}
