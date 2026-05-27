-- Killer Sudoku — initial database schema
-- Run with: mysql -u root -p < sudoku.sql

CREATE DATABASE IF NOT EXISTS sudoku
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sudoku;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(20)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS puzzles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  difficulty TINYINT NOT NULL,
  grid_json  JSON NOT NULL,
  cages_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_difficulty CHECK (difficulty BETWEEN 1 AND 3),
  CONSTRAINT fk_puzzle_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_puzzle_difficulty (difficulty)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS results (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  puzzle_id    INT NOT NULL,
  time_seconds INT NOT NULL,
  hints_used   INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_result_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_puzzle FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE,
  INDEX idx_result_leaderboard (puzzle_id, time_seconds),
  INDEX idx_result_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ratings (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  puzzle_id           INT NOT NULL,
  stars               TINYINT NOT NULL,
  difficulty_feedback ENUM('too_easy', 'fits', 'too_hard') NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_stars CHECK (stars BETWEEN 1 AND 5),
  CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_puzzle FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_puzzle (user_id, puzzle_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_puzzles (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  puzzle_id INT NOT NULL,
  date      DATE NOT NULL UNIQUE,
  CONSTRAINT fk_daily_puzzle FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
) ENGINE=InnoDB;
