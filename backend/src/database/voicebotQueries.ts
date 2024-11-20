import { database } from './database'

/**
 * These are all the sql queries that the voicebot might need.
 * Depending on the request, find the correct sql query by accessing this map
 *
 */
export const sqlMap: Record<string, any> = {
  last_transaction: getLastTransaction,
  num_of_accounts: numberOfAccounts,
  num_of_cards: numberOfCards,
  num_of_debit_cards: numberOfDebitCards,
  num_of_credit_cards: numberOfCreditCards,
  type_of_accounts: accountTypes,
  customer_relation: customerRelation,
  address: getAddress,
  monthly_payments: montlyPayments,
  num_of_loans: numberOfLoans,
  all_info_about_one_loan: loans,
  type_of_accounts_with_balance: getTypeOfAccountWithBalance
}

/**
 * The following are functions used in the map above.
 */

async function getTypeOfAccountWithBalance(customerId: string) {
  const db = await database
  const res = await db.all(
    `SELECT *
    FROM AccountOwnership AS ao
    JOIN Account ON Account.id = ao.account_id
    WHERE ao.customer_id = ?
    `, [customerId])
  return res
}


async function getLastTransaction(customerId: string) {
  const db = await database
  return await db.get(
    `
    SELECT * FROM 
    AccountOwnership AS ao
    JOIN Account ON ao.account_id = Account.id
    JOIN AccountTransaction ON AccountTransaction.account_id = Account.id
    WHERE ao.customer_id = ?
    ORDER BY AccountTransaction.date DESC
    LIMIT 1
    `,
    [customerId]
  )
}

async function numberOfAccounts(customerId: string) {
  const db = await database
  const res = await db.get(
    `
    SELECT COUNT(*) AS num_of_accounts
    FROM AccountOwnership AS ao
    JOIN Account ON Account.id = ao.account_id
    WHERE ao.customer_id = ?
    `,
    [customerId]
  )
  return res['num_of_accounts']
}

async function numberOfCards(customerId: string) {
  const db = await database
  const res = await db.get(
    `
      SELECT COUNT(*) AS num_of_cards
      FROM AccountOwnership AS ao
      JOIN Account ON Account.id = ao.account_id
      JOIN Card ON Card.account_id = Account.id
      WHERE ao.customer_id = ?
    `,
    [customerId]
  )
  return res['num_of_cards']
}

async function numberOfDebitCards(customerId: string) {
  const db = await database
  const res = await db.get(
    `
      SELECT COUNT(*) AS num_of_debit_cards
      FROM AccountOwnership as ao
      JOIN Account ON Account.id = ao.account_id
      JOIN Card ON Card.account_id = Account.id
      WHERE ao.customer_id = ? AND Card.isDebit = 1
    `,
    [customerId]
  )
  return res['num_of_debit_cards']
}

async function numberOfCreditCards(customerId: string) {
  const db = await database
  const res = await db.get(
    `
      SELECT COUNT(*) AS num_of_credit_cards
      FROM AccountOwnership as ao
      JOIN Account ON Account.id = ao.account_id
      JOIN Card ON Card.account_id = Account.id
      WHERE ao.customer_id = ? AND Card.isDebit = 0
    `,
    [customerId]
  )
  return res['num_of_credit_cards']
}

async function accountTypes(customerId: string) {
  const db = await database
  const res = await db.all(
    `
      SELECT DISTINCT Account.type
      FROM AccountOwnership AS ao
      JOIN Account ON Account.id = ao.account_id
      WHERE ao.customer_id = ? 
    `,
    [customerId]
  )
  return res.map(entry => entry['type'])
}

async function customerRelation(customerId: string) {
  const db = await database
  return await db.all(
    `
    SELECT * FROM CustomerRelation WHERE CustomerRelation.customer_id = ?
    `,
    [customerId]
  )
}

async function getAddress(customerId: string) {
  const db = await database
  const res = await db.get(
    'SELECT address FROM Customer WHERE Customer.id = ?',
    [customerId]
  )
  return res['address']
}

async function montlyPayments(customerId: string) {
  const db = await database
  const res = await db.all(
    `
    SELECT monthlyInstallments 
    FROM AccountOwnership AS ao
    JOIN Account ON Account.id = ao.account_id
    JOIN Loan ON Loan.account_id = Account.id
    WHERE ao.customer_id = ?
    `,
    [customerId]
  )
  return res.map(entry => entry['monthlyInstallments'])
}

async function numberOfLoans(customerId: string) {
  const db = await database
  const res = await db.get(
    `
      Select Count(*) as number_of_loans
      FROM AccountOwnership as ao
      JOIN Account ON Account.id = ao.account_id
      JOIN Loan ON Loan.account_id = Account.id
      WHERE ao.customer_id = ?
    `,
    [customerId]
  )
  return res['number_of_loans']
}

async function loans(customerId: string) {
  const db = await database
  const res = await db.all(
    `
      SELECT * FROM AccountOwnership as ao
      JOIN Account ON Account.id = ao.account_id
      JOIN Loan ON Loan.account_id = Account.id
      WHERE ao.customer_id = ?
    `,
    [customerId]
  )
  return res
}
