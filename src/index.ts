// @ts-ignore
import express from "express";
import * as bodyParser from "body-parser";
const app = express();
const port = 3000;

type Piece = {
    color: string;
    position: number;
}

type Player = {
    id: number;
    name: string;
    admin: boolean;
}

type Dices = {
    first: number;
    second: number;
}

type Session = {
    id: number;
    black: Player,
    blackDices: Piece[];
    white: Player,
    whiteDices: Piece[];
    dices: Dices;
    blackTurn: boolean;
}

let players = new Map<number, Player>();
let sessions = new Map<number, Session>();
let playerBusiness = new Map<number, number>();

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello and Welcome!");
});

// Create the sessions
app.post("/matchmaker", (req, res) => {
    console.log(`Creating a new session with the users`);

    const player1 = req.body.user_1;
    const player2 = req.body.user_2;
    if (playerBusiness.has(player1) || playerBusiness.has(player2)) {
        return res.send({error: "players are playing"})
    }
    console.log(req.body.user_1);
    // init the session
    let session: Session = {
        id: sessions.size + 1,
        black: players.get(player1) as Player,
        blackDices: [],
        white: players.get(player2) as Player,
        whiteDices: [],
        dices: {
            first: 2,
            second: 2,
        },
        blackTurn: true,
    };
    sessions.set(sessions.size + 1, session);

    console.log(`Session is`, session);

    return res.send(session);
});

// Roll the dices
app.post("/roll", (req, res) => {
    let sessionId = req.body.session_id;
    let playerId = req.body.player_id;
    let dices: Dices = {
        first: Math.floor( Math.random() * 6 ) +1,
        second: Math.floor(Math.random() * 6) + 1,
    };

    let session = sessions.get(sessionId);
    if (session == undefined) {
        return res.send({error: "no session found"});
    }
    session.dices = dices;
    if (session.black.id == playerId) {
        if (!session.blackTurn) {
            return res.send({error: "not your turn"})
        }
        session.blackTurn = false;
    } else {
        if (session.blackTurn) {
            return res.send({error: "not your turn"})
        }
        session.blackTurn = false;
    }

    sessions.set(sessionId, session);

    return res.send(dices);
})

// Move the piece
app.post("/move", (req, res) => {
    let sessionId = req.body.session_id;
    let playerId = req.body.player_id;
    let from = req.body.from as number;
    let to = req.body.to as number;

    let session = sessions.get(sessionId);
    if (session == undefined) {
        return res.send({error: "no session found"});
    }

    if (session.black.id == playerId) {
        if (!session.blackTurn) {
            return res.send({error: "not your turn"})
        }
        session.blackTurn = false;
    } else {
        if (session.blackTurn) {
            return res.send({error: "not your turn"})
        }
        session.blackTurn = false;
    }

    return res.send({ok: true});
});

app.listen(port, () => {
    players.set(players.size + 1, {id: players.size + 1, name: `user ${players.size + 1}`, admin: false});
    players.set(players.size + 1, {id: players.size + 1, name: `user ${players.size + 1}`, admin: false});
    players.set(players.size + 1, {id: players.size + 1, name: `admin ${players.size + 1}`, admin: true});

    console.log(players);

    console.log(`Example app is running on ${port}`);
})