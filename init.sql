CREATE TABLE IF NOT EXISTS help (
    id SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL
);

INSERT INTO help (id, texto)
VALUES (1, 'esto esta conectado')
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto;
