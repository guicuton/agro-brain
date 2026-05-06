import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  validateSync,
} from 'class-validator';
import { ValidateCpf } from './validate-cpf.decorator';
import { ValidateCnpj } from './validate-cnpj.decorator';

class CpfHolder {
  @ValidateCpf()
  value: string;
}

class CnpjHolder {
  @ValidateCnpj()
  value: string;
}

export function ValidateDoc(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateDoc',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          const digits = value.replace(/\D/g, '');

          if (digits.length === 11) {
            const holder = new CpfHolder();
            holder.value = value;
            return validateSync(holder).length === 0;
          }

          if (digits.length > 11) {
            const holder = new CnpjHolder();
            holder.value = value;
            return validateSync(holder).length === 0;
          }

          return false;
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} invalid input`;
        },
      },
    });
  };
}
