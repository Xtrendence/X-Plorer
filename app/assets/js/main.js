document.addEventListener("DOMContentLoaded", () => {
	const electron = require("electron");
	const { ipcRenderer } = electron;

	let info;

	let body = document.getElementsByTagName("body")[0];
	
	let divFilesList = document.getElementsByClassName("files-list")[0];

	if(detectMobile()) {
		body.id = "mobile";
	}
	else {
		body.id = "desktop";
	}

	getInfo();
	getHomeFiles();

	ipcRenderer.on("get-info", (error, res) => {
		info = res;
	});

	ipcRenderer.on("get-files", (error, res) => {
		divFilesList.innerHTML = "";
		res.map(file => {
			divFilesList.innerHTML += '<div class="folder-wrapper"><div class="top"><svg class="folder-icon" viewBox="0 0 101 101" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M33.7361623,1.04316043 L39.5337476,10.1585655 L92.8250395,10.1585655 L92.8250395,39.6071167 L98.9257217,39.6071167 L91.0996902,99.0431604 L9.72102492,99.0431604 L1.21924397,39.6071167 L7.81718653,39.6071167 L7.81718653,1.04316043 L33.7361623,1.04316043 Z M97.3803974,41.1316631 L3.304595,41.1316631 L11.1288474,97.8759678 L89.821937,97.8759678 L97.3803974,41.1316631 Z M33.2725109,1.9082847 L9.01468081,1.9082847 L9.01468081,39.5724079 L13.333349,39.5724079 L13.333349,31.5185005 L14.3814157,31.5185005 L14.3814157,26.2528193 L16.7000838,26.2528193 L16.7000838,20.7930271 L83.3789623,20.7930271 L83.3789623,26.2528193 L85.1045036,26.2528193 L85.1045036,31.5185005 L87.5312985,31.5185005 L87.5312985,39.5724079 L91.8746429,39.5724079 L91.8746429,10.922097 L38.4383672,10.922097 L33.2725109,1.9082847 Z M87.0255397,32.0303244 L13.9252502,32.0303244 L13.9252502,39.5724079 L87.0255397,39.5724079 L87.0255397,32.0303244 Z M84.5601602,27.0642806 L15.2102087,27.0642806 L15.2102087,31.2865028 L84.5601602,31.2865028 L84.5601602,27.0642806 Z M83.2155301,21.4892805 L17.5782293,21.4892805 L17.5782293,26.2670583 L83.2155301,26.2670583 L83.2155301,21.4892805 Z" stroke-width="2"></path></g></svg><svg class="folder-background" viewBox="0 0 115 84" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M96.5,24.8008282 C104.27428,29.8920147 109.475132,34.1575317 112.102556,37.5973794 C114.72998,41.037227 114.72998,45.2309211 112.102556,50.1784617 C109.663448,52.6469336 104.462596,55.9911154 96.5,60.2110073 C88.5374036,64.4308991 79.8405176,68.7741262 70.409342,73.2406886 L54.7887365,80.1586502 C41.0428863,83.8569427 32.1318382,83.8569427 28.0555923,80.1586502 C23.9793463,76.4603578 19.2808311,71.4777888 13.9600468,65.2109433 C5.74279647,54.7889643 1.63417132,47.9024988 1.63417132,44.5515468 C1.63417132,39.5251187 -0.603525227,41.6745084 6.67826077,27.81121 C11.5327848,18.5690111 14.778946,12.3678071 16.4167444,9.20759788 C20.2445536,3.84854719 24.1241696,1.16902185 28.0555923,1.16902185 C31.9870149,1.16902185 36.5792675,1.16902185 41.8323499,1.16902185 C45.3281252,1.10720703 52.1047958,3.22568928 62.1623617,7.52446859 C72.2199275,11.8232479 83.665807,17.5820344 96.5,24.8008282 Z"></path></g><defs><linearGradient id="folder-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:rgb(61,212,219);stop-opacity:1" /><stop offset="25%" style="stop-color:rgb(69,168,199);stop-opacity:1" /><stop offset="60%" style="stop-color:rgb(80,125,182);stop-opacity:1" /><stop offset="100%" style="stop-color:rgb(93,79,156);stop-opacity:1" /></linearGradient></defs></svg></div><div class="bottom"><span class="title">' + file + '</span><span class="subtitle"></span></div></div>';
		});
	});

	function getInfo() {
		ipcRenderer.send("get-info");
	}

	function getHomeFiles() {
		ipcRenderer.send("get-home-files");
	}

	function getFiles(directory) {
		ipcRenderer.send("get-files", directory);
	}
});

// Replace all occurrences in a string.
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

// Detect whether or not the user is on a mobile browser.
function detectMobile() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}