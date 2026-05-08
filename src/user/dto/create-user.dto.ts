import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'Kaldar Valkaria',
        description: 'Nome completo do aventureiro'
    })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name: string;

    @ApiProperty({ example: 'kaldar_valkaria', description: 'Nome de usuário único' })
    @IsString()
    @IsNotEmpty({ message: 'O username é obrigatório' })
    username: string;

    @ApiProperty({
        example: 'kaldar@valkaria.com',
        description: 'Email único para login'
    })
    @IsEmail({}, { message: 'O email deve ser um endereço válido' })
    email: string;

    @ApiProperty({
        example: 'senha123',
        description: 'Senha de acesso (mínimo 6 caracteres)'
    })
    @IsString()
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    password: string;
}
