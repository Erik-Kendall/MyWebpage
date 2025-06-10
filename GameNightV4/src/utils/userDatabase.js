// src/utils/userDatabase.js

const MAX_USERS = 20;

export const saveUser = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (Object.keys(users).length >= MAX_USERS) {
        return 'User limit reached.';
    }
    if (users[username]) {
        return 'Username already exists.';
    }
    users[username] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    return 'User registered successfully.';
};

export const getUser = (username) => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return users[username] || null;
};
