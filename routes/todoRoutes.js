// routes/todoRoutes.js
import express from 'express';
import db from '../index.js';
import bodyParser from 'body-parser';

const router = express.Router();

router.get("/getItemData", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM todoItems ORDER BY id ASC");
        const todos = result.rows;
        console.log("rows, fetched");
        res.json(todos).status(200);
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).send("Error loading todo list");
    }
});
router.post("/addNewItem", async (req, res) => {
    try {
        const result = await db.query("\
             INSERT INTO todoItems (description, status)\
             VALUES ($1, $2) RETURNING id, description, status", [' ', false]);
        const todos = result.rows[0];
        console.log("item added");
        res.json(todos).status(200);
    } catch (error) {
        console.error("Error adding todos:", error);
        res.status(500).send("Error adding new todo list item");
    }
});

router.post("/storeItem", async (req, res) => {
  try {
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).send("Invalid data format");
    }

    for (const item of items) {
      const id = parseInt(item.id);
      const description = item.description;
      const status = item.status;

      if (isNaN(id)) {
        console.warn(`Skipping invalid item with id: ${item.id}`);
        continue;
      }

      await db.query(`
        UPDATE todoItems
        SET description = $1, status = $2
        WHERE id = $3
      `, [description, status, id]);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving todos:", error);
    res.status(500).send("Error saving todo list");
  }
});

router.delete("/deleteListItem", async (req, res)=>{
    try {
    const id = parseInt(req.body.id);
        await db.query("\
            DELETE FROM todoItems \
            WHERE id = $1",
            [id]);
        console.log("rows, deleted");
        res.sendStatus(200);
    } catch (error) {
        console.error("Error deleting todos:", error);
        res.sendStatus(500).send("Error deleting todo list");
    }
});

export default router; 
