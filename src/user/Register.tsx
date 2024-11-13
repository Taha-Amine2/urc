import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "../slices/usersSlice";
import { User } from "../model/common";
import { AppDispatch, RootState } from "../store";  

export function Register() {
  const dispatch = useDispatch<AppDispatch>();  
  const { error } = useSelector((state: RootState) => state.users); // Accéder à users.error depuis l'état global
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const newUser: User = {
      user_id: Date.now(), 
      username,
      email,
      password,
    };

    try {
      await dispatch(createUser(newUser)).unwrap();
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex align-center">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Nom d`Utilisateur
              </label>
              <div className="mt-2">
                <input
                  placeholder="Nom d`Utilisateur"
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                E-Mail
              </label>
              <div className="mt-2">
                <input
                  placeholder="Email"
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Mot de Passe
              </label>
              <div className="mt-2">
                <input
                  placeholder="Mot de passe"
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-950 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                S`inscrire
              </button>
            </div>
            <p className="mt-10 text-center text-sm/6 text-gray-500">
            Vous avez un compte?{' '}
            <a href="login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Se Connecter
            </a>
          </p>

            {error && <p className=" text-center text-red-500">{error} !</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
