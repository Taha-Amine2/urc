// RoomsList.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../slices/roomsSlice';
import { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { Room } from '../model/common';

export const RoomsList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((state: RootState) => state.rooms);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleRoomClick = (roomId: number) => {
    navigate(`/messages/room/${roomId}`);
  };

  return (
    <div className="max-w-md mx-left bg-gray-100 shadow-lg rounded-lg overflow-y-auto md:max-w-lg align h-full">
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
              {list.map((room: Room) => (
                <li key={room.room_id}>
                  <button
                    onClick={() => handleRoomClick(room.room_id)}
                    className="flex justify-between items-center bg-white mt-2 p-2 hover:shadow-lg rounded cursor-pointer transition w-full text-left"
                  >
                    <div className="flex flex-col ml-2">
                      <span className="font-medium text-black">{room.name}</span>
                      <span className="text-sm text-gray-400 truncate w-50">
                        Created on: {new Date(room.created_on).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};
