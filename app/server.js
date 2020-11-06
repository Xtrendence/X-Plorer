const localPort = 2225;
const scriptPath = process.cwd() + "\\server.js";
const debugMode = true;

const electron = require("electron");
const localShortcut = require("electron-localshortcut");
const { app, BrowserWindow, screen, ipcMain, dialog, shell, Menu, globalShortcut } = electron;

const express = require("express");
const localExpress = express();
const localServer = localExpress.listen(localPort, "localhost");

const ip = require("ip");
const os = require("os");
const fs = require("fs");
const path = require("path");
const trash = require("trash");
const mime = require("mime-types");
const glob = require("glob");
const body_parser = require("body-parser");
const { ipcRenderer } = require("electron");

app.requestSingleInstanceLock();
app.disableHardwareAcceleration();
app.name = "X:/Plorer";

app.on("ready", function() {
	let info = {
		port:localPort,
		homePath:app.getPath("home")
	};

	let status = {
		currentPath:info.homePath
	};

	const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workAreaSize;

	let windowWidth = 1000;
	let windowHeight = 600;

	if(debugMode) {
		windowWidth += 260;
	}

	const localWindow = new BrowserWindow({
		width:windowWidth,
		minWidth:800,
		height:windowHeight,
		minHeight:600,
		resizable:true,
		frame:false,
		transparent:false,
		x:80,
		y:80,
		webPreferences: {
			nodeIntegration:true
		}
	});

	// macOS apps behave differently that Windows when it comes to closing an application.
	if(process.platform === "darwin") {
		let quit = true;

		localShortcut.register(localWindow, "Command+Q", () => {
			quit = true;
			app.quit();
		});
		
		localShortcut.register(localWindow, "Command+W", () => {
			quit = false;
			app.hide();
		});

		localWindow.on("close", (e) => {
			if(!quit) {
				e.preventDefault();
				quit = true;
			}
		});
	}

	localExpress.set("views", path.join(__dirname, "views"));
	localExpress.set("view engine", "ejs");
	localExpress.use("/assets", express.static(path.join(__dirname, "assets")));
	localExpress.use(body_parser.urlencoded({ extended:true }));
	localExpress.use(body_parser.json({ limit:"512mb" }));
	
	localWindow.loadURL("http://127.0.0.1:" + localPort);
	localWindow.webContents.setFrameRate(45);
	localWindow.webContents.openDevTools();

	localExpress.get("/", (req, res) => {
		res.render("index");
	});

	ipcMain.on("get-info", (error, req) => {
		sendInfo();
	});

	ipcMain.on("get-home-files", (error) => {
		sendFiles(info.homePath, true);
	});

	ipcMain.on("get-files", (error, req) => {
		let directory = req;
		if(!empty(directory)) {
			sendFiles(directory);
		}
	});

	ipcMain.on("set-window-state", (error, req) => {
		let state = req.toString();
		switch(state) {
			case "closed":
				(process.platform === "darwin") ? app.hide() : app.quit();
				break;
			case "minimized":
				localWindow.minimize();
				break;
			case "maximized":
				if(process.platform === "darwin") {
					localWindow.isFullScreen() ? localWindow.setFullScreen(false) : localWindow.setFullScreen(true);
				}
				else {
					localWindow.isMaximized() ? localWindow.restore() : localWindow.maximize();
				}
				break;		
		}
	});

	function sendInfo() {
		localWindow.webContents.send("get-info", info);
	}

	function sendFiles(directory, initialLaunch) {
		let files = fs.readdirSync(path.resolve(directory));
		let list = {};
		files.map(name => {
			let valid = true;
			let fullPath = path.join(directory, name);
			let isDirectory = false;
			try {
				isDirectory = fs.lstatSync(fullPath).isDirectory();
			}
			catch {
				valid = false;
			}

			let fileInfo = { name:name, isDirectory:isDirectory };
			if(isDirectory) {
				try {
					fileInfo.fileCount = fs.readdirSync(fullPath).length;
				}
				catch {
					valid = false;
				}
			}
			else {
				try {
					fileInfo.size = fs.lstatSync(fullPath).size;
				}
				catch {
					valid = false;
				}
			}
		
			if(valid) {
				list[fullPath] = fileInfo;
			}
		});
		localWindow.webContents.send("get-files", { directory:directory, files:list, initialLaunch:initialLaunch });
		status.currentPath = directory;
	}
});

String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

function empty(string) {
	if(typeof string === "undefined" || string === null || string.toString().trim() === "") {
		return true;
	}
	return false;
}

function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return object;
		}
	}
	catch(e) { }
	return false;
}