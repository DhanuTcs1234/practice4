const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
    *
    FROM
    cricket_team
    WHERE
    player_id=${playerId}`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(Player));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayersQuery = `
   INSERT INTO
   cricket_team(player_name,jersey_number,role)
   VALUES
   ('${playerName}','${jerseyNumber}','${role}');`;
  const player = await db.run(postPlayersQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayersQuery = `
   UPDATE
   cricket_team
   set
   player_name='${playerName}',
   jersey_number='${jerseyNumber}',
   role='${role}'
   where
   player_id='${playerId}'`;
  await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `
   delete from
   cricket_team
   where
   player_id='${playerId}'`;
  await db.run(deletePlayersQuery);
  response.send("Player Removed");
});
module.exports = app;
