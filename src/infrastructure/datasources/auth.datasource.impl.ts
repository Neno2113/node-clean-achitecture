import { BcryptAdapter } from "../../config";
import { UserModel } from "../../data/mongodb";
import { AuthDataSource, CustomError, RegisterUserDto, UserEntity } from "../../domain";



export class AuthDatasourceImpl implements AuthDataSource {

    constructor(
        
    ){

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

            return new UserEntity(
                user.id,
                name,
                email,
                user.password,
                user.roles,
            )
        } catch (error) {
            

            if( error instanceof CustomError ) {
                throw error;
            }

            throw CustomError.internalServer();

        }

    }

}