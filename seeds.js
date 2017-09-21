var mongoose = require("mongoose")

var Campground = require("./models/campground")
var Comment = require("./models/comment")
var User = require("./models/user")

var conn = mongoose.connection;

var seedData = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Bacon ipsum dolor amet shank tenderloin kevin venison alcatra bacon. Biltong venison prosciutto, sirloin kevin cupim alcatra tongue brisket. Salami pork loin cupim biltong fatback pig venison shoulder bacon tail drumstick. Tail short ribs chuck pork beef pork loin kevin meatloaf.",
        author: "Cloud",
        comments: [
            {author: "Homer", text: "This place is great, but lacks internet"},
            {author: "CampingMomma", text: "Awesome place! Very kid friendly! Don't bring your dog!"},
            {author: "DogLuvr123", text: "Dogs are fine, campground has lots of whiney dog haterzzz"},
            {author: "QuasiStud767", text: "Chicks really dig this place!"},
        ]
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5694/21041875770_ffea6404d0.jpg",
        description: "Frankfurter fatback pork chop, cow short ribs meatball boudin shankle short loin venison. Shoulder kielbasa shankle ground round. Ribeye short ribs meatloaf burgdoggen. Short ribs filet mignon kielbasa capicola. Alcatra ball tip brisket pork chop pastrami, turkey ribeye. Pork loin jowl ham hock, shoulder ball tip spare ribs tail rump strip steak. Meatloaf ground round cupim picanha capicola prosciutto.",
        author: "StanleyWringer111",
        comments: [
            {author: "PeachyMomma5567", text: "Tried to get in last weekend but was booked full :("},
            {author: "LadiesMan513", text: "Was going to go here this week but got interrupted by gigantic fighting robots."},
        ]
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Pork chop ribeye fatback chuck bresaola cupim shank sausage t-bone andouille turkey capicola. Filet mignon beef landjaeger ham sirloin porchetta. Swine shank corned beef pancetta, burgdoggen ribeye ham kevin pork belly strip steak meatball beef pig doner jowl. Cow capicola bacon jowl strip steak biltong turkey ground round pork belly. Capicola turkey filet mignon, ham burgdoggen prosciutto ribeye kevin ham hock. Brisket cupim pastrami shank ham hock cow swine jowl. Ham cupim cow andouille landjaeger ball tip pancetta rump boudin shank prosciutto ribeye.",
        author: "MoonDumpling",
        comments: [
            {author: "Cloud", text: "Great place to stop and save yourself. Not much MATERIA here though."},
            {author: "Sonic", text: "No coins. Sad."},
            {author: "Tails", text: "Too many hedgehogs >:("},
            {author: "ParkerPeterson1245", text: "Mutant ticks invaded my tent while I was sleeping. Thankfully my spidey sense woke me up in time to battle them off."},
            {author: "HulkHoganFan667", text: "Not enough wrasslin by the folks campin here. Tore my teeshirt off ten times anyways. Good fun!"},
            {author: "MoonDumpling", text: "Can't sleep here. Too many magnetic resonances interfering with my Chakra."},
            {author: "BatFlame9232", text: "Parked by batmobile near a cliff, forgot to set the parking brake. Had to call my bat-copter in to retrieve it. Campground was nice. Lots of bats at night."},
        ]
    }
]

function upsertUser(username) {
    return User.findOne({username: username}).exec().then((user) => {
        if (user) {
            console.log("Found user " + user.username)
            return user
        }
        return new Promise((resolve, reject) => {
            User.register(new User({username: username}), "password", (error, user) => {
                if (error) {
                    reject(error)
                } else {
                    console.log("Created new user " + user.username)
                    resolve(user)
                }
            })
        })
    }).catch((error) => console.log(error))
}

function seedComments(campgroundName) {
    // find the campground entry
    var campgroundEntry = seedData.filter(entry => entry.name == campgroundName)[0]
    var commentList = campgroundEntry.comments

    console.log("Seeding comments for " + campgroundName)
    var commentPromises = []

    commentList.forEach(entry => {
        var promise = upsertUser(entry.author)
        .then((user) => {
            var newComment = {
                text: entry.text,
                author: {username: user.username, id: user._id}
            }
            return Promise.all([Comment.create(newComment), Campground.findOne({name: campgroundName}).exec()])
        })
        .then(data => {
            var comment = data[0]
            var campground = data[1]

            campground.comments.push(comment)
            campground.save().catch(console.error)
            console.log("Added comment from " + comment.author.username + " to " + campground.name)
        })
        .catch((error) => console.log(error))

        commentPromises.push(promise)
    })
    // return a promise for ALL operations we just started
    return Promise.all(commentPromises)
}

function seedCampgrounds() {
    var promises = []
    seedData.forEach(entry => {
        var promise = upsertUser(entry.author)
        .then((user) => {
            return Campground.create({
                name: entry.name,
                image: entry.image,
                description: entry.description,
                author: {username: user.username, id: user._id}
            })
        })
        .then(campground => {
            console.log("Created campground " + campground.name + " submitted by " + campground.author.username)
            return seedComments(campground.name)
        })
        .then(() => {
            console.log("Done seeding comments for " + entry.name)
        }).catch(console.error)

        promises.push(promise)
    })
    return Promise.all(promises)
}

function dropAllData() {
    var promises = []
    
    promises.push(Campground.remove({}))
    promises.push(Comment.remove({}))
    promises.push(User.remove({}))
    
    return Promise.all(promises)
}

function seedDB() {
    dropAllData().then(() => {
        console.log("Dropped all existing data...")
        return seedCampgrounds()
    }).then(() => {
        console.log("Finished seeding database")
    })
}

module.exports = seedDB
