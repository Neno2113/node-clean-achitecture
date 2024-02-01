import { BcryptAdapter } from "../../config";
import { UserModel } from "../../data/mongodb";
import { AuthDataSource, CustomError, RegisterUserDto, UserEntity } from "../../domain";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";
import { UserMapper } from "../mappers/user.mapper";



export class AuthDatasourceImpl implements AuthDataSource {

    constructor(
        
    ){

    }
    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {

        const  { email, password } = loginUserDto;

        try {
            const user = await UserModel.findOne({ email });
            if( !user ) throw CustomError.badRequest('User dont exists');

            const validatePassword = BcryptAdapter.compare(password, user.password);
            if( !validatePassword ) throw CustomError.badRequest('Login denied');


            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            if( error instanceof CustomError ) {
                throw error;
            }

            throw CustomError.internalServer();
        }
    }
    
    async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {

        const { name, email, password }  = registerUserDto;

        try {

            // 1. Verificar si el correo existe
            const emailExists = await UserModel.findOne({ email: email });
            if( emailExists ) throw CustomError.badRequest('User already exists.');
            
            // 2. Hash de contraseña


            const user = await UserModel.create({
                name,
                email,
                password: BcryptAdapter.hash( password),
            })

            await user.save();
            
            //3. Mapear la respuesta

            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            

            if( error instanceof CustomError ) {
                throw error;
            }

            throw CustomError.internalServer();

        }

    }

}