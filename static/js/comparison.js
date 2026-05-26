const modelViewerComparison1 = document.querySelector("model-viewer#modelViewerComparison1");
const modelViewerComparison2 = document.querySelector("model-viewer#modelViewerComparison2");

const scenesData = {
    "colosseum": {
        images: 567,
        "FlashVGGT": "10.04s",
        "FastVGGT": "21.67s",
        "VGGT": "67.43s"
    },
    "pyramid": {
        images: 295,
        "FlashVGGT": "9.20s",
        "FastVGGT": "19.21s",
        "VGGT": "57.01s"
    },
    "garden": {
        images: 185,
        "FlashVGGT": "3.22s",
        "FastVGGT": "7.13s",
        "VGGT": "11.02s"
    },
    "residence": {
        images: 996,
        "FlashVGGT": "29.78s",
        "FastVGGT": "128.29s",
        "VGGT": "296.17s"
    },
    "person-tracking": {
        images: 580,
        "FlashVGGT": "15.89s",
        "FastVGGT": "37.98s",
        "VGGT": "125.25s"
    },
    "pumpkin": {
        images: 1000,
        "FlashVGGT": "36.84s",
        "FastVGGT": "78.42s",
        "VGGT": "373.87s"
    },
    "full_dataset_scene0046_02": {
        images: 834,
        "FlashVGGT": "27.27s",
        "FastVGGT": "72.70s",
        "VGGT": "260.24s"
    },
    "breakfast_room": {
        images: 584,
        "FlashVGGT": "16.04s",
        "FastVGGT": "31.16s",
        "VGGT": "126.30s"
    }
};

// Initialize the selection panel images
$('#comparisonSelectionPanel .selectable-image').each((i, img) => {
    const scene = img.getAttribute('name');
    img.src = `static/single_forward_recon/${scene}/overview.png`;
})

function updateStats(scene, baseline) {
    const data = scenesData[scene];
    if (!data) return;

    const timeOurs = parseFloat(data.FlashVGGT);
    const timeBaseline = parseFloat(data[baseline]);
    const speedup = (timeBaseline / timeOurs).toFixed(1);

    document.getElementById('stats-ours').innerHTML = `
        <div style="opacity: 0.9; font-size: 0.9em; margin-bottom: 2px;">${data.images} images</div>
        <div class="time-highlight">⏱️ ${data.FlashVGGT} <span class="speedup-badge">${speedup}x Faster</span></div>
    `;
    document.getElementById('stats-baseline').innerHTML = `
        <div style="opacity: 0.9; font-size: 0.9em; margin-bottom: 2px;">${data.images} images</div>
        <div class="time-highlight baseline">⏱️ ${data[baseline]}</div>
    `;
}

// Click an image to select the case
const comparisonSelectionPanel = document.getElementById('comparisonSelectionPanel');
comparisonSelectionPanel.addEventListener('click', function(event) {
    const img = event.target.closest('.selectable-image'); 
    if (!img || img.classList.contains('selected')) 
        return;

    // Highlight the selected image
    comparisonSelectionPanel.querySelectorAll('.selectable-image').forEach(function(image) {
        image.classList.remove('selected');
    });
    img.classList.add('selected');

    // Load the corresponding model
    const scene = img.getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelection').value;
    const data = scenesData[scene];

    if (!data) return;

    const meshPath1 = `static/single_forward_recon/${scene}/FlashVGGT_${data.images}images_${data.FlashVGGT.replace('s', 's')}.glb`;
    const meshPath2 = `static/single_forward_recon/${scene}/${baseline}_${data.images}images_${data[baseline].replace('s', 's')}.glb`;
    
    updateStats(scene, baseline);

    modelViewerComparison1.src = meshPath1;
    
    modelViewerComparison2.src = meshPath2;
});

// Dropdown to select the baseline method
document.getElementById('comparisonBaselineSelection').addEventListener('change', function (event) {
    const scene = document.querySelector('#comparisonSelectionPanel .selectable-image.selected').getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelection').value;
    const data = scenesData[scene];

    if (!data) return;
    
    const meshPath2 = `static/single_forward_recon/${scene}/${baseline}_${data.images}images_${data[baseline].replace('s', 's')}.glb`;
    
    updateStats(scene, baseline);

    modelViewerComparison2.src = meshPath2;
});

// Sync the view of two model viewers
var syncViewWith = undefined;
var syncViewEnabled = true;

