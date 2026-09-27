const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '.site');
const types = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml'};

http.createServer(async (request, response) => {
	try {
		const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
		if (!pathname.startsWith('/project/')) throw new Error('Outside project');
		const filename = path.resolve(root, pathname.slice('/project/'.length) || 'index.html');
		if (!filename.startsWith(root + path.sep)) throw new Error('Outside fixture');
		const content = await fs.readFile(filename);
		response.writeHead(200, {'content-type': types[path.extname(filename)] || 'application/octet-stream'});
		response.end(content);
	} catch {
		response.writeHead(404);
		response.end('Not found');
	}
}).listen(9294, '127.0.0.1');
