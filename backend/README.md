
# How to run

### Populate the database (OPTIONAL IF tietoevry.db already exist in /backend/src/database/)

1. Navigate to /backend/
2. run command: `npx ts-node src/database/databaseInit.ts`

### Start server 

1. Navigate to /backend/
2. run command: `npm install`
3. run command: `npm install sqlite3`
4. run command: `npm run dev`

## Folder structure

`src/database/` includes code related to database maintenance. The project uses sqlite as database, and no ORM. `databaseInit.ts` will create and populate a database from scratch, should this be necessary. `queries.ts` defines queries used to support the frontend, while `voicebotQueries.ts` support operations by the voicebot. This folder also includes the database itself (`tietoevry.db`). Note that these files are "private" and will be accessed through different endpoints. 

`src/endpoints/` have files that define the different endpoints. There is one file for each of the frontend areas (baffel, cheque-client and userland), and one for the voicebot (`voicebot.ts`). Please try to limit the overlap between these. 

`index.ts` starts an express server using all the endpoints. 