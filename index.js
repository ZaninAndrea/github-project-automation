const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.post("deployed", async (req, res) => {
    console.log(req.body)
    res.send("ok")
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
