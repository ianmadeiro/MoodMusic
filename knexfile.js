module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost",
      user: "root",
      password: "",
      database: "spotify_app",
    },
    migrations: {
      directory: "./backend/migrations",
    },
    seeds: {
      directory: "./backend/seeds",
    },
  },
};
