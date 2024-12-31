CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  course VARCHAR(255) NOT NULL,
  creator_id INTEGER REFERENCES users(id)
);

CREATE TABLE team_members (
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  max_team_size INTEGER NOT NULL
);

INSERT INTO courses (name, max_team_size) VALUES
  ('Math', 3),
  ('Science', 4),
  ('History', 2),
  ('English', 5);

