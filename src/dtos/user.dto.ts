import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    public email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(12)
    public password: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['user', 'admin', 'support'])
    public role: string;
}
