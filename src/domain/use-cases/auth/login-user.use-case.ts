import { LoginUserDto } from "../../dtos/auth/login-user.dto";
import { UserToken } from "./register-user.user-case";
import { AuthRepository } from '../../repositories/auth.repository';
import { JwtAdapter } from "../../../config";
import { CustomError } from "../../errors/custom-errors";





interface LoginUserUseCase {
    execute( loginUserDto: LoginUserDto):Promise<UserToken>
}


type SignToken = ( payload: object, duration?: string ) => Promise<string | null>;


export class LoginUser implements LoginUserUseCase {

    constructor(
        private readonly AuthRepository: AuthRepository,
        private readonly  signToken: SignToken = JwtAdapter.generateToken
    ){}
    
    async execute(loginUserDto: LoginUserDto): Promise<UserToken> {

        const user = await this.AuthRepository.login(loginUserDto);

        const token = await this.signToken({ id: user.id}, '2h');
        if( !token ) throw CustomError.internalServer('Internal server error.')

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        }


    }





}