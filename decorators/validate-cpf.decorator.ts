import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function ValidateCpf(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCpf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const cpf = value.replace(/\D/g, '');

          if (cpf.length !== 11) return false;

          if (/^(\d)\1{10}$/.test(cpf)) return false;

          let sum = 0;
          let rest: number;

          for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
          }
          rest = (sum * 10) % 11;
          if (rest === 10 || rest === 11) rest = 0;
          if (rest !== parseInt(cpf.substring(9, 10))) return false;

          sum = 0;
          for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
          }
          rest = (sum * 10) % 11;
          if (rest === 10 || rest === 11) rest = 0;
          if (rest !== parseInt(cpf.substring(10, 11))) return false;

          return true;
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} invalid input`;
        },
      },
    });
  };
}
