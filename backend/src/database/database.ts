import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

/**
 * This file exports three different tools for database management:
 * 1. A connection to the database itself (called database)
 * 2. A function for creating the tables
 * 3. A set of functions for populating the database with data
 */

/**
 * The database connection itself.
 * Example usage:
 * ```ts
 *  const db = await database
 *  await db.exec(...sql goes here...)
 * ```
 */
export const database = open({
  filename: 'src/database/tietoevry.db',
  driver: sqlite3.Database,
})

/**
 * Create tables in a sqlite database using the specified database model
 * @param db database to initialize
 */
export async function initializeDatabase() {
  const db = await database
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Customer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phoneNo TEXT NOT NULL,
      address TEXT NOT NULL,
      socialSecurityNo TEXT NOT NULL
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Bank (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS CustomerRelation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      fund TEXT NOT NULL,
      eInvoice TEXT NOT NULL,
      bank_id INTEGER,
      customer_id INTEGER,
      FOREIGN KEY (bank_id) REFERENCES Bank(id),   
      FOREIGN KEY (customer_id) REFERENCES Customer(id)
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Account (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      securityCode TEXT NOT NULL,
      balance TEXT NOT NULL,
      monthlySavingsAgreements TEXT NOT NULL,
      type TEXT NOT NULL,
      bank_id INTEGER,
      FOREIGN KEY (bank_id) REFERENCES Bank(id)   
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL,
      expDate TEXT NOT NULL,
      securityCode TEXT NOT NULL,
      status TEXT NOT NULL,
      isDebit INTEGER NOT NULL,
      account_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES Account(id)
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS AccountTransaction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount TEXT NOT NULL,
      receiverName TEXT,
      account_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES Account(id)
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Loan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      amount TEXT NOT NULL,
      originalAmount TEXT NOT NULL,
      monthlyInstallments TEXT NOT NULL,
      type TEXT NOT NULL,
      dateOfPayment TEXT NOT NULL,
      account_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES Account(id)
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS AccountOwnership (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER, 
      customer_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES Account(id),
      FOREIGN KEY (customer_id) REFERENCES Customer(id)
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS AccountOwnership (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER, 
      customer_id INTEGER,
      FOREIGN KEY (account_id) REFERENCES Account(id),
      FOREIGN KEY (customer_id) REFERENCES Customer(id)
    )
  `)
}

/**
 * Clear tables in the database object
 * Must follow our database schema
 * @param db to clear
 */
export async function clearAllTables() {
  const db = await database

  // Disable foreign key constraints temporarily to prevent issues while deleting data
  await db.run('PRAGMA foreign_keys = OFF;')

  // Clear all tables
  await db.run('DELETE FROM Customer;')
  await db.run('DELETE FROM Bank;')
  await db.run('DELETE FROM Account;')
  await db.run('DELETE FROM Card;')
  await db.run('DELETE FROM AccountTransaction;')
  await db.run('DELETE FROM AccountOwnership;')
  await db.run('DELETE FROM Loan;')
  await db.run('DELETE FROM CustomerRelation;')

  // Optionally, reset auto-increment sequences to start from 1
  await db.run('DELETE FROM sqlite_sequence;')

  // Re-enable foreign key constraints
  await db.run('PRAGMA foreign_keys = ON;')
}

/**
 * Insert random data
 * Must follow our database schema
 */
export async function insertRandomData() {
  const db = await database
  // Insert random Customer
  for (let i = 0; i < customerCount; i++) {
    const { firstName, lastName } = generateRandomName()
    const ssn = generateRandomSSN()
    const phoneNo = generateRandomPhoneNo()
    const address = getRandomAddress()
    await db.run(
      `
      INSERT INTO Customer (firstName, lastName, phoneNo, address, socialSecurityNo) VALUES (?, ?, ?, ?, ?)
    `,
      [firstName, lastName, phoneNo, address, ssn]
    )
  }

  // Insert random Bank
  for (const bankName of bankNames) {
    await db.run(
      `
      INSERT INTO Bank (name) VALUES (?)
    `,
      [bankName]
    )
  }

  // Insert random Accounts
  for (let i = 0; i < accountCount; i++) {
    const status = generateRandomStatus()
    const securityCode = generateRandomSecurityCode()
    const balance = generateRandomBalance()
    const bankId = getRandomInt(1, bankNames.length) // Assuming 3 banks
    const agreement = getRandomMonthlySavingsAgreementName()
    const type = getRandomAccountType()

    await db.run(
      `
      INSERT INTO Account (status, securityCode, balance, monthlySavingsAgreements, type, bank_id) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [status, securityCode, balance, agreement, type, bankId]
    )
  }

  // Insert random Cards
  for (let i = 0; i < cardCount; i++) {
    const cardNumber = generateRandomCardNumber()
    const expDate = generateRandomExpDate()
    const securityCode = generateRandomSecurityCode()
    const status = generateRandomStatus()
    const accountId = getRandomInt(1, accountCount) // Assuming 10 accounts
    const isDebit = Math.floor(Math.random() * 2)

    await db.run(
      `
      INSERT INTO Card (number, expDate, securityCode, status, isDebit, account_id) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [cardNumber, expDate, securityCode, status, isDebit, accountId]
    )
  }

  // Insert random Transactions
  for (let i = 0; i < 20; i++) {
    const date = generateRandomDate()
    const amount = generateRandomTransactionAmount()
    const receiverName = generateRandomName().firstName
    const accountId = getRandomInt(1, accountCount) // Assuming 10 accounts
    await db.run(
      `
      INSERT INTO AccountTransaction (date, amount, receiverName, account_id) VALUES (?, ?, ?, ?)
    `,
      [date, amount, receiverName, accountId]
    )
  }

  // Insert random Account Ownerships
  for (let i = 0; i < 10; i++) {
    const accountId = getRandomInt(1, accountCount)
    const customerId = getRandomInt(1, customerCount)
    await db.run(
      `
      INSERT INTO AccountOwnership (account_id, customer_id) VALUES (?, ?)
      `,
      [accountId, customerId]
    )
  }
  
  // Insert random Loan
  //id	startDate	amount	originalAmount	monthlyInstallments	type	dateOfPayment	account_id
  
  for (let i = 0; i < 10; i++) {
    const startDate = generateRandomDate()
    const amount = generateRandomBalance()
    const originalAmount = generateRandomBalance()
    const monthlyInstallments = generateRandomBalance()
    const type = Math.random() > 0.5 ? 'Loan type A' : 'Loan type B'
    const dateOfPayment = generateRandomDate()
    const account_id = getRandomInt(1, accountCount)
    
    await db.run(
      'INSERT INTO Loan (startDate, amount, originalAmount, monthlyInstallments, type, dateOfPayment, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        startDate,
        amount,
        originalAmount,
        monthlyInstallments,
        type,
        dateOfPayment,
        account_id,
      ]
    )
  }

  // Make some random customer relations
  for (let i = 0; i < 10; i++) {
    const startDate = generateRandomDate()
    const fund = generateRandomBalance()
    const eInvoice = Math.random() > 0.5 ? 'yes' : 'no'
    const bankId = getRandomInt(1, bankNames.length)
    const customerId = getRandomInt(1, customerCount)

    await db.run(
      'INSERT INTO CustomerRelation (startDate, fund, eInvoice, bank_id, customer_id) VALUES (?, ?, ?, ?, ?)',
      [startDate, fund, eInvoice, bankId, customerId]
    )
  }
}

/*
 * The following are functions for randomly generating data
 * Define amounts by changing the constants below.
 */

const accountCount = 5
const customerCount = 10
const cardCount = 20

const bankNames = [
  'ZAB Bank',
  'Norwegian Bank',
  'NTNU Banking',
  'Big Financial',
  'Bro Bank',
  'Noscam Europe',
]

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomName(): { firstName: string; lastName: string } {
  const firstNames = [
    'Sondre',
    'Magnus',
    'Nora',
    'Hanna',
    'Karsten',
    'Emiel',
    'Emil',
    'Alex',
    'Gunnar',
    'Anders',
    'Albert',
    'Christine',
    'Lenni',
    'Leo',
    'Lars',
    'Hedda',
    'Amalie',
    'Martine',
  ]
  const lastNames = [
    'Kåreson',
    'den store',
    'depp',
    'Potter',
    'Clinton',
    'Jackson',
    'Lopez',
    'Junior',
    'Senior',
    'Johnson',
    'Flatson',
    'Bigson',
    'Broson',
  ]
  const firstName = firstNames[getRandomInt(0, firstNames.length - 1)]
  const lastName = lastNames[getRandomInt(0, lastNames.length - 1)]
  return { firstName, lastName }
}

function getRandomMonthlySavingsAgreementName(): string {
  const agreementTypes = [
    'Retirement Savings Plan',
    'Education Fund',
    'Vacation Savings',
    'Emergency Fund',
    'Home Renovation Fund',
    'Car Savings Plan',
    'Investment Growth Plan',
    'Health Savings Account',
  ]

  const randomIndex = Math.floor(Math.random() * agreementTypes.length)
  return agreementTypes[randomIndex]
}

function getRandomAccountType(): string {
  const accountTypes = [
    'Checking Account',
    'Savings Account',
    'Money Market Account',
    'Certificate of Deposit (CD)',
    'Individual Retirement Account (IRA)',
    'Brokerage Account',
    'Joint Account',
    'Trust Account',
  ]

  const randomIndex = Math.floor(Math.random() * accountTypes.length)
  return accountTypes[randomIndex]
}

function generateRandomSSN(): string {
  return `${getRandomInt(100000, 999999)}-${getRandomInt(
    10,
    99
  )}-${getRandomInt(1000, 9999)}`
}

function generateRandomPhoneNo(): string {
  return `${getRandomInt(10000000, 99999999)}`
}

function getRandomAddress(): string {
  const streetNames = [
    'Main St',
    'Oak Ave',
    'Pine Dr',
    'Maple Blvd',
    'Cedar Ln',
    'Birch Rd',
    'Elm St',
    'Spruce Ct',
  ]
  const cities = [
    'Springfield',
    'Rivertown',
    'Lakeview',
    'Hilltop',
    'Greendale',
    'Brookside',
    'Fairview',
    'Sunnydale',
  ]
  const states = ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'NV', 'MA']
  const zipCodes = [
    '10001',
    '90210',
    '33101',
    '73301',
    '60601',
    '98101',
    '20001',
    '02108',
  ]

  const streetNumber = Math.floor(Math.random() * 1000) + 1
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const state = states[Math.floor(Math.random() * states.length)]
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)]

  return `${streetNumber} ${streetName}, ${city}, ${state} ${zipCode}`
}

function generateRandomStatus(): string {
  return Math.random() > 0.5 ? 'open' : 'closed'
}

function generateRandomBalance(): string {
  return (Math.random() * 10000).toFixed(2)
}

function generateRandomCardNumber(): string {
  return `${getRandomInt(1000, 9999)} ${getRandomInt(
    1000,
    9999
  )} ${getRandomInt(1000, 9999)} ${getRandomInt(1000, 9999)}`
}

function generateRandomExpDate(): string {
  const month = getRandomInt(1, 12).toString().padStart(2, '0')
  const year = getRandomInt(24, 30)
  return `${month}/${year}`
}

function generateRandomSecurityCode(): string {
  return getRandomInt(100, 999).toString()
}

function generateRandomTransactionAmount(): string {
  return (Math.random() * 1000).toFixed(2)
}

function generateRandomDate(): string {
  const year = 2023
  const month = getRandomInt(1, 12).toString().padStart(2, '0')
  const day = getRandomInt(1, 28).toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
