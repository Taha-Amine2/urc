import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../slices/usersSlice';
import { RootState, AppDispatch } from '../store';  
import { useNavigate } from 'react-router-dom';

export const UserList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((state: RootState) => state.users);
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const navigate = useNavigate();


  const username = sessionStorage.getItem('username');

  const filteredList = list.filter((user) => user.username !== username);

  const handleUserClick = (userId: number) => {
    navigate(`/messages/user/${userId}`);
  };

  return (
    <div className="max-w-md mx-left bg-gray-100 shadow-lg rounded-lg overflow-hidden md:max-w-lg align h-full">
      <div className="md:flex">
        <div className="w-full p-4">
          {loading ? (
            <ul>
              {[...Array(10)].map((_, index) => (
                <li key={index} className="flex justify-between items-center bg-white mt-2 p-2 animate-pulse rounded">
                  <div className="flex flex-col ml-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex flex-col items-center w-1/3">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
  {filteredList.map((user) => (
    <li key={user.user_id}>
      <button
        onClick={() => handleUserClick(user.user_id)}
        className="flex justify-between items-center bg-white mt-2 p-2 hover:shadow-lg rounded cursor-pointer transition w-full text-left"
      >
        <div className="flex flex-col ml-2">
          <span className="font-medium text-black">{user.username}</span>
          <span className="text-sm text-gray-400 truncate w-50">
            Dernière connexion : {user.last_login}
          </span>
        </div>
      </button>
    </li>
  ))}
</ul>

          
          )}
        </div>
      </div>
    </div>
  );
};