const syncView = (event) => {
    if (!syncViewEnabled || event.target !== syncViewWith)
        return;
    const source = syncViewWith;
    const target = source === modelViewerComparison1 ? modelViewerComparison2 : modelViewerComparison1;

    const sourceOrbit = source.getCameraOrbit();
    const sourceTarget = source.getCameraTarget();
    const sourceFoV = source.getFieldOfView();
    target.cameraOrbit = `${sourceOrbit.theta}rad ${sourceOrbit.phi}rad ${sourceOrbit.radius}m`;
    target.cameraTarget = `${sourceTarget.x}m ${sourceTarget.y}m ${sourceTarget.z}m`;
    target.fieldOfView = `${sourceFoV}deg`;
    target.jumpCameraToGoal();
}

modelViewerComparison1.addEventListener('camera-change', syncView)
modelViewerComparison1.addEventListener('mousedown', () => {syncViewWith = modelViewerComparison1;});
modelViewerComparison1.addEventListener('wheel', () => {syncViewWith = modelViewerComparison1;});

modelViewerComparison2.addEventListener('camera-change', syncView)
modelViewerComparison2.addEventListener('mousedown', () => {syncViewWith = modelViewerComparison2;});
modelViewerComparison2.addEventListener('wheel', () => {syncViewWith = modelViewerComparison2;});

// Initialize the model viewer with selected model
$(document).ready(() => {
    const scene = document.querySelector('#comparisonSelectionPanel .selectable-image.selected').getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelection').value;
    const data = scenesData[scene];
    
    if (!data) return;

    updateStats(scene, baseline);

    const meshPath1 = `static/single_forward_recon/${scene}/FlashVGGT_${data.images}images_${data.FlashVGGT.replace('s', 's')}.glb`;
    const meshPath2 = `static/single_forward_recon/${scene}/${baseline}_${data.images}images_${data[baseline].replace('s', 's')}.glb`;
    
    modelViewerComparison1.src = meshPath1;
    
    modelViewerComparison2.src = meshPath2;
});

// --- Chunk-Recursive Reconstruction ---

const modelViewerComparisonChunk1 = document.querySelector("model-viewer#modelViewerComparisonChunk1");
const modelViewerComparisonChunk2 = document.querySelector("model-viewer#modelViewerComparisonChunk2");

const chunkScenesData = {
    "kitchen": {
        images: 279,
        "FlashVGGTStream": "5.52s",
        "cut3r": "18.92s",
        "ttt3r": "13.70s",
        overviewExt: "JPG"
    },
    "morning_apartment": {
        images: 920,
        "FlashVGGTStream": "30.80s",
        "cut3r": "55.29s",
        "ttt3r": "55.17s",
        overviewExt: "png"
    },
    "playroom": {
        images: 225,
        "FlashVGGTStream": "4.25s",
        "cut3r": "14.97s",
        "ttt3r": "14.57s",
        overviewExt: "jpg"
    },
    "rgbd_dataset_freiburg3_sitting_halfsphere": {
        images: 1110,
        "FlashVGGTStream": "41.03s",
        "cut3r": "95.89s",
        "ttt3r": "93.35s",
        overviewExt: "png"
    },
    "truck": {
        images: 251,
        "FlashVGGTStream": "4.10s",
        "cut3r": "20.13s",
        "ttt3r": "13.21s",
        overviewExt: "jpg"
    }
};

// Initialize the selection panel images for chunk
$('#comparisonSelectionPanelChunk .selectable-image').each((i, img) => {
    const scene = img.getAttribute('name');
    const ext = chunkScenesData[scene].overviewExt;
    img.src = `static/chunk_recursive_recon/${scene}/overview.${ext}`;
});

function updateStatsChunk(scene, baseline) {
    const data = chunkScenesData[scene];
    if (!data) return;

    const timeOurs = parseFloat(data.FlashVGGTStream);
    const timeBaseline = parseFloat(data[baseline]);
    const speedup = (timeBaseline / timeOurs).toFixed(1);

    document.getElementById('stats-ours-chunk').innerHTML = `
        <div style="opacity: 0.9; font-size: 0.9em; margin-bottom: 2px;">${data.images} images</div>
        <div class="time-highlight">⏱️ ${data.FlashVGGTStream} <span class="speedup-badge">${speedup}x Faster</span></div>
    `;
    document.getElementById('stats-baseline-chunk').innerHTML = `
        <div style="opacity: 0.9; font-size: 0.9em; margin-bottom: 2px;">${data.images} images</div>
        <div class="time-highlight baseline">⏱️ ${data[baseline]}</div>
    `;
}

