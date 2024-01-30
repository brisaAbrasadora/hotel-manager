const express = require("express");

const Limpieza = require("../models/limpieza");
const Habitacion = require("../models/habitacion");

const router = express.Router();

// GET form
router.get("/nueva/:id", async (req, res) => {
  try {
    const habitacion = await Habitacion.findById(req.params.id).select(
      "numero"
    );
    const fechaActual = new Date();

    res.render("limpiezas_nueva", { habitacion: habitacion, hoy: fechaActual });
  } catch (error) {
    res.render("error", { error: error });
  }
});

// GET all cleanings
router.get("/:id", async (req, res) => {
  try {
    const limpiezas = await Limpieza.find({ idHabitacion: req.params.id }).sort(
      "-fechaHora"
    );
    const numHabitacion = await Habitacion.findById(req.params.id).select(
      "numero"
    );

    // if (limpiezas.length == 0) {
    //   throw Error("No hay limpiezas registradas para esa habitación");
    // }

    res.render("limpiezas_listado", {
      limpiezas: limpiezas,
      habitacion: numHabitacion,
    });
  } catch (error) {
    res.render("error", { error: error });
  }
});

// GET room cleaning
router.get("/:id/estadolimpieza", async (req, res) => {
  try {
    const ultimaLimpieza = await Limpieza.find({ idHabitacion: req.params.id })
      .sort("-fechaHora")
      .limit(1);

    const fecha = ultimaLimpieza[0].fechaHora.toDateString();
    const hoy = new Date().toDateString();

    const estado = fecha === hoy ? "limpia" : "pendiente de limpieza";
    res.status(200).send({ resultado: estado });
  } catch (error) {
    res
      .status(400)
      .send({
        error: "Error obteniendo estado de limpieza",
        mensaje: error.message,
      });
  }
});

// POST new cleaning to a room
router.post("/:id", async (req, res) => {
  try {
    const limpiezaNueva = new Limpieza({
      idHabitacion: req.params.id,
      fechaHora: req.body.fecha,
      observaciones: req.body.observaciones,
    });

    limpiezaNueva.save().then(async () => {
        await fetch(req.headers.origin + "/habitaciones/" + req.params.id + "/ultimaLimpieza", {
            method: 'PUT',
          });
          res.redirect(req.baseUrl + "/" + req.params.id);
    });
  } catch (error) {
    res.render("error", { error: error });
  }
});

module.exports = router;
