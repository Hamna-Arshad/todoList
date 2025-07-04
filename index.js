import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// db connection
const db = new pg.Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use("/", todoRoutes);
db.connect();
// get box information
async function getBoxColor() {
    try {
        const result = await db.query("SELECT id, color FROM box");
        result.rows.forEach(box => {
            console.log(box.id, box.color);
        });
        return result.rows;
    } catch (err) {
        console.error("Error fetching boxes:", err);
        return [];
    }
}

app.get("/", async (req, res) => {
    try {
        const boxes = await getBoxColor();
        res.render("index.ejs", { boxes });
        res.status(200);
    } catch (error) {
        console.error("Error loading homepage!", error);
        res.sendStatus(400);

    }

});

//gets all boxes to load
app.get("/api/boxes", async (req, res) => {
    try {
        const result = await db.query("SELECT id, color, title, content FROM box ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching boxes:", err);
        res.status(500).json({ error: "Failed to fetch boxes" });
    }
});

//add box
app.post("/addbox", async (req, res) => {
    try {
        const color = req.body.color;
        const title = req.body.title;
        const content = req.body.content;
        const result = await db.query("INSERT INTO box (color, title, content) VALUES ($1, $2, $3)\
             RETURNING id, color, title, content", [color, title, content]);
        const newBox = result.rows[0];
        res.status(201).json(newBox);
    } catch (err) {
        console.error("Error adding box:", err);
        res.status(500).send("Failed to add box");
    }
});

//delete box
app.delete("/deletebox", async (req, res) => {
    try {
        console.log("delete called");
        const id = req.body.id;
        await db.query("DELETE FROM box WHERE id = $1", [id]);
        res.status(200).json({ message: "Box deleted successfully" });

    } catch (err) {
        console.error("Error deleting box", err);
    }
});

//update color
app.post("/updateColor", async (req, res) => {
    const color = req.body.color;
    const id = parseInt(req.body.id);
    console.log("Color", color);
    console.log("id: ", id);
    if (!color || isNaN(id)) {
        return res.status(400).send("Missing color or invalid id");
    }

    try {
        await db.query("UPDATE box SET color = $1 WHERE id = $2", [color, id]);
        res.sendStatus(200);

    } catch (err) {
        console.error("Error updating color:", err);
        res.status(500).send("Failed to update color");
    }
});

//save box content
app.post("/save", async (req, res) => {
    const id = parseInt(req.body.id);
    const title = req.body.title;
    const content = req.body.content;
    try {
        await db.query("UPDATE box SET title = $1, content = $2 WHERE id = $3;", [title, content, id]);
        res.sendStatus(200);
    } catch (err) {
        console.error("Error saving data:", err);
        res.status(500).send("Failed to save data");
    }
});

app.get("/todoList", (req, res) => {
    try {
        console.log("todo page loaded!");
        res.render("todopage");
    } catch (error) {
        console.error("Error loading todo page!", error);
        res.sendStatus(400);
    }
});

// listen
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default db;