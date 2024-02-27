import express, { json } from "express";
import { nanoid } from "nanoid";
import { readFile, writeFile } from "node:fs/promises";
import cors from "cors";

const app = express(); //Instancia  de Express

app.use(express.json()); //Instancia  middleware JSON a nuestra aplicación Express.
app.use(cors()); //Permite realizar solicitudes Cross-Origin (CORS)

app.listen(5000, ()=>{
    console.log("Servidor encendido!");
});

// Método para obtener todas las canciones
app.get("/canciones", async (req, res) => {
    try {
        const repertorioData = await readFile("repertorio.json", "utf-8");
        const repertorio = JSON.parse(repertorioData);
        res.status(200).json(repertorio);
    } catch (error) {
        console.error("Error al obtener las canciones", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Método de agregado de canciones
app.post("/canciones", async (req, res) => {
    try {
        const { titulo, artista, tono } = req.body; // Corregido para que coincida con los nombres de las propiedades enviadas desde el cliente

        // Verificar si los datos necesarios están presentes
        if (!titulo || !artista || !tono) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const nuevaCancion = {
            id: nanoid(),
            titulo, // Corregido para que coincida con el nombre enviado desde el cliente
            artista,
            tono
        };

        let repertorio = [];

        try {
            const repertorioData = await readFile("repertorio.json", "utf-8");
            repertorio = JSON.parse(repertorioData);
        } catch (error) {
            console.error("Error al leer repertorio.json", error);
        }

        // Agregar la nueva canción al repertorio
        repertorio.push(nuevaCancion);

        // Escribir el repertorio actualizado en el archivo repertorio.json
        await writeFile("repertorio.json", JSON.stringify(repertorio));

        // Devolver la canción como respuesta
        res.status(201).json(nuevaCancion);
    } catch (error) {
        console.error("Error al agregar nueva canción", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Método para editar una canción por su ID
app.put("/canciones/:id", async (req, res) => {
    const id = req.params.id;
    const { titulo, artista, tono } = req.body; // Cambiado para que coincida con los nombres de las propiedades enviadas desde el cliente

    if (!titulo || !artista || !tono) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        let repertorio = [];
        const repertorioData = await readFile("repertorio.json", "utf-8");
        repertorio = JSON.parse(repertorioData);

        const index = repertorio.findIndex(c => c.id === id);
        if (index !== -1) {
            repertorio[index] = { id, titulo, artista, tono }; // Cambiado para que coincida con los nombres de las propiedades enviadas desde el cliente
            await writeFile("repertorio.json", JSON.stringify(repertorio));
            res.status(200).json({ message: "Canción actualizada exitosamente" });
        } else {
            res.status(404).json({ message: "Canción no encontrada" });
        }
    } catch (error) {
        console.error("Error al editar la canción", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});


// Método para eliminar una canción por su ID
app.delete("/canciones/:id", async (req, res) => {
    const id = req.params.id; // Corregido para obtener el ID correctamente

    // Leer el contenido actual del archivo repertorio.json
    try {
        let repertorio = [];
        const repertorioData = await readFile("repertorio.json", "utf-8");
        repertorio = JSON.parse(repertorioData);

        // Filtrar la canción con el ID proporcionado y actualizar el repertorio
        const cancionesRestantes = repertorio.filter(cancion => cancion.id !== id);

        // Escribir el repertorio actualizado en el archivo repertorio.json
        await writeFile("repertorio.json", JSON.stringify(cancionesRestantes));

        res.status(200).json({ message: "Canción eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar la canción", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});