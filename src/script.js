document.addEventListener("DOMContentLoaded", async function () {
    var storageLink = localStorage.getItem("batteryInformationLink");
    if (storageLink) {
        await GetBatteryInformation(storageLink);
    } else {
        createAndFetchBatteryData();
    }

    // TODO:
    // Tomorrow Github (DONE)
    // Send to Github (DONE)
    // Rechecking the code (DONE)
    // Fetch for login (DONE)
    // Store the token in local or session storage (DONE)
    // Request login only when token is expired (DONE)
    // Fix HTML images icons...
});

async function createAndFetchBatteryData() {
    var link = await CreateBatteryInformationLink();

    localStorage.setItem("batteryInformationLink", link);

    await GetBatteryInformation(link);
}
async function CreateBatteryInformationLink() {
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
    var loginInformation = await GetLoginInformation();

    // calculate sign
    var sign = await CalculateSign(loginInformation.salt, loginInformation.secret, loginInformation.token, staticQueryStringObject);

    // sign + salt + token
    variableQueryStringObject.sign = sign;
    variableQueryStringObject.salt = loginInformation.salt;
    variableQueryStringObject.token = loginInformation.token;

    // convert the objects to query string
    var variableQueryString = ConvertObjectToQueryString(variableQueryStringObject);
    var staticQueryString = ConvertObjectToQueryString(staticQueryStringObject);

    var link = url + "?" + variableQueryString + "&" + staticQueryString;

    return link;
}

async function GetLoginInformation() {
    var loginURL =
        "http://8.210.123.202/public/?sign=fd14f1abae92ace3d9cf8b9cc64fa96f52835107&salt=1719343193678&action=authSource&usr=solar+Hashmi&company-key=bnrl_frRFjEz8Mkn&i18n=en_US&lang=en_US&source=1&_app_client_=android&_app_id_=wifiapp.volfw.watchpower&_app_version_=1.4.0.2";

    var response = await fetch(loginURL);
    var data = await response.json();

    var loginInformation = {
        salt: "123456789",
        secret: data.dat.secret,
        token: data.dat.token,
    };

    return loginInformation;
}

// {"err":4,"desc":"ERR_SIGN"}
async function GetBatteryInformation(link) {
    try {
        var response = await fetch(link);
        var data = await response.json();

        if (data.err != 0 || data.desc != "ERR_NONE") {
            console.log("there is an error");
            localStorage.removeItem("batteryInformationLink");
            createAndFetchBatteryData();
        } else {
            document.getElementById("batteryStatus").textContent = getStatusText(data.dat.status);
            document.getElementById("date").textContent = data.dat.date;
            data.dat.bt_status.forEach((item) => {
                if (item.par === "bt_battery_capacity") {
                    document.getElementById("batteryCapacity").textContent = `${item.val} ${item.unit}`;
                } else if (item.par === "battery_active_power") {
                    document.getElementById("activePower").textContent = `${item.val} ${item.unit}`;
                }
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
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
