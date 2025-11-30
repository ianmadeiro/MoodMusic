-- Criação do banco de dados, se ainda não existir
CREATE DATABASE IF NOT EXISTS spotify_app;
USE spotify_app;

-- 1. Tabela para armazenar os dados dos usuários/clientes
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE, -- O email deve ser único para login
    senha VARCHAR(255) NOT NULL, -- Armazena o hash da senha
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela para armazenar todas as músicas disponíveis
CREATE TABLE musicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    artista VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL, -- O link para o arquivo/stream da música
    capa VARCHAR(255), -- Link opcional para a capa do álbum
    popularidade ENUM('baixa', 'alta') DEFAULT 'baixa',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela para armazenar as playlists criadas pelos usuários
CREATE TABLE playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    usuario_id INT NOT NULL, -- Chave estrangeira para vincular a playlist a um usuário
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Tabela de relacionamento N:M (Muitos para Muitos) entre Playlists e Músicas
-- Isso permite que uma música esteja em várias playlists e uma playlist tenha várias músicas.
CREATE TABLE playlist_musicas (
    playlist_id INT NOT NULL,
    musica_id INT NOT NULL,
    adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, musica_id), -- A combinação é única
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (musica_id) REFERENCES musicas(id) ON DELETE CASCADE
);