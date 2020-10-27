export interface User {
  room: string;
  id: string;
  username: string;
}

const users: User[] = [];

export const addUser = ({ id, username, room }: User) => {
  //Clean data
  username = username?.trim().toLowerCase();
  room = room?.trim().toLowerCase();

  //Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser)
    return {
      error: "Username is already in use",
    };

  //Create and add user to list
  const user: User = {
    id,
    username,
    room,
  };

  users.push(user);
  return { user };
};

export const removeUser = (id: string): User | undefined => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index !== -1) return users.splice(index, 1)[0];
  else return;
};

export const getUser = (id: string): User | undefined => {
  return users.find((user) => {
    return user.id === id;
  });
};

export const getUsersInRoom = (room: string): User[] => {
  return users.filter((user) => {
    return user.room === room;
  });
};
