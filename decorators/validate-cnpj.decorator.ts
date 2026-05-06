import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function ValidateCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCnpj',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const cnpj = value.replace(/\D/g, '');

          if (cnpj.length !== 14) return false;

          if (/^(\d)\1{13}$/.test(cnpj)) return false;

          const calcCheckDigit = (cnpjBase: string, weights: number[]) => {
            let sum = 0;
            for (let i = 0; i < weights.length; i++) {
              sum += parseInt(cnpjBase[i]) * weights[i];
            }
            const rest = sum % 11;
            return rest < 2 ? 0 : 11 - rest;
          };

          const base = cnpj.substring(0, 12);

          const digit1 = calcCheckDigit(
            base,
            [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
          );
          const digit2 = calcCheckDigit(
            base + digit1,
            [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
          );

          return cnpj === base + digit1.toString() + digit2.toString();
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} invalid input`;
        },
      },
    });
  };
}
