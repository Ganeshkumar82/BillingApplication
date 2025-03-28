const config = require("./config");
const mysql = require("mysql2/promise");
const pool = mysql.createPool(config.db);

const pool1 = mysql.createPool(config.db1);

async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result;
  } catch (er) {
    console.log(`Error while executing the query ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function spcall(sql, params) {
  const connection = await pool.getConnection();
  try {
    const result = await connection.query(sql, params);
    return result;
  } catch (er) {
    console.log(`Error ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function query1(sql, params) {
  const connection = await pool1.getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result;
  } catch (er) {
    console.log(`Error while executing the query ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function spcall1(sql, params) {
  const connection = await pool1.getConnection();
  try {
    const result = await connection.query(sql, params);
    return result;
  } catch (er) {
    console.log(`Error ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

module.exports = {
  query,
  spcall,
  query1,
  spcall1,
};
