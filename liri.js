

var keys = require('./logic/keys.js');
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var moment = require('moment-timezone');
var colors = require('colors');
var fs = require('fs');
var master = "Cameron";
var input = process.argv;
var command;
var modifier;
var timestamp = moment().format();
var curTime = String(moment().tz("America/New_York").format("hh:mma"));


function greeting() {
    if (curTime[5] !== "p") {
        console.log("\r\n************************************************************************************\r".bold.grey);
        console.log("Good Morning Cameron, it is ".bold + curTime.bold + ".");
    } else if (curtime[5] === "p" && parseInt(curtime.substring(0, 1)) < 05) {
        console.log("\r\n************************************************************************************\r".bold.grey);
        console.log("Good Afternoon Cameron, it is ".bold + curTime.bold + ".");
    } else {
console.log("\r\n************************************************************************************\r".bold.grey);
        console.log("Good Evening Cameron, it is ".bold + curTime.bold + ".");
    }
};

function myTweets() {
    var client = new Twitter(keys.twitter);
    client.get('statuses/home_timeline', { count: "20" }, function (error, tweets, response) {
        fs.appendFile("./logs/log.txt", "\r\n************************************************************************************\r", 'utf-8', function () { });
        greeting();
        console.log("Here's the latest from your timeline:".bold.red);
        fs.appendFile("./logs/log.txt", "Cameron, here's the latest from your timeline:", 'utf-8', function () { });
        for (var i = 0; i < tweets.length; i++) {
            var tweet = {
                date: tweets[i].created_at.substring(0, 10),
                time: moment(tweets[i].created_at.substring(10, 25), "hh:mm:ss Z").tz("America/New_York").format("hh:mm:ssa"),
                name: tweets[i].user.name,
                handle: "@" + tweets[i].user.screen_name,
                text: tweets[i].text,
                print() {
                    fs.appendFile("./logs/log.txt", "------------------------------------------------------------------------------------", 'utf-8', function () { });
                    fs.appendFile("./logs/log.txt", String(timestamp) + "\r\n", 'utf-8', function () { });
                    console.log("------------------------------------------------------------------------------------".grey);
                    fs.appendFile("./logs/log.txt", String(this.name) + "|" + String(this.handle) + "|" + String(this.date) + "|" + String(this.time) + "\n" + String(this.text), 'utf-8', function () { });
                    console.log(this.name.blue.bold, "|", this.handle.italic, "|", this.date.bold.yellow, this.time.dim, "\n", this.text);
                    fs.appendFile("./logs/log.txt", "------------------------------------------------------------------------------------\r", 'utf-8', function () { });
                    console.log("------------------------------------------------------------------------------------\r".grey);
                }
            };
            tweet.print();
        }
    });
};

function spotifyThisSong(modifier) {
    var info;
    var song;
    if (modifier === undefined || "") {
        console.log("\nOops! You forgot to give me a song!".bold.yellow, "\r\nCheck out this classic, then try again!:".yellow.dim);
        song = "The Sign Ace Of Base";
    } else {
        song = modifier;
    }
    spotify.search({
        type: 'track',
        query: song
    },
        function (e, d) {
            info = {
                artist: d.tracks.items[0].artists[0].name,
                album: d.tracks.items[0].album.name,
                prev: d.tracks.items[0].preview_url,
                name: d.tracks.items[0].name,
                print() {

                    fs.appendFile("./logs/log.txt", "\r-------------------------------------------------------------------------\r\n", 'utf-8', function () { });
                    fs.appendFile("./logs/log.txt", String(timestamp) + "\r\n", 'utf-8', function () { });
                    console.log("-------------------------------------------------------------------------".gray);
                    fs.appendFile("./logs/log.txt", "Track Name: " + String(info.name) + "\r\nArtist: " + String(info.artist) + "\r\nAlbum: " + String(info.album) + "\r\nPreview Link: " + String(info.prev),
                        'utf-8', function () { });
                    console.log("Track Name: ".bold.red, info.name,
                        "\nArtist: ".bold.red, info.artist,
                        "\nAlbum: ".bold.red, info.album,
                        "\nPreview Link: ".bold.red, info.prev.dim.underline
                    );
                    console.log("-------------------------------------------------------------------------".gray);
                }
            }
            info.print();
        });
};

function movieThis(modifier) {
    var info;
    var title;
    if (modifier === undefined || "") {
        console.log("\nOops! You forgot to give me a title!\r\nHere's the info on my favorite movie though, as an example:".bold.yellow);
        title = "The Big Lebowski";
    } else {
        title = modifier;
    }
    var options = {
        url: 'http://www.omdbapi.com/?',
        qs: {
            't': title,
            'type': 'movie',
            'r': 'json',
            'plot': 'full'
        }
    };
    function movieResp(e, response, body) {
        var data = JSON.parse(response.body);
        info = {
            title: String(data.Title),
            year: String(data.Year),
            imdb: String(data.imdbRating),
            meta: String(data.Metascore),
            rtR: String(data.Ratings[1].Value),
            country: String(data.Country),
            lang: String(data.Language),
            plot: String(data.Plot),
            cast: String(data.Actors),
            print() {
                console.log("-------------------------------------------------------------------------");
                greeting();
                console.log("Title: ".bold.red, info.title,
                    "\nRelease Year: ".bold.red, info.year,
                    "\nIMDB Rating: ".bold.red, info.imdb,
                    "\nMetascore: ".bold.red, info.meta,
                    "\nRotten Tomatoes: ".bold.red, info.rtR,
                    "\nCountry: ".bold.red, info.country,
                    "\nLanguage: ".bold.red, info.lang,
                    "\nSynopsis: ".bold.red, info.plot,
                    "\nActors: ".bold.red, info.cast);
                console.log("-------------------------------------------------------------------------");
                fs.appendFile("./logs/log.txt", "\r-------------------------------------------------------------------------\r\n", 'utf-8', function () { });
                fs.appendFile("./logs/log.txt", String(timestamp) + "\r\n", 'utf-8', function () { });
                fs.appendFile("./logs/log.txt", JSON.stringify(info), 'utf-8', function () { }); /* I got lazy... I would make the log more closely match the UI like I did in the other modules... */
            }
        };
        info.print();
    }
    request(options, movieResp);


};

function help() {

};

function doWhat() {
    fs.readFile("./random.txt", "utf-8", function (e, d) {
        command = d.split(',')[0];
        modifier = d.split(',')[1];
        execute(command, modifier);
    });
};

function execute(command, modifier) {
    switch (command) {
        case 'myTweets':
        case 'my-tweets':
            myTweets();
            break;
        case 'spotifyThisSong':
        case 'spotify-this-song':
            spotifyThisSong(modifier);
            break;
        case 'movieThis':
        case 'movie-this':
            movieThis(modifier);
            break;
        case 'doWhatItSays':
        case 'do-what-it-says':
            doWhat();
            break;
        case 'help':
        case 'Help':
        case 'HELP':
            help();
            break;
        default:
            console.log("Hello! I'm LIRI...\n",
                "That's short for Language Interpretation and Recognition Interface\n"
            );

    }
};

function run(input, command, modifier) {
    command = process.argv[2];
    modifier = process.argv[3];
    execute(command, modifier);
};

run();
