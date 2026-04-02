// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto, MinimalRegisterDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) { }

 async register(registerDto: MinimalRegisterDto): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);
  
  const createUserDto: CreateUserDto = {
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    }

    const user = await this.usersService.create(createUserDto);

// 3. Salva o código no banco (certifique-se de ter o método saveUser ou fazer direto no repository)
   await this.usersService.setVerificationData(user.id, code, expires);

    // 4. DISPARO REAL DO E-MAIL
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Seu código de verificação',
      text: `Olá ${user.name}, seu código de verificação é: ${code}. Ele expira em 15 minutos.`,
    });


    return user.email; 
  }

  async verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (user.isVerified) {
      return { message: 'E-mail já está verificado' };
    }

    if (user.verificationCode !== code) {
      throw new UnauthorizedException('Código inválido');
    }

    if (!user.verificationExpires || new Date() > user.verificationExpires) {
      throw new UnauthorizedException('Código expirado ou inválido. Solicite um novo.');
    }

    // Sucesso! Atualiza o banco com o novo método semântico
    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {

   const { identifier, password } = loginDto;
    let user;

    if (identifier.includes('@')) {
      user = await this.usersService.findByEmail(identifier);
    } else {
      const cleanCpf = identifier.replace(/\D/g, ''); // Limpa pontuações caso o front envie
      user = await this.usersService.findByCpf(cleanCpf);
    }
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas'); // Mensagem genérica por segurança
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Por favor, verifique seu e-mail antes de acessar o sistema.');
    }

    const payload = { sub: user.id, name: user.name, email: user.email, role: user.role.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
