const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 7500;

app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados
const db = mysql.createConnection({
    host: 'bancomysql.c1rmsxzyhbjb.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Skyfall20#?',
    database: 'new'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conexão ao banco de dados estabelecida com sucesso');
    }
});


app.post('/auth', (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        res.status(400).send('Nome de usuário e senha são obrigatórios.');
        return;
    }

    const sql = 'SELECT * FROM usuarios WHERE nome = ? AND senha = ?';
    db.query(sql, [nome, senha], (err, results) => {
        if (err) {
            console.error('Erro ao verificar o login:', err);
            res.status(500).send('Erro ao verificar o login. Por favor, tente novamente.');
        } else {
            if (results.length > 0) {
                res.status(200).send('Login bem-sucedido!');
            } else {
                res.status(401).send('Nome de usuário ou senha incorretos. Tente novamente.');
            }
        }
    });
});

// Rota de cadastro
app.post('/cadastro', (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        res.status(400).send('Nome de usuário e senha são obrigatórios.');
        return;
    }

    // Verifique se o nome de usuário já existe no banco de dados
    const checkSql = 'SELECT * FROM usuarios WHERE nome = ?';
    db.query(checkSql, [nome], (err, results) => {
        if (err) {
            console.error('Erro ao verificar o nome de usuário:', err);
            res.status(500).send('Erro ao verificar o nome de usuário. Por favor, tente novamente.');
        } else {
            if (results.length > 0) {
                res.status(409).send('Nome de usuário já existe. Tente outro nome de usuário.');
            } else {
                // Insira o novo usuário no banco de dados
                const insertSql = 'INSERT INTO usuarios (nome, senha) VALUES (?, ?)';
                db.query(insertSql, [nome, senha], (err) => {
                    if (err) {
                        console.error('Erro ao cadastrar o usuário:', err);
                        res.status(500).send('Erro ao cadastrar o usuário. Por favor, tente novamente.');
                    } else {
                        res.status(201).send('Cadastro realizado com sucesso.');
                    }
                });
            }
        }
    });
});

app.post('/registrar', (req, res) => {
  const { nome, data, quantidadeAgua } = req.body;

  if (!quantidadeAgua && quantidadeAgua !== 0) {
    res.status(400).send('A quantidade de água não pode ser vazia.');
    return;
  }

  const sql = 'INSERT INTO registros (nome, quant_agua, data) VALUES (?, ?, ?)';
  db.query(sql, [nome, quantidadeAgua, data], (err, result) => {
    if (err) {
      console.error('Erro ao inserir os dados no banco de dados:', err);
      res.status(500).send('Erro ao salvar os dados. Por favor, tente novamente.');
    } else {
      console.log('Dados inseridos no banco de dados com sucesso');
      res.status(200).send('Dados salvos com sucesso.');
    }
  });
});

// Rota para recuperar o histórico de consumo de água com base no nome do usuário
app.get('/historico', (req, res) => {
  const nome = req.query.nome; // Obtém o nome do parâmetro da consulta

  if (!nome) {
    res.status(400).send('Por favor, forneça um nome para recuperar o histórico.');
    return;
  }

  const sql = 'SELECT * FROM registros WHERE nome = ?';
  db.query(sql, [nome], (err, results) => {
    if (err) {
      console.error('Erro ao recuperar o histórico:', err);
      res.status(500).send('Erro ao recuperar o histórico. Por favor, tente novamente.');
    } else {
      res.status(200).json(results);
    }
  });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
