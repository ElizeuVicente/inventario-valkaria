import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class LoginDto {
    @ApiProperty({
        example: 'kaldar_valkaria',
        description: 'Pode ser o seu email ou o seu nome de usuário'
    })
    @IsString()
    @IsNotEmpty({ message: 'O login é obrigatório' })
    login: string;

    @ApiProperty({
        example: 'senha123',
        description: 'Sua senha de acesso'
    })
    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    password: string;
}