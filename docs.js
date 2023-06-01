import asar from "@electron/asar";
import fs from "fs";
import os from "os";
import path from "path";
import { request } from "undici";

export function getDocUrl(version) {
	return `https://raw.githubusercontent.com/avolgha/node-wiki/docs/${version}.asar`;
}

export const docSavePath = path.join(os.homedir(), ".config", "node-wiki");
export function getDocPath(version) {
	return path.join(docSavePath, `${version}.asar`);
}

export function isDocInstalled(version) {
	return fs.existsSync(getDocPath(version));
}

// a returned string represents an error.
export async function downloadDocs(version, force = false) {
	const fpath = getDocPath(version);

	if (isDocInstalled(version)) {
		if (!force) return;

		fs.rmSync(fpath);
	}

	if (!fs.existsSync(docSavePath)) {
		fs.mkdirSync(docSavePath);
	}

	const url = getDocUrl(version);
	const response = await request(url);

	if (response.statusCode !== 200) {
		return `request ended with status code ${response.statusCode} ("${url}")`;
	}

	const body = await response.body.text();
	fs.writeFileSync(fpath, body);

	return null;
}

export function listDownloadedDocs() {
	if (!fs.existsSync(docSavePath)) {
		return [];
	}

	return fs.readdirSync(docSavePath)
		.filter((file) => fs.statSync(file).isFile() && file.endsWith(".asar"))
		.map((file) => file.replace(/\.asar$/g, ""));
}

export function listFiles(version) {
	if (!isDocInstalled(version)) {
		return null;
	}

	return asar.listPackage(getDocPath(version));
}

export function readDoc(version, file) {
	if (!isDocInstalled(version)) {
		return null;
	} else if (!listFiles(version).includes(file)) {
		return null;
	}

	if (file.startsWith("/")) {
		file = file.substring(1);
	}
	
	const content = asar.extractFile(getDocPath(version), file);
	return content.toString();
}
