import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: AuthService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() === 'http') {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      const request = context.switchToHttp().getRequest();
      const auth = request.headers.authorization;
      const [, token] = auth.split(' ');
      if (token) {
        const id = this.jwtService.decode(token)['sub'];
        console.log(id);
        const user = await this.userService.findById(id);
        console.log(user);
        return roles.includes(user.role);
      } else {
        return false;
      }
    }

    return false;
  }
}
