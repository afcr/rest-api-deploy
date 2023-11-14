const express = require('express')
const crypto = require('crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const PORT = process.env.PORT ?? 3000
const app = express()



app.disable('x-powered-by')
app.use(express.json()) //Middleware para no tener que parsear el body a string y pasarlo a jason
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:3000',
            'https://movies.com'
        ]

        if(ACCEPTED_ORIGINS.includes(origin)){
            return callback(null, true)
        }

        if(!origin){
            return callback(null, true)
        }

        if(origin === 'null'){
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
})) //Por defecto es como si fuera * asi que cuidao.

app.get('/movies', (req, res) => {
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin || origin === 'null'){ //Si se pide desde el mismo host donde está la api no trae origins, habría que agregar || !origin al if
    //     res.header('Access-Control-Allow-Origin', origin)
    // }
    
    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id == id)
    if(movie) return res.json(movie)
    res.status(404).json({message: 'Movie not found'})
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
  
    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    const newMovie = {
      id: crypto.randomUUID(), // uuid v4
      ...result.data
    }
  
    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie)
  
    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if(!result.success){
        return res.status(400).json({ error: JSON.parse(result.error.message)})
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex < 0){
        return res.status(404).json({ message: 'Movie not found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie
    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin || origin === 'null'){ //Si se pide desde el mismo host donde está la api no trae origins, habría que agregar || !origin al if
    //     res.header('Access-Control-Allow-Origin', origin)
    // }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex < 0){
        return res.status(404).json({ message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)
    return res.json({ message: 'Movie deleted' })
})

// app.options('/movies/:id', (req, res) => { //Esta opción es para los metodos PUT/PATCH/DELETE
//     const origin = req.header('origin')
//     if(ACCEPTED_ORIGINS.includes(origin) || !origin || origin === 'null'){ 
//         res.header('Access-Control-Allow-Origin', origin)
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
//     }

//     res.sendStatus(200)
// })

app.listen(PORT, () => {
    console.log('The server is watching u')
})

