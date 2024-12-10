// import express from 'express'
// import db from '../db.js'

// const router = express.Router()


// router.get('/', (req, res) => {
//     const getTodos = db.prepare('SELECT * FROM todos WHERE user_id = ?')
//     const todos = getTodos.all(req.userId)
//     res.json(todos)
// })


// router.post('/', (req, res) => {
//     const { task } = req.body
//     const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
//     const result = insertTodo.run(req.userId, task)

//     res.json({ id: result.lastInsertRowid, task, completed: 0 })
// })


// router.put('/:id', (req, res) => {
//     const { completed } = req.body
//     const { id } = req.params
//     const { page } = req.query

//     const updatedTodo = db.prepare('UPDATE todos SET completed = ? WHERE id = ?')
//     updatedTodo.run(completed, id)

//     res.json({ message: "Todo completed" })
// })


// router.delete('/:id', (req, res) => {
//     const { id } = req.params
//     const userId = req.userId
//     const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
//     deleteTodo.run(id, userId)
    
//     res.send({ message: "Todo deleted" })
// })

// export default router



import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
    try {
        const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`)
        const todos = getTodos.all(req.userId)  
        res.json(todos)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Error fetching todos' })
    }
})

router.post('/', (req, res) => {
    const { task } = req.body
    
    if (!task) {
        return res.status(400).json({ message: 'Task is required' })
    }

    try {
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        const result = insertTodo.run(req.userId, task)
        
        res.status(201).json({ 
            id: result.lastInsertRowid, 
            task, 
            completed: 0,
            user_id: req.userId 
        })
    } catch (err) {
        console.error(err.message)
        res.status(503).json({ message: 'Error adding todo' })
    }
})

router.put('/:id', (req, res) => {
    const { completed } = req.body
    const { id } = req.params

    if (completed === undefined) {
        return res.status(400).json({ message: 'Completed status is required' })
    }

    try {
        const checkTodo = db.prepare(`SELECT * FROM todos WHERE id = ? AND user_id = ?`)
        const existingTodo = checkTodo.get(id, req.userId)

        if (!existingTodo) {
            return res.status(404).json({ message: 'Todo not found' })
        }

        const updateTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?`)
        const result = updateTodo.run(completed, id, req.userId)

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Todo not found or no changes made' })
        }

        res.json({ 
            message: "Todo updated", 
            id, 
            completed 
        })
    } catch (err) {
        console.error(err.message)
        res.status(503).json({ message: 'Error updating todo' })
    }
})

router.delete('/:id', (req, res) => {
    const { id } = req.params

    try {
        const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
        const result = deleteTodo.run(id, req.userId)

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Todo not found' })
        }

        res.json({ message: "Todo deleted", id })
    } catch (err) {
        console.error(err.message)
        res.status(503).json({ message: 'Error deleting todo' })
    }
})

export default router