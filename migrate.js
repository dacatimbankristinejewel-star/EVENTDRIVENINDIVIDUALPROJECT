import { Sequelize } from "sequelize";
import inquirer from "inquirer";
import { databaseName, sequelize } from "./models/db.js";
import "./models/userModel.js";

const { createDb } = await inquirer.prompt([
  {
    type: "confirm",
    name: "createDb",
    message: `Create database '${databaseName}' if it does not exist?`,
    default: true,
  },
]);

let serverConnection;
try {
  if (createDb) {
    serverConnection = new Sequelize(
      "mysql",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        dialect: "mysql",
        logging: false,
      },
    );
    const escapedDatabaseName = databaseName.replace(/`/g, "``");
    await serverConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${escapedDatabaseName}\`;`,
    );
    console.log(`Database '${databaseName}' is ready.`);
  }

  await sequelize.authenticate();
  await sequelize.sync();
  console.log("Database tables are ready.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await serverConnection?.close();
  await sequelize.close();
}
