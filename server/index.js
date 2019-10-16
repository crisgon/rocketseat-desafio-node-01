const express = require("express");
const server = express();

server.use(express.json());
server.listen(3000);

const projects = [];
const requests = {
	count: 0,
	history: []
};

server.use(showApplicationLogs);

function showApplicationLogs(req, _, next) {
	const { method, url } = req;
	console.time("RESPONSE");

	requests.count++;
	requests.history.push(`[${method} - ${url}]`);

	console.log(`REQUEST COUNT: ${requests.count}`);
	console.log(`REQUEST HISTORY: ${requests.history}`);

	next();
	console.timeEnd("RESPONSE");
	console.log(`METHOD: ${method}; URL: ${url};`);
}

function checkIfHasIdOnProjects(req, res, next) {
	const { id } = req.params;
	const index = findProjectIndex(id);

	if (!projects[index]) {
		return res
			.status(400)
			.json({ error: `Não existe um projeto com o id ${id}.` });
	}

	return next();
}

function blockDuplicateIds(req, res, next) {
	const { id } = req.body;
	const index = findProjectIndex(id);

	if (index && projects.length) {
		return res
			.status(400)
			.json({ error: `Já existe um projeto com o id ${id}.` });
	}

	return next();
}

function findProjectIndex(id) {
	return projects.findIndex(project => project.id === id);
}

server.get("/projects", (_, res) => {
	return res.json({ projects });
});

server.get("/projects/:id/tasks", checkIfHasIdOnProjects, (req, res) => {
	const { id } = req.params;
	const index = findProjectIndex(id);

	return res.json({ tasks: projects[index].tasks });
});

server.post("/projects", blockDuplicateIds, (req, res) => {
	const { id, title } = req.body;
	projects.push({ id, title, tasks: [] });

	return res.json({ projects });
});

server.post("/projects/:id/tasks", checkIfHasIdOnProjects, (req, res) => {
	const { id } = req.params;
	const { title } = req.body;
	const index = findProjectIndex(id);

	projects[index].tasks.push(title);

	return res.json({
		message: `A task ${title} foi adicionada com sucesso!`,
		projects
	});
});

server.put("/projects/:id", checkIfHasIdOnProjects, (req, res) => {
	const { id } = req.params;
	const { title } = req.body;
	const index = findProjectIndex(id);

	projects[index].title = title;

	return res.json({
		message: "Titulo editado com sucesso!",
		project: projects[index]
	});
});

server.delete("/projects/:id", checkIfHasIdOnProjects, (req, res) => {
	const { id } = req.params;
	const index = findProjectIndex(id);
	projects.splice(index, 1);

	return res.json({ message: "Projeto deletato com sucesso", projects });
});
