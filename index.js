const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const got = require("got")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

const fetch_query = `
    query {
        repository(owner: "IglooCloud", name: "IglooBering") {
            id
            project(number: 2) {
                name
                columns(first: 5) {
                    nodes {
                        id
                        name
                        cards(first: 20, archivedStates: NOT_ARCHIVED) {
                            nodes {
                                id
                                note
                                state
                                updatedAt
                            }
                        }
                    }
                }
            }
            deployments(first: 1, environments: "igloo-production") {
                nodes {
                    updatedAt
                }
            }
        }
    }
`

const move_mutation = cardId => `mutation {
    moveProjectCard(
        input: {
            columnId: "MDEzOlByb2plY3RDb2x1bW40NDUwNzc3" # column to move into
            cardId: "${cardId}"
        }
    ) {
        clientMutationId
    }
}`

app.post("/deployed", async (req, res) => {
    if (req.body.deployment.environment !== "igloo-production") {
        res.send("OK")
        return
    }

    const response = await got("https://api.github.com/graphql", {
        headers: { Authorization: "bearer " + process.env.GITHUB_KEY },
        method: "POST",
        body: JSON.stringify({
            query: fetch_query,
        }),
    })

    const {
        data: {
            repository: {
                id,
                project: {
                    columns: { nodes: columns },
                },
                deployments,
            },
        },
    } = JSON.parse(response.body)

    const updatedAt = deployments.nodes[0].updatedAt
    console.log("Deployed at " + updatedAt)

    const {
        cards: { nodes: cards },
    } = columns.filter(column => column.name === "Done")[0]

    function moveCard(card) {
        if (new Date(card.updatedAt) > new Date(updatedAt)) {
            return got("https://api.github.com/graphql", {
                headers: { Authorization: "bearer " + process.env.GITHUB_KEY },
                method: "POST",
                body: JSON.stringify({
                    query: move_mutation(card.id),
                }),
            })
        } else {
            return Promise.resolve("OK")
        }
    }
    await Promise.all(cards.map(moveCard))

    res.send("ok")
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
