// ==UserScript==
// @name         Twitch Vod Local Timestamps
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add local time the content was streamed at to the twitch vod
// @author       El Bad#5788
// @match        https://www.twitch.tv/*
// @grant        none
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js


// ==/UserScript==
var css=`
.tsSpan{
padding-left:4px;
}
`;

(function($) {
$(document).ready(function(){
$.noConflict();
function addCSS(cssRules){
    $('head').append('<style type="text/css">' + cssRules + '</style>');
}addCSS(css);

console.log("RUNNING Twitch Vod Local Timestamps");

var storedAccessToken = localStorage.getItem('storedAccessToken');
var authURL = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=v2bd4gbgdfyveh1khra6i1imuv5e4r&redirect_uri=' + window.location + '&scope=viewing_activity_read+openid';
var hash = window.location.hash;
var $spacer = '<span class="tsSpan"> • </span>';

function begin(){
    if(window.location.href.match(/.*\/videos\/.+/g)){
        startTimestamps();
    }else{
        var checkVideosPage = setInterval(function(){
            if(window.location.href.match(/.*\/videos\/.+/g)){
                clearInterval(checkVideosPage);
                startTimestamps();
            }
        }, 2000);
    }
}
begin();

function startTimestamps(){
    if(hash.length > 0 && hash.includes('access_token')){
        var accessToken = window.location.hash.split('access_token=')[1];
        accessToken = accessToken.split('&')[0];
        localStorage.setItem('storedAccessToken', accessToken);
    }

    if(storedAccessToken !== null && storedAccessToken !== undefined){
        setTimeout(main, 2000);
    }else{
        setTimeout(authorize, 4000);
    }
}

function main(){
    let vidID = window.location.href.split('/')[window.location.href.split('/').length - 1]
    vidID = vidID.split('?')[0];
    $.ajax({
        url: 'https://api.twitch.tv/helix/videos?id=' + vidID,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + storedAccessToken);
            xhr.setRequestHeader('Client-Id', 'v2bd4gbgdfyveh1khra6i1imuv5e4r');
        },
        data: {},
        success: videoApiSuccess,
        error: function (err) { console.log('error accessing twitch api for video'); console.log(err); authorize();},
    });
}

function authorize(){
    var $authLink = '<span class="tsSpan"><a href="' + authURL + '">AUTHENTICATE Twitch Vod Local Timestamps Script</a><span>'
    $(".timestamp-metadata__bar").eq(0).parent().append($spacer);
    $(".timestamp-metadata__bar").eq(0).parent().append($authLink);
}

function videoApiSuccess(response){
    var $currTimeDisplay = '<span id="currLocalTime" class="tsSpan"><span>';
    let data = response.data[0]
    let utcTime = data.created_at;
    var createdAtDate = new Date(utcTime);

    var updateTimeInterval = setInterval(function(){
        let seekTime = $("[data-a-target='player-seekbar-current-time']").eq(0).html()
        if(seekTime){
            let seekSeconds = hmsToSeconds(seekTime);
            let currDateTime = new Date(createdAtDate);
            currDateTime.setSeconds(createdAtDate.getSeconds() + seekSeconds );
            let currTime = moment(currDateTime).format('M/DD/YY - h:mm:ss A');
            if($('#currLocalTime').length === 0){
                $(".timestamp-metadata__bar").eq(0).parent().append($spacer);
                $(".timestamp-metadata__bar").eq(0).parent().append($currTimeDisplay);
            }
            $('#currLocalTime').html(currTime);
        }
        if(!window.location.href.match(/.*\/videos\/[0-9].+/g)){
            clearInterval(updateTimeInterval);
            begin();
        }
    },500);
}

function hmsToSeconds(hms){
    var a = hms.split(':');
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
}

});//doc.ready
})(jQuery);