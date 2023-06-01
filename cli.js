import blessed from "blessed";
import * as docs from "./docs.js";

const screen = blessed.screen({
	smartCSR: true,
});

screen.title = "node-wiki";

const box = blessed.box({
	top: "center",
	left: "center",
	width: "80%",
	height: "80%",
	content: "nothing",
	border: { type: "line" }
});

let qListener;
const q = (fn) => {
	qListener = fn;
	screen.key("q", qListener);
}
function freeBox() {
	box.children.forEach((child) => {
		box.remove(child);
	});

	if (qListener) {
		screen.unkey("q", qListener);
	}
}

function renderError(error) {
	freeBox();

	throw new Error("method not implemented");
}

function renderVersionSelect() {
	freeBox();

	const infoText = blessed.text({
		content: "{bold}select a node.js version{/}",
		tags: true,
	});

	const select = blessed.list({
		top: "5%",
		mouse: true,	
		keys: true,
		vi: true,
		style: {
			selected: {
				bg: "red",
			}
		}
	});

	const items = [
		"18.x",
		"20.x",
	];
	select.setItems(items);

	select.on("select", (_, idx) => {
		const version = items[idx];
	
		if (docs.isDocInstalled(version)) {
			renderChooseFile(version);
		} else {
			renderDownloadVersion(version, renderChooseFile);
		}
	});

	box.append(infoText);
	box.append(select);

	q(() => process.exit(0));

	select.focus();
	screen.render();
}

function renderDownloadVersion(version, thenFn) {
	freeBox();
	
	const infoText = blessed.bigtext({
		top: "center",
		left: "center",
		content: "{bold}downloading version...{/}",
	});

	box.append(infoText);
	screen.render();

	docs.downloadDocs(version, true).then((error) => {
		if (error) {
			renderError(error);
			return;
		}

		thenFn(version);
	});
}

function renderChooseFile(version) {
	freeBox();

	const infoText = blessed.text({
		content: "{bold}select a file in the documentation{/}",
		tags: true,
	});

	const select = blessed.list({
		top: "5%",
		mouse: true,	
		keys: true,
		vi: true,
		style: {
			selected: {
				bg: "red",
			}
		}
	});

	const items = docs.listFiles(version);
	select.setItems(items);

	select.on("select", (_, idx) => {
		const file = items[idx];

		renderFileContent(version, file);
	});

	box.append(infoText);
	box.append(select);

	q(() => renderVersionSelect());
	
	select.focus();
	screen.render();
}

export function renderFileContent(version, file) {
	freeBox();

	const content = docs.readDoc(version, file);
	const text = blessed.text({
		alwaysScroll: true,
		scrollable: true,
		keys: true,
		vi: true,
		mouse: true,
		content
	});

	box.append(text);

	q(() => renderChooseFile(version));

	text.focus();
	screen.render();
}

renderVersionSelect();
screen.append(box);

screen.key(["escape"], () => process.exit(0));
screen.render();
