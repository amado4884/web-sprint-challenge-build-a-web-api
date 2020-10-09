const express = require("express");

const Action = require("../data/helpers/actionModel");
const Project = require("../data/helpers/projectModel");
const router = express.Router();

const defaultResponse = { message: null, data: null };

const validateId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid ID" });
  try {
    const action = await Action.get(id);
    if (!action)
      return res.status(400).json({ message: "No action found with that ID" });
    req.action = action;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

router.get("/", async (req, res) => {
  try {
    const actions = await Action.db;
    return res.status(200).json(actions);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

router.get("/:id", validateId, (req, res) => {
  return res.status(200).json(req.action);
});

router.post("/", async (req, res) => {
  let { project_id, description, notes, completed } = req.body;
  if (!project_id || !description || !notes)
    return res.status(400).json({
      ...defaultResponse,
      message:
        "Please include project_id, description, and notes for the action",
    });

  completed = completed ? !!completed : false;

  try {
    const project = await Project.get(project_id);
    if (!project)
      return res.status(404).json({
        ...defaultResponse,
        message: "There is no project with that id.",
      });

    const action = await Action.insert({
      project_id,
      description,
      notes,
      completed,
    });
    return res.status(200).json({ ...defaultResponse, data: action });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error creating that action.",
    });
  }
});

router.put("/:id", validateId, async (req, res) => {
  const { action } = req;
  const changes = req.body;

  try {
    const updatedAction = await Action.update(action.id, changes);
    if (!updatedAction) throw new Error("Could not update the action");

    return res.status(200).json({ ...defaultResponse, data: updatedAction });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error updating that action.",
    });
  }
});

router.delete("/:id", validateId, async (req, res) => {
  const { id } = req.action;
  try {
    return res.status(200).json(await Action.remove(id));
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error deleting that action.",
    });
  }
});

module.exports = router;
