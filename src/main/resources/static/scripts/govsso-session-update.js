var sessionLengthInSeconds;
var sessionTimer;
var timeout;
var anotherPageOpen = false;

$(window).on('load', function() {
    if (!anotherPageOpen) {
        sessionLengthInSeconds = $("#updateTimer").text();
        timeout = setTimeout(autoUpdateGovSsoSession, sessionLengthInSeconds * 1000);
        sessionTimer = setInterval(incrementSeconds, 1000);
    } else {
        $("#updateTimer").hide();
        $("#updateToggle").hide();
    }
});

function updateGovSsoSession() {
    $("#updateButton").prop("disabled",true);
    const csrfToken = $("meta[name='_csrf']").attr("content");
    const csrfHeader = $("meta[name='_csrf_header']").attr("content");
    (async () => {
        await fetch('/oauth2/refresh/govsso', {
            method: 'POST',
            headers: {
                [csrfHeader]: csrfToken,
            },
            redirect: "manual"
        }).then(async function (response) {
            if (response.ok) {
                const idToken = await response.json();

                $("#id_token").text(idToken.id_token);
                $("#jti").text(idToken.jti);
                $("#iss").text(idToken.iss);
                $("#aud").text(idToken.aud);
                $("#exp").text(idToken.exp);
                $("#iat").text(idToken.iat);
                $("#sub").text(idToken.sub);
                $("#birthdate").text(idToken.birthdate);
                $("#given_name").text(idToken.given_name);
                $("#family_name").text(idToken.family_name);
                $("#amr").text(idToken.amr);
                $("#nonce").text(idToken.nonce);
                $("#acr").text(idToken.acr);
                $("#at_hash").text(idToken.at_hash);
                $("#sid").text(idToken.sid);
                $("#error").hide();

                if (!anotherPageOpen) {
                    sessionLengthInSeconds = idToken.time_until_session_refresh_in_seconds;
                    clearInterval(sessionTimer);
                    sessionTimer = setInterval(incrementSeconds, 1000);
                    clearTimeout(timeout);
                    timeout = setTimeout(autoUpdateGovSsoSession, sessionLengthInSeconds * 1000);
                }

                $("#error").hide();
                $("#updateButton").prop("disabled",false);
            } else {
                $("#error").show();
                $("#error").text('Error updating GovSSO session. Refresh token is expired. Retrying.');
                clearTimeout(timeout);
                timeout = setTimeout(autoUpdateGovSsoSession, 5 * 1000);
            }
        }).catch((error) => {
            $("#error").show();
            $("#error").text('Error updating GovSSO session: ' + error.message + ' Retrying.');
            clearTimeout(timeout);
            timeout = setTimeout(autoUpdateGovSsoSession, 5 * 1000);
        });
    })();
}

function incrementSeconds() {
    if (sessionLengthInSeconds >= 0) {
        sessionLengthInSeconds -= 1;
        $("#updateTimer").text(sessionLengthInSeconds);
    } else {
        clearInterval(sessionTimer);
    }
}

function autoUpdateGovSsoSession() {
    if($('#autoUpdate').prop("checked")) {
        updateGovSsoSession();
    }
}

localStorage.openpages = Date.now();
var onLocalStorageEvent = function(e){
    if(e.key == "openpages"){
        localStorage.page_available = Date.now();
    }
    if(e.key == "page_available"){
        anotherPageOpen = true;
    }
};
window.addEventListener('storage', onLocalStorageEvent, false);