console.log("Hello");
let songs;
let currfolder;
let currentSong = new Audio();

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return "00:00"; 
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currfolder = folder;

    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // shoe all the songs on the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>Anish</div>
                </div>
                <div class="playNow">
                  <span>Play now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div>       
         </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    });

    return songs;

}

const playMusic = (track, pause=false) => {
    currentSong.src = `/${currfolder}/` + track
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    
}

async function displayalbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <!-- <div class="circle"> -->
                  <img src="img/play.svg" alt="">
                <!-- </div> -->
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              >
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

async function main(){

    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // display all the albums on the page
    await displayalbums();

    //Attach an event listener to play next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for time update function
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".dot").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an eventlistener to seek bar
    document.querySelector(".seekBar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".dot").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (currentSong.duration) * percent/100
    })

    // add an eventlistemer to hamburger
    document.querySelector(".ham").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    // add an eventlistemer to close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listener to previous and next
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if (index-1 >= 0){
            playMusic(songs[index-1]);
        }
    })

    next.addEventListener("click", ()=>{
        console.log("next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index);
        if (index+1 < songs.length){
            playMusic(songs[index+1]);
        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to", e.target.value, "/100");
        currentSong.volume =parseInt(e.target.value)/100
    })

    // add event listener for when the song ends
    currentSong.addEventListener("ended", () => {
        console.log("Song ended, playing next song");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            console.log("End of playlist, starting from beginning");
            playMusic(songs[0]);
        }
    });

} 
 
main()