// Click an image to select the case for chunk
const comparisonSelectionPanelChunk = document.getElementById('comparisonSelectionPanelChunk');
comparisonSelectionPanelChunk.addEventListener('click', function(event) {
    const img = event.target.closest('.selectable-image'); 
    if (!img || img.classList.contains('selected')) 
        return;

    // Highlight the selected image
    comparisonSelectionPanelChunk.querySelectorAll('.selectable-image').forEach(function(image) {
        image.classList.remove('selected');
    });
    img.classList.add('selected');

    // Load the corresponding model
    const scene = img.getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelectionChunk').value;
    const data = chunkScenesData[scene];

    if (!data) return;

    const meshPath1 = `static/chunk_recursive_recon/${scene}/FlashVGGTStream_${data.images}images_${data.FlashVGGTStream}.glb`;
    const meshPath2 = `static/chunk_recursive_recon/${scene}/${baseline}_${data.images}images_${data[baseline]}.glb`;
    
    updateStatsChunk(scene, baseline);

    modelViewerComparisonChunk1.src = meshPath1;
    modelViewerComparisonChunk2.src = meshPath2;
});

// Dropdown to select the baseline method for chunk
document.getElementById('comparisonBaselineSelectionChunk').addEventListener('change', function (event) {
    const scene = document.querySelector('#comparisonSelectionPanelChunk .selectable-image.selected').getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelectionChunk').value;
    const data = chunkScenesData[scene];

    if (!data) return;
    
    const meshPath2 = `static/chunk_recursive_recon/${scene}/${baseline}_${data.images}images_${data[baseline]}.glb`;
    
    updateStatsChunk(scene, baseline);

    modelViewerComparisonChunk2.src = meshPath2;
});

// Sync the view of two model viewers for chunk
var syncViewWithChunk = undefined;
var syncViewEnabledChunk = true;

const syncViewChunk = (event) => {
    if (!syncViewEnabledChunk || event.target !== syncViewWithChunk)
        return;
    const source = syncViewWithChunk;
    const target = source === modelViewerComparisonChunk1 ? modelViewerComparisonChunk2 : modelViewerComparisonChunk1;

    const sourceOrbit = source.getCameraOrbit();
    const sourceTarget = source.getCameraTarget();
    const sourceFoV = source.getFieldOfView();
    target.cameraOrbit = `${sourceOrbit.theta}rad ${sourceOrbit.phi}rad ${sourceOrbit.radius}m`;
    target.cameraTarget = `${sourceTarget.x}m ${sourceTarget.y}m ${sourceTarget.z}m`;
    target.fieldOfView = `${sourceFoV}deg`;
    target.jumpCameraToGoal();
}

modelViewerComparisonChunk1.addEventListener('camera-change', syncViewChunk)
modelViewerComparisonChunk1.addEventListener('mousedown', () => {syncViewWithChunk = modelViewerComparisonChunk1;});
modelViewerComparisonChunk1.addEventListener('wheel', () => {syncViewWithChunk = modelViewerComparisonChunk1;});

modelViewerComparisonChunk2.addEventListener('camera-change', syncViewChunk)
modelViewerComparisonChunk2.addEventListener('mousedown', () => {syncViewWithChunk = modelViewerComparisonChunk2;});
modelViewerComparisonChunk2.addEventListener('wheel', () => {syncViewWithChunk = modelViewerComparisonChunk2;});

// Initialize the model viewer with selected model for chunk
$(document).ready(() => {
    const scene = document.querySelector('#comparisonSelectionPanelChunk .selectable-image.selected').getAttribute('name');
    const baseline = document.getElementById('comparisonBaselineSelectionChunk').value;
    const data = chunkScenesData[scene];
    
    if (!data) return;

    updateStatsChunk(scene, baseline);

    const meshPath1 = `static/chunk_recursive_recon/${scene}/FlashVGGTStream_${data.images}images_${data.FlashVGGTStream}.glb`;
    const meshPath2 = `static/chunk_recursive_recon/${scene}/${baseline}_${data.images}images_${data[baseline]}.glb`;
    
    modelViewerComparisonChunk1.src = meshPath1;
    modelViewerComparisonChunk2.src = meshPath2;
});