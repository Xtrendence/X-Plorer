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
const mime = require("mime-types");
const glob = require("glob");
const body_parser = require("body-parser");
const { ipcRenderer } = require("electron");

app.requestSingleInstanceLock();
app.name = "X:/Plorer";

app.on("ready", function() {
	let info = {
		homePath:app.getPath("home")
	};

	const { screenWidth, screenHeight } = screen.getPrimaryDisplay().workAreaSize;

	let windowWidth = 1000;
	let windowHeight = 600;

	if(debugMode) {
		windowWidth += 350;
	}

	const localWindow = new BrowserWindow({
		width:windowWidth,
		minWidth:800,
		maxWidth:1200,
		height:windowHeight,
		minHeight:600,
		maxHeight:800,
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

		localShortcut.register(localWindow,"Command+Q", () => {
			quit = true;
			app.quit();
		});
		
		localShortcut.register(localWindow,"Command+W", () => {
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

	localWindow.webContents.openDevTools();

	localExpress.get("/", (req, res) => {
		res.render("index");
	});

	ipcMain.on("get-info", (error, req) => {
		sendInfo();
	});

	ipcMain.on("get-home-files", (error) => {
		sendFiles(info.homePath);
	});

	ipcMain.on("get-files", (error, req) => {
		let directory = req.toString().trim();
		if(directory !== "") {
			sendFiles(directory);
		}
	});

	function sendInfo() {
		localWindow.webContents.send("get-info", info);
	}

	function sendFiles(directory) {
		fs.readdir(path.resolve(directory), (error, files) => {
			if(error) {
				console.log(error);
			}
			else {
				localWindow.webContents.send("get-files", files);
			}
		});
	}
});

String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
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