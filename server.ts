import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const VEHICLES_FILE = path.join(__dirname, "vehicles.json");

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/vehicles", (req, res) => {
    try {
      const data = fs.readFileSync(VEHICLES_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read vehicles" });
    }
  });

  app.post("/api/vehicles", (req, res) => {
    try {
      const data = fs.readFileSync(VEHICLES_FILE, "utf-8");
      const vehicles = JSON.parse(data);
      const newVehicle = { ...req.body, id: Date.now().toString() };
      vehicles.push(newVehicle);
      fs.writeFileSync(VEHICLES_FILE, JSON.stringify(vehicles, null, 2));
      res.status(201).json(newVehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to save vehicle" });
    }
  });

  app.put("/api/vehicles/:id", (req, res) => {
    try {
      const data = fs.readFileSync(VEHICLES_FILE, "utf-8");
      let vehicles = JSON.parse(data);
      const index = vehicles.findIndex((v: any) => v.id === req.params.id);
      if (index !== -1) {
        vehicles[index] = { ...vehicles[index], ...req.body };
        fs.writeFileSync(VEHICLES_FILE, JSON.stringify(vehicles, null, 2));
        res.json(vehicles[index]);
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", (req, res) => {
    try {
      const data = fs.readFileSync(VEHICLES_FILE, "utf-8");
      let vehicles = JSON.parse(data);
      vehicles = vehicles.filter((v: any) => v.id !== req.params.id);
      fs.writeFileSync(VEHICLES_FILE, JSON.stringify(vehicles, null, 2));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
