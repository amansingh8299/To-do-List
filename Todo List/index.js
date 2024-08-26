const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TodoTask = require("./models/TodoTask");
dotenv.config();
const app = express();

//mongoose.set("useFindAndModify", false);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.get("/", async (req, res) => {
    try {
        // Use await with find() to get all documents
        const tasks = await TodoTask.find({});
        // Render the view with the tasks data
        res.render("todo.ejs", { todoTasks: tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.route("/edit/:id")
    .get(async (req, res) => {
        const id = req.params.id;
        try {
            // Fetch all tasks and the specific task by ID
            const tasks = await TodoTask.find({});
            const taskToEdit = await TodoTask.findById(id);
            
            if (taskToEdit) {
                res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id, taskContent: taskToEdit.content });
            } else {
                res.status(404).send('Task not found');
            }
        } catch (err) {
            console.error('Error fetching tasks or task to edit:', err);
            res.status(500).send('Internal Server Error');
        }
    })
    .post(async (req, res) => {
        const id = req.params.id;
        try {
            // Update the task with the new content
            const updatedTask = await TodoTask.findByIdAndUpdate(id, { content: req.body.content }, { new: true });
            
            if (updatedTask) {
                res.redirect("/");
            } else {
                res.status(404).send('Task not found');
            }
        } catch (err) {
            console.error('Error updating task:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    app.delete("/tasks/:id", async (req, res) => {
        try {
            const taskId = req.params.id;
            // Use findByIdAndDelete to remove the document
            const result = await TodoTask.findByIdAndDelete(taskId);
            
            if (result) {
                // Task was found and deleted
                res.status(200).send('Task deleted successfully');
            } else {
                // Task not found
                res.status(404).send('Task not found');
            }
        } catch (err) {
            console.error('Error deleting task:', err);
            res.status(500).send('Internal Server Error');
        }
    });
    
app.post('/', async (req, res) => {
    const todoTask = new TodoTask({
        content: req.body.content
    });

    try {
        await todoTask.save();
        res.redirect('/');
    }
    catch (err) {
        console.error('Error saving todo task', err);
        res.redirect('/');
    }
})
app.listen(3000, () => {
    console.log("Server start at port 3000");
})