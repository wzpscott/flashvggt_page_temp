const videoData = {
    "long_corridor": {
        title: "VGGTLong-Corridor (2499 images)"
    },
    "rubble": {
        title: "Mill19-Rubble (1677 images)"
    },
    "vkitti": {
        title: "VKitti-Scene01 (446 images)"
    },
    "pumpkin": {
        title: "7Scenes-Pumpkin (1000 images)"
    },
    "scannet": {
        title: "ScanNet-Scene0002 (5192 images)"
    }
};

// Initialize the selection panel images
$('#videoSelectionPanel .selectable-image').each((i, img) => {
    const scene = img.getAttribute('name');
    img.src = `static/videos/${scene}/image.png`;
    // Fallback to .jpg if .png doesn't exist
    img.onerror = function() {
        if (this.src.endsWith('.png')) {
            this.src = `static/videos/${scene}/image.jpg`;
        }
    };
});

// Add event listener to the selection panel
const videoSelectionPanel = document.getElementById('videoSelectionPanel');
const mainVideo = document.getElementById('main-video');
const mainVideoSource = document.getElementById('main-video-source');
const videoTitle = document.getElementById('video-title');

videoSelectionPanel.addEventListener('click', function(event) {
    const img = event.target.closest('.selectable-image'); 
    
    if (!img || img.classList.contains('selected')) 
        return;
   
    videoSelectionPanel.querySelectorAll('.selectable-image').forEach(function(image) {
        image.classList.remove('selected');
    });
    img.classList.add('selected');

    const scene = img.getAttribute('name');
    const data = videoData[scene];

    if (!data) return;

    mainVideoSource.src = `./static/videos/${scene}/video.mov`;
    mainVideo.load();
    
    videoTitle.innerText = data.title;
});
