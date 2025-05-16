require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const pug = require("pug");
const url = require("url");
const querystring = require("querystring");
const students = require("./Data/student.js");
const { formatFrenchDate } = require("./utils/formatDate.js");

const host = process.env.APP_HOST || "127.0.0.1";
const port = process.env.APP_PORT || 3000;

const renderHome = pug.compileFile("./view/home.pug");
const renderUsers = pug.compileFile("./view/users.pug");

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	const pathname = parsedUrl.pathname;

	if (pathname.startsWith("/assets/")) {
		const filePath = path.join(__dirname, pathname);
		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404);
				return res.end("Fichier non trouvé");
			}
			res.writeHead(200, { "Content-Type": "text/css" });
			res.end(data);
		});
		return;
	}

	if (req.method === "GET" && pathname === "/") {
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		res.end(renderHome({}));
	} else if (req.method === "GET" && pathname === "/users") {
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		const studentsFormatted = students.map((s) => ({
			name: s.name,
			birth: formatFrenchDate(s.birth),
		}));
		res.end(renderUsers({ students: studentsFormatted }));
	} else if (req.method === "POST" && pathname === "/add") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			const parsed = querystring.parse(body);
			const { name, birth } = parsed;

			if (name && birth) {
				students.push({ name, birth });
			}
			res.writeHead(302, { Location: "/users" });
			res.end();
		});
	} else if (req.method === "GET" && pathname === "/delete") {
		const nameToDelete = parsedUrl.query.name;

		const index = students.findIndex((s) => s.name === nameToDelete);
		if (index !== -1) {
			students.splice(index, 1);
		}
		res.writeHead(302, { Location: "/users" });
		res.end();
	} else if (req.method === "GET" && pathname === "/edit") {
		const nameToEdit = parsedUrl.query.name;
		const student = students.find((s) => s.name === nameToEdit);

		if (student) {
			const studentsFormatted = students.map((s) => ({
				name: s.name,
				birth: formatFrenchDate(s.birth),
			}));
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(
				renderUsers({
					students: studentsFormatted,
					editStudent: student,
				})
			);
		} else {
			res.writeHead(302, { Location: "/users" });
			res.end();
		}
	} else if (req.method === "POST" && pathname === "/edit") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			const parsed = querystring.parse(body);
			const { originalName, name, birth } = parsed;

			const student = students.find((s) => s.name === originalName);
			if (student && name && birth) {
				student.name = name;
				student.birth = birth;
			}

			res.writeHead(302, { Location: "/users" });
			res.end();
		});
	} else {
		res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Page non trouvée");
	}
});

server.listen(port, host, () => {
	console.log(`Serveur démarré sur http://${host}:${port}`);
});
