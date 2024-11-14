import {useState} from "react";
import {loginUser} from "./loginApi";
import {Session} from "../model/common";
import {CustomError} from "../model/CustomError";
import { useNavigate } from "react-router-dom";

export function Login() {

    const [error, setError] = useState({} as CustomError);
    const [session, setSession] = useState({} as Session);

    const navigate = useNavigate();


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        loginUser({user_id: -1, username:  data.get('login') as string, password: data.get('password') as string},
            (result: Session) => {
                console.log(result);
                setSession(result);
                form.reset();
                setError(new CustomError(""));
                navigate('/users');
            }, (loginError: CustomError) => {
                console.log(loginError);
                setError(loginError);
                setSession({} as Session);
            });
    };

    return(<div className="flex align-center">

        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="UBO"
              src="https://beachild.fr/wp-content/uploads/2024/03/logo-UBO-1-removebg-preview.png"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            UBO Relay Chat
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="login" className="block text-sm/6 font-medium text-gray-900">
                  Compte
                </label>
                <div className="mt-2">
                  <input placeholder="Nom d`Utilisateur"
                    id="login"
                    name="login"
                    type="text"
                    required
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                    Mot de Passe
                  </label>
                  
                </div>
                <div className="mt-2">
                  <input placeholder="Mot de passe"
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-950 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Connexion
                </button>
              </div>
            </form>
            <p className="mt-10 text-center text-sm/6 text-gray-500">
            Pas de compte?{' '}
            <a href="register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Créer un Compte
            </a>
          </p>

          </div>
        </div>
</div>
);
    
  }

