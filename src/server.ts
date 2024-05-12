import express from "express";
import "express-async-errors";
import morgan from "morgan";
import dotenv from "dotenv";
import Joi from "joi";

const app = express();
const createPlanetSchema = Joi.object({
  name: Joi.string().required().trim(),
});
const updatePlanetSchema = Joi.object({
  name: Joi.string().trim(),
});
dotenv.config();
const PORT = process.env.port || 3000;

app.use(morgan("dev"));
app.use(express.json());

type Planet = {
  id: number;
  name: string;
};

type Planets = Planet[];

let planets: Planets = [
  {
    id: 1,
    name: "Earth",
  },
  {
    id: 2,
    name: "Mars",
  },
];

app.get("/api/planets", (req, res) => {
  res.status(200).json(planets);
});

app.get("/api/planets/:id", (req, res) => {
  const { id } = req.params;
  const { error } = Joi.number().required().validate(id);
  if (error) {
    return res.status(400).json({ error: error.details[0].message }); // Bad request
  }
  const planet = planets.find((planet) => planet.id === Number(id));
  if (!planet) {
    return res.status(404).json({ error: "Planet not found" }); // Not found
  }

  res.status(200).json(planet);
});

app.post("/api/planets", (req, res) => {
  const { error } = createPlanetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message }); // Bad request
  }

  const newId = Math.max(...planets.map((p) => p.id)) + 1;

  const newPlanet = {
    id: newId,
    name: req.body.name,
  };

  planets = [...planets, newPlanet];
  res.status(201).json({ msg: "The planet was created." });
});

app.put("/api/planets/:id", (req, res) => {
  const { id } = req.params;
  const { error } = Joi.object({
    id: Joi.number().required().validate(id),
    name: updatePlanetSchema,
  }).validate(req.params, { allowUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const planetIndex = planets.findIndex((p) => p.id === Number(id));
  if (planetIndex === -1) {
    return res.status(404).json({ error: "Planet not found" });
  }

  planets[planetIndex] = { ...planets[planetIndex], ...req.body };
  res.status(200).json({ msg: "Planet was updated." });
});

app.delete("/api/planets/:id", (req, res) => {
  const { id } = req.params;
  planets = planets.filter((p) => p.id !== Number(id));
  const { error } = Joi.number().required().validate(id);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  console.log(planets);
  res.status(200).json({ msg: "Planet was deleted." });
});

app.listen(PORT, () => {
  console.log(`My server, listening to http://localhost:3000/api/planets`);
});
