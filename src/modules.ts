export class RegisterDTO
{
    first_name: string = '';
    last_name: string ='';
    email: string = '';
    password: string = '';
    password_confirmation: string = '';
}
export class LoginDTO
{
    email: string = '';
    password: string = '';
}