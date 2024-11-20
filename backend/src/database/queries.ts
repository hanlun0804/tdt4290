import { database } from './database'
/**
 * Here you can find sql queries for use in index.ts
 * This separation is done to make index.ts easier to read.
 * It also makes it easier to reuse in multiple endpoints
 */



/**
 * Simple functions for getting data
 */

export const getCustomerById = async (id: string) => {
  const db = await database
  return await db.get("SELECT * FROM Customer WHERE id = ?", [id])
}

export const getCustomerByPhone = async (phoneNo: string) => {
  const db = await database
  return await db.all(
    `SELECT * FROM
        Customer WHERE phoneNo LIKE ?`,
    [`%${phoneNo}%`]
  )
}

export const getCustomerBySsn = async (ssn: string) => {
  const db = await database
  return await db.get("SELECT * FROM Customer WHERE socialSecurityNo = ?", [ssn])
}

export const getAccountById = async (id: string) => {
  const db = await database
  const accounts = await db.all(
    `SELECT * FROM 
      Account a
      JOIN AccountOwnership ao ON a.id = ao.account_id
      WHERE ao.customer_id = ?`,
    [id]
  )
  return accounts
}

export const getTransactionsByAccountId = async (accountId: string) => {
  const db = await database
  return await db.all(
    `SELECT * FROM
      AccountTransaction
      WHERE account_id = ?`,
    [accountId]
  )
}

/**
 * More complicated joins etc
 */

export const getTransactionsByCustomerSSN = async (
  socialSecurityNo: string
) => {
  const db = await database
  return await db.all(
    `
      SELECT 
          c.firstName,
          c.lastName,
          c.socialSecurityNo,
          at.date,
          at.amount,
          at.receiverName
      FROM 
          Customer c
      JOIN 
          AccountOwnership ao ON c.id = ao.customer_id
      JOIN 
          Account a ON ao.account_id = a.id
      JOIN 
          AccountTransaction at ON a.id = at.account_id
      WHERE 
          c.socialSecurityNo = ?
      ORDER BY 
          at.date DESC
    `,
    [socialSecurityNo]
  )
}
export const getTransactionsByCustomerPhone = async (phoneNo: string) => {
  const db = await database
  return await db.all(
    `
      SELECT 
          c.firstName,
          c.lastName,
          c.socialSecurityNo,
          at.date,
          at.amount,
          at.receiverName
      FROM 
          Customer c
      JOIN 
          AccountOwnership ao ON c.id = ao.customer_id
      JOIN 
          Account a ON ao.account_id = a.id
      JOIN 
          AccountTransaction at ON a.id = at.account_id
      WHERE 
          c.phoneNo = ?
      ORDER BY 
          at.date DESC
    `,
    [phoneNo]
  )
}

const isValidName = (tableName: string): boolean => {
  return /^[\w\d\s]+$/.test(tableName);
};

export const insertIntoTable = async (tableName: string, data: any) => {
  const db = await database;

  if (!isValidName(tableName)) {
    throw new Error('Invalid table name');
  }

  const columns = Object.keys(data);
  const values = Object.values(data);

  for (const column of columns) {
    if (!isValidName(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
  }

  const placeholders = columns.map(() => '?').join(', ');

  const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

  return await db.run(query, values);
};

export const getSchemaForTable = async (tableName: string) => {
  const db = await database
  const schema = await db.all(`PRAGMA table_info(${tableName})`)
  return schema
}

export const checkIfTableExist = async (tableName: string) => {
  const db = await database
  return await db.get(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    tableName
  )
}

export const selectAllFromTable = async (tableName: string) => {
  const db = await database
  return await db.all(`SELECT * FROM ${tableName}`)
}
