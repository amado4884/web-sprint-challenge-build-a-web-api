const express = require("express");
const { projectToBody } = require("../data/helpers/mappers");

const Project = require("../data/helpers/projectModel");
const router = express.Router();

const defaultResponse = { message: null, data: null };

const validateId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Invalid ID" });
  try {
    const project = await Project.get(id);
    if (!project)
      return res.status(400).json({ message: "No project found with that ID" });
    req.project = projectToBody(project);
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

router.get("/", async (req, res) => {
  try {
    const projects = await Project.db;
    return res
      .status(200)
      .json(projects.map((project) => projectToBody(project)));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

router.get("/:id", validateId, async (req, res) => {
  return res.status(200).json(req.project);
});

router.post("/", async (req, res) => {
  let { name, description, completed } = req.body;
  if (!name || !description)
    return res.status(400).json({
      ...defaultResponse,
      message: "Please include a name and description for the project",
    });

  completed = completed ? !!completed : false;

  try {
    const project = await Project.insert({ name, description, completed });
    return res.status(200).json({ ...defaultResponse, data: project });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error creating that project.",
    });
  }
});

router.put("/:id", validateId, async (req, res) => {
  const { project } = req;
  const changes = req.body;

  try {
    const updatedProject = await Project.update(project.id, changes);
    if (!updatedProject) throw new Error("Could not update the project");

    return res.status(200).json({ ...defaultResponse, data: updatedProject });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error updating that project.",
    });
  }
});

router.delete("/:id", validateId, async (req, res) => {
  const { id } = req.project;
  try {
    return res.status(200).json(await Project.remove(id));
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ...defaultResponse,
      message: "There was an error deleting that project.",
    });
  }
});

module.exports = router;
