document.addEventListener("DOMContentLoaded", async function () {
    var url = "http://8.210.123.202/public/";

    var variableQueryStringObject = {
        sign: "",
        salt: "",
        token: "",
    };

    var staticQueryStringObject = {
        action: "webQueryDeviceEnergyFlowEs",
        pn: "W0027105756807",
        sn: "96322210500203",
        devaddr: "1",
        devcode: "2451",
        i18n: "en_US",
        lang: "en_US",
        source: "1",
    };

    // login information
    var salt = "123456789";
    var secret = "a66ee2473d32f177f7421c85426b33861efd1f93";
    var token = "9783152367911fcfbb6574fe4faade391b60f8ae2225aae42a97b0ad06e4e0a6";

    // calculate sign
    var sign = await CalculateSign(salt, secret, token, staticQueryStringObject);

    // sign + salt + token
    variableQueryStringObject.sign = sign;
    variableQueryStringObject.salt = salt;
    variableQueryStringObject.token = token;

    // convert the objects to query string
    var variableQueryString = ConvertObjectToQueryString(variableQueryStringObject);
    var staticQueryString = ConvertObjectToQueryString(staticQueryStringObject);

    var link = url + "?" + variableQueryString + "&" + staticQueryString;

    GetDataInformation(link);

    // TODO:
    // Tomorrow Github (DONE)
    // Send to Github (DONE)
    // Rechecking the code (DONE)
    // Fetch for login
    // Fix HTML images icons...
});

function GetDataInformation(link) {
    fetch(link)
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("batteryStatus").textContent = getStatusText(data.dat.status);
            document.getElementById("date").textContent = data.dat.date;
            data.dat.bt_status.forEach((item) => {
                if (item.par === "bt_battery_capacity") {
                    document.getElementById("batteryCapacity").textContent = `${item.val} ${item.unit}`;
                } else if (item.par === "battery_active_power") {
                    document.getElementById("activePower").textContent = `${item.val} ${item.unit}`;
                }
            });
        })
        .catch((error) => console.error("Error fetching data:", error));
}

function getStatusText(statusCode) {
    switch (statusCode) {
        case 0:
            return "Offline";
        case 1:
            return "Starting";
        case 2:
            return "Normal";
        case 3:
            return "Fault";
        case 4:
            return "Standby";
        default:
            return "Unknown";
    }
}

async function GetSHA1Value(str) {
    const buffer = new TextEncoder("utf-8").encode(str);
    const digest = await crypto.subtle.digest("SHA-1", buffer);

    // Convert digest to hex string
    const result = Array.from(new Uint8Array(digest))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");

    return result;
}

function ConvertObjectToQueryString(object) {
    var queryString = new URLSearchParams(object).toString();
    return queryString;
}

async function CalculateSign(salt, secret, token, staticQueryStringObject) {
    // calculate sign = SHA-1 (salt + secret + token + "&action=...");
    var staticQueryString = "&" + ConvertObjectToQueryString(staticQueryStringObject);
    return await GetSHA1Value(salt + secret + token + staticQueryString);
}
